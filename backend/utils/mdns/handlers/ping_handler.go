package handlers

import (
	"fmt"
	"transok/backend/consts"
)

type PingHandler struct {
}

func NewPingHandler() *PingHandler {
	return &PingHandler{}
}

func (h *PingHandler) GetType() string {
	return "PING"
}

func (h *PingHandler) Handle(payload consts.DiscoverPayload) {
	// 处理聊天消息的逻辑
	fmt.Println("PingHandler: ", "PONG")
}
