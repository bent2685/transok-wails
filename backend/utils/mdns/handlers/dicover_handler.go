package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"transok/backend/consts"
	"transok/backend/services"
)

type DiscoverDevice struct {
	IP       string `json:"ip"`
	Port     string `json:"port"`
	Uname    string `json:"uname"`
	Platform string `json:"platform"`
	Address  string `json:"address"`
}

type DiscoverHandler struct {
}

var (
	discoverHandler *DiscoverHandler
	once            sync.Once
)

func GetDiscoverHandler() *DiscoverHandler {
	once.Do(func() {
		discoverHandler = &DiscoverHandler{}
	})
	return discoverHandler
}

func (h *DiscoverHandler) GetType() string {
	return "DISCOVER"
}

func (h *DiscoverHandler) Handle(payload consts.DiscoverPayload) {
	device := DiscoverDevice{
		IP:       payload.Payload["IP"],
		Port:     payload.Payload["Port"],
		Uname:    payload.Payload["Uname"],
		Platform: payload.Payload["Platform"],
		Address:  fmt.Sprintf("%s:%s", payload.Payload["IP"], payload.Payload["Port"]),
	}

	var deviceList []DiscoverDevice
	if discoverList, ok := services.Storage().Get("discover-list"); ok {
		jsonData, _ := json.Marshal(discoverList)
		json.Unmarshal(jsonData, &deviceList)
	}

	// 通过 Address 去重，如果存在则更新信息
	found := false
	for i, dev := range deviceList {
		if dev.Address == device.Address {
			deviceList[i] = device // 更新设备信息
			found = true
			break
		}
	}
	if !found {
		deviceList = append(deviceList, device)
	}

	services.Storage().Set("discover-list", deviceList)
}

/* 测试地址是否连通 */
func ping(address string) bool {
	resp, err := http.Get("http://" + address + "/discover/ping")
	if err != nil {
		fmt.Printf("ping %s 失败: %v\n", address, err)
		return false
	}
	defer resp.Body.Close()

	// 读取响应内容
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("读取响应失败: %v\n", err)
		return false
	}

	// 解析JSON响应
	var result struct {
		Success bool `json:"success"`
	}
	if err := json.Unmarshal(body, &result); err != nil {
		fmt.Printf("解析JSON失败: %v\n", err)
		return false
	}

	return result.Success
}

func mapperDiscoverDevice(device map[string]interface{}) DiscoverDevice {
	return DiscoverDevice{
		IP:       device["ip"].(string),
		Port:     device["port"].(string),
		Uname:    device["uname"].(string),
		Platform: device["platform"].(string),
		Address:  device["address"].(string),
	}
}

/* 获取发现列表 */
func (h *DiscoverHandler) GetDiscoverList() []DiscoverDevice {
	var deviceList []DiscoverDevice
	if discoverList, ok := services.Storage().Get("discover-list"); ok {
		jsonData, _ := json.Marshal(discoverList)
		json.Unmarshal(jsonData, &deviceList)
	}

	// 只返回能 ping 通的设备，并从存储中删除不可访问的设备
	var accessibleDevices []DiscoverDevice
	var needUpdate bool

	for _, dev := range deviceList {
		if ping(dev.Address) {
			accessibleDevices = append(accessibleDevices, dev)
		} else {
			needUpdate = true // 标记需要更新存储
		}
	}

	// 如果有不可访问的设备被过滤掉，更新存储
	if needUpdate {
		services.Storage().Set("discover-list", accessibleDevices)
	}

	return accessibleDevices
}
