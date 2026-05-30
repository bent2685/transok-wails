package consts

const DEFAULT_FONT_SIZE = 14
const DEFAULT_ASIDE_WIDTH = 300
const DEFAULT_WINDOW_WIDTH = 1024
const DEFAULT_WINDOW_HEIGHT = 768
const MIN_WINDOW_WIDTH = 960
const MIN_WINDOW_HEIGHT = 640

// Log configuration
const (
	ENABLE_LOG           = true // Whether to enable file logs
	DEFAULT_LOG_MAX_SIZE = 100  // Maximum size of each log file (MB)
	DEFAULT_LOG_BACKUPS  = 3    // Maximum number of old log files to keep
	DEFAULT_LOG_MAX_AGE  = 28   // Maximum number of days to keep old log files
)

var APP_INFO = map[string]string{
	"name":    "Transok",
	"env":     "prod",
	"version": "0.5.2",
	"desc":    "Transok is an efficient LAN file sharing tool",
	"author":  "bent2685",
	"email":   "bent2685@outlook.com",
}

type DiscoverPayload struct {
	Type    string
	Sender  string
	Payload map[string]string
}
