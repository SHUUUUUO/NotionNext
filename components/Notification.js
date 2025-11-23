import { useState } from 'react'

/**
 * 弹框通知
 * @returns
 */
const useNotification = () => {
  const [message, setMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  const showNotification = msg => {
    setMessage(msg)
    setIsVisible(true)
    setTimeout(() => {
      closeNotification()
    }, 3000)
  }

  const closeNotification = () => {
    setIsVisible(false)
    setMessage('')
  }

  // 测试通知效果
  //   const toggleVisible = () => {
  //     setIsVisible(prev => !prev) // 使用函数式更新
  //   }
  //   useEffect(() => {
  //     document?.addEventListener('click', toggleVisible)
  //     return () => {
  //       document?.removeEventListener('click', toggleVisible)
  //     }
  //   }, [])

  /**
   * 通知组件
   * @returns
   */
  const Notification = () => {
    return (
      <div className={`notification fixed left-0 w-full px-2 z-20 bottom-14 flex justify-center`}>
        <div
          className={` ${isVisible && message ? 'opacity-100' : 'invisible opacity-0 bottom-0'} transition-opacity duration-200 
           w-auto mx-auto bg-green-500 flex items-center justify-center px-4 py-2 text-white rounded-lg shadow-lg`}>
          <span className='text-center'>{message}</span>
          <button
            onClick={closeNotification}
            className='ml-2 p-2 cursor-pointer bg-transparent text-white border-none flex-shrink-0'>
            <i className='fas fa-times' />
          </button>
        </div>
      </div>
    )
  }

  return {
    showNotification,
    closeNotification,
    Notification
  }
}

export default useNotification
