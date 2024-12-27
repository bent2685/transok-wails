package resp

type Err struct {
	Code    int         `json:"code"`
	Success bool        `json:"success"`
	Msg     string      `json:"msg"`
	Data    interface{} `json:"data"`
}

// NewErr 创建一个新的错误
func NewErr(code int, success bool, msg string) *Err {
	return &Err{
		Code:    code,
		Success: success,
		Msg:     msg,
	}
}

// 实现error接口
func (e *Err) Error() string {
	return e.Msg
}

// Out 抛出
func (e *Err) Out() {
	panic(*e)
}

// WithMsg 带数据的错误
func (e *Err) WithMsg(msg string) *Err {
	e.Msg = msg
	return e
}

// WithData 带数据的错误
func (e *Err) WithData(data interface{}) *Err {
	e.Data = data
	return e
}

/**
 * 以下为预定义的错误
 */

// Success 成功
func Success() *Err {
	return NewErr(20000, true, "success")
}

// ClientErr 客户端异常
func ClientErr() *Err {
	return NewErr(40000, false, "client error")
}

// NotLoginErr 未登录
func NotLoginErr() *Err {
	return NewErr(40001, false, "unauthorized")
}

// Forbidden 无此权限
func Forbidden() *Err {
	return NewErr(40003, false, "forbidden")
}

// NotFoundErr 资源不存在
func NotFoundErr() *Err {
	return NewErr(40004, false, "resource not found")
}

// NotExistErr 数据不存在
func NotExistErr() *Err {
	return NewErr(40005, false, "data not found")
}

// ExistErr 数据已存在
func ExistErr() *Err {
	return NewErr(40006, false, "data already exists")
}

// InvalidErr 无效的数据
func InvalidErr() *Err {
	return NewErr(40007, false, "invalid data")
}

// DataFormatErr 数据格式错误
func DataFormatErr() *Err {
	return NewErr(40010, false, "data format error")
}

// ServerErr 服务器异常
func ServerErr() *Err {
	return NewErr(50000, false, "server error")
}

// ServerBusyErr 服务器繁忙
func ServerBusyErr() *Err {
	return NewErr(50001, false, "server busy")
}

// ServerTimeoutErr 服务器超时
func ServerTimeoutErr() *Err {
	return NewErr(50002, false, "server timeout")
}

// DbErr 数据库错误
func DbErr() *Err {
	return NewErr(50003, false, "database error")
}

// CacheErr 缓存错误
func CacheErr() *Err {
	return NewErr(50004, false, "cache error")
}

// UnknownErr 未知错误
func UnknownErr() *Err {
	return NewErr(99999, false, "unknown error")
}
