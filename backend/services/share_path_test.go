package services

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"transok/backend/domain/vo"
)

// setupSharedFolder 在临时目录建一个共享文件夹并注册进 storage，返回根路径
func setupSharedFolder(t *testing.T, id string) string {
	t.Helper()
	root := t.TempDir()
	// 建一些内容：子目录 + 文件
	if err := os.MkdirAll(filepath.Join(root, "sub"), 0755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(root, "sub", "a.txt"), []byte("hi"), 0644); err != nil {
		t.Fatal(err)
	}
	// EvalSymlinks 会把 /var 解析成 /private/var 之类，统一用解析后的根
	realRoot, err := filepath.EvalSymlinks(root)
	if err != nil {
		t.Fatal(err)
	}
	Storage().Set("share-list", []vo.ShareItem{
		{Id: id, Type: "folder", Name: filepath.Base(root), Path: root},
	})
	return realRoot
}

func TestResolveSharedPath_Normal(t *testing.T) {
	realRoot := setupSharedFolder(t, "f1")

	got, err := ResolveSharedPath("f1", "sub/a.txt")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	want := filepath.Join(realRoot, "sub", "a.txt")
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}

func TestResolveSharedPath_Root(t *testing.T) {
	realRoot := setupSharedFolder(t, "f1")

	got, err := ResolveSharedPath("f1", "")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if got != realRoot {
		t.Errorf("got %q, want %q", got, realRoot)
	}
}

func TestResolveSharedPath_Traversal(t *testing.T) {
	setupSharedFolder(t, "f1")

	// ".." 穿越应被 Clean 消解后落回根内，不应逃逸出根
	if _, err := ResolveSharedPath("f1", "../../../etc/passwd"); err == nil {
		t.Error("expected error for traversal attempt, got nil")
	}
}

func TestResolveSharedPath_SymlinkEscape(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("symlink semantics differ on windows")
	}
	realRoot := setupSharedFolder(t, "f1")

	// 在共享文件夹里放一个指向外部的软链
	outside := t.TempDir()
	link := filepath.Join(realRoot, "escape")
	if err := os.Symlink(outside, link); err != nil {
		t.Fatal(err)
	}

	if _, err := ResolveSharedPath("f1", "escape"); err != ErrPathEscape {
		t.Errorf("expected ErrPathEscape, got %v", err)
	}
}

func TestResolveSharedPath_UnknownFolder(t *testing.T) {
	setupSharedFolder(t, "f1")

	if _, err := ResolveSharedPath("nope", ""); err != ErrFolderNotFound {
		t.Errorf("expected ErrFolderNotFound, got %v", err)
	}
}

func TestResolveSharedPath_RootDeleted(t *testing.T) {
	root := t.TempDir()
	Storage().Set("share-list", []vo.ShareItem{
		{Id: "f1", Type: "folder", Name: "gone", Path: root},
	})
	os.RemoveAll(root)

	if _, err := ResolveSharedPath("f1", ""); err == nil {
		t.Error("expected error for deleted root, got nil")
	}
}
