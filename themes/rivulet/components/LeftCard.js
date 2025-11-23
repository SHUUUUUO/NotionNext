import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import Announcement from './Announcement'
import SiteInfo from './SiteInfo'
import SocialButton from './SocialButton'
import Logo from './Logo'
import { MenuList } from './MenuList'

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
  const [enableScroll, setEnableScroll] = useState(false) // 是否启用滚动
  const [showBottomComponents, setShowBottomComponents] = useState(true) // 是否显示下方组件（公告、站点信息）
  const [enableMenuScroll, setEnableMenuScroll] = useState(false) // 是否启用菜单内部滚动
  const [menuMaxHeight, setMenuMaxHeight] = useState(null) // 菜单最大高度
  
  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  
  const [cardHeight, setCardHeight] = useState(null) // 卡片高度，null 表示自适应
  
  const cardStyle = {
    top: cardTop,
    width: cardWidth,
    height: cardHeight || 'auto',
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
      
      // 计算卡片内容的总高度
      const cardContentHeight = content.scrollHeight
      const maxAllowedHeight = window.innerHeight - parseFloat(cardGapValue) * 2
      
      // 如果内容高度超出屏幕范围，固定卡片高度并启用滚动
      if (cardContentHeight > maxAllowedHeight) {
        setCardHeight(`calc(100vh - ${cardGapValue} - ${cardGapValue})`)
        setEnableScroll(true)
      } else {
        // 内容未超出，让卡片高度自适应
        setCardHeight(null)
        setEnableScroll(false)
      }
      
      // 如果菜单下方到屏幕底部的距离小于所需高度，隐藏下方组件
      if (distanceToBottom < minRequiredHeight) {
        setShowBottomComponents(false)
        
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
        
        // 如果公告存在，继续压缩公告区域
        if (notice && cardContentHeight > maxAllowedHeight) {
          const overflow = cardContentHeight - maxAllowedHeight
          const newHeight = Math.max(4, 8 - (overflow / 16))
          setAnnouncementMaxHeight(`${newHeight}rem`)
        }
      } else {
        setEnableMenuScroll(false)
        setShowBottomComponents(true)
        
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

  // 检测卡片是否超出屏幕，动态调整公告高度和启用滚动
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
      className={`hidden lg:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-300 ease-in-out ${cardHeight ? 'flex flex-col overflow-hidden' : ''}`}
      style={{
        ...cardStyle,
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}>
      <div 
        ref={contentRef}
        className={`p-6 space-y-3 flex flex-col items-center text-center ${cardHeight ? 'flex-1 min-h-0' : ''} ${enableScroll ? 'overflow-y-auto overflow-x-hidden' : ''}`}
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
          <section className='flex flex-col items-center dark:text-gray-300 w-full border-t border-gray-200 dark:border-gray-700'>
            <Announcement post={notice} maxHeight={announcementMaxHeight} showTitleOnly={hasSubMenuOpen} />
          </section>
        )}

        {/* 站点信息 */}
        {showBottomComponents && (
          <section className={`flex flex-col items-center w-full ${notice ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            <SiteInfo />
          </section>
        )}
      </div>
    </aside>
  )
}

export default LeftCard

