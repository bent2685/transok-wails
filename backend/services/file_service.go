package services

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
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
	files, err := runtime.OpenMultipleFilesDialog(c.ctx, runtime.OpenDialogOptions{
		Title: "Select File",
	})

	if err != nil {
		return nil
	}

	return files
}

/* Get FileInfo object by absolute file path */
func (c *fileService) GetFile(path string) *FileInfo {
	// Get file information
	fileInfo, err := os.Stat(path)
	if err != nil {
		return nil
	}

	// Return file object
	return &FileInfo{
		Id:   uuid.New().String(),
		Path: path,
		Name: fileInfo.Name(),
		Size: fileInfo.Size(),
		Type: strings.TrimPrefix(strings.ToLower(filepath.Ext(path)), "."),
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
