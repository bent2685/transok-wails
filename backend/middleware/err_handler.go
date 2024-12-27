package middleware

import (
	"runtime/debug"
	"transok/backend/domain/resp"

	"github.com/gin-gonic/gin"
)

func Recover(c *gin.Context) {
	defer func() {
		if err := recover(); err != nil {

			// 解析panic抛出的是否为定义好的Error响应体
			if e, ok := err.(resp.Err); ok {
				// 如果是则直接返回
				if !e.Success {
					debug.PrintStack()
					c.JSON(400, e)
					c.Abort()
					return
				}
				c.JSON(200, e)
			} else {
				debug.PrintStack()
				c.JSON(500, resp.ServerErr())
			}
			c.Abort()
		}
	}()

	c.Next()
}
