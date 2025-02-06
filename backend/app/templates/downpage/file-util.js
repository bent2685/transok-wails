
const FILE_TYPE_LIST = [
    {
        icon: 'i-tabler:file-type-jpg',
        path: './icons/type/jpg.svg',
        type: 'jpg'
    },
    {
        icon: 'i-tabler:file-type-png',
        path: './icons/type/png.svg',
        type: 'png'
    },
    {
        icon: 'i-tabler:file-type-jpg',
        path: './icons/type/jpg.svg',
        type: 'jpeg'
    },
    {
        icon: 'i-tabler:photo-bolt',
        path: './icons/type/gif.svg',
        type: 'gif'
    },
    {
        icon: 'i-tabler:file-type-svg',
        path: './icons/type/svg.svg',
        type: 'svg'
    },
    {
        icon: 'i-tabler:file-type-bmp',
        path: './icons/type/bmp.svg',
        type: 'bmp'
    },
    {
        icon: 'i-tabler:file-type-pdf',
        path: './icons/type/pdf.svg',
        type: 'pdf'
    },
    {
        icon: 'i-tabler:file-type-doc',
        path: './icons/type/doc.svg',
        type: 'doc'
    },
    {
        icon: 'i-tabler:file-type-docx',
        path: './icons/type/docx.svg',
        type: 'docx'
    },
    {
        icon: 'i-tabler:file-type-xls',
        path: './icons/type/xls.svg',
        type: 'xls'
    },
    {
        icon: 'i-tabler:file-type-xls',
        path: './icons/type/xls.svg',
        type: 'xlsx'
    },
    {
        icon: 'i-tabler:file-type-ppt',
        path: './icons/type/ppt.svg',
        type: 'ppt'
    },
    {
        icon: 'i-tabler:file-type-ppt',
        path: './icons/type/ppt.svg',
        type: 'pptx'
    },
    {
        icon: 'i-tabler:file-type-txt',
        path: './icons/type/txt.svg',
        type: 'txt'
    },
    {
        icon: 'i-tabler:file-type-zip',
        path: './icons/type/zip.svg',
        type: 'zip'
    },
    {
        icon: 'i-tabler:file-zip',
        path: './icons/type/package.svg',
        type: 'rar'
    },
    {
        icon: 'i-tabler:file-zip',
        path: './icons/type/package.svg',
        type: '7z'
    },
    {
        icon: 'i-tabler:file-zip',
        path: './icons/type/package.svg',
        type: 'tar'
    },
    {
        icon: 'i-tabler:file-zip',
        path: './icons/type/package.svg',
        type: 'gz'
    },
    {
        icon: 'i-tabler:file-zip',
        path: './icons/type/package.svg',
        type: 'iso'
    },
    {
        icon: 'i-tabler:file-type-ts',
        path: './icons/type/ts.svg',
        type: 'ts'
    },
    {
        icon: 'i-tabler:file-ai',
        path: './icons/type/ai.svg',
        type: 'ai'
    },
    {
        icon: 'i-tabler:file-delta',
        path: './icons/type/psd.svg',
        type: 'psd'
    },
    {
        icon: 'i-tabler:file-smile',
        path: './icons/type/dmg.svg',
        type: 'dmg'
    },
    {
        icon: 'i-tabler:file-neutral',
        path: './icons/type/exe.svg',
        type: 'exe'
    },
    {
        icon: 'i-tabler:brand-android',
        path: './icons/type/apk.svg',
        type: 'apk'
    },
    {
        icon: 'i-tabler:brand-apple',
        path: './icons/type/ipa.svg',
        type: 'ipa'
    },
    {
        icon: 'i-tabler:file-type-tsx',
        path: './icons/type/tsx.svg',
        type: 'tsx'
    },
    {
        icon: 'i-tabler:file-type-js',
        path: './icons/type/js.svg',
        type: 'js'
    },
    {
        icon: 'i-tabler:file-type-jsx',
        path: './icons/type/jsx.svg',
        type: 'jsx'
    },
    {
        icon: 'i-tabler:file-type-html',
        path: './icons/type/html.svg',
        type: 'html'
    },
    {
        icon: 'i-tabler:file-type-css',
        path: './icons/type/css.svg',
        type: 'css'
    },
    {
        icon: 'i-tabler:file-type-css',
        path: './icons/type/css.svg',
        type: 'scss'
    },
    {
        icon: 'i-tabler:file-type-css',
        path: './icons/type/css.svg',
        type: 'sass'
    },
    {
        icon: 'i-tabler:file-type-css',
        path: './icons/type/css.svg',
        type: 'less'
    },
    {
        icon: 'i-tabler:file-type-css',
        path: './icons/type/css.svg',
        type: 'styl'
    },
    {
        icon: 'i-tabler:file-dots',
        path: './icons/type/file-dots.svg',
        type: 'json'
    },
    {
        icon: 'i-tabler:file-dots',
        path: './icons/type/file-dots.svg',
        type: 'yaml'
    },
    {
        icon: 'i-tabler:file-dots',
        path: './icons/type/file-dots.svg',
        type: 'toml'
    },
    {
        icon: 'i-tabler:markdown',
        path: './icons/type/md.svg',
        type: 'md'
    },
    {
        icon: 'i-tabler:keyboard',
        path: './icons/type/keyboard.svg',
        type: 'pure-text'
    },
    {
        icon: 'i-tabler:file',
        path: './icons/type/other.svg',
        type: 'other'
    }
]


/**
 * 计算文件大小
 * @param size 文件大小的字节数
 * @returns 文件大小 KB MB GB
 */
const calcFileSize = (size) => {
    if (size < 1024) {
        return `${size}B`
    }
    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)}KB`
    }
    if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)}MB`
    }
    return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`
}
