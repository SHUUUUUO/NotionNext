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

  const [announcementMaxHeight, setAnnouncementMaxHeight] = useState('12rem') // 默认 192px
  const [showBottomComponents, setShowBottomComponents] = useState(true) // 是否显示下方组件（公告、站点信息）
  const [showAnnouncementTitleOnly, setShowAnnouncementTitleOnly] = useState(false) // 是否只显示公告标题
  const [showCopyright, setShowCopyright] = useState(true) // 是否显示版权信息
  const [layoutReady, setLayoutReady] = useState(false) // 页面加载后延迟显示内容，防止初始渲染时的溢出闪烁

  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  const cardBottomGap = '68px' // 始终保持底部间距68px，与右侧卡片保持一致

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
      // 这里的 "bottomLimit" 应该是窗口高度减去我们强制保留的 68px 底部间距
      // 如果 menuBottom 已经超过了这个 limit，说明即使没有底部组件，菜单也已经满了
      const bottomLimit = window.innerHeight - 68
      const distanceToBottom = bottomLimit - menuBottom

      // 计算各组件高度
      const announcementTitleHeight = 40 // 公告标题高度
      const announcementFullHeight = 192 // 公告完整高度（12rem = 192px）
      const sectionGap = 12 // 分隔线和间距（pt-3 = 12px，已改为紧凑模式）

      // 实际测量 SiteInfo 的高度（如果已渲染）
      const siteInfoElement = contentRef.current?.querySelector('footer')
      let actualCopyrightHeight = 80 // 默认估算值（增加高度）
      if (siteInfoElement) {
        const siteInfoRect = siteInfoElement.getBoundingClientRect()
        actualCopyrightHeight = siteInfoRect.height + sectionGap // 包括分隔线间距
      }

      // 计算公告所需高度
      const announcementHeight = showAnnouncementTitleOnly ? announcementTitleHeight : announcementFullHeight
      const announcementWithGap = notice ? (announcementHeight + sectionGap) : 0

      // 计算显示版权信息所需的总高度（包括公告和分隔线）
      const totalHeightForCopyright = announcementWithGap + actualCopyrightHeight

      // 判定逻辑：
      // 1. 如果剩余空间小于版权所需高度，隐藏版权
      if (distanceToBottom < actualCopyrightHeight) {
        setShowCopyright(false)
        // 版权隐藏了，继续判断公告
        // 2. 如果隐藏版权后，剩余空间还不够放公告（哪怕是标题），那把公告也隐藏了
        if (notice && distanceToBottom < announcementTitleHeight + sectionGap) {
          setShowBottomComponents(false)
          setShowAnnouncementTitleOnly(false)
        } else if (notice) {
          // 空间够放公告（至少够标题）
          setShowBottomComponents(true)
          // 进一步判断够不够放完整公告
          if (distanceToBottom < announcementFullHeight + sectionGap) {
            setShowAnnouncementTitleOnly(true)
          } else {
            setShowAnnouncementTitleOnly(false)
          }
        }
      } else {
        // 空间充足，显示版权
        setShowCopyright(true)

        // 3. 既然能放版权，再看能不能完整放公告
        // 注意：这里逻辑稍微复杂点，因为版权显示会占用空间。
        // 总需求 = 公告 + 版权。
        if (distanceToBottom < totalHeightForCopyright) {
          // 总空间不够放 "完整公告 + 版权"，尝试 "标题公告 + 版权"
          const heightForTitleAndCopyright = announcementTitleHeight + sectionGap + actualCopyrightHeight
          if (distanceToBottom < heightForTitleAndCopyright) {
            // 连 "标题 + 版权" 都放不下，说明刚才判断有误？
            // 其实上面 distanceToBottom < actualCopyrightHeight 已经过滤了 extreme case
            // 这里说明空间介于 "仅版权" 和 "版权+标题" 之间？
            // 策略：优先保版权还是优先保公告？通常保版权。所以这里可能还是得隐藏公告。
            setShowBottomComponents(false)
            // 或者，如果不介意稍微滚动一点点，也可以显示。
            // 但为了严格的 "无滚动"，我们倾向于隐藏。
          } else {
            // 可以放 "标题 + 版权"
            setShowBottomComponents(true)
            setShowAnnouncementTitleOnly(true)
          }
        } else {
          // 空间巨大，全部显示
          setShowBottomComponents(true)
          setShowAnnouncementTitleOnly(false)
          setAnnouncementMaxHeight('12rem')
        }
      }
    })

    // 标记布局计算已完成
    if (!layoutReady) {
      setLayoutReady(true)
    }
  }, [notice, cardGapValue, showAnnouncementTitleOnly, layoutReady])

  // 当菜单展开/收起或内容变化时，检查剩余组件能否显示
  useEffect(() => {
    if (!isBrowser) return

    // 立即执行一次检查
    checkBottomComponentsVisibility()

    // 延迟检查，等待菜单展开/收起动画完成
    const timers = [
      setTimeout(() => checkBottomComponentsVisibility(), 200),
      setTimeout(() => checkBottomComponentsVisibility(), 500)
    ]

    // 监听窗口大小变化
    window.addEventListener('resize', checkBottomComponentsVisibility)

    return () => {
      timers.forEach(timer => clearTimeout(timer))
      window.removeEventListener('resize', checkBottomComponentsVisibility)
    }
  }, [hasSubMenuOpen, notice, cardGapValue])

  // 页面加载后延迟显示内容，防止初始渲染时的溢出闪烁
  // 使用 layoutReady 状态来控制显示，只有当首次布局计算完成后才显示


  // 为了保险起见，设置一个超时，确保即使计算逻辑有问题也能最终显示
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!layoutReady) setLayoutReady(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [layoutReady])

  return (
    <aside
      ref={cardRef}
      id="sidebar-left-card"
      className={`hidden md:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-500 ease-in-out ${layoutReady ? 'opacity-100' : 'opacity-0'}`}
      style={{
        ...cardStyle,
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        // 叠加 isCollapsed 的透明度控制
        opacity: isCollapsed ? 0 : (layoutReady ? 1 : 0),
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}>
      <div
        ref={contentRef}
        className="p-6 space-y-3 flex flex-col items-center text-center overflow-y-auto overflow-x-hidden"
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
          className='flex flex-col items-center w-full pt-6 border-t border-gray-200 dark:border-gray-700'
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
