import DarkModeButton from '@/components/DarkModeButton'
import { siteConfig } from '@/lib/config'
import { isBrowser } from '@/lib/utils'
import { throttle } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CONFIG from '../config'

/**
 * 功能按键区域组件
 * @param {object} props
 * @param {boolean} props.isCollapsed - 是否折叠
 * @param {function} props.toggleOpen - 切换折叠状态
 * @param {boolean} props.showCollapseButton - 是否显示折叠按钮
 * @param {boolean} props.isFullScreenReading - 是否处于满屏阅读模式
 * @param {function} props.toggleFullScreenReading - 切换满屏阅读模式
 * @param {boolean} props.isArticlePage - 是否为文章页面
 * @param {boolean} props.isWaterfallPage - 是否为瀑布流页面
 * @returns {JSX.Element}
 */
const FunctionArea = ({
  isCollapsed,
  toggleOpen,
  showCollapseButton,
  isFullScreenReading,
  toggleFullScreenReading,
  isArticlePage,
  isWaterfallPage
}) => {
  // 计算功能区样式
  const cardGap = siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const functionAreaHeight = '44px'
  const bottomGap = '12px' // 与窗口下边缘的间隙恒定为12px
  const functionAreaTop = `calc(100vh - ${functionAreaHeight} - ${bottomGap})`
  
  const functionAreaStyle = {
    top: functionAreaTop,
    width: 'auto',
    height: functionAreaHeight,
    right: cardGap,
    minWidth: 'fit-content'
  }
  const router = useRouter()
  // 回到顶部按钮显示状态
  const [showBackToTop, setShowBackToTop] = useState(false)

  // 监听滚动，显示/隐藏回到顶部按钮
  useEffect(() => {
    if (!isBrowser) return

    const handleScroll = throttle(() => {
      const scrollY = window.scrollY || window.pageYOffset
      setShowBackToTop(scrollY > 200)
    }, 200)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 回到顶部功能
  const scrollToTop = () => {
    if (isBrowser) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // 回到首页功能
  const goToHome = () => {
    if (isBrowser) {
      router.push('/')
    }
  }

  return (
    <aside
      id="sidebar-function-area"
      className="hidden md:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-250 ease-linear"
      style={functionAreaStyle}>
      <div className='px-3 py-2 h-full'>
        <div className='w-full h-full flex items-center justify-center'>
          {/* 按钮组容器 - 当前可用的按钮作为一个整体居中，线性动画 */}
          <div className='flex items-center gap-1 transition-all duration-250 ease-linear will-change-transform'>
            {/* 回到顶部按钮 - 始终在 DOM 中，通过 CSS 控制显示/隐藏以实现平滑过渡 */}
            <button
              onClick={scrollToTop}
              className={`flex items-center justify-center h-10 rounded-lg bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-none dark:outline-none focus:outline-none transition-all duration-250 ease-linear overflow-hidden ${
                showBackToTop
                  ? 'opacity-100 w-10 pointer-events-auto'
                  : 'opacity-0 w-0 pointer-events-none'
              }`}
              title='回到顶部'>
              <i className='fas fa-angle-up text-lg whitespace-nowrap'></i>
            </button>

            {/* 回到首页按钮 */}
            <button
              onClick={goToHome}
              className='flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-none dark:outline-none focus:outline-none transition-colors duration-200'
              title='回到首页'>
              <i className='fas fa-home text-lg'></i>
            </button>

            {/* 暗黑模式切换 - 添加与其他按钮一致的样式 */}
            <div
              onClick={() => {
                // 触发暗黑模式切换
                const darkModeButton = document.getElementById('darkModeButton')
                if (darkModeButton) {
                  darkModeButton.click()
                }
              }}
              className='flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-none dark:outline-none focus:outline-none transition-colors duration-200 cursor-pointer'>
              <DarkModeButton />
            </div>

            {/* 满屏阅读按钮 - 只在文章页面显示 */}
            {isArticlePage && (
              <button
                onClick={toggleFullScreenReading}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200 ${
                  isFullScreenReading
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                    : 'bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                } dark:border-none dark:outline-none focus:outline-none`}
                title={isFullScreenReading ? '退出满屏阅读' : '满屏阅读'}>
                <i className={`fas ${isFullScreenReading ? 'fa-compress' : 'fa-expand'} text-lg`}></i>
              </button>
            )}

            {/* 折叠/展开卡片按钮 */}
            {/* 在瀑布流页面的全屏模式下也显示展开按钮 */}
            {showCollapseButton && (!isFullScreenReading || (isFullScreenReading && isWaterfallPage && !isArticlePage)) && (
              <button
                onClick={toggleOpen}
                className='flex items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-none dark:outline-none focus:outline-none transition-colors duration-200'
                title={isCollapsed ? '展开卡片' : '收起卡片'}>
                {isCollapsed ? (
                  <i className='fa-solid fa-indent text-lg'></i>
                ) : (
                  <i className='fas fa-bars text-lg'></i>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

export default FunctionArea

