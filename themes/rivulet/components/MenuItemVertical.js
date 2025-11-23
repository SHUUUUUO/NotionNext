import SmartLink from '@/components/SmartLink'

/**
 * 垂直菜单项组件，用于左侧卡片
 * @param {object} link - 菜单链接对象
 * @param {boolean} isOpen - 是否展开（由父组件控制）
 * @param {function} onToggle - 切换展开状态的回调函数
 * @returns {JSX.Element}
 */
export const MenuItemVertical = ({ link, isOpen = false, onToggle }) => {
  const hasSubMenu = link?.subMenus?.length > 0

  // 处理点击事件
  const handleClick = () => {
    if (hasSubMenu && onToggle) {
      onToggle(!isOpen)
    }
  }

  if (!link || !link.show) {
    return null
  }

  return (
    <div className='w-full'>
      {!hasSubMenu && (
        <SmartLink
          href={link?.href}
          target={link?.target}
          className='w-full py-2 px-3 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center justify-center'>
          {link.icon && (
            <i className={`${link.icon} text-center w-4 mr-2`} />
          )}
          <span className='text-sm font-light'>{link.name}</span>
          {link.slot}
        </SmartLink>
      )}

      {hasSubMenu && (
        <div className='w-full'>
          <div
            onClick={handleClick}
            className='w-full py-2 px-3 text-gray-500 dark:text-gray-300 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center justify-center cursor-pointer gap-2'>
            <div className='flex items-center'>
              {link.icon && (
                <i className={`${link.icon} text-center w-4 mr-2`} />
              )}
              <span className='text-sm font-light'>{link.name}</span>
            </div>
            <i
              className={`fas fa-chevron-down text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
          </div>

          {/* 子菜单 */}
          {isOpen && (
            <div className='mt-1 space-y-1 pl-4'>
              {link?.subMenus?.map((sLink, index) => {
                if (!sLink || !sLink.show) return null
                return (
                  <SmartLink
                    key={index}
                    href={sLink.href}
                    target={link?.target}
                    className='w-full py-1.5 px-3 text-gray-400 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-all duration-200 flex items-center justify-center'>
                    {sLink.icon && (
                      <i className={`${sLink.icon} text-center w-3 mr-2 text-xs`} />
                    )}
                    <span className='text-xs font-light'>{sLink.name || sLink.title}</span>
                    {sLink.slot}
                  </SmartLink>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

