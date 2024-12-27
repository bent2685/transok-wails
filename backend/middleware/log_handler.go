package middleware

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
	"transok/backend/domain/resp"

	"github.com/gin-gonic/gin"
)

func LogHandler(basePath string) gin.HandlerFunc {
	logPath := filepath.Join(basePath, "log")

	// 创建日志目录
	if err := os.MkdirAll(logPath, 0755); err != nil {
		log.Printf("创建日志目录失败: %v", err)
	}

	logFile, err := os.OpenFile(filepath.Join(basePath, "log", "app.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Fatalf("无法打开日志文件: %v", err)
	}
	logger := log.New(logFile, "[API-LOG]", log.LstdFlags)
	return func(c *gin.Context) {
		// 请求开始时间
		startTime := time.Now()
		var err interface{}
		defer func() {
			if err != nil {
				errRes := resp.UnknownErr().Msg
				businessCode := resp.UnknownErr().Code
				if e, ok := err.(resp.Err); ok {
					errRes = e.Msg
					businessCode = e.Code
				}
				// 请求结束时间
				endTime := time.Now()
				// 计算请求处理时间
				processingTime := endTime.Sub(startTime)
				// 请求信息
				reqMethod := c.Request.Method
				reqURL := c.Request.RequestURI
				statusCode := c.Writer.Status()
				clientIp := c.ClientIP()
				logMsg := fmt.Sprintf(" <IP: ==> %s> [%s] URL: %s => [code:%d | BusinessCode:%d => \"%s\"] lasted:%v", clientIp, reqMethod, reqURL, statusCode, businessCode, errRes, processingTime)
				logger.Println(logMsg)
				panic(err)
			}
		}()
		defer func() {
			if r := recover(); r != nil {
				err = r
			}
		}()

		c.Next()

	}
}

type LogType string

const (
	API LogType = "api"
)

func (l LogType) String() string {
	// 申明了一个LogType变量
	var api LogType = "apassi"
	return string(api)
}
