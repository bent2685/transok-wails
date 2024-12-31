package vo

type ShareItem struct {
	Type string `json:"Type"`
	Name string `json:"Name"`
	Path string `json:"Path"`
	Size int64  `json:"Size"`
	Text string `json:"Text"`
}

type ShareListVo struct {
	ShareList []ShareItem `json:"shareList"`
}
