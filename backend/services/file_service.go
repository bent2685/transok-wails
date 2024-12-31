package services

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type fileService struct {
	ctx context.Context
}

type FileInfo struct {
	Path string
	Name string
	Size int64
	Ext  string
}

var file *fileService
var fileOnce sync.Once

func File() *fileService {
	if file == nil {
		fileOnce.Do(func() {
			file = &fileService{}
		})
	}
	return file
}

func (c *fileService) Start(ctx context.Context) {
	c.ctx = ctx
}

/* 可多选选择文件 */
func (c *fileService) SelectFiles() []string {
	// 打开文件选择对话框,允许多选
	files, err := runtime.OpenMultipleFilesDialog(c.ctx, runtime.OpenDialogOptions{
		Title: "选择文件",
	})

	if err != nil {
		return nil
	}

	return files
}

/* 通过文件的绝对路径获取File对象 */
func (c *fileService) GetFile(path string) *FileInfo {
	// 获取文件信息
	fileInfo, err := os.Stat(path)
	if err != nil {
		return nil
	}

	// 返回文件对象
	return &FileInfo{
		Path: path,
		Name: fileInfo.Name(),
		Size: fileInfo.Size(),
		Ext:  strings.TrimPrefix(strings.ToLower(filepath.Ext(path)), "."),
	}
}

func (c *fileService) GetShareList() []FileInfo {
	storage := Storage()
	shareList, isExist := storage.Get("share-list")

	// 初始化一个空数组
	result := make([]FileInfo, 0)

	if !isExist {
		storage.Set("share-list", result)
		return result
	}

	// 使用 json.Marshal 和 json.Unmarshal 进行类型转换
	if jsonData, err := json.Marshal(shareList); err == nil {
		json.Unmarshal(jsonData, &result)
	}

	validFiles := make([]FileInfo, 0)
	for _, file := range result {
		if _, err := os.Stat(file.Path); err == nil {
			validFiles = append(validFiles, file)
		}
	}

	storage.Set("share-list", validFiles)
	return validFiles
}
