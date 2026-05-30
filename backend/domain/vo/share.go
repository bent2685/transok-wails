package vo

type ShareItem struct {
	Id   string `json:"Id"`
	Type string `json:"Type"`
	Name string `json:"Name"`
	Path string `json:"Path"`
	Size int64  `json:"Size"`
	Text string `json:"Text"`
	Note string `json:"Note"`
}

type ShareListVo struct {
	ShareList []ShareItem `json:"shareList"`
}

// BrowseEntry 共享文件夹内某个目录的一个直接子项（实时读盘得到）
type BrowseEntry struct {
	Name    string `json:"name"`
	IsDir   bool   `json:"isDir"`
	Size    int64  `json:"size"`
	RelPath string `json:"relPath"` // 相对共享文件夹根的路径
}

// BrowseVo 浏览某个目录的返回
type BrowseVo struct {
	FolderId string        `json:"folderId"`
	Sub      string        `json:"sub"` // 当前所在目录相对根的路径（根为空）
	Entries  []BrowseEntry `json:"entries"`
}
