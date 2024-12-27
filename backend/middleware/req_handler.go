package middleware

import (
	reflect "reflect"
	"strings"
	"transok/backend/domain/resp"

	"github.com/gin-gonic/gin"
)

func Valid(dto interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 使用传入的dto创建一个新的对象
		data := reflect.New(reflect.TypeOf(dto)).Interface()

		if err := c.ShouldBindJSON(data); err != nil {
			resp.DataFormatErr().WithData(strings.Split(err.Error(), "\n")).Out()
			c.Abort()
			return
		}
		c.Set("dto", data)
		c.Next()
	}
}
