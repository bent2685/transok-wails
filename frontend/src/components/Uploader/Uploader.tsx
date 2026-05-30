import { useState, useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { GetFile, SelectFiles, SelectFolder, OpenInFileManager } from '@wa/services/fileService'
import { OnFileDrop, OnFileDropOff } from '@runtime/runtime'
import { FileTypeList } from './file-type'
import { useConfirm } from '@/provider/confirm.provider'
import { EventEmitter } from 'ahooks/lib/useEventEmitter'
import { calcFileSize } from '@/utils/file.util'
import React from 'react'
import { useTranslation } from 'react-i18next'
// 定义文件信息接口
export interface FileInfo {
  Id: string // 稳定唯一 id
  Name: string
  Size: number
  Path: string // 文件在设备中的绝对路径
  Type: string // 文件类型/扩展名
  Text?: string // 纯文本
  Note?: string // 附加文本（仅文件类型使用）
}

const genId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
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
    const [showUploadMenu, setShowUploadMenu] = useState(false)
    const { confirm } = useConfirm()

    // 系统对话框无法同时选文件与文件夹，故点击上传弹小菜单二选一
    const pickFiles = async () => {
      setShowUploadMenu(false)
      try {
        const filePaths = await SelectFiles()
        if (!filePaths || filePaths.length === 0) return
        await handleDrop(filePaths)
      } catch (error) {
        console.error('选择文件失败:', error)
      }
    }

    const pickFolder = async () => {
      setShowUploadMenu(false)
      try {
        const dirPaths = await SelectFolder()
        if (!dirPaths || dirPaths.length === 0) return
        await handleDrop(dirPaths)
      } catch (error) {
        console.error('选择文件夹失败:', error)
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
            const id = genId()
            const newTextShare: FileInfo = {
              Id: id,
              Type: 'pure-text',
              Name: 'Untitled',
              Path: id,
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

    const editNote = async (file: FileInfo) => {
      const result = await confirm({
        title: t('home.upload.note.title'),
        description: t('home.upload.note.placeholder'),
        isPrompt: true,
        defaultValue: file.Note || ''
      })
      if (result === false) return
      const note = typeof result === 'string' ? result : ''
      const newFiles = selectedFiles.map(f => (f.Id === file.Id ? { ...f, Note: note } : f))
      setSelectedFiles(newFiles)
      onFileSelect?.(newFiles)
    }

    const renderListItem = (file: FileInfo) => {
      const renderCommon = () => (
        <div className="flex flex-col line-height-1em min-w-0 flex-1">
          <span className="truncate font-bold text-(3.5 text) break-all">{file.Name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-(3 text2) break-all shrink-0">{calcFileSize(file.Size)}</span>
            <span
              className="text-(2.8 pri) cursor-pointer hover:underline truncate inline-flex items-center gap-0.5"
              onClick={e => {
                e.stopPropagation()
                editNote(file)
              }}>
              <span className="i-tabler:message-plus text-3 shrink-0"></span>
              <span className="truncate">{file.Note ? file.Note : t('home.upload.note.add')}</span>
            </span>
          </div>
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

      const isFolder = file.Type === 'folder'

      const renderFolder = () => (
        <div className="flex flex-col line-height-1em min-w-0 flex-1">
          <span className="truncate font-bold text-(3.5 text) break-all">{file.Name}</span>
          <span className="text-(3 text2) mt-0.5">{t('home.upload.folder')}</span>
        </div>
      )

      const renderContent = () => {
        if (isFolder) return renderFolder()
        if (file.Type === 'pure-text') return renderPureText()
        return renderCommon()
      }

      const folderIcon = 'i-tabler:folder'

      return (
        <div className="group flex items-center bg-bg border border-solid border-border rd-3 px-3 py-2.5 duration-200 hover:(border-pri/40 bg-bg/60) select-text">
          <div className="flex items-center gap-3 truncate flex-1">
            <div className="w-9 h-9 rd-2 bg-bg2 flex-center shrink-0 group-hover:(bg-pri/15) duration-200">
              <div
                className={cn(
                  'text-text text-4.5',
                  isFolder
                    ? folderIcon
                    : FileTypeList.find(item => item.type === file.Type)?.icon || 'i-tabler:file'
                )}></div>
            </div>
            {renderContent()}
          </div>
          <div className="flex items-center pl-2 gap-1">
            {isFolder && (
              <div
                className="cursor-pointer rd-full duration-200 w-7 h-7 flex-center text-text2 hover:(bg-pri/20 text-pri) active:(scale-92)"
                title={t('home.upload.openInFinder')}
                onClick={() => OpenInFileManager(file.Path)}>
                <div className="i-tabler:external-link text-3.5"></div>
              </div>
            )}
            <div
              className="cursor-pointer rd-full duration-200 w-7 h-7 flex-center text-text2 hover:(bg-pri/20 text-pri) active:(scale-92)"
              onClick={() => removeFile(file.Path)}>
              <div className="i-tabler:trash text-3.5"></div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          onDragOver={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
          className={cn(
            'group relative flex flex-col items-center justify-center w-full min-h-44',
            'border border-dashed rd-3 cursor-pointer bg-bg2/60 backdrop-blur-sm',
            'transition-all duration-200',
            isDragging ? 'border-pri bg-pri/8 scale-[1.005]' : 'border-border hover:(border-pri/50 bg-bg2)',
            className
          )}
          style={{ '--wails-drop-target': 'drop' } as React.CSSProperties}>
          <div className="flex flex-col items-center justify-center pt-6 pb-5 px-4">
            <div className="relative">
              <div className="absolute inset-0 bg-pri/30 blur-xl rd-full"></div>
              <div className="relative w-12 h-12 rd-3 bg-pri flex-center">
                <div className="i-tabler:upload text-white text-6"></div>
              </div>
            </div>
            <p className="mt-4 text-(3.5 text2) text-center max-w-72 line-height-1.5">
              {t('home.upload.title')}
              {multiple ? t('home.upload.multiple') : t('home.upload.single')}
            </p>
            <div className="relative mt-3">
              <Button
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  setShowUploadMenu(v => !v)
                }}
                className="bg-pri text-white font-700 px-5 h-8.5 rd-2 hover:(bg-pri brightness-110) active:(scale-95)">
                <div className="i-tabler:plus mr-1 text-3.5"></div>
                {t('home.upload.button')}
              </Button>
              {showUploadMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUploadMenu(false)}></div>
                  <div className="absolute z-20 top-full mt-1.5 left-1/2 -translate-x-1/2 min-w-36 bg-bg border border-solid border-border rd-2 shadow-lg overflow-hidden">
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-(3.2 text) cursor-pointer hover:(bg-pri/10 text-pri) duration-150"
                      onClick={pickFiles}>
                      <div className="i-tabler:file text-3.8 shrink-0"></div>
                      {t('home.upload.selectFile')}
                    </div>
                    <div
                      className="flex items-center gap-2 px-3 py-2 text-(3.2 text) cursor-pointer hover:(bg-pri/10 text-pri) duration-150"
                      onClick={pickFolder}>
                      <div className="i-tabler:folder text-3.8 shrink-0"></div>
                      {t('home.upload.selectFolder')}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <p className="text-(2.8 text2) mt-2 tracking-wide flex items-center gap-1.5">
          <span className="w-1 h-1 rd-full bg-pri"></span>
          {t('home.upload.noLimit')}
        </p>

        <div className="h-5"></div>
        <div className="flex items-center flex-wrap gap-y-2 gap-x-3">
          <h2 className="text-(4 text) font-800 tracking-[-0.3px] shrink-0">
            {t('home.upload.fileList')}
            {!!selectedFiles?.length && (
              <span className="ml-1.5 text-pri font-900">({selectedFiles?.length})</span>
            )}
          </h2>
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            {actionList?.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'cursor-pointer rd-2 duration-200 h-7 px-2.5 flex items-center justify-center shrink-0',
                  'bg-bg2 border border-solid border-border text-text',
                  'hover:(bg-pri/15 border-pri/40 text-pri) active:(scale-95)',
                  !item.display && 'hidden'
                )}
                onClick={item.onClick}>
                {item?.text && (
                  <span className="text-2.8 font-600 mr-1 tracking-[0.3px] uppercase whitespace-nowrap">
                    {item.text}
                  </span>
                )}
                <div className={`${item.icon} text-3.2`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-auto mt-3 hide-scrollbar">
          {!selectedFiles?.length && (
            <div className="flex-center px-2 py-10 flex-col gap-2 opacity-60">
              <div className="i-tabler:files-off text-10 text-text2"></div>
              <p className="text-(3.2 text2) tracking-wide">{t('home.upload.noFiles')}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {selectedFiles.map((file, index) => (
              <React.Fragment key={index}>{renderListItem(file)}</React.Fragment>
            ))}
            <div className="h-25"></div>
          </div>
        </div>
      </div>
    )
  }
)
