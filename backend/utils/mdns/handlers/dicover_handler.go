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
	fmt.Println("DiscoverHandler: ", payload)

	// 将 payload.Payload 转换为 DiscoverPayload
	device := DiscoverDevice{
		IP:       payload.Payload["IP"],
		Port:     payload.Payload["Port"],
		Uname:    payload.Payload["Uname"],
		Platform: payload.Payload["Platform"],
		Address:  fmt.Sprintf("%s:%s", payload.Payload["IP"], payload.Payload["Port"]),
	}

	// 初始化设备列表
	keys := services.Storage().GetKeys()
	hasList := false
	for _, key := range keys {
		if key == "discover-list" {
			hasList = true
			break
		}
	}
	if !hasList {
		services.Storage().Set("discover-list", []DiscoverDevice{})
	}

	// 获取现有设备列表
	var deviceList []DiscoverDevice
	discoverList, ok := services.Storage().Get("discover-list")
	if !ok {
		fmt.Println("获取 discover-list 失败")
		return
	}

	// 将 interface{} 转换为 []DiscoverDevice
	if list, ok := discoverList.([]interface{}); ok {
		for _, item := range list {
			if deviceMap, ok := item.(map[string]interface{}); ok {
				dev := mapperDiscoverDevice(deviceMap)
				deviceList = append(deviceList, dev)
			}
		}
	}

	// 添加新设备并去重
	deviceExists := false
	for i, dev := range deviceList {
		if dev.Address == device.Address {
			// 更新设备信息
			deviceList[i] = device
			deviceExists = true
			break
		}
	}
	if !deviceExists {
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
	discoverList, ok := services.Storage().Get("discover-list")
	fmt.Printf("获取discover-list结果: %v, ok: %v\n", discoverList, ok)

	if !ok {
		fmt.Println("从Storage获取discover-list失败")
		return []DiscoverDevice{}
	}

	// 直接尝试将 discoverList 转换为 []DiscoverDevice
	var deviceList []DiscoverDevice

	// 方法1：使用 json.Marshal 和 json.Unmarshal 进行类型转换
	jsonData, err := json.Marshal(discoverList)
	if err != nil {
		fmt.Printf("Marshal失败: %v\n", err)
		return []DiscoverDevice{}
	}

	err = json.Unmarshal(jsonData, &deviceList)
	if err != nil {
		fmt.Printf("Unmarshal失败: %v\n", err)
		return []DiscoverDevice{}
	}

	// 检查设备可访问性
	var accessibleDevices []DiscoverDevice
	for _, dev := range deviceList {
		if ping(dev.Address) {
			accessibleDevices = append(accessibleDevices, dev)
		}
	}

	services.Storage().Set("discover-list", accessibleDevices)

	fmt.Printf("最终返回的设备列表: %+v\n", accessibleDevices)
	return accessibleDevices
}
