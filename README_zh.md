<div align="center">
  <img src="https://github.com/bent2685/transok-wails/blob/main/readme_assets/banner.png" alt="banner" />
</div>

<h4 align="center"><a href="https://github.com/bent2685/transok-wails/blob/main/README.md">English</a> | <strong>简体中文</strong></h4>

<div align="center">

![go][go-badge]
![ts][ts-badge]
![license][license-badge]
![download](https://img.shields.io/github/downloads/bent2685/transok-wails/total)

</div>

> 一个高效的局域网文件共享工具

---

# 关于

**Transok** 是一个局域网文件共享小工具。它不会占用多余的存储空间，对传输文件数量和大小没有限制。同时分享文件时可以设置密码，防止文件被非法下载。

---

# Features

- [x] 文件上传功能
- [x] 开启分享功能
- [x] 文件删除和清空
- [x] 文件下载页（下载端 Web 应用：`dash`）
- [x] 深色模式
- [x] 纯文字分享
- [x] 文件附加文本（为任意分享文件附加一段说明，下载页可见）
- [x] 下载页详情弹窗，支持多行文本与图片预览
- [x] 大文件可靠下载（Service Worker + HEAD/ETag + 256KB 流式 buffer）
- [x] 分享项稳定 Id —— 列表顺序变化后详情/下载链接仍然可用
- [x] i18n（en / zh-CN / zh-TW / ja）
- [x] 自定义端口
- [x] 文件加密分享（验证码下载校验）
- [x] 查找局域网内正在共享的设备（zeroconf）
- [ ] 在 Finder/资源管理器中右键添加

---

# Preview

![preview](https://github.com/bent2685/transok-wails/blob/main/readme_assets/preview1.jpg)
![preview](https://github.com/bent2685/transok-wails/blob/main/readme_assets/preview2.jpg)

---

# 贡献者

感谢以下贡献者让这个项目变得更好：

- [@404errorg6](https://github.com/404errorg6) (Fahad Khan) —— 使用 `betamos/zeroconf` 重写了局域网设备发现服务（[#32](https://github.com/bent2685/transok-wails/pull/32)，修复 [#6](https://github.com/bent2685/transok-wails/issues/6)）

---

# Sponsor

☕ 如果这个项目对你有帮助，为什么不请我喝杯咖啡呢？这将激励我继续开发。

<img src="https://github.com/bent2685/transok-wails/blob/main/readme_assets/sponsor.jpeg" alt="wechat" width="200" />

---

# License

[MIT](/LICENSE)

[go-badge]: https://img.shields.io/github/go-mod/go-version/bent2685/transok-wails
[ts-badge]: https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label
[license-badge]: https://img.shields.io/github/license/bent2685/transok-wails
