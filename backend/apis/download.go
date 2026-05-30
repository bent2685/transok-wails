package apis

import (
	"archive/zip"
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"mime"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"transok/backend/domain/resp"
	"transok/backend/domain/vo"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

type DownloadApi struct{}

// 256KB buffer：在 4KB / 1MB 之间折衷，吞吐与内存占用平衡。
const downloadBufferSize = 256 * 1024

// DownloadFile handles large file downloads efficiently with range support.
// 同时支持 HEAD（仅返回元信息）与 GET（含 Range 分片）。
func (d *DownloadApi) DownloadFile(c *gin.Context) {
	// folderId 存在 → 共享文件夹内的文件，按 folderId+相对路径解析授权
	folderId := c.Query("folderId")

	var filePath string
	if folderId == "" {
		filePathRaw := c.Query("filePath")
		if filePathRaw == "" {
			resp.DataFormatErr().WithMsg("filePath is required").Out()
			return
		}

		unescaped, err := url.QueryUnescape(filePathRaw)
		if err != nil {
			resp.DataFormatErr().WithMsg("Invalid filePath").Out()
			return
		}
		filePath = unescaped
	}

	captchaInStore := services.Share().GetCaptcha()
	if captchaInStore != "" {
		captchaKey := c.Query("captcha-key")
		if captchaKey == "" {
			captchaKey = c.GetHeader("Captcha-Key")
		}
		if captchaKey == "" {
			resp.DataFormatErr().WithMsg("Captcha key required").Out()
			return
		}
		if captchaKey != captchaInStore {
			resp.Forbidden().WithMsg("Captcha is incorrect").Out()
			return
		}
	}
	if folderId != "" {
		// 共享文件夹内文件：folderId+sub 解析为安全绝对路径（含越界校验）
		resolved, err := services.ResolveSharedPath(folderId, c.Query("sub"))
		if err != nil {
			resp.NotExistErr().WithMsg("File not accessible").Out()
			return
		}
		filePath = resolved
	} else {
		// 散文件：必须精确命中分享清单
		storage := services.Storage()
		if storage == nil {
			resp.ServerErr().WithMsg("storage is nil").Out()
			return
		}

		shareList, isExist := storage.Get("share-list")
		if !isExist {
			resp.NotExistErr().WithMsg("share-list is not exist").Out()
			return
		}

		var result []vo.ShareItem
		if jsonData, err := json.Marshal(shareList); err == nil {
			_ = json.Unmarshal(jsonData, &result)
		}

		exist := false
		for _, item := range result {
			if item.Path == filePath {
				exist = true
				break
			}
		}
		if !exist {
			resp.NotExistErr().WithMsg("File not in share list").Out()
			return
		}
	}

	// Open file
	file, err := os.Open(filePath)
	if err != nil {
		resp.ServerErr().WithMsg("Failed to open file").Out()
		return
	}
	defer file.Close()

	fileInfo, err := file.Stat()
	if err != nil {
		resp.ServerErr().WithMsg("Failed to get file info").Out()
		return
	}
	fileSize := fileInfo.Size()
	fileName := filepath.Base(filePath)
	modTime := fileInfo.ModTime()
	etag := buildETag(filePath, fileSize, modTime)

	// inline=1 → preview (image/text) in the browser; otherwise attachment download
	inline := c.Query("inline") == "1"

	encodedName := url.PathEscape(fileName)
	disposition := "attachment"
	contentType := "application/octet-stream"
	if inline {
		disposition = "inline"
		if ct := mime.TypeByExtension(strings.ToLower(filepath.Ext(fileName))); ct != "" {
			contentType = ct
		}
	}
	c.Header("Content-Disposition", fmt.Sprintf("%s; filename*=UTF-8''%s", disposition, encodedName))
	c.Header("Content-Type", contentType)
	c.Header("Accept-Ranges", "bytes")
	c.Header("ETag", etag)
	c.Header("Last-Modified", modTime.UTC().Format(http.TimeFormat))
	// 允许 SW / fetch 跨端读到必要响应头
	c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified")
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	// HEAD：只返头不返体，前端预探尺寸用
	if c.Request.Method == http.MethodHead {
		c.Header("Content-Length", strconv.FormatInt(fileSize, 10))
		c.Status(http.StatusOK)
		return
	}

	// Check if it's a Range request (breakpoint resume)
	rangeHeader := c.GetHeader("Range")
	if rangeHeader == "" {
		c.Header("Content-Length", strconv.FormatInt(fileSize, 10))
		c.Status(200)
		httpServeFile(c, file)
		return
	}

	// Parse Range
	var start, end int64
	if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-%d", &start, &end); err != nil {
		if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-", &start); err != nil {
			resp.DataFormatErr().WithMsg("Invalid Range header").Out()
			return
		}
		end = fileSize - 1
	}
	if end >= fileSize {
		end = fileSize - 1
	}
	if start > end || start >= fileSize {
		c.Header("Content-Range", fmt.Sprintf("bytes */%d", fileSize))
		c.Status(http.StatusRequestedRangeNotSatisfiable)
		return
	}

	c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
	c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))
	c.Status(206)

	// Move pointer
	_, err = file.Seek(start, io.SeekStart)
	if err != nil {
		resp.ServerErr().WithMsg("Failed to seek file").Out()
		return
	}

	buffer := make([]byte, downloadBufferSize)
	reader := io.LimitReader(file, end-start+1)

	for {
		n, err := reader.Read(buffer)
		if n > 0 {
			if _, wErr := c.Writer.Write(buffer[:n]); wErr != nil {
				return // Connection disconnected
			}
			c.Writer.Flush()
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return
		}
	}
}

// Encapsulate file stream output（无 Range 时使用）
func httpServeFile(c *gin.Context, file *os.File) {
	buf := make([]byte, downloadBufferSize)
	for {
		n, err := file.Read(buf)
		if n > 0 {
			if _, wErr := c.Writer.Write(buf[:n]); wErr != nil {
				return
			}
			c.Writer.Flush()
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			return
		}
	}
}

// DownloadZip 把共享文件夹内某层目录（含子目录）流式打包为 zip 下载。
// 流式：不预知总大小、不支持 Range/续传。入参 folderId + sub（默认根）。
func (d *DownloadApi) DownloadZip(c *gin.Context) {
	folderId := c.Query("folderId")
	if folderId == "" {
		resp.DataFormatErr().WithMsg("folderId is required").Out()
		return
	}

	// captcha 校验：与 DownloadFile 同标准
	captchaInStore := services.Share().GetCaptcha()
	if captchaInStore != "" {
		captchaKey := c.Query("captcha-key")
		if captchaKey == "" {
			captchaKey = c.GetHeader("Captcha-Key")
		}
		if captchaKey == "" {
			resp.DataFormatErr().WithMsg("Captcha key required").Out()
			return
		}
		if captchaKey != captchaInStore {
			resp.Forbidden().WithMsg("Captcha is incorrect").Out()
			return
		}
	}

	dir, err := services.ResolveSharedPath(folderId, c.Query("sub"))
	if err != nil {
		resp.NotExistErr().WithMsg("Folder not accessible").Out()
		return
	}

	info, err := os.Stat(dir)
	if err != nil || !info.IsDir() {
		resp.NotExistErr().WithMsg("Not a directory").Out()
		return
	}

	zipName := filepath.Base(dir) + ".zip"
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename*=UTF-8''%s", url.PathEscape(zipName)))
	c.Header("Content-Type", "application/zip")
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate")
	c.Status(http.StatusOK)

	zw := zip.NewWriter(c.Writer)
	defer zw.Close()

	// zip 内路径以打包目录名为顶层，便于解压后归档
	base := filepath.Base(dir)
	filepath.WalkDir(dir, func(path string, de fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return nil // 跳过无法访问的项，不中断整包
		}
		name := de.Name()
		if strings.HasPrefix(name, ".") {
			if de.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		if de.IsDir() {
			return nil // 目录本身不单独写入，靠文件路径隐式建立
		}

		rel, err := filepath.Rel(dir, path)
		if err != nil {
			return nil
		}
		w, err := zw.Create(filepath.ToSlash(filepath.Join(base, rel)))
		if err != nil {
			return nil
		}
		f, err := os.Open(path)
		if err != nil {
			return nil
		}
		defer f.Close()
		io.Copy(w, f)
		return nil
	})
}

// buildETag 用 path+size+mtime 算稳定弱 ETag，便于客户端校验续传一致性。
func buildETag(path string, size int64, mod time.Time) string {
	h := sha1.New()
	io.WriteString(h, path)
	fmt.Fprintf(h, ":%d:%d", size, mod.UnixNano())
	return `W/"` + hex.EncodeToString(h.Sum(nil))[:16] + `"`
}
