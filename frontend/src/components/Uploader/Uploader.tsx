import { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { GetFile, SelectFiles } from '@wa/services/fileService'
import { OnFileDrop, OnFileDropOff } from '@runtime/runtime'
import { FileTypeList } from './file-type'
// 定义文件信息接口
export interface FileInfo {
  Name: string
  Size: number
  Path: string // 文件在设备中的绝对路径
  Ext: string // 文件扩展名
}

// 更新 ref 接口定义
export interface UploaderRef {
  getSelectedFiles: () => FileInfo[]
  clearFiles: () => void
  removeFile: (fileName: string) => void
  setShareList: (files: FileInfo[]) => void
}

interface UploaderProps {
  onFileSelect?: (files: FileInfo[]) => void
  onFileChange?: (files: FileInfo[]) => void
  accept?: string
  maxSize?: number // 单位: MB，不传则不限制大小
  className?: string
  multiple?: boolean
}

export const Uploader = forwardRef<UploaderRef, UploaderProps>(
  ({ onFileSelect, onFileChange, accept = '*', maxSize, className, multiple = false }, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([])

    const handleClick = async () => {
      try {
        const filePaths = await SelectFiles()
        if (!filePaths || filePaths.length === 0) return
        await handleDrop(filePaths)
      } catch (error) {
        console.error('选择文件失败:', error)
      }
    }

    /* 删除文件 */
    const removeFile = (fileName: string) => {
      const newFiles = selectedFiles.filter(file => file.Name !== fileName)
      setSelectedFiles(newFiles)
      onFileSelect?.(newFiles)
    }

    /* 清空文件 */
    const clearFiles = () => {
      setSelectedFiles([])
      onFileSelect?.([])
    }

    const setShareList = (files: FileInfo[]) => {
      setSelectedFiles(files)
      onFileSelect?.(files)
    }

    // 添加useImperativeHandle
    useImperativeHandle(ref, () => ({
      getSelectedFiles: () => selectedFiles,
      clearFiles: () => setSelectedFiles([]),
      removeFile: (fileName: string) => removeFile(fileName),
      setShareList: (files: FileInfo[]) => setShareList(files)
    }))

    const handleDrop = async (path: string[]) => {
      const files = await Promise.all(
        path
          .filter(path => !selectedFiles.some(file => file.Path === path))
          .map(async path => {
            return await GetFile(path)
          })
      )

      // 使用函数式更新确保获取最新的状态
      setSelectedFiles(prevFiles => {
        const newFiles = [...prevFiles, ...files]
        // 在更新完成后触发回调
        onFileSelect?.(newFiles)
        onFileChange?.(files)
        return newFiles
      })
    }

    useEffect(() => {
      OnFileDrop((x, y, paths) => {
        console.log(paths)
        handleDrop(paths)
      }, true)
      return () => OnFileDropOff()
    }, [])

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className={cn(
            'relative flex flex-col items-center justify-center w-full min-h-42',
            'border-2 border-solid rounded-lg cursor-pointer bg-bg2',
            'transition-colors duration-200',
            isDragging ? 'border-primary bg-primary/5' : 'border-border',
            className
          )}
          style={{ '--wails-drop-target': 'drop' } as React.CSSProperties}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="i-tabler:file-upload text-(pri 10)"></div>
            <p className="m-2 text-(3.5 text2)">点击或拖拽{multiple ? '一个或多个文件' : '文件'}上传</p>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="destructive" onClick={handleClick}>
                上传文件
              </Button>
            </div>
          </div>
        </div>
        <p className="text-(3 text2) mt-2">无文件格式限制 无大小限制</p>

        <div className="h-4"></div>
        <div className="flex">
          <h2 className="text-lg font-bold">文件列表{!!selectedFiles?.length && `(${selectedFiles?.length})`}</h2>
          <div className="flex-1"></div>
          {!!selectedFiles?.length && (
            <div
              className="flex items-center cursor-pointer bg-pri/20 w-8 h-8 rd-full flex-center duration-300 hover:(bg-pri/30) active:(scale-95)"
              onClick={clearFiles}>
              <div className="i-tabler:trash text-3.5"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-auto mt-2 hide-scrollbar">
          {!selectedFiles?.length && (
            <div className="flex-center px-2 py-6 flex-col">
              <div className="i-tabler:playlist-x text-12 text-text2"></div>
              <p className="text-4 text-text2">请先上传文件</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {selectedFiles.map(file => (
              <div key={file.Name} className="flex items-center border-2 border-solid border-border rounded-lg p-2">
                <div className="flex items-center gap-2 truncate flex-1">
                  <div
                    className={cn(
                      'text-text',
                      FileTypeList.find(item => item.type === file.Ext)?.icon || 'i-tabler:file'
                    )}></div>
                  <div className="flex flex-col line-height-1em">
                    <span className="truncate font-bold text-(3.5 text)">{file.Name}</span>
                    <span className="text-(3 text2)">{(file.Size / 1024).toFixed(2)}KB</span>
                  </div>
                </div>
                <div className="flex items-center pl-2">
                  <div
                    className="cursor-pointer rd-full duration-300 bg-border/60 w-6 h-6 flex items-center justify-center hover:(bg-pri/30) active:(scale-95)"
                    onClick={() => removeFile(file.Name)}>
                    <div className="i-tabler:trash text-text text-3"></div>
                  </div>
                </div>
              </div>
            ))}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    )
  }
)
