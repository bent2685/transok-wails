# 实现计划：共享文件夹分享

> 设计依据：`docs/adr/0001-shared-folder-realtime-listing.md` 与 `CONTEXT.md`。
> 原则：复用现有结构、最小改动、一个任务一个提交。

## 总览

把"文件夹"作为新的分享项类型（`Type:"folder"`，复用 `ShareItem`）。文件夹内容不进快照，由被分享方浏览时后端实时读盘。新增浏览接口与 zip 打包接口，授权一律走「folderId + 相对子路径」，客户端永不传绝对路径。

涉及三端：后端（Go）、主 App（frontend）、下载页（dash）。

---

## 提交 1 — 后端：上传支持文件夹 + 在文件管理器打开

**目标**：分享方能把文件夹加入分享清单；列表项能在系统文件管理器打开。

`backend/services/file_service.go`
- `GetFile(path)`：用 `os.Stat` 的 `IsDir()` 判断。若是目录 → `Type:"folder"`、`Size:0`、`Name=filepath.Base`；否则维持现状。（拖拽与选择都经此函数，天然区分。）
- 新增 `SelectFolder() []string`：调用 `runtime.OpenDirectoryDialog`，返回单元素切片，与 `SelectFiles` 同形，前端复用 `handleDrop`。
- 新增 `OpenInFileManager(path string) error`：按 `runtime.Environment(ctx).Platform` 分发 `open`(darwin) / `explorer`(windows) / `xdg-open`(linux)，`exec.Command(...).Start()`。

`GetShareList()` 校验维持 `os.Stat` 仅判存在（不加类型一致性检查，folder 与 file 同样适用）。

提交信息：`feat: 支持选择/拖拽文件夹加入分享并可在文件管理器打开`

---

## 提交 2 — 后端：路径解析与授权工具

**目标**：把「folderId + 相对子路径 → 安全的绝对路径」抽成一处，供 browse / download / zip 共用。

新增 `backend/services/share_path.go`（或并入 share_service）：
- `ResolveSharedPath(folderId, subRel string) (abs string, err error)`：
  1. 从 share-list 找 `Id==folderId 且 Type=="folder"` 项，取根绝对路径 `root`。
  2. `joined = filepath.Join(root, filepath.Clean("/"+subRel))`（先 Clean 掉 `..`）。
  3. `filepath.EvalSymlinks(joined)`（解析符号链接）。
  4. 校验解析结果以 `root`（同样 EvalSymlinks 后）为前缀，否则返回越界错误。
- 单元测试覆盖：正常子路径、`../` 穿越、软链逃逸、folderId 不存在、根已被删。

提交信息：`feat: 新增共享文件夹路径解析与越界校验`（含测试）

---

## 提交 3 — 后端：浏览接口

**目标**：`GET /share/browse` 实时列目录。

`backend/apis/share.go` 新增 `Browse(c)`：
- 入参 `folderId`、`sub`（相对路径，默认空=根）。
- `ResolveSharedPath` → `os.ReadDir`。
- 过滤 `.` 开头项；每项映射为 `{Name, IsDir, Size(文件), RelPath(相对根)}`。
- 排序：目录在前，各自 `Name` 升序。
- 目录不存在/出错 → 返回明确错误码（dash 据此退回清单）。
- 新增对应 VO（`backend/domain/vo/share.go`：`BrowseEntry` / `BrowseVo`）。

`backend/app/gin.go`：在 `/share` 组内注册 `share.GET("/browse", con.Browse)`（自动继承 captcha 中间件）。

提交信息：`feat: 新增共享文件夹实时浏览接口`

---

## 提交 4 — 后端：文件夹内文件下载授权扩展

**目标**：让 `/download/index` 支持文件夹内的文件（散文件保持原精确匹配）。

`backend/apis/download.go`：
- 新增可选入参 `folderId`、`sub`。当带 `folderId` 时走 `ResolveSharedPath` 得到 `filePath`，跳过原 `item.Path==filePath` 精确匹配；否则维持现有散文件逻辑。
- captcha 校验、Range、ETag 等逻辑全部不动。

提交信息：`feat: 下载接口支持共享文件夹内文件`

---

## 提交 5 — 后端：zip 流式打包接口

**目标**：`GET /download/zip` 打包"当前所在目录"。

`backend/apis/download.go` 新增 `DownloadZip(c)`：
- 入参 `folderId`、`sub`。`ResolveSharedPath` → 目标目录。
- captcha 校验复用 download 现有逻辑。
- `Content-Disposition: attachment; filename*=...<目录名>.zip`，`Content-Type: application/zip`，**不设 Content-Length**（流式）。
- `archive/zip` 直接写 `c.Writer`，`filepath.WalkDir` 遍历（跳过 `.` 开头项），边写边 `Flush`。写入中途出错只能断流（已发头）。

`gin.go`：`download.GET("/zip", con.DownloadZip)`。

提交信息：`feat: 新增共享文件夹流式 zip 打包下载`

---

## 提交 6 — 主 App：上传按钮与文件夹项 UI

**目标**：frontend 端入口与列表项。

`frontend/src/components/Uploader/Uploader.tsx`
- "上传"按钮点击改为弹小菜单二选一（选择文件 → `SelectFiles`；选择文件夹 → 新增 `SelectFolder`），都接 `handleDrop`。
- `renderListItem`：`Type==="folder"` 分支——文件夹图标 + 名称 + "文件夹"标签，不显示大小；操作区在"移除"旁加"在文件管理器中打开"按钮 → 调 `OpenInFileManager(file.Path)`。
- 拖拽路径无需改（`GetFile` 已在后端区分）。

提交信息：`feat: 主界面支持上传文件夹并展示文件夹分享项`

---

## 提交 7 — dash：浏览导航与文件夹列表

**目标**：下载页进入文件夹、面包屑、排序、筛选。

`dash/src/services/api.ts`：新增 `browse(folderId, sub)`。
`dash/src/types/index.ts`：新增 `BrowseEntry` 类型，`FileItem` 已含 `Type` 可判 folder。
`dash/src/App.tsx`：
- 复用 hash 机制新增浏览态（`#folder=<id>&sub=<rel>`），监听 hashchange 切换"清单视图 / 浏览视图"。
- 浏览视图顶部面包屑（根/子/子，可点跳任意级）。
- 筛选 chip 增 `Folders`（All/Folders/Files/Text）；"Download all" 过滤掉 folder。
- 搜索框在浏览态只本地过滤当前目录条目。
- 浏览出错 → toast 提示并清 hash 退回清单。

`dash/src/components/FileItem.tsx`：`Type==="folder"` 时点击进入（改 hash），右侧主操作换成"打包下载"（原生 `<a href=/download/zip?...>`），不进 DownloadCenter。

提交信息：`feat: 下载页支持进入文件夹浏览与打包下载`

---

## 验证

- 后端：`go test ./backend/services/...`（路径解析用例）。
- 手动：主 App 拖入/选择文件夹 → 启动分享 → 浏览器进入文件夹、下钻、单文件下载、zip 打包；分享期间增删文件夹内文件，刷新即时反映；尝试 `../` 穿越被拒。
