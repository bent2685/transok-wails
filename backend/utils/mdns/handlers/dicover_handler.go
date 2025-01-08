package handlers

import (
	"fmt"
	"transok/backend/consts"
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
	// 处理聊天消息的逻辑
	fmt.Println("DiscoverHandler: ", payload)
}
