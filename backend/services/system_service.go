package services

import (
	"context"
	"net"
	"runtime"
	"sync"
	"time"
	"transok/backend/consts"

	wailsRuntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

type SystemService struct {
	ctx     context.Context
	env     string
	version string
	appInfo map[string]string
}

var system *SystemService
var systemOnce sync.Once

func System() *SystemService {
	if system == nil {
		systemOnce.Do(func() {
			system = &SystemService{}
			system.appInfo = consts.APP_INFO
			system.env = consts.APP_INFO["env"]
			go system.loopWindowEvent()
		})
	}
	return system
}

func (c *SystemService) Start(ctx context.Context, version string) {
	c.ctx = ctx
	c.version = version

	if screen, err := wailsRuntime.ScreenGetAll(ctx); err == nil && len(screen) > 0 {
		for _, sc := range screen {
			if sc.IsCurrent {
				if sc.Size.Width < consts.MIN_WINDOW_WIDTH || sc.Size.Height < consts.MIN_WINDOW_HEIGHT {
					wailsRuntime.WindowMaximise(ctx)
					break
				}
			}
		}
	}
}

// GetVersion 获取版本号
func (c *SystemService) GetVersion() string {
	return c.version
}

// GetEnv 获取环境
func (c *SystemService) GetEnv() string {
	return c.env
}

// 获取本机局域网ip，可以排除指定的IP地址，排除广播和网络地址
func (c *SystemService) GetLocalIp(excludeIps []string) string {
	// 将 excludeIps 转换为 map，便于快速查找
	excludeMap := make(map[string]bool)
	for _, ip := range excludeIps {
		excludeMap[ip] = true
	}

	// 获取所有网络接口
	interfaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}

	// 用于存储找到的IP地址
	var classA, classB, classC, publicIP string

	// 遍历所有网络接口
	for _, iface := range interfaces {
		// 跳过禁用的接口和回环接口
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		for _, addr := range addrs {
			ipNet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}

			ip4 := ipNet.IP.To4()
			if ip4 == nil {
				continue
			}

			// 排除特殊地址
			if ip4[0] == 169 && ip4[1] == 254 { // 排除链路本地地址
				continue
			}

			ipStr := ip4.String()
			if excludeMap[ipStr] {
				continue
			}

			// 排除网络地址和广播地址
			if ip4[3] == 0 || ip4[3] == 255 {
				continue
			}

			// 根据IP地址范围分类存储
			if !ip4.IsLoopback() {
				if ip4[0] == 192 && ip4[1] == 168 {
					classC = ipStr
				} else if ip4[0] == 172 && ip4[1] >= 16 && ip4[1] <= 31 {
					classB = ipStr
				} else if ip4[0] == 10 {
					classA = ipStr
				} else if !ip4.IsPrivate() {
					publicIP = ipStr
				}
			}
		}
	}

	// 按优先级返回IP地址
	if classC != "" {
		return classC
	}
	if classB != "" {
		return classB
	}
	if classA != "" {
		return classA
	}
	if publicIP != "" {
		return publicIP
	}

	return "127.0.0.1"
}

func (c *SystemService) GetAppInfo() map[string]string {
	return c.appInfo
}

func (c *SystemService) GetPlatform() string {
	return runtime.GOOS
}

func (s *SystemService) loopWindowEvent() {
	for {
		time.Sleep(time.Second + time.Millisecond*500)
		if s.ctx != nil {
			wailsRuntime.WindowShow(s.ctx)
			break
		}
	}

}
