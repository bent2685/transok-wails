package services

import (
	"context"
	"net"
	"runtime"
	"strings"
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

	var wlanIP string
	var ethernetIP string

	// 遍历所有网络接口
	for _, iface := range interfaces {
		// 检查接口是否启用且不是回环接口
		if iface.Flags&net.FlagUp != 0 && iface.Flags&net.FlagLoopback == 0 {
			name := iface.Name
			// 跳过虚拟接口
			if strings.Contains(strings.ToLower(name), "virtual") ||
				strings.Contains(strings.ToLower(name), "vethernet") ||
				strings.Contains(strings.ToLower(name), "vmware") ||
				strings.Contains(strings.ToLower(name), "vbox") {
				continue
			}

			isWlan := false
			isEthernet := false

			switch runtime.GOOS {
			case "windows":
				// Windows 下通过描述来判断接口类型
				description := name
				isWlan = strings.Contains(strings.ToLower(description), "wireless") ||
					strings.Contains(strings.ToLower(description), "wi-fi") ||
					strings.Contains(strings.ToLower(description), "wlan")
				isEthernet = strings.Contains(strings.ToLower(description), "ethernet") ||
					strings.Contains(strings.ToLower(description), "gigabit")
			case "darwin":
				// macOS 下 en0 通常是内置网卡（Wi-Fi），en1/en2 等可能是以太网
				isWlan = name == "en0"
				isEthernet = strings.HasPrefix(name, "en") && name != "en0"
			case "linux":
				isWlan = strings.HasPrefix(name, "wlan") || strings.HasPrefix(name, "wifi")
				isEthernet = strings.HasPrefix(name, "eth") || strings.HasPrefix(name, "enp") || strings.HasPrefix(name, "eno")
			}

			addrs, err := iface.Addrs()
			if err != nil {
				continue
			}

			for _, addr := range addrs {
				if ipnet, ok := addr.(*net.IPNet); ok {
					if ip4 := ipnet.IP.To4(); ip4 != nil && isPrivateIP(ip4) {
						if isWlan {
							wlanIP = ip4.String()
						} else if isEthernet {
							ethernetIP = ip4.String()
						}
					}
				}
			}
		}
	}

	if wlanIP != "" {
		return wlanIP
	}
	return ethernetIP
}

func isPrivateIP(ip net.IP) bool {
	return ip[0] == 192 && ip[1] == 168 || // 192.168.0.0/16
		ip[0] == 10 || // 10.0.0.0/8
		(ip[0] == 172 && ip[1] >= 16 && ip[1] <= 31) // 172.16.0.0/12
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
