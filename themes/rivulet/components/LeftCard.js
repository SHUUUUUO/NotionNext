import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import Announcement from './Announcement'
import SocialButton from './SocialButton'
import Logo from './Logo'
import { MenuList } from './MenuList'
import { isBrowser } from '@/lib/utils'

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
  const [enableMenuScroll, setEnableMenuScroll] = useState(false) // 是否启用菜单内部滚动
  const [menuMaxHeight, setMenuMaxHeight] = useState(null) // 菜单最大高度
  
  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  
  const cardStyle = {
    top: cardTop,
    width: cardWidth,
    maxHeight: `calc(100vh - ${cardGapValue} - ${cardGapValue})`,
    left: cardGapValue
  }

  // 获取头像配置，如果为空则使用默认头像
  const avatarUrl = siteConfig('RIVULET_LEFT_CARD_AVATAR', '/avatar.png', CONFIG) || '/avatar.png'

  // 点击头像返回首页
  const handleAvatarClick = () => {
    router.push('/')
  }

  // 处理子菜单展开状态变化
  const handleSubMenuToggle = (isOpen) => {
    setHasSubMenuOpen(isOpen)
  }

  // 检查剩余组件能否显示
  const checkBottomComponentsVisibility = () => {
    const card = cardRef.current
    const content = contentRef.current
    const menuSection = menuSectionRef.current
    if (!card || !content || !menuSection) return

    // 等待 DOM 更新完成
    requestAnimationFrame(() => {
      // 获取菜单区域的底部位置
      const menuRect = menuSection.getBoundingClientRect()
      const menuBottom = menuRect.bottom
      
      // 计算菜单底部到屏幕底部的距离
      const distanceToBottom = window.innerHeight - menuBottom
      
      // 计算公告标题高度和站点信息高度
      // 公告标题：约 40px（包含 padding）
      // 站点信息：约 120-150px（根据内容动态）
      // 加上分隔线和间距，总共约 180-200px
      const announcementTitleHeight = 40 // 公告标题高度
      const siteInfoHeight = 150 // 站点信息高度（估算）
      const sectionGap = 24 // 分隔线和间距
      const minRequiredHeight = announcementTitleHeight + siteInfoHeight + sectionGap
      const minRequiredHeightWithTitleOnly = announcementTitleHeight + sectionGap // 只显示公告标题时所需的最小高度
      
      // 计算卡片内容的总高度
      const cardContentHeight = content.scrollHeight
      const maxAllowedHeight = window.innerHeight - parseFloat(cardGapValue) * 2
      
      // 计算内容区域的最大高度（基于卡片的最大高度）
      // 内容区域有上下 padding（各 24px，即 p-6）
      const paddingTop = 24
      const paddingBottom = 24
      const availableHeight = maxAllowedHeight - paddingTop - paddingBottom
      const maxHeight = Math.max(200, availableHeight) // 最小 200px
      
      // 如果内容超出，设置最大高度以启用滚动
      if (cardContentHeight > maxAllowedHeight) {
        setContentMaxHeight(maxHeight)
      } else {
        // 内容未超出，不限制高度
        setContentMaxHeight(null)
      }
      
      // 优先策略：先尝试只显示公告标题，如果还是放不下再隐藏公告
      if (distanceToBottom < minRequiredHeight) {
        // 如果距离小于完整显示所需高度，先尝试只显示公告标题
        if (distanceToBottom >= minRequiredHeightWithTitleOnly && notice) {
          // 可以只显示公告标题
          setShowBottomComponents(true)
          setShowAnnouncementTitleOnly(true)
        } else {
          // 连只显示标题都放不下，隐藏整个公告
          setShowBottomComponents(false)
          setShowAnnouncementTitleOnly(false)
        }
        
        // 计算菜单区域的高度和可用空间
        const menuHeight = menuRect.height
        const menuTop = menuRect.top
        const bottomPadding = 16 // 底部留出 16px 的空隙
        const availableHeight = window.innerHeight - menuTop - parseFloat(cardGapValue) - bottomPadding
        
        // 如果菜单高度超过可用空间，启用菜单内部滚动
        // 给一个小的容差，避免因为计算误差导致不必要的滚动
        if (menuHeight > availableHeight - 10) {
          setEnableMenuScroll(true)
          setMenuMaxHeight(availableHeight)
        } else {
          setEnableMenuScroll(false)
          setMenuMaxHeight(null)
        }
        
        // 如果公告存在且显示完整内容（不是只显示标题），继续压缩公告区域
        if (notice && cardContentHeight > maxAllowedHeight && distanceToBottom >= minRequiredHeightWithTitleOnly) {
          const overflow = cardContentHeight - maxAllowedHeight
          const newHeight = Math.max(4, 8 - (overflow / 16))
          setAnnouncementMaxHeight(`${newHeight}rem`)
        }
      } else {
        // 空间充足，正常显示
        setEnableMenuScroll(false)
        setShowBottomComponents(true)
        setShowAnnouncementTitleOnly(false)
        
        // 如果未超出，恢复默认高度
        if (notice) {
          setAnnouncementMaxHeight('8rem')
        }
      }
    })
  }

  // 当菜单展开/收起状态变化时，检查剩余组件能否显示
  useEffect(() => {
    // 延迟检查，等待菜单展开/收起动画完成
    const timers = [
      setTimeout(() => checkBottomComponentsVisibility(), 200),
      setTimeout(() => checkBottomComponentsVisibility(), 500)
    ]

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [hasSubMenuOpen, notice, cardGapValue])

  // 计算内容区域的最大高度（基于卡片最大高度）
  useEffect(() => {
    if (!isBrowser || !cardRef.current || !contentRef.current) {
      return
    }

    const calculateContentMaxHeight = () => {
      if (!contentRef.current) return
      
      const cardGapPx = parseFloat(cardGapValue) || 16
      const maxAllowedHeight = window.innerHeight - cardGapPx * 2
      
      // 内容区域有上下 padding（各 24px，即 p-6）
      const paddingTop = 24
      const paddingBottom = 24
      const availableHeight = maxAllowedHeight - paddingTop - paddingBottom
      const maxHeight = Math.max(200, availableHeight) // 最小 200px
      
      // 检查内容是否超出
      const cardContentHeight = contentRef.current.scrollHeight
      if (cardContentHeight > maxAllowedHeight) {
        setContentMaxHeight(maxHeight)
      } else {
        setContentMaxHeight(null)
      }
    }

    // 初始计算
    calculateContentMaxHeight()

    // 监听窗口大小变化和滚动
    window.addEventListener('resize', calculateContentMaxHeight)
    window.addEventListener('scroll', calculateContentMaxHeight)

    // 使用 MutationObserver 监听内容变化
    const observer = new MutationObserver(() => {
      setTimeout(calculateContentMaxHeight, 100)
    })

    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }

    // 延迟计算，等待内容渲染完成
    const timer = setTimeout(calculateContentMaxHeight, 100)
    const timer2 = setTimeout(calculateContentMaxHeight, 500)

    return () => {
      window.removeEventListener('resize', calculateContentMaxHeight)
      window.removeEventListener('scroll', calculateContentMaxHeight)
      observer.disconnect()
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [isCollapsed, cardGapValue, hasSubMenuOpen, notice, showBottomComponents, showAnnouncementTitleOnly])

  // 检测卡片是否超出屏幕，动态调整公告高度
  useEffect(() => {
    const checkCardHeight = () => {
      checkBottomComponentsVisibility()
    }

    // 初始检查
    checkCardHeight()

    // 监听窗口大小变化
    window.addEventListener('resize', checkCardHeight)
    
    // 使用 MutationObserver 监听卡片内容变化
    const observer = new MutationObserver(() => {
      // 延迟检查，等待 DOM 更新完成
      setTimeout(checkCardHeight, 100)
    })

    if (cardRef.current) {
      observer.observe(cardRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }

    // 延迟检查，等待菜单展开动画完成
    const timers = [
      setTimeout(checkCardHeight, 200),
      setTimeout(checkCardHeight, 500)
    ]

    return () => {
      window.removeEventListener('resize', checkCardHeight)
      observer.disconnect()
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [hasSubMenuOpen, notice, cardGapValue])

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

      </div>
    </aside>
  )
}

export default LeftCard

