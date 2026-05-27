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
