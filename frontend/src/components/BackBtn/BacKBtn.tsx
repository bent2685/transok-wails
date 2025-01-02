import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface IBackBtnProps {
  onClick?: (next: () => void) => Promise<void>
}

/**
 * 返回按钮
 * @param props
 * @returns
 */
const BackBtn: React.FC<IBackBtnProps> = props => {
  const navigate = useNavigate()

  /**
   * 点击事件
   */
  const handleClick = async () => {
    const done = () => navigate(-1)
    if (props?.onClick) {
      // 如果传入 onClick 则执行
      await props.onClick(done)
      return
    }
    done()
  }
  return (
    <div
      className="w-8 h-8 duration-300 bg-bg2 rd-5 flex-center cursor-pointer hover:(bg-pri/20) active:(bg-pri/40 scale-95)"
      onClick={handleClick}>
      <div className="i-tabler:arrow-left text-(text 3.5)"></div>
    </div>
  )
}

export default BackBtn
