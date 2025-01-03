import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { GetFile, SelectFiles } from '@wa/services/fileService'
import { OnFileDrop, OnFileDropOff } from '@runtime/runtime'
import { FileTypeList } from './file-type'
import { useConfirm } from '@/provider/confirm.provider'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import { calcFileSize } from '@/utils/file.util'
import React from 'react'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
// 定义文件信息接口
export interface FileInfo {
  Name: string
  Size: number
  Path: string // 文件在设备中的绝对路径
  Type: string // 文件类型/扩展名
  Text?: string // 纯文本
}

export interface UploaderEvent {
  type: 'copy-link' | 'is-running' | 'share-list'
  data: any
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
  event$: EventEmitter<UploaderEvent>
}

export const Uploader = forwardRef<UploaderRef, UploaderProps>(
  ({ onFileSelect, onFileChange, accept = '*', maxSize, className, multiple = false, event$ }, ref) => {
    const { t } = useTranslation()
    const [isDragging, setIsDragging] = useState(false)
    const [isRunning, setIsRunning] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState<FileInfo[]>([])
    const { confirm } = useConfirm()
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
    const removeFile = (filePath: string) => {
      const newFiles = selectedFiles.filter(file => file.Path !== filePath)
      setSelectedFiles(newFiles)
      onFileSelect?.(newFiles)
    }

    /* 清空文件 */
    const clearFiles = () => {
      setSelectedFiles([])
      onFileSelect?.([])
    }

    const setShareList = (files: FileInfo[]) => {
      setSelectedFiles(files || [])
      onFileSelect?.(files || [])
    }

    const actionList /* 文件列表操作 */ = useMemo(() => {
      return [
        {
          icon: 'i-tabler:keyboard',
          display: true,
          text: t('home.upload.actions.pureText'),
          onClick: () => {
            const newTextShare = {
              Type: 'pure-text',
              Name: 'Untitled',
              Path: _.uniqueId('text-'),
              Size: 0,
              Text: ''
            }
            setSelectedFiles(prev => {
              const newList = [...prev, newTextShare]
              onFileSelect?.(newList)
              onFileChange?.([newTextShare])
              return newList
            })
          }
        },
        {
          icon: 'i-tabler:copy',
          display: isRunning,
          text: t('home.upload.actions.copyLink'),
          onClick: () => {
            event$.emit({ type: 'copy-link', data: null })
          }
        },
        {
          icon: 'i-tabler:trash',
          display: !!selectedFiles?.length,
          text: '',
          onClick: () => clearFiles()
        }
      ]
    }, [selectedFiles, isRunning])

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

    event$.useSubscription(payload => {
      const { type, data } = payload
      if (type === 'is-running') {
        setIsRunning(data)
        return
      }

      if (type === 'share-list') {
        setShareList(data)
        return
      }
    })

    useEffect(() => {
      OnFileDrop((x, y, paths) => {
        console.log(paths)
        handleDrop(paths)
      }, true)
      return () => OnFileDropOff()
    }, [])

    const renderListItem = (file: FileInfo) => {
      const renderCommon = () => (
        <div className="flex flex-col line-height-1em">
          <span className="truncate font-bold text-(3.5 text) break-all">{file.Name}</span>
          <span className="text-(3 text2) break-all">{calcFileSize(file.Size)}</span>
        </div>
      )

      const renderPureText = () => (
        <div className="flex flex-col line-height-1em flex-1">
          <input
            type="text"
            value={file.Name}
            onChange={e => {
              const newFiles = selectedFiles.map(f => {
                if (f.Path === file.Path) {
                  return { ...f, Name: e.target.value }
                }
                return f
              })
              setSelectedFiles(newFiles)
              onFileSelect?.(newFiles)
            }}
            className="w-full bg-transparent border-none outline-none font-bold text-(3.5 text)"
            placeholder={t('home.upload.text.inputTitle')}
          />
          <div
            className="text-(3 text2) cursor-pointer"
            onClick={async () => {
              const text = await confirm({
                title: t('home.upload.text.editText'),
                description: t('home.upload.text.enterContent'),
                isPrompt: true,
                defaultValue: file.Text
              })
              if (!text) return
              const newFiles = selectedFiles.map(f => {
                if (f.Path === file.Path) {
                  return { ...f, Text: text }
                }
                return f
              }) as FileInfo[]
              setSelectedFiles(newFiles)
              onFileSelect?.(newFiles)
            }}>
            <div className="i-tabler:edit mr-0.5 text-2.5 inline-block -mb-0.5 text-pri"></div>
            <span className="truncate">{file.Text || t('home.upload.text.noContent')}</span>
          </div>
        </div>
      )

      return (
        <>
          <div className="flex items-center border-2 border-solid border-border rounded-lg p-2">
            <div className="flex items-center gap-2 truncate flex-1">
              <div
                className={cn(
                  'text-text min-w-4 min-h-4',
                  FileTypeList.find(item => item.type === file.Type)?.icon || 'i-tabler:file'
                )}></div>
              {file.Type === 'pure-text' ? renderPureText() : renderCommon()}
            </div>
            <div className="flex items-center pl-2">
              <div
                className="cursor-pointer rd-full duration-300 bg-border/60 w-6 h-6 flex items-center justify-center hover:(bg-pri/30) active:(scale-95)"
                onClick={() => removeFile(file.Path)}>
                <div className="i-tabler:trash text-text text-3"></div>
              </div>
            </div>
          </div>
        </>
      )
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          onDragOver={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
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
            <p className="m-2 text-(3.5 text2) text-center">
              {t('home.upload.title')}
              {multiple ? t('home.upload.multiple') : t('home.upload.single')}
            </p>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="destructive" onClick={handleClick}>
                {t('home.upload.button')}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-(3 text2) mt-2">{t('home.upload.noLimit')}</p>

        <div className="h-4"></div>
        <div className="flex">
          <h2 className="text-lg font-bold">
            {t('home.upload.fileList')}
            {!!selectedFiles?.length && `(${selectedFiles?.length})`}
          </h2>
          <div className="flex-1"></div>
          <div className="flex items-center">
            <div></div>
            {actionList?.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'not-last:mr-2 cursor-pointer rd-full duration-300 bg-border/60 h-6 px-1.5 flex items-center justify-center hover:(bg-pri/30) active:(scale-95)',
                  !item.display && 'hidden'
                )}
                onClick={item.onClick}>
                {item?.text && <span className="text-3 mr-1">{item.text}</span>}
                <div className={`${item.icon} text-3`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-auto mt-2 hide-scrollbar">
          {!selectedFiles?.length && (
            <div className="flex-center px-2 py-6 flex-col">
              <div className="i-tabler:playlist-x text-12 text-text2"></div>
              <p className="text-4 text-text2">{t('home.upload.noFiles')}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {selectedFiles.map((file, index) => (
              <React.Fragment key={index}>{renderListItem(file)}</React.Fragment>
            ))}
            <div className="h-20"></div>
          </div>
        </div>
      </div>
    )
  }
)
