package services

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"
	"transok/backend/consts"
	"transok/backend/utils/logger"
	"transok/backend/utils/mdns"

	"github.com/google/uuid"
	"github.com/grandcat/zeroconf"
	"go.uber.org/zap"
)

type DiscoverService struct {
	ctx    context.Context
	cancel context.CancelFunc
	server *zeroconf.Server
	ticker *time.Ticker
	done   chan bool
	id     string
}

var (
	discoverService *DiscoverService
	once            sync.Once
)

func GetDiscoverService() *DiscoverService {
	once.Do(func() {
		discoverService = &DiscoverService{
			id: uuid.New().String(),
		}
	})
	return discoverService
}

/* Start 开始监听mdns广播 */
func (s *DiscoverService) Start() error {
	logger.Info("开始监听mdns广播...")
	resolver, err := zeroconf.NewResolver(nil)
	if err != nil {
		logger.Error("创建resolver失败", zap.Error(err))
		return err
	}

	s.ctx, s.cancel = context.WithCancel(context.Background())

	entries := make(chan *zeroconf.ServiceEntry)
	go func() {
		logger.Info("开始浏览服务...")
		err = resolver.Browse(s.ctx, "_transok._tcp", "local.", entries)
		if err != nil {
			logger.Error("浏览服务失败", zap.Error(err))
			return
		}
	}()

	go func() {
		logger.Info("等待服务发现...")

		for entry := range entries {
			logger.Debug("收到原始服务条目", zap.Any("entry", entry))

			// 查找包含数据的 TXT 记录
			var jsonData string
			for _, txt := range entry.Text {
				if len(txt) > 5 && txt[:5] == "data=" {
					jsonData = txt[5:]
					break
				}
			}

			if jsonData == "" {
				continue
			}

			// 去除多余的转义符
			jsonData = strings.ReplaceAll(jsonData, `\"`, `"`)

			var data consts.DiscoverPayload

			// 解析 JSON 字符串到 DiscoverPayload 结构体
			if err := json.Unmarshal([]byte(jsonData), &data); err != nil {
				logger.Error("解析JSON数据失败", zap.Error(err))
				continue
			}

			/* 如果发送者是自己，则跳过 */
			// if data.Sender == s.id {
			// 	continue
			// }

			logger.Info("发现服务", zap.Any("data", data))

			// 使用调度器处理消息
			mdns.GetDispatcher().Dispatch(data)
		}
	}()

	return nil
}

/* Broadcast 开始广播服务 */
func (s *DiscoverService) Broadcast(port int, payload consts.DiscoverPayload) error {
	// 构建 DiscoverPayload
	discoverPayload := consts.DiscoverPayload{
		Type:    payload.Type,
		Sender:  s.id,
		Payload: payload.Payload,
	}

	// 序列化为 JSON
	jsonBytes, err := json.Marshal(discoverPayload)
	if err != nil {
		return fmt.Errorf("序列化payload失败: %v", err)
	}

	// 将 JSON 字符串作为单个 TXT 记录
	txtRecords := []string{
		fmt.Sprintf("data=%s", string(jsonBytes)),
	}

	// 修改服务注册配置
	server, err := zeroconf.Register(
		fmt.Sprintf("TransokService_%s", s.id),
		"_transok._tcp",
		"local.",
		port,
		txtRecords,
		nil,
	)
	if err != nil {
		logger.Error("注册广播服务失败", zap.Error(err))
		return err
	}

	// 保存server实例前，确保关闭旧的实例
	if s.server != nil {
		s.server.Shutdown()
	}
	s.server = server

	logger.Info("服务已开始广播",
		zap.String("id", s.id),
		zap.Int("port", port),
		zap.Any("payload", discoverPayload),
	)
	return nil
}

/* StartPeriodicBroadcast 开始定期广播 */
func (s *DiscoverService) StartPeriodicBroadcast(port int, payload consts.DiscoverPayload, interval time.Duration) {
	if s.ticker != nil {
		return
	}

	s.ticker = time.NewTicker(interval)
	s.done = make(chan bool)

	go func() {
		_ = s.Broadcast(port, payload)

		for {
			select {
			case <-s.ticker.C:
				if s.server != nil {
					s.server.Shutdown()
				}
				_ = s.Broadcast(port, payload)
			case <-s.done:
				if s.server != nil {
					s.server.Shutdown()
				}
				return
			}
		}
	}()
}

/* StopPeriodicBroadcast 停止定期广播 */
func (s *DiscoverService) StopPeriodicBroadcast() {
	if s.ticker != nil {
		s.ticker.Stop()
		s.done <- true
		close(s.done)
		s.ticker = nil

		if s.server != nil {
			s.server.Shutdown()
			s.server = nil
		}
	}
}

// 修改 Stop 方法
func (s *DiscoverService) Stop() {
	s.StopPeriodicBroadcast()
	if s.cancel != nil {
		s.cancel()
	}
}
