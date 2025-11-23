import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import Announcement from './Announcement'
import SocialButton from './SocialButton'
import Logo from './Logo'
import { MenuList } from './MenuList'
import { isBrowser } from '@/lib/utils'
import SiteInfo from './SiteInfo'

/**
 * 左侧卡片组件
 * @param {object} props
 * @param {array} props.tagOptions - 标签选项
 * @param {string} props.currentTag - 当前标签
 * @param {array} props.categoryOptions - 分类选项
 * @param {string} props.currentCategory - 当前分类
 * @param {boolean} props.isCollapsed - 是否折叠
 * @param {string} props.cardGap - 卡片间隙
 * @returns {JSX.Element}
 */
const LeftCard = ({
  isCollapsed,
  cardGap,
  notice,
  ...otherProps
}) => {
  const router = useRouter()
  const cardRef = useRef(null)
  const contentRef = useRef(null)
  const menuSectionRef = useRef(null)
  const [hasSubMenuOpen, setHasSubMenuOpen] = useState(false)
  const [announcementMaxHeight, setAnnouncementMaxHeight] = useState('8rem') // 默认 128px
  const [contentMaxHeight, setContentMaxHeight] = useState(null) // 内容区域最大高度
  const [showBottomComponents, setShowBottomComponents] = useState(true) // 是否显示下方组件（公告、站点信息）
  const [showAnnouncementTitleOnly, setShowAnnouncementTitleOnly] = useState(false) // 是否只显示公告标题
  const [showCopyright, setShowCopyright] = useState(true) // 是否显示版权信息
  const [enableMenuScroll, setEnableMenuScroll] = useState(false) // 是否启用菜单内部滚动
  const [menuMaxHeight, setMenuMaxHeight] = useState(null) // 菜单最大高度
  
  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  const [cardBottomGap, setCardBottomGap] = useState('12px') // 默认底部间距12px
  
  // 检测页码组件是否存在，动态调整底部间距
  useEffect(() => {
    if (!isBrowser) return

    const updateBottomGap = () => {
      const pageNumber = document.querySelector('#page-number-area')
      // 如果页码组件存在且可见，底部间距为68px，否则为12px
      if (pageNumber) {
        const rect = pageNumber.getBoundingClientRect()
        const isVisible = rect.width > 0 && rect.height > 0 && 
                         window.getComputedStyle(pageNumber).display !== 'none' &&
                         window.getComputedStyle(pageNumber).visibility !== 'hidden'
        setCardBottomGap(isVisible ? '68px' : '12px')
      } else {
        setCardBottomGap('12px')
      }
    }

    // 初始计算
    updateBottomGap()

    // 监听窗口大小变化和滚动
    window.addEventListener('resize', updateBottomGap)
    window.addEventListener('scroll', updateBottomGap, { passive: true })

    // 使用 MutationObserver 监听页码组件的变化
    const observer = new MutationObserver(updateBottomGap)
    const pageNumber = document.querySelector('#page-number-area')
    if (pageNumber) {
      observer.observe(pageNumber, {
        attributes: true,
        attributeFilter: ['style', 'class'],
        childList: true,
        subtree: true
      })
    }

    // 监听整个文档的变化，以便检测页码组件的出现/消失
    const documentObserver = new MutationObserver(updateBottomGap)
    documentObserver.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 延迟计算，等待内容渲染完成
    const timer = setTimeout(updateBottomGap, 100)
    const timer2 = setTimeout(updateBottomGap, 500)

    return () => {
      window.removeEventListener('resize', updateBottomGap)
      window.removeEventListener('scroll', updateBottomGap)
      observer.disconnect()
      documentObserver.disconnect()
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [router.asPath]) // 路由变化时重新检测
  
  const cardStyle = {
    top: cardTop,
    width: cardWidth,
    maxHeight: `calc(100vh - ${cardGapValue} - ${cardBottomGap})`,
    left: cardGapValue
  }

  // 获取头像配置，如果为空则使用默认头像
  const avatarUrl = siteConfig('RIVULET_LEFT_CARD_AVATAR', '/avatar.png', CONFIG) || '/avatar.png'

  // 点击头像返回首页 - 使用 useCallback 优化
  const handleAvatarClick = useCallback(() => {
    router.push('/')
  }, [router])

  // 处理子菜单展开状态变化 - 使用 useCallback 优化
  const handleSubMenuToggle = useCallback((isOpen) => {
    setHasSubMenuOpen(isOpen)
  }, [])

  // 检查剩余组件能否显示（只负责显示/隐藏逻辑，不负责计算高度）- 使用 useCallback 优化
  const checkBottomComponentsVisibility = useCallback(() => {
    const menuSection = menuSectionRef.current
    if (!menuSection) return

    // 等待 DOM 更新完成
    requestAnimationFrame(() => {
      // 获取菜单区域的底部位置
      const menuRect = menuSection.getBoundingClientRect()
      const menuBottom = menuRect.bottom
      
      // 计算菜单底部到屏幕底部的距离
      const distanceToBottom = window.innerHeight - menuBottom
      
      // 计算各组件高度
      const announcementTitleHeight = 40 // 公告标题高度
      const announcementFullHeight = 128 // 公告完整高度（8rem = 128px）
      const copyrightHeight = 60 // 版权信息高度（估算，包括分隔线和间距）
      const sectionGap = 12 // 分隔线和间距（pt-3 = 12px，已改为紧凑模式）
      
      // 计算不同组合所需的高度
      const minRequiredHeightWithAll = announcementFullHeight + copyrightHeight + sectionGap * 2 // 公告完整 + 版权信息
      const minRequiredHeightWithAnnouncementOnly = announcementFullHeight + sectionGap // 只有公告完整
      const minRequiredHeightWithTitleOnly = announcementTitleHeight + sectionGap // 只显示公告标题
      const minRequiredHeightWithCopyrightOnly = copyrightHeight + sectionGap // 只有版权信息
      
      // 获取页码组件位置，用于计算可用空间
      const pageNumber = document.querySelector('#page-number-area')
      let pageNumberTop = window.innerHeight
      if (pageNumber) {
        const pageNumberRect = pageNumber.getBoundingClientRect()
        pageNumberTop = pageNumberRect.top
      } else {
        // 如果页码组件不存在，卡片下边缘距离屏幕底部12px
        const bottomGap = 12
        pageNumberTop = window.innerHeight - bottomGap
      }
      
      // 优先策略：优先隐藏版权信息，然后尝试只显示公告标题，最后隐藏公告
      if (distanceToBottom < minRequiredHeightWithAll) {
        // 空间不足，需要隐藏一些内容
        if (distanceToBottom >= minRequiredHeightWithAnnouncementOnly && notice) {
          // 可以显示完整公告，但隐藏版权信息
          setShowBottomComponents(true)
          setShowAnnouncementTitleOnly(false)
          setShowCopyright(false)
        } else if (distanceToBottom >= minRequiredHeightWithTitleOnly && notice) {
          // 只能显示公告标题，隐藏版权信息
          setShowBottomComponents(true)
          setShowAnnouncementTitleOnly(true)
          setShowCopyright(false)
        } else if (distanceToBottom >= minRequiredHeightWithCopyrightOnly && !notice) {
          // 没有公告，但可以显示版权信息
          setShowBottomComponents(false)
          setShowAnnouncementTitleOnly(false)
          setShowCopyright(true)
        } else {
          // 连最小内容都放不下，全部隐藏
          setShowBottomComponents(false)
          setShowAnnouncementTitleOnly(false)
          setShowCopyright(false)
        }
        
        // 计算菜单区域的高度和可用空间
        const menuHeight = menuRect.height
        const menuTop = menuRect.top
        const bottomPadding = 16 // 底部留出 16px 的空隙
        const availableHeight = pageNumberTop - menuTop - bottomPadding
        
        // 如果菜单高度超过可用空间，启用菜单内部滚动
        // 给一个小的容差，避免因为计算误差导致不必要的滚动
        if (menuHeight > availableHeight - 10) {
          setEnableMenuScroll(true)
          setMenuMaxHeight(availableHeight)
        } else {
          setEnableMenuScroll(false)
          setMenuMaxHeight(null)
        }
      } else {
        // 空间充足，正常显示所有内容
        setEnableMenuScroll(false)
        setShowBottomComponents(true)
        setShowAnnouncementTitleOnly(false)
        setShowCopyright(true)
        
        // 恢复默认高度
        if (notice) {
          setAnnouncementMaxHeight('8rem')
        }
      }
    })
  }, [notice, cardGapValue, contentMaxHeight])

  // 计算内容区域的最大高度（基于页码组件位置，类似右卡片基于功能组件位置）
  useEffect(() => {
    if (!cardRef.current || !contentRef.current) {
      return
    }

    let resizeTimer = null
    let scrollTimer = null

    const calculateContentMaxHeight = () => {
      const card = cardRef.current
      const content = contentRef.current
      const pageNumber = document.querySelector('#page-number-area')

      if (!card || !content) return

      // 获取卡片的位置
      const cardRect = card.getBoundingClientRect()
      const cardTop = cardRect.top

      // 获取页码组件的位置
      let pageNumberTop = window.innerHeight
      if (pageNumber) {
        const pageNumberRect = pageNumber.getBoundingClientRect()
        pageNumberTop = pageNumberRect.top
      } else {
        // 如果页码组件不存在，卡片下边缘距离屏幕底部12px
        const bottomGap = 12
        pageNumberTop = window.innerHeight - bottomGap
      }

      // 计算内容区域可用的最大高度
      // 内容区域的下边缘（包括下 padding）应该接近页码组件顶部，只保留很小间距（4px）
      const availableHeight = pageNumberTop - cardTop - 4
      const maxHeight = Math.max(200, availableHeight) // 最小 200px

      setContentMaxHeight(maxHeight)
    }

    // 防抖处理 resize 事件
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(calculateContentMaxHeight, 100)
    }

    // 防抖处理 scroll 事件
    const handleScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer)
      scrollTimer = setTimeout(calculateContentMaxHeight, 50)
    }

    // 初始计算
    calculateContentMaxHeight()

    // 监听窗口大小变化和滚动
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    // 使用 MutationObserver 监听页码组件的变化
    const observer = new MutationObserver(calculateContentMaxHeight)
    const pageNumber = document.querySelector('#page-number-area')
    if (pageNumber) {
      observer.observe(pageNumber, {
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }

    // 延迟计算，等待内容渲染完成
    const timer = setTimeout(calculateContentMaxHeight, 100)
    const timer2 = setTimeout(calculateContentMaxHeight, 500)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
      if (resizeTimer) clearTimeout(resizeTimer)
      if (scrollTimer) clearTimeout(scrollTimer)
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [isCollapsed])

  // 当菜单展开/收起或内容变化时，检查剩余组件能否显示
  useEffect(() => {
    if (!isBrowser) return

    // 延迟检查，等待菜单展开/收起动画完成
    const timers = [
      setTimeout(() => checkBottomComponentsVisibility(), 200),
      setTimeout(() => checkBottomComponentsVisibility(), 500)
    ]

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [hasSubMenuOpen, notice, cardGapValue, contentMaxHeight])

  return (
    <aside
      ref={cardRef}
      id="sidebar-left-card"
      className="hidden md:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-300 ease-in-out"
      style={{
        ...cardStyle,
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}>
      <div 
        ref={contentRef}
        className="p-6 space-y-3 flex flex-col items-center text-center overflow-y-auto overflow-x-hidden"
        style={contentMaxHeight ? { maxHeight: `${contentMaxHeight}px` } : undefined}
      >
        {/* 头像 */}
        {avatarUrl && (
          <section className='flex flex-col items-center w-full mb-1'>
            <div
              onClick={handleAvatarClick}
              className='cursor-pointer hover:opacity-80 transition-opacity duration-200'
              title='返回首页'>
              <img
                src={avatarUrl}
                alt='Avatar'
                className='w-28 h-28 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700'
              />
            </div>
          </section>
        )}

        {/* Logo */}
        <section className='flex flex-col items-center w-full -my-1'>
          <Logo {...otherProps} />
        </section>

        {/* 站点描述 */}
        <section className='siteInfo flex flex-col items-center dark:text-gray-300 w-full'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {siteConfig('RIVULET_LEFT_CARD_DESCRIPTION', '', CONFIG) || siteConfig('DESCRIPTION')}
          </p>
        </section>

        {/* 社交按钮 */}
        <section className='flex flex-col items-center w-full'>
          <SocialButton />
        </section>

        {/* 菜单 - 仅在大屏模式下显示 */}
        <section 
          ref={menuSectionRef}
          className={`flex flex-col items-center w-full pt-6 border-t border-gray-200 dark:border-gray-700 ${enableMenuScroll ? 'overflow-y-auto overflow-x-hidden pb-4' : ''}`}
          style={enableMenuScroll && menuMaxHeight ? {
            maxHeight: `${menuMaxHeight}px`
          } : {}}
        >
          <MenuList
            {...otherProps}
            showDesktop={true}
            showMobile={false}
            desktopWrapperClass='w-full'
            desktopClassName='flex flex-col space-y-1'
            vertical={true}
            onSubMenuToggle={handleSubMenuToggle}
          />
        </section>

        {/* 公告 */}
        {notice && showBottomComponents && (
          <section className='flex flex-col items-center dark:text-gray-300 w-full border-t border-gray-200 dark:border-gray-700 pb-0'>
            <Announcement post={notice} maxHeight={announcementMaxHeight} showTitleOnly={hasSubMenuOpen || showAnnouncementTitleOnly} />
          </section>
        )}

        {/* 版权信息 */}
        {showCopyright && (
          <section className='flex flex-col items-center w-full pt-3 border-t border-gray-200 dark:border-gray-700'>
            <SiteInfo />
          </section>
        )}

      </div>
    </aside>
  )
}

export default LeftCard

