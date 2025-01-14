import React from 'react'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '../ui/input-otp'

interface ICaptchaProps {
  value?: string
  onChange?: (value: string) => void
  maxLength?: number
  disabled?: boolean
}

const Captcha: React.FC<ICaptchaProps> = ({ value = '', onChange, maxLength = 6, disabled = false }) => {
  const showSeparator = maxLength >= 6
  const slots = Array.from({ length: maxLength })

  // 只有在需要分隔的情况下才计算分组
  const groups = showSeparator
    ? [
        slots.slice(0, 3),
        slots.slice(3)
      ]
    : [slots]

  return (
    <div className="flex items-center justify-center space-x-2">
      <InputOTP maxLength={maxLength} value={value} onChange={onChange} disabled={disabled}>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {groupIndex > 0 && showSeparator && <InputOTPSeparator />}
            <InputOTPGroup>
              {group.map((_, index) => {
                const slotIndex = groupIndex === 0 
                  ? index 
                  : index + groups[0].length
                return <InputOTPSlot key={slotIndex} index={slotIndex} />
              })}
            </InputOTPGroup>
          </React.Fragment>
        ))}
      </InputOTP>
    </div>
  )
}

export default Captcha
