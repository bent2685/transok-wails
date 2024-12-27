package req

import "github.com/gin-gonic/gin"

func GetBody[T any](ctx *gin.Context) T {
	value, _ := ctx.Get("dto")
	req, _ := value.(*T)
	return *req
}
