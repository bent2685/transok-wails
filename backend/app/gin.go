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
	"transok/backend/domain/resp"
	"transok/backend/middleware"
	"transok/backend/services"
	"transok/backend/utils/common"
	"transok/backend/utils/mdns"
	mdns_handlers "transok/backend/utils/mdns/handlers"

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
	// Check if the service is already running
	if c.httpServer != nil {
		log.Println("Server is already running")
		return
	}

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
			log.Printf("Failed to parse port number: %v, using default port 4343\n", err)
			portNum = 4343
		}
	}

	c.SetupRoutes()
	// Start sending periodic mDNS messages

	// Add: Re-subscribe handler

	uname, ok := services.Storage().Get("uname")
	if !ok {
		uname = "transok"
	}

	payload := consts.DiscoverPayload{
		Type: "DISCOVER",
		Payload: map[string]string{
			"IP":       services.System().GetLocalIp(nil),
			"Port":     fmt.Sprintf("%d", portNum),
			"Uname":    uname.(string),
			"Platform": services.System().GetPlatform(),
		}}

	handler := mdns_handlers.GetDiscoverHandler()
	handler.Handle(payload)
	mdns.GetDispatcher().Subscribe(handler)

	services.GetDiscoverService().Broadcast(portNum, payload)

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
	// Stop mDNS broadcast first
	// services.GetDiscoverService().StopPeriodicBroadcast()

	if c.cancel != nil {
		c.cancel()
	}

	if c.httpServer != nil {
		// Create a new context for shutdown operation
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// Close all new connections first
		c.httpServer.SetKeepAlivesEnabled(false)

		// Shut down the server
		if err := c.httpServer.Shutdown(ctx); err != nil {
			log.Printf("Server forced to shutdown: %v\n", err)
			// If graceful shutdown fails, force close
			if err := c.httpServer.Close(); err != nil {
				log.Printf("Server force close error: %v\n", err)
			}
		}

		// Reset server state
		c.httpServer = nil
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
	c.server.Use(middleware.LogHandler(common.GetBasePath()))

	api := c.server.Group("/api")
	{
		api.GET("/ping", func(ctx *gin.Context) {
			resp.Success().WithData("pong").Out()
		})
		con := apis.ShareApi{}
		api.GET("/should-captcha", con.ShouldCaptcha)

	}

	share := c.server.Group("/share")
	share.Use(middleware.CaptchaHandler())
	{
		con := apis.ShareApi{}
		share.POST("/list", con.ShareList)
	}

	download := c.server.Group("/download")
	{
		con := apis.DownloadApi{}

		// Modify static file server configuration to point to the downpage subdirectory
		templatesFS, err := fs.Sub(downpageFS, "templates/downpage")
		if err != nil {
			log.Printf("Failed to sub downpage directory: %v\n", err)
		}
		download.StaticFS("/page", http.FS(templatesFS))

		download.GET("/index", con.DownloadFile)
		download.HEAD("/index", con.DownloadFile)
	}

	discover := c.server.Group("/discover")
	{
		con := apis.DiscoverApi{}
		discover.GET("/ping", con.Ping)
	}

	for _, route := range c.server.Routes() {
		fmt.Printf("Method: %s, Path: %s\n", route.Method, route.Path)
	}

	c.routesSetup = true
}
