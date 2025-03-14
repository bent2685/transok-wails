package apis

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"transok/backend/domain/resp"
	"transok/backend/domain/vo"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

type DownloadApi struct{}

func (d *DownloadApi) DownloadFile(c *gin.Context) {
	filePath := c.Query("filePath")

	if filePath == "" {
		resp.DataFormatErr().WithMsg("filePath is required").Out()
		return
	}

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
		json.Unmarshal(jsonData, &result)
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

	fileName := filepath.Base(filePath)
	fileSize := fileInfo.Size()

	// 设置支持断点续传的响应头
	c.Header("Accept-Ranges", "bytes")
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Header("Content-Type", "application/octet-stream")

	// 获取Range请求头
	rangeHeader := c.GetHeader("Range")
	if rangeHeader == "" {
		// 如果没有Range头，返回整个文件
		c.Header("Content-Length", strconv.FormatInt(fileSize, 10))
		c.File(filePath)
		return
	}

	// 解析Range头
	var start, end int64
	if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-%d", &start, &end); err != nil {
		if _, err := fmt.Sscanf(rangeHeader, "bytes=%d-", &start); err != nil {
			resp.DataFormatErr().WithMsg("Invalid range header").Out()
			return
		}
		end = fileSize - 1
	}

	// 验证范围的有效性
	if start >= fileSize {
		resp.DataFormatErr().WithMsg("Range start exceeds file size").Out()
		return
	}
	if end >= fileSize {
		end = fileSize - 1
	}

	// 设置分块下载的响应头
	c.Header("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
	c.Header("Content-Length", strconv.FormatInt(end-start+1, 10))
	c.Status(206) // Partial Content

	// 移动文件指针到指定位置
	_, err = file.Seek(start, io.SeekStart)
	if err != nil {
		resp.ServerErr().WithMsg("Failed to seek file").Out()
		return
	}

	// 使用缓冲区分块传输
	const bufferSize = 4 * 1024 // 4KB chunks
	buffer := make([]byte, bufferSize)

	// 创建限制读取器，确保只读取请求的范围
	limitReader := io.LimitReader(file, end-start+1)

	// 分块传输文件
	for {
		n, err := limitReader.Read(buffer)
		if err == io.EOF {
			break
		}
		if err != nil {
			resp.ServerErr().WithMsg("Failed to read file").Out()
			return
		}
		if n > 0 {
			if _, err := c.Writer.Write(buffer[:n]); err != nil {
				resp.ServerErr().WithMsg("Failed to write response").Out()
				return
			}
			c.Writer.Flush()
		}
	}
}
