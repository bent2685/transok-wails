package services

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"sync"

	"github.com/google/uuid"
	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type fileService struct {
	ctx context.Context
}

type FileInfo struct {
	Id   string
	Path string
	Name string
	Size int64
	Type string
	Text string
	Note string
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

/* Select multiple files */
func (c *fileService) SelectFiles() []string {
	// Open file selection dialog, allowing multiple selection
	files, err := wailsRuntime.OpenMultipleFilesDialog(c.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select File",
	})

	if err != nil {
		return nil
	}

	return files
}

/* Select a single folder（系统对话框无法同时选文件与文件夹，故单独入口） */
func (c *fileService) SelectFolder() []string {
	dir, err := wailsRuntime.OpenDirectoryDialog(c.ctx, wailsRuntime.OpenDialogOptions{
		Title: "Select Folder",
	})
	if err != nil || dir == "" {
		return nil
	}
	return []string{dir}
}

/* 在系统文件管理器中打开目录内部 */
func (c *fileService) OpenInFileManager(path string) error {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin":
		cmd = exec.Command("open", path)
	case "windows":
		cmd = exec.Command("explorer", path)
	default:
		cmd = exec.Command("xdg-open", path)
	}
	return cmd.Start()
}

/* Get FileInfo object by absolute file path */
func (c *fileService) GetFile(path string) *FileInfo {
	// Get file information
	fileInfo, err := os.Stat(path)
	if err != nil {
		return nil
	}

	// 目录作为共享文件夹项：内容不进快照，浏览时实时读盘
	fileType := strings.TrimPrefix(strings.ToLower(filepath.Ext(path)), ".")
	if fileInfo.IsDir() {
		fileType = "folder"
	}

	// Return file object
	return &FileInfo{
		Id:   uuid.New().String(),
		Path: path,
		Name: fileInfo.Name(),
		Size: fileInfo.Size(),
		Type: fileType,
	}
}

func (c *fileService) GetShareList() []FileInfo {
	storage := Storage()
	shareList, isExist := storage.Get("share-list")

	// Initialize an empty array
	result := make([]FileInfo, 0)

	if !isExist {
		storage.Set("share-list", result)
		return result
	}

	// Use json.Marshal and json.Unmarshal for type conversion
	if jsonData, err := json.Marshal(shareList); err == nil {
		json.Unmarshal(jsonData, &result)
	}

	validFiles := make([]FileInfo, 0)
	for _, file := range result {
		if file.Id == "" {
			file.Id = uuid.New().String()
		}
		if file.Type == "pure-text" {
			validFiles = append(validFiles, file)
			continue
		}

		if _, err := os.Stat(file.Path); err == nil {
			validFiles = append(validFiles, file)
		}
	}

	storage.Set("share-list", validFiles)
	return validFiles
}
