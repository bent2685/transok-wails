package apis

import (
	"transok/backend/domain/resp"

	"github.com/gin-gonic/gin"
)

type DiscoverApi struct{}

func (d *DiscoverApi) DiscoverList(c *gin.Context) {

}

/* 测试ping */
func (d *DiscoverApi) Ping(c *gin.Context) {
	resp.Success().Out()
}
