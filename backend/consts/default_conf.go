package consts

const DEFAULT_FONT_SIZE = 14
const DEFAULT_ASIDE_WIDTH = 300
const DEFAULT_WINDOW_WIDTH = 1024
const DEFAULT_WINDOW_HEIGHT = 768
const MIN_WINDOW_WIDTH = 960
const MIN_WINDOW_HEIGHT = 640

// 日志配置
const (
	ENABLE_LOG           = true // 是否启用文件日志
	DEFAULT_LOG_MAX_SIZE = 100  // 每个日志文件的最大尺寸（MB）
	DEFAULT_LOG_BACKUPS  = 3    // 保留的旧日志文件最大数量
	DEFAULT_LOG_MAX_AGE  = 28   // 保留的旧日志文件最大天数
)

var APP_INFO = map[string]string{
	"name":    "Transok",
	"env":     "dev",
	"version": "0.3.2",
	"desc":    "Transok is an efficient LAN file sharing tool",
	"author":  "bent2685",
	"email":   "bent2685@outlook.com",
}

type DiscoverPayload struct {
	Type    string
	Sender  string
	Payload map[string]string
}
