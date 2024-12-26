package services

import (
	"context"
	"sync"
	"time"
	"transok/backend/consts"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type systemService struct {
	ctx     context.Context
	version string
	appInfo map[string]string
}

var system *systemService
var systemOnce sync.Once

func System() *systemService {
	if system == nil {
		systemOnce.Do(func() {
			system = &systemService{}
			system.appInfo = consts.APP_INFO
			go system.loopWindowEvent()
		})
	}
	return system
}

func (c *systemService) Start(ctx context.Context, version string) {
	c.ctx = ctx
	c.version = version

	if screen, err := runtime.ScreenGetAll(ctx); err == nil && len(screen) > 0 {
		for _, sc := range screen {
			if sc.IsCurrent {
				if sc.Size.Width < consts.MIN_WINDOW_WIDTH || sc.Size.Height < consts.MIN_WINDOW_HEIGHT {
					runtime.WindowMaximise(ctx)
					break
				}
			}
		}
	}
}

// GetVersion 获取版本号
func (c *systemService) GetVersion() string {
	return c.version
}

func (c *systemService) GetAppInfo() map[string]string {
	return c.appInfo
}

func (s *systemService) loopWindowEvent() {
	for {
		time.Sleep(time.Second + time.Millisecond*500)
		if s.ctx != nil {
			runtime.WindowShow(s.ctx)
			break
		}
	}

}
