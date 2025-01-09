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
	interfaces, err := net.Interfaces()
	if err != nil {
		return ""
	}

	// 遍历所有网络接口
	for _, iface := range interfaces {
		// 检查接口是否启用且不是回环接口
		if iface.Flags&net.FlagUp != 0 && iface.Flags&net.FlagLoopback == 0 {
			addrs, err := iface.Addrs()
			if err != nil {
				continue
			}

			for _, addr := range addrs {
				if ipnet, ok := addr.(*net.IPNet); ok {
					if ip4 := ipnet.IP.To4(); ip4 != nil {
						// 检查是否是私有IP地址
						// RFC 1918 私有网络
						if ip4[0] == 192 && ip4[1] == 168 || // 192.168.0.0/16
							ip4[0] == 10 || // 10.0.0.0/8
							(ip4[0] == 172 && ip4[1] >= 16 && ip4[1] <= 31) || // 172.16.0.0/12
							// 其他特殊用途地址
							(ip4[0] == 169 && ip4[1] == 254) || // 169.254.0.0/16 (APIPA)
							(ip4[0] == 100 && ip4[1] >= 64 && ip4[1] <= 127) { // 100.64.0.0/10 (CGN)
							return ip4.String()
						}
					}
				}
			}
		}
	}
	return ""
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
