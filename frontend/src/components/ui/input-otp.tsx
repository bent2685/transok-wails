import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { cn } from '@/lib/utils'
import { MinusIcon } from '@radix-ui/react-icons'

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
)
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center gap-2', className)} {...props} />
)
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]
  const filled = !!char

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-12 w-10 items-center justify-center rd-2 border border-solid duration-200 ease-out',
        'text-(4.5 text) font-700 tracking-[1px]',
        'bg-bg2/60',
        filled && !isActive && 'border-pri/40 bg-pri/8',
        !filled && !isActive && 'border-border',
        isActive && 'z-10 border-pri scale-[1.06] shadow-[0_0_0_3px_hsl(var(--primary-color)/0.18)]',
        className
      )}
      {...props}>
      <span
        className={cn(
          'inline-block duration-200 ease-out',
          filled ? 'opacity-100 scale-100 text-pri' : 'opacity-0 scale-50'
        )}>
        {char}
      </span>
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-[2px] rd-full animate-caret-blink bg-pri duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(
  ({ ...props }, ref) => (
    <div ref={ref} role="separator" {...props}>
      <MinusIcon />
    </div>
  )
)
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
