package apis

import (
	"encoding/json"
	"fmt"
	"transok/backend/domain/resp"
	"transok/backend/domain/vo"
	"transok/backend/services"

	"github.com/gin-gonic/gin"
)

type ShareApi struct{}

func (s *ShareApi) ShareList(c *gin.Context) {
	storage := services.Storage()
	if storage == nil {
		resp.ServerErr().Out()
		return
	}

	keys := storage.GetKeys()
	hasShare := false
	for _, key := range keys {
		if key == "is-share" {
			hasShare = true
			break
		}
	}
	if !hasShare {
		resp.ServerErr().WithMsg("未开启分享").Out()
		return
	}

	shareList, isExist := storage.Get("share-list")
	fmt.Println("shareList", shareList)
	var result []vo.ShareItem
	if isExist {
		if jsonData, err := json.Marshal(shareList); err == nil {
			json.Unmarshal(jsonData, &result)
		}
	}

	resp.Success().WithData(vo.ShareListVo{
		ShareList: result,
	}).Out()
}

/* 获取是否需要验证码 */
func (s *ShareApi) ShouldCaptcha(c *gin.Context) {
	captcha := services.Share().GetCaptcha()
	resp.Success().WithData(captcha != "").Out()
}
