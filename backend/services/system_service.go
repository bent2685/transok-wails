package services

import (
	"context"
	"net"
	"runtime"
	"sort"
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

// GetVersion returns the version number
func (c *SystemService) GetVersion() string {
	return c.version
}

// GetEnv returns the environment
func (c *SystemService) GetEnv() string {
	return c.env
}

// GetLocalIp gets the local area network IP, allows excluding specific IPs, and filters out broadcast and network addresses
func (c *SystemService) GetLocalIp(excludeIps []string) string {
	// Convert excludeIps to a map for faster lookup
	excludeMap := make(map[string]bool)
	for _, ip := range excludeIps {
		excludeMap[ip] = true
	}

	// Get all network interfaces
	interfaces, err := net.Interfaces()
	if err != nil {
		return "127.0.0.1"
	}

	// Used to store found IP addresses
	var classA, classB, classC, publicIP string

	// Iterate through all network interfaces
	for _, iface := range interfaces {
		// Skip disabled interfaces and loopback interfaces
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

			// Exclude special addresses
			if ip4[0] == 169 && ip4[1] == 254 { // Exclude link-local addresses
				continue
			}

			ipStr := ip4.String()
			if excludeMap[ipStr] {
				continue
			}

			// Exclude network and broadcast addresses
			if ip4[3] == 0 || ip4[3] == 255 {
				continue
			}

			// Categorize storage based on IP range
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

	// Return IP address by priority
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

// GetLocalIps returns all LAN-reachable IPv4 addresses, ordered so the links a
// LAN peer can actually open come first. Virtual adapters (Docker / VMware /
// VirtualBox / Hyper-V / VPN tunnels) are excluded, only private addresses are
// kept, and wired (Ethernet) interfaces rank above Wi-Fi.
func (c *SystemService) GetLocalIps() []string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return []string{}
	}

	// The source IP of the default route is guaranteed reachable; rank it first
	// among interfaces of the same type.
	primaryIP := preferredOutboundIP()

	type candidate struct {
		ip    string
		score int
	}
	var candidates []candidate
	seen := make(map[string]bool)

	for _, iface := range interfaces {
		// Skip disabled, loopback and virtual interfaces.
		if iface.Flags&net.FlagUp == 0 || iface.Flags&net.FlagLoopback != 0 {
			continue
		}
		if isVirtualInterface(iface) {
			continue
		}

		addrs, err := iface.Addrs()
		if err != nil {
			continue
		}

		typeScore := interfaceTypeScore(iface)

		for _, addr := range addrs {
			ipNet, ok := addr.(*net.IPNet)
			if !ok {
				continue
			}

			ip4 := ipNet.IP.To4()
			if ip4 == nil {
				continue
			}

			// Skip link-local, network/broadcast and loopback addresses.
			if ip4[0] == 169 && ip4[1] == 254 {
				continue
			}
			if ip4[3] == 0 || ip4[3] == 255 || ip4.IsLoopback() {
				continue
			}

			// Only private addresses can be reached by peers on the same LAN.
			if !ip4.IsPrivate() {
				continue
			}

			ipStr := ip4.String()
			if seen[ipStr] {
				continue
			}
			seen[ipStr] = true

			score := typeScore
			if ipStr == primaryIP {
				score += 50
			}
			candidates = append(candidates, candidate{ip: ipStr, score: score})
		}
	}

	sort.SliceStable(candidates, func(i, j int) bool {
		return candidates[i].score > candidates[j].score
	})

	result := make([]string, 0, len(candidates))
	for _, c := range candidates {
		result = append(result, c.ip)
	}
	return result
}

// preferredOutboundIP resolves the local source IP the OS would use to reach an
// external host. No packet is actually sent — the UDP "connection" only triggers
// route resolution. Returns "" when there is no usable route.
func preferredOutboundIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		return ""
	}
	defer conn.Close()

	localAddr, ok := conn.LocalAddr().(*net.UDPAddr)
	if !ok {
		return ""
	}
	ip4 := localAddr.IP.To4()
	if ip4 == nil {
		return ""
	}
	return ip4.String()
}

// virtualInterfaceOUIs lists the MAC address prefixes used by common
// virtualization / tunnelling software. Matching by OUI is language-independent,
// which matters because interface names are localized on Windows.
var virtualInterfaceOUIs = []string{
	"00:05:69", "00:0c:29", "00:50:56", "00:1c:14", // VMware
	"08:00:27", "0a:00:27", // VirtualBox
	"00:15:5d", // Hyper-V
	"00:1c:42", // Parallels
	"00:16:3e", // Xen
	"02:42",    // Docker bridge
}

// virtualInterfaceNames lists case-insensitive substrings found in the names of
// virtual adapters across Windows and macOS.
var virtualInterfaceNames = []string{
	"docker", "veth", "virtual", "vmware", "vmnet", "vbox", "virtualbox",
	"vethernet", "hyper-v", "tailscale", "zerotier", "wireguard", "wintun",
	"hamachi", "radmin", "loopback", "tun", "tap", "utun", "ppp", "ipsec",
	"vpn", "awdl", "llw", "default switch",
}

// isVirtualInterface reports whether the interface belongs to virtualization or
// tunnelling software whose addresses LAN peers cannot reach.
func isVirtualInterface(iface net.Interface) bool {
	name := strings.ToLower(iface.Name)
	for _, kw := range virtualInterfaceNames {
		if strings.Contains(name, kw) {
			return true
		}
	}

	mac := strings.ToLower(iface.HardwareAddr.String())
	for _, oui := range virtualInterfaceOUIs {
		if strings.HasPrefix(mac, oui) {
			return true
		}
	}
	return false
}

// interfaceTypeScore ranks wired Ethernet above Wi-Fi above anything else, so
// the more stable connection's link is offered first. Detection is name-based;
// when the type is unknown the default-route boost still surfaces the active one.
func interfaceTypeScore(iface net.Interface) int {
	name := strings.ToLower(iface.Name)
	for _, kw := range []string{"wi-fi", "wifi", "wlan", "wireless", "无线", "airport"} {
		if strings.Contains(name, kw) {
			return 200
		}
	}
	for _, kw := range []string{"ethernet", "以太网", "local area", "本地连接"} {
		if strings.Contains(name, kw) {
			return 300
		}
	}
	return 100
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
