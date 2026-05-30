<div align="center">
  <img src="https://github.com/bent2685/transok-wails/blob/main/readme_assets/banner.png" alt="banner" />
</div>

<h4 align="center"><strong>English</strong> | <a href="https://github.com/bent2685/transok-wails/blob/main/README_zh.md">
简体中文</a></h4>

<div align="center">

![go][go-badge]
![ts][ts-badge]
![license][license-badge]
![download](https://img.shields.io/github/downloads/bent2685/transok-wails/total)

</div>

> An efficient LAN file sharing tool

---

# About

**Transok** is a LAN file sharing widget. It does not take up excess storage space, and there is no limit to the number and size of files transferred. You can also set a password when sharing files to prevent illegal file downloading.

---

# Features

- [x] File upload functionality
- [x] Enable sharing feature
- [x] File deletion and clearing
- [x] File download page (download web app: `dash`)
- [x] Dark mode
- [x] Pure text sharing
- [x] Folder sharing (add a whole folder; recipients browse subfolders, download files individually or the current directory as a zip)
- [x] Live folder contents (read on each visit, auto-reflecting changes on disk)
- [x] Reveal a shared folder in the system file manager (Finder / Explorer / Files)
- [x] Image thumbnails on the download page
- [x] Per-file additional note (attach a remark to any shared file, visible on the download page)
- [x] Detail dialog on download page with multi-line text & image preview
- [x] Resilient large-file downloads (Service Worker + HEAD/ETag + 256KB streaming)
- [x] Stable per-item ID — detail/download links keep working after the share list is reordered
- [x] i18n (en / zh-CN / zh-TW / ja)
- [x] Custom port
- [x] Encrypted file sharing (captcha-gated download)
- [x] Discover sharing devices in the local network (zeroconf)
- [ ] Right-click to add in Finder/File Explorer

---

# Preview

![preview](https://github.com/bent2685/transok-wails/blob/main/readme_assets/preview1.jpg)
![preview](https://github.com/bent2685/transok-wails/blob/main/readme_assets/preview2.jpg)

---

# Contributors

Thanks to the following contributors for making this project better:

- [@404errorg6](https://github.com/404errorg6) (Fahad Khan) — Reimplemented the LAN discovery service with `betamos/zeroconf` ([#32](https://github.com/bent2685/transok-wails/pull/32), fixes [#6](https://github.com/bent2685/transok-wails/issues/6))

---

# Sponsor

☕ If this project has been helpful to you, why not buy me a cup of coffee? This will keep me going.

<img src="https://github.com/bent2685/transok-wails/blob/main/readme_assets/sponsor.jpeg" alt="wechat" width="200" />

---

# License

[MIT](/LICENSE)

[go-badge]: https://img.shields.io/github/go-mod/go-version/bent2685/transok-wails
[ts-badge]: https://badgen.net/badge/-/TypeScript/blue?icon=typescript&label
[license-badge]: https://img.shields.io/github/license/bent2685/transok-wails
