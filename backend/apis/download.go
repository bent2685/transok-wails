package apis

import (
	"encoding/json"
	"fmt"
	"io"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"transok/backend/domain/resp"
	"transok/backend/domain/vo"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

type DownloadApi struct{}

// DownloadFile handles large file downloads efficiently with range support.
func (d *DownloadApi) DownloadFile(c *gin.Context) {
	filePathRaw := c.Query("filePath")
	if filePathRaw == "" {
		resp.DataFormatErr().WithMsg("filePath is required").Out()
		return
	}

	filePath, err := url.QueryUnescape(filePathRaw)
	if err != nil {
		resp.DataFormatErr().WithMsg("Invalid filePath").Out()
		return
	}

	captchaKey := c.Query("captcha-key")
	if captchaKey == "" {
		captchaKey = c.GetHeader("Captcha-Key")
	}
	if captchaKey == "" {
		resp.DataFormatErr().WithMsg("Captcha key required").Out()
		return
	}
	captchaInStore := services.Share().GetCaptcha()
	if captchaKey != captchaInStore {
		resp.Forbidden().WithMsg("Captcha is incorrect").Out()
		return
	}
	// 验证 share-list 是否存在
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

	// 验证文件是否在共享列表中
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

	// 打开文件
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

	// 中文文件名 & 下载兼容
	encodedName := url.PathEscape(fileName)
	contentDisposition := fmt.Sprintf("attachment; filename*=UTF-8''%s", encodedName)

	c.Header("Content-Disposition", contentDisposition)
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Accept-Ranges", "bytes")
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	// 检查是否为 Range 请求（断点续传）
	rangeHeader := c.GetHeader("Range")
	if rangeHeader == "" {
		c.Header("Content-Length", strconv.FormatInt(fileSize, 10))
		c.Status(200)
		httpServeFile(c, file)
		return
	}

	// 解析 Range
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
		resp.DataFormatErr().WithMsg("Invalid byte range").Out()
		return
	}

	c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
	c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))
	c.Status(206)

	// 移动指针
	_, err = file.Seek(start, io.SeekStart)
	if err != nil {
		resp.ServerErr().WithMsg("Failed to seek file").Out()
		return
	}

	// 分块传输
	const bufferSize = 4 * 1024 // 4KB
	buffer := make([]byte, bufferSize)
	reader := io.LimitReader(file, end-start+1)

	for {
		n, err := reader.Read(buffer)
		if n > 0 {
			if _, wErr := c.Writer.Write(buffer[:n]); wErr != nil {
				return // 连接断开
			}
			c.Writer.Flush()
		}
		if err == io.EOF {
			break
		}
		if err != nil {
			resp.ServerErr().WithMsg("Read error").Out()
			return
		}
	}
}

// 封装文件流输出
func httpServeFile(c *gin.Context, file *os.File) {
	const bufferSize = 64 * 1024 // 64KB
	buf := make([]byte, bufferSize)
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
			resp.ServerErr().WithMsg("File read error").Out()
			return
		}
	}
}
