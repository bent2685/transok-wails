import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { Cross2Icon } from '@radix-ui/react-icons'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-0 right-0 bottom-0 z-50 mx-auto flex flex-col w-full max-w-xl max-h-[80vh]',
        'bg-bg px-6 pt-3 pb-5 rd-t-4',
        'border-t border-x border-solid border-border',
        'shadow-[0_-24px_60px_-12px_rgba(0,0,0,0.55),0_0_0_1px_hsl(var(--primary-color)/0.04)]',
        'duration-300 ease-out',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-bottom-full',
        className
      )}
      {...props}>
      {/* 抽屉顶部把手 */}
      <div className="flex-center pb-3 shrink-0">
        <span className="w-10 h-1 rd-full bg-border" />
      </div>
      <DialogPrimitive.Close
        className={cn(
          'absolute right-3.5 top-5 w-7 h-7 rd-full flex-center duration-200 z-10',
          'text-text2 border border-solid border-transparent',
          'hover:(bg-pri/15 border-pri/40 text-pri) focus:outline-none',
          'disabled:pointer-events-none'
        )}>
        <Cross2Icon className="h-3.5 w-3.5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
      {/* 抽屉内容流式布局，外部使用 DialogBody / DialogFooter 决定滚动与吸底 */}
      <div className="flex flex-col flex-1 min-h-0 gap-5">{children}</div>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 pr-8 shrink-0', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 min-h-0 overflow-auto hide-scrollbar flex flex-col gap-4 py-1', className)} {...props} />
)
DialogBody.displayName = 'DialogBody'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-row items-center gap-2 pt-3 mt-auto shrink-0', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-(5 text) font-700 leading-[1.4]', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-(3.3 text2) leading-[1.6]', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription
}
