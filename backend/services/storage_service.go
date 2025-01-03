package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"slices"
	"sync"
)

type StorageService struct {
	ctx         context.Context
	data        map[string]interface{}
	storagePath string
	mu          sync.RWMutex
}

var (
	storage     *StorageService
	storageOnce sync.Once
)

// NewStorageService 现在将确保只创建一个 StorageService 实例
func Storage() *StorageService {
	if storage == nil {
		storageOnce.Do(func() {
			storage = &StorageService{
				data: make(map[string]interface{}),
			}
		})
	}
	return storage
}

// Init 初始化存储服务，根据环境变量设置不同的存储路径
func (s *StorageService) Init(ctx context.Context) error {
	s.ctx = ctx

	// 根据环境变量获取存储路径
	env := system.GetEnv()
	fmt.Println("环境", env)
	if env == "" {
		env = "dev" // 默认为开发环境
	}

	// 获取适合当前操作系统的基础存储路径
	basePath := s.GetBasePath()
	fmt.Println("basePath => ", basePath)

	s.storagePath = filepath.Join(basePath, "storage.json")

	// 确保存储目录存在
	if err := os.MkdirAll(filepath.Dir(s.storagePath), 0755); err != nil {
		return fmt.Errorf("创建存储目录失败: %w", err)
	}

	// 先加载现有数据
	if err := s.loadData(); err != nil {
		return err
	}

	// 然后再检查并设置默认值
	keys := s.GetKeys()
	if !slices.Contains(keys, "language") {
		fmt.Println("设置语言为en")
		s.Set("language", "en")
	}

	if !slices.Contains(keys, "port") {
		fmt.Println("设置端口为9482")
		s.Set("port", "9482")
	}

	if !slices.Contains(keys, "share-list") {
		fmt.Println("设置share-list为空")
		s.Set("share-list", []interface{}{})
	}

	if !slices.Contains(keys, "is-share") {
		fmt.Println("设置is-share为false")
		s.Set("is-share", false)
	}

	return nil
}

func (s *StorageService) GetBasePath() string {
	env := system.GetEnv()
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

// Set 设置键值对
func (s *StorageService) Set(key string, value interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data[key] = value
	return s.saveData()
}

// Get 获取值
func (s *StorageService) Get(key string) (interface{}, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	value, exists := s.data[key]
	return value, exists
}

// Delete 删除键值对
func (s *StorageService) Delete(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	delete(s.data, key)
	return s.saveData()
}

// loadData 从文件加载数据
func (s *StorageService) loadData() error {
	data, err := os.ReadFile(s.storagePath)
	if os.IsNotExist(err) {
		return nil // 文件不存在时返回空数据
	}
	if err != nil {
		return fmt.Errorf("读取存储文件失败: %w", err)
	}

	return json.Unmarshal(data, &s.data)
}

// saveData 保存数据到文件
func (s *StorageService) saveData() error {
	data, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化数据失败: %w", err)
	}

	return os.WriteFile(s.storagePath, data, 0644)
}

// GetKeys 获取所有键列表
func (s *StorageService) GetKeys() []string {
	s.mu.RLock()
	defer s.mu.RUnlock()

	keys := make([]string, 0, len(s.data))
	for key := range s.data {
		keys = append(keys, key)
	}
	return keys
}

// Clear 清除所有数据
func (s *StorageService) Clear() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.data = make(map[string]interface{})
	return s.saveData()
}
