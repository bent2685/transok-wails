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
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return ""
	}

	for _, addr := range addrs {
		// 检查ip地址判断是否回环地址
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
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
