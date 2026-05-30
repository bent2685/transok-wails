package services

import (
	"net"
	"testing"
)

func mustMAC(t *testing.T, s string) net.HardwareAddr {
	t.Helper()
	mac, err := net.ParseMAC(s)
	if err != nil {
		t.Fatalf("parse mac %q: %v", s, err)
	}
	return mac
}

func TestIsVirtualInterface(t *testing.T) {
	cases := []struct {
		name string
		mac  string
		want bool
	}{
		// Virtual adapters that previously polluted the share-link list.
		{"docker0", "02:42:ac:11:00:01", true},                    // Docker, by name and OUI
		{"vEthernet (Default Switch)", "00:15:5d:01:02:03", true}, // Hyper-V
		{"VMware Network Adapter VMnet8", "00:50:56:c0:00:08", true},
		{"VirtualBox Host-Only Network", "0a:00:27:00:00:00", true},
		{"utun4", "", true},                  // macOS VPN tunnel
		{"awdl0", "b6:d2:35:05:83:a0", true}, // Apple Wireless Direct Link
		// Real LAN adapters that must be kept.
		{"以太网", "a4:bb:6d:11:22:33", false},
		{"WLAN", "a4:bb:6d:44:55:66", false},
		{"en0", "ca:74:91:e1:71:0b", false},
		{"Ethernet", "00:1a:2b:3c:4d:5e", false},
	}

	for _, c := range cases {
		iface := net.Interface{Name: c.name}
		if c.mac != "" {
			iface.HardwareAddr = mustMAC(t, c.mac)
		}
		if got := isVirtualInterface(iface); got != c.want {
			t.Errorf("isVirtualInterface(%q, %q) = %v, want %v", c.name, c.mac, got, c.want)
		}
	}
}

func TestInterfaceTypeScoreEthernetRanksAboveWifi(t *testing.T) {
	ethernet := interfaceTypeScore(net.Interface{Name: "以太网"})
	ethernetEN := interfaceTypeScore(net.Interface{Name: "Ethernet"})
	wifi := interfaceTypeScore(net.Interface{Name: "WLAN"})
	wifiHyphen := interfaceTypeScore(net.Interface{Name: "Wi-Fi"})
	unknown := interfaceTypeScore(net.Interface{Name: "en0"})

	if !(ethernet > wifi && ethernetEN > wifiHyphen && wifi > unknown) {
		t.Errorf("expected ethernet > wifi > unknown, got ethernet=%d wifi=%d unknown=%d", ethernet, wifi, unknown)
	}
}
