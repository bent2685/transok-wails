package apis

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
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
	fmt.Println("shareList", shareList)
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
	// filePath是绝对路径
	// 根据路径输出下载流
	// 获取文件名
	fileName := filepath.Base(filePath)

	// 打开文件
	file, err := os.Open(filePath)
	if err != nil {
		resp.ServerErr().WithMsg("Failed to open file").Out()
		return
	}
	defer file.Close()

	// 获取文件信息
	fileInfo, err := file.Stat()
	if err != nil {
		resp.ServerErr().WithMsg("Failed to get file info").Out()
		return
	}

	// 设置响应头
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))

	// 将文件流写入响应
	c.File(filePath)
}
