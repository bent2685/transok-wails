package main

import (
	"context"
	"embed"
	"fmt"
	"runtime"
	"transok/backend/services"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

var icon []byte

func main() {
	sysSvc := services.System()
	appInfo := sysSvc.GetAppInfo()
	windowStartState := options.Normal
	// menu
	isMacOS := runtime.GOOS == "darwin"
	appMenu := menu.NewMenu()
	if isMacOS {
		appMenu.Append(menu.AppMenu())
		appMenu.Append(menu.EditMenu())
		appMenu.Append(menu.WindowMenu())
	}

	err := wails.Run(&options.App{
		Title:                    appInfo["name"],
		Width:                    380,
		Height:                   620,
		MinWidth:                 380,
		MinHeight:                620,
		MaxWidth:                 380,
		MaxHeight:                620,
		WindowStartState:         windowStartState,
		Menu:                     appMenu,
		EnableDefaultContextMenu: true,

		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: options.NewRGBA(0, 0, 0, 0),
		StartHidden:      true,
		OnStartup: func(ctx context.Context) {
			sysSvc.Start(ctx, appInfo["version"])

		},
		Bind: []interface{}{
			sysSvc,
		},
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title:   fmt.Sprintf("%s %s", appInfo["name"], appInfo["version"]),
				Message: appInfo["desc"],
				Icon:    icon,
			},
			TitleBar:             mac.TitleBarHiddenInset(),
			WebviewIsTransparent: false,
			WindowIsTranslucent:  false,
		},
		Windows: &windows.Options{
			WebviewIsTransparent:              false,
			WindowIsTranslucent:               false,
			DisableFramelessWindowDecorations: false,
		},
		Linux: &linux.Options{
			ProgramName:         appInfo["name"],
			Icon:                icon,
			WebviewGpuPolicy:    linux.WebviewGpuPolicyOnDemand,
			WindowIsTranslucent: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
