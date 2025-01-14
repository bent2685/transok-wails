package logger

import (
	"os"
	"path/filepath"
	"time"
	"transok/backend/consts"
	"transok/backend/utils/common"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"gopkg.in/natefinch/lumberjack.v2"
)

var Log *zap.Logger

// InitLogger 初始化日志
func InitLogger() {
	basePath := common.GetBasePath()
	// 配置编码器
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalLevelEncoder,
		EncodeTime:     timeEncoder,
		EncodeDuration: zapcore.SecondsDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	var cores []zapcore.Core

	// 始终添加控制台输出
	cores = append(cores, zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderConfig),
		zapcore.AddSync(os.Stdout),
		zapcore.DebugLevel,
	))

	// 根据配置决定是否启用文件日志
	if consts.ENABLE_LOG {
		// 构建完整的日志路径
		fullLogPath := filepath.Join(basePath, "logs", "app.log")

		// 确保日志目录存在
		logDir := filepath.Dir(fullLogPath)
		if err := os.MkdirAll(logDir, 0755); err != nil {
			panic("创建日志目录失败: " + err.Error())
		}

		// 配置日志轮转
		writer := &lumberjack.Logger{
			Filename:   fullLogPath,
			MaxSize:    consts.DEFAULT_LOG_MAX_SIZE,
			MaxBackups: consts.DEFAULT_LOG_BACKUPS,
			MaxAge:     consts.DEFAULT_LOG_MAX_AGE,
			Compress:   true,
		}

		// 添加文件输出
		cores = append(cores, zapcore.NewCore(
			zapcore.NewJSONEncoder(encoderConfig),
			zapcore.AddSync(writer),
			zapcore.InfoLevel,
		))
	}

	// 创建logger
	core := zapcore.NewTee(cores...)
	Log = zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
}

// timeEncoder 自定义时间编码格式
func timeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("2006-01-02 15:04:05.000"))
}

// Debug 输出Debug级别日志
func Debug(msg string, fields ...zap.Field) {
	Log.Debug(msg, fields...)
}

// Info 输出Info级别日志
func Info(msg string, fields ...zap.Field) {
	Log.Info(msg, fields...)
}

// Warn 输出Warn级别日志
func Warn(msg string, fields ...zap.Field) {
	Log.Warn(msg, fields...)
}

// Error 输出Error级别日志
func Error(msg string, fields ...zap.Field) {
	Log.Error(msg, fields...)
}

// Fatal 输出Fatal级别日志
func Fatal(msg string, fields ...zap.Field) {
	Log.Fatal(msg, fields...)
}
