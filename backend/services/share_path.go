package services

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"

	"transok/backend/domain/vo"
)

var (
	// ErrFolderNotFound 指定的共享文件夹项不存在（或不是文件夹类型）
	ErrFolderNotFound = errors.New("shared folder not found")
	// ErrPathEscape 解析后的路径越出了共享文件夹根
	ErrPathEscape = errors.New("path escapes shared folder root")
)

// ResolveSharedPath 把「共享文件夹项 Id + 相对子路径」解析为安全的绝对路径。
//
// 安全约束：客户端只传 folderId + 相对路径，绝不传绝对路径。解析时先用 Clean
// 去除 ".." 等穿越片段，再对根与目标都做符号链接解析，最终校验目标仍落在根之内，
// 任何越界（含软链逃逸）一律拒绝。
func ResolveSharedPath(folderId, subRel string) (string, error) {
	root, err := sharedFolderRoot(folderId)
	if err != nil {
		return "", err
	}

	// 先 Clean 掉相对路径里的 ".."，再与根拼接
	cleanedSub := filepath.Clean("/" + subRel)
	joined := filepath.Join(root, cleanedSub)

	// 根与目标都解析符号链接后再比较，防止软链逃逸
	realRoot, err := filepath.EvalSymlinks(root)
	if err != nil {
		return "", err
	}
	realTarget, err := filepath.EvalSymlinks(joined)
	if err != nil {
		return "", err
	}

	if realTarget != realRoot && !strings.HasPrefix(realTarget, realRoot+string(os.PathSeparator)) {
		return "", ErrPathEscape
	}

	return realTarget, nil
}

// sharedFolderRoot 从分享清单里找出指定 Id 的共享文件夹根绝对路径
func sharedFolderRoot(folderId string) (string, error) {
	storage := Storage()
	if storage == nil {
		return "", ErrFolderNotFound
	}

	shareList, isExist := storage.Get("share-list")
	if !isExist {
		return "", ErrFolderNotFound
	}

	var items []vo.ShareItem
	jsonData, err := json.Marshal(shareList)
	if err != nil {
		return "", err
	}
	if err := json.Unmarshal(jsonData, &items); err != nil {
		return "", err
	}

	for _, item := range items {
		if item.Id == folderId && item.Type == "folder" {
			return item.Path, nil
		}
	}
	return "", ErrFolderNotFound
}
