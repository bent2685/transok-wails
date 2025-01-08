package app

import (
	"context"
	"embed"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
	"transok/backend/apis"
	"transok/backend/consts"
	"transok/backend/domain/dto"
	"transok/backend/domain/resp"
	"transok/backend/middleware"
	"transok/backend/services"

	"io/fs"

	"github.com/gin-gonic/gin"
)

//go:embed templates/downpage/*
var downpageFS embed.FS

type contextKey string

const mdnsKey contextKey = "mdns"

type ginService struct {
	ctx         context.Context
	server      *gin.Engine
	storage     *services.StorageService
	cancel      context.CancelFunc
	httpServer  *http.Server
	routesSetup bool
}

var ginEngine *ginService
var ginEngineOnce sync.Once

func Gin() *ginService {
	if ginEngine == nil {
		ginEngineOnce.Do(func() {
			ctx, cancel := context.WithCancel(context.Background())
			ctx = context.WithValue(ctx, mdnsKey, nil)
			ginEngine = &ginService{
				ctx:    ctx,
				server: gin.Default(),
				cancel: cancel,
			}
		})
	}
	return ginEngine
}

func (c *ginService) Start(port string) {
	if c.server == nil {
		c.server = gin.Default()
	}

	c.storage = services.Storage()
	if port == "" {
		port = ":4343"
	}

	portNum := 4343
	if port != ":4343" {
		_, err := fmt.Sscanf(port, ":%d", &portNum)
		if err != nil {
			log.Printf("解析端口号失败: %v，将使用默认端口 4343\n", err)
			portNum = 4343
		}
	}

	c.SetupRoutes()
	/* 开始发送轮询mdns消息 */
	services.GetDiscoverService().StopPeriodicBroadcast()

	// 添加：重新订阅处理器
	// mdns.GetDispatcher().Subscribe(mdns_handlers.NewDiscoverHandler())

	services.GetDiscoverService().StartPeriodicBroadcast(portNum, consts.DiscoverPayload{
		Type: "DISCOVER",
		Payload: map[string]string{
			"ip":   services.System().GetLocalIp(),
			"port": fmt.Sprintf("%d", portNum),
		},
	}, 3*time.Second)

	c.httpServer = &http.Server{
		Addr:    port,
		Handler: c.server,
	}

	go func() {
		if err := c.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			services.GetDiscoverService().Stop()
			log.Printf("Gin server error: %v\n", err)
		}
	}()
	log.Printf("Gin server starting on port %s\n", port)
}

func Storage() {
	panic("unimplemented")
}

func (c *ginService) Stop() {
	if c.cancel != nil {
		c.cancel()
	}
	services.GetDiscoverService().StopPeriodicBroadcast()
	if c.httpServer != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		if err := c.httpServer.Shutdown(ctx); err != nil {
			log.Printf("Server forced to shutdown: %v\n", err)
		}

		c.server = nil
		c.routesSetup = false
	}

}

func (c *ginService) SetupRoutes() {
	if c.routesSetup {
		return
	}

	c.server.Use(middleware.Cors())
	c.server.Use(middleware.Recover)
	c.server.Use(middleware.LogHandler(c.storage.GetBasePath()))

	api := c.server.Group("/api")
	{
		api.GET("/ping", func(ctx *gin.Context) {
			resp.Success().WithData("pong").Out()
		})

	}

	share := c.server.Group("/share")
	{
		con := apis.ShareApi{}
		share.POST("/list", middleware.Valid(dto.ShareListDto{}), con.ShareList)
	}

	download := c.server.Group("/download")
	{
		con := apis.DownloadApi{}

		// 修改静态文件服务配置，指向 downpage 子目录
		templatesFS, err := fs.Sub(downpageFS, "templates/downpage")
		if err != nil {
			log.Printf("Failed to sub downpage directory: %v\n", err)
		}
		download.StaticFS("/page", http.FS(templatesFS))

		download.GET("/index", con.DownloadFile)
	}

	for _, route := range c.server.Routes() {
		fmt.Printf("Method: %s, Path: %s\n", route.Method, route.Path)
	}

	c.routesSetup = true
}
