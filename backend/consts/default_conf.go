package consts

const DEFAULT_FONT_SIZE = 14
const DEFAULT_ASIDE_WIDTH = 300
const DEFAULT_WINDOW_WIDTH = 1024
const DEFAULT_WINDOW_HEIGHT = 768
const MIN_WINDOW_WIDTH = 960
const MIN_WINDOW_HEIGHT = 640

var APP_INFO = map[string]string{
	"name":    "Transok",
	"env":     "dev",
	"version": "0.3.0",
	"desc":    "Transok is an efficient LAN file sharing tool",
	"author":  "bent2685",
	"email":   "bent2685@outlook.com",
}

type DiscoverPayload struct {
	Type    string
	Sender  string
	Payload map[string]string
}
