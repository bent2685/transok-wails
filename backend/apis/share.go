package apis

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"transok/backend/domain/resp"
	"transok/backend/domain/vo"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

type ShareApi struct{}

func (s *ShareApi) ShareList(c *gin.Context) {
	storage := services.Storage()
	if storage == nil {
		resp.ServerErr().Out()
		return
	}

	keys := storage.GetKeys()
	hasShare := false
	for _, key := range keys {
		if key == "is-share" {
			hasShare = true
			break
		}
	}
	if !hasShare {
		resp.ServerErr().WithMsg("Sharing not enabled").Out()
		return
	}

	shareList, isExist := storage.Get("share-list")
	fmt.Println("shareList", shareList)
	var result []vo.ShareItem
	if isExist {
		if jsonData, err := json.Marshal(shareList); err == nil {
			json.Unmarshal(jsonData, &result)
		}
	}

	resp.Success().WithData(vo.ShareListVo{
		ShareList: result,
	}).Out()
}

// Browse 实时列出共享文件夹内某个目录的直接子项。
// 入参 folderId（分享清单里 Type=folder 的项）+ sub（相对根的子路径，空=根）。
func (s *ShareApi) Browse(c *gin.Context) {
	folderId := c.Query("folderId")
	if folderId == "" {
		resp.DataFormatErr().WithMsg("folderId is required").Out()
		return
	}
	sub := c.Query("sub")

	dir, err := services.ResolveSharedPath(folderId, sub)
	if err != nil {
		resp.NotExistErr().WithMsg("Folder not accessible").Out()
		return
	}

	dirEntries, err := os.ReadDir(dir)
	if err != nil {
		resp.NotExistErr().WithMsg("Failed to read folder").Out()
		return
	}

	entries := make([]vo.BrowseEntry, 0, len(dirEntries))
	for _, de := range dirEntries {
		name := de.Name()
		// 过滤以 . 开头的隐藏项
		if strings.HasPrefix(name, ".") {
			continue
		}
		var size int64
		if info, err := de.Info(); err == nil {
			size = info.Size()
		}
		entries = append(entries, vo.BrowseEntry{
			Name:    name,
			IsDir:   de.IsDir(),
			Size:    size,
			RelPath: filepath.ToSlash(filepath.Join(sub, name)),
		})
	}

	// 目录在前，各自按名称升序
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir != entries[j].IsDir {
			return entries[i].IsDir
		}
		return entries[i].Name < entries[j].Name
	})

	resp.Success().WithData(vo.BrowseVo{
		FolderId: folderId,
		Sub:      sub,
		Entries:  entries,
	}).Out()
}

/* Check if captcha is required */
func (s *ShareApi) ShouldCaptcha(c *gin.Context) {
	captcha := services.Share().GetCaptcha()
	resp.Success().WithData(captcha != "").Out()
}
