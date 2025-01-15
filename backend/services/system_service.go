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

// 获取本机局域网ip
func (c *SystemService) GetLocalIp() string {
	// 获取所有网络接口
	interfaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}

	// 遍历所有网络接口
	for _, iface := range interfaces {
		// 跳过禁用的接口和回环接口
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}

		// 获取接口的地址
		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		// 遍历地址
		for _, addr := range addrs {
			// 尝试转换为 IP 网络接口
			ipNet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}

			// 获取 IPv4 地址
			ip4 := ipNet.IP.To4()
			if ip4 == nil {
				continue
			}

			// 排除特殊地址
			if ip4[0] == 169 && ip4[1] == 254 { // 排除链路本地地址
				continue
			}

			// 返回第一个有效的非内网 IPv4 地址
			if !ip4.IsLoopback() && !ip4.IsPrivate() {
				return ip4.String()
			}

			// 如果没有公网地址，也接受私有地址
			if !ip4.IsLoopback() {
				return ip4.String()
			}
		}
	}

	// 如果没有找到合适的地址，返回本地回环地址
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
