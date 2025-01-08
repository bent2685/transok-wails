package mdns

import (
	"sync"
	"transok/backend/consts"
)

// Handler 使用handlers包中定义的接口
type Handler interface {
	GetType() string
	Handle(payload consts.DiscoverPayload)
}

// Dispatcher MDNS消息调度器
type Dispatcher struct {
	handlers map[string][]Handler
	mu       sync.RWMutex
}

var (
	defaultDispatcher *Dispatcher
	once              sync.Once
)

// GetDispatcher 获取单例的调度器实例
func GetDispatcher() *Dispatcher {
	once.Do(func() {
		defaultDispatcher = &Dispatcher{
			handlers: make(map[string][]Handler),
		}
	})
	return defaultDispatcher
}

// Subscribe 修改为接收Handler接口
func (d *Dispatcher) Subscribe(handler Handler) {
	d.mu.Lock()
	defer d.mu.Unlock()

	messageType := handler.GetType()
	if d.handlers[messageType] == nil {
		d.handlers[messageType] = make([]Handler, 0)
	}
	d.handlers[messageType] = append(d.handlers[messageType], handler)
}

// Unsubscribe 取消订阅特定类型的消息处理
func (d *Dispatcher) Unsubscribe(messageType string, handler Handler) {
	d.mu.Lock()
	defer d.mu.Unlock()

	if handlers, exists := d.handlers[messageType]; exists {
		for i, h := range handlers {
			if &h == &handler {
				d.handlers[messageType] = append(handlers[:i], handlers[i+1:]...)
				break
			}
		}
	}
}

// Dispatch 分发消息到对应的处理器
func (d *Dispatcher) Dispatch(payload consts.DiscoverPayload) {
	d.mu.RLock()
	handlers, exists := d.handlers[payload.Type]
	d.mu.RUnlock()

	if !exists {
		return
	}

	// 调用所有注册的处理器
	for _, handler := range handlers {
		go handler.Handle(payload)
	}
}
