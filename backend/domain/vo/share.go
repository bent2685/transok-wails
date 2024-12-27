package vo

type ShareItem struct {
	Ext  string `json:"Ext"`
	Name string `json:"Name"`
	Path string `json:"Path"`
	Size int64  `json:"Size"`
}

type ShareListVo struct {
	ShareList []ShareItem `json:"shareList"`
}
