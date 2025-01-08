package handlers

import (
	"fmt"
	"net"
	"time"
	"transok/backend/consts"
	"transok/backend/services"
)

type DiscoverHandler struct {
}

func NewDiscoverHandler() *DiscoverHandler {
	return &DiscoverHandler{}
}

func (h *DiscoverHandler) GetType() string {
	return "DISCOVER"
}

func (h *DiscoverHandler) Handle(payload consts.DiscoverPayload) {
	fmt.Println("DiscoverHandler: ", payload)
	ip := payload.Payload["ip"]
	port := payload.Payload["port"]
	address := fmt.Sprintf("%s:%s", ip, port)

	// 添加连通性测试
	timeout := time.Second * 5
	conn, err := net.DialTimeout("tcp", address, timeout)
	if err != nil {
		fmt.Printf("连接到 %s 失败: %v\n", address, err)
		return
	}
	defer conn.Close()

	keys := services.Storage().GetKeys()
	hasList := false
	for _, key := range keys {
		if key == "discover-list" {
			hasList = true
			break
		}
	}
	if !hasList {
		services.Storage().Set("discover-list", []string{})
	}

	discoverList, ok := services.Storage().Get("discover-list")
	if !ok {
		fmt.Println("获取 discover-list 失败")
		return
	}

	// 将 interface{} 转换为 []string
	var stringList []string
	if list, ok := discoverList.([]interface{}); ok {
		for _, item := range list {
			if str, ok := item.(string); ok {
				stringList = append(stringList, str)
			}
		}
	}

	stringList = append(stringList, address)
	// 去重复
	uniqueList := make([]string, 0)
	seen := make(map[string]bool)
	for _, addr := range stringList {
		if !seen[addr] {
			seen[addr] = true
			uniqueList = append(uniqueList, addr)
		}
	}

	accessList := make([]string, 0)
	for _, addr := range uniqueList {
		if ping(addr) {
			accessList = append(accessList, addr)
		}
	}

	services.Storage().Set("discover-list", accessList)
}

func ping(address string) bool {
	conn, err := net.DialTimeout("tcp", address, time.Second*3)
	if err != nil {
		return false
	}
	defer conn.Close()
	return true
}
