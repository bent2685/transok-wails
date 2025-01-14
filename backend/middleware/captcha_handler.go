package middleware

import (
	"transok/backend/domain/resp"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

// CaptchaHandler 验证码校验中间件
func CaptchaHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		captchaInStore := services.Share().GetCaptcha()
		/* 没有设置验证码，直接跳过 */
		if captchaInStore == "" {
			c.Next()
			return
		}

		// 从请求头获取验证码密钥
		captchaInHeader := c.GetHeader("Captcha-Key")
		if captchaInHeader == "" {
			resp.Forbidden().WithMsg("Captcha is required").Out()
			c.Abort()
			return
		}

		if captchaInHeader != captchaInStore {
			resp.Forbidden().WithMsg("Captcha is incorrect").Out()
			c.Abort()
			return
		}

		c.Next()
	}
}
