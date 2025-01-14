package services

import (
	"context"
	"sync"
)

type ShareService struct {
	ctx context.Context
}

var share *ShareService
var shareOnce sync.Once

func Share() *ShareService {
	if share == nil {
		shareOnce.Do(func() {
			share = &ShareService{}
		})
	}
	return share
}

func (s *ShareService) Start(ctx context.Context) {
	s.ctx = ctx
}

/* 设置分享密钥 */
func (s *ShareService) SetCaptcha(captcha string) {
	store := Storage()
	store.Set("captcha", captcha)
}

/* 获取分享密钥 */
func (s *ShareService) GetCaptcha() string {
	store := Storage()
	captcha, exists := store.Get("captcha")
	if !exists {
		return ""
	}
	return captcha.(string)
}
