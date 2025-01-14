package common

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"transok/backend/consts"
)

/* 获取环境变量 */
func GetEnv() string {
	return consts.APP_INFO["env"]
}

func GetBasePath() string {
	env := GetEnv()
	fmt.Println("环境", env)
	if env == "" {
		env = "dev" // 默认为开发环境
	}

	if env == "dev" {
		return "data"
	}
	// 获取适合当前操作系统的基础存储路径
	var basePath string
	switch runtime.GOOS {
	case "windows":
		appData := os.Getenv("APPDATA")
		if appData == "" {
			appData = filepath.Join(os.Getenv("USERPROFILE"), "AppData", "Roaming")
		}
		basePath = filepath.Join(appData, "transok")
	case "darwin":
		homeDir, _ := os.UserHomeDir()
		basePath = filepath.Join(homeDir, "Library", "Application Support", "transok")
	default: // linux 和其他类 Unix 系统
		basePath = "/var/lib/transok"
		// 如果不是 root 用户，使用用户目录
		if os.Getuid() != 0 {
			homeDir, _ := os.UserHomeDir()
			basePath = filepath.Join(homeDir, ".transok")
		}
	}

	return basePath

}
