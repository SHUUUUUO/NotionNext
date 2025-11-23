import { siteConfig } from '@/lib/config'
import { isBrowser } from '@/lib/utils'
import { useEffect, useState } from 'react'
import CONFIG from '../config'

/**
 * 页码组件
 * 显示在右下角，与功能按键上下对齐，左边缘与左卡片左边缘对齐
 * @returns {JSX.Element}
 */
const PageNumber = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [inputValue, setInputValue] = useState('')
  const [isInputMode, setIsInputMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 计算功能区样式（与 FunctionArea 保持一致）
  const cardGap = siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'
  const pageNumberHeight = '44px'
  const bottomGap = '12px' // 与窗口下边缘的间隙恒定为12px
  const pageNumberTop = `calc(100vh - ${pageNumberHeight} - ${bottomGap})`
  
  // 左边缘与左卡片左边缘对齐（左卡片 left: cardGap）
  const pageNumberStyle = {
    top: pageNumberTop,
    width: 'auto',
    height: pageNumberHeight,
    left: cardGap,
    minWidth: 'fit-content'
  }

  // 标记组件已挂载，避免 hydration 错误
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // 计算当前页码和总页数
  useEffect(() => {
    if (!isBrowser || !isMounted) return

    const calculatePageNumber = () => {
      // 获取所有文章组容器
      const gridContainers = document.querySelectorAll('.grid-container[data-group-index]')
      if (gridContainers.length === 0) {
        setTotalPages(1)
        setCurrentPage(1)
        return
      }

      const totalPagesCount = gridContainers.length
      setTotalPages(totalPagesCount)

      // 获取当前视口中心位置
      const viewportCenter = window.innerHeight / 2 + window.scrollY
      const scrollY = window.scrollY

      // 找到当前视口中心所在的组
      let currentPageIndex = 1
      
      for (let i = 0; i < gridContainers.length; i++) {
        const container = gridContainers[i]
        const rect = container.getBoundingClientRect()
        const containerTop = rect.top + scrollY
        const containerBottom = containerTop + rect.height

        // 如果视口中心在这个容器范围内
        if (viewportCenter >= containerTop && viewportCenter <= containerBottom) {
          currentPageIndex = i + 1
          break
        }
        
        // 如果视口中心在当前容器上方，且这是第一个容器
        if (viewportCenter < containerTop && i === 0) {
          currentPageIndex = 1
          break
        }
        
        // 如果视口中心在当前容器下方，且这是最后一个容器
        if (viewportCenter > containerBottom && i === gridContainers.length - 1) {
          currentPageIndex = totalPagesCount
          break
        }
        
        // 如果视口中心在当前容器下方，但还有下一个容器
        if (viewportCenter > containerBottom && i < gridContainers.length - 1) {
          // 检查下一个容器
          const nextContainer = gridContainers[i + 1]
          const nextRect = nextContainer.getBoundingClientRect()
          const nextContainerTop = nextRect.top + scrollY
          
          // 如果视口中心在下一个容器上方，说明当前容器是可见的
          if (viewportCenter < nextContainerTop) {
            currentPageIndex = i + 1
            break
          }
        }
      }

      setCurrentPage(currentPageIndex)
    }

    // 初始计算
    calculatePageNumber()

    // 监听滚动和窗口大小变化
    const handleScroll = () => {
      calculatePageNumber()
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', calculatePageNumber)

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      setTimeout(calculatePageNumber, 100)
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // 延迟计算，等待内容渲染完成
    const timer = setTimeout(calculatePageNumber, 100)
    const timer2 = setTimeout(calculatePageNumber, 500)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', calculatePageNumber)
      observer.disconnect()
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [isMounted])

  // 查找目标页的第一篇文章
  const findFirstArticle = (container) => {
    if (!container) return null
    
    const gridItems = container.querySelectorAll('.grid-item')
    let firstArticle = null
    let firstArticleTop = Infinity
    
    for (let i = 0; i < gridItems.length; i++) {
      const gridItem = gridItems[i]
      
      // 跳过空白容器
      const isEmptyPlaceholder = gridItem.querySelector('[class*="EmptyPlaceholder"]') || 
                                 gridItem.querySelector('div[style*="minHeight: \'200px\'"]')
      if (isEmptyPlaceholder) {
        continue
      }
      
      const article = gridItem.querySelector('article')
      if (article) {
        const rect = article.getBoundingClientRect()
        const scrollY = window.scrollY
        const articleTop = rect.top + scrollY
        
        // 找到位置最靠上的文章
        if (articleTop < firstArticleTop) {
          firstArticle = article
          firstArticleTop = articleTop
        }
      }
    }
    
    return firstArticle
  }

  // 滚动到指定元素
  const scrollToElement = (element, offset = 20) => {
    if (!element) return
    
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect()
      const scrollY = window.scrollY
      const elementTop = rect.top + scrollY
      const targetScrollTop = Math.max(0, elementTop - offset)
      
      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth'
      })
    })
  }

  // 跳转到指定页面
  const scrollToPage = (pageNumber) => {
    if (!isBrowser) return
    const totalPagesFromDOM = document.querySelectorAll('.grid-container[data-group-index]').length
    if (pageNumber < 1 || pageNumber > totalPagesFromDOM) return
    
    // 延迟执行，确保 DOM 已更新
    setTimeout(() => {
      const gridContainers = document.querySelectorAll('.grid-container[data-group-index]')
      const targetIndex = pageNumber - 1
      
      if (!gridContainers[targetIndex]) {
        return
      }
      
      const targetContainer = gridContainers[targetIndex]
      const firstArticle = findFirstArticle(targetContainer)
      
      // 优先滚动到第一篇文章，否则滚动到容器顶部
      if (firstArticle) {
        scrollToElement(firstArticle, 20)
      } else {
        scrollToElement(targetContainer, 20)
      }
    }, 300)
  }


  // 实时获取当前页码（从 DOM 计算，不依赖 state）
  const getCurrentPageFromDOM = () => {
    if (!isBrowser) return 1
    
    const gridContainers = document.querySelectorAll('.grid-container[data-group-index]')
    if (gridContainers.length === 0) return 1

    const viewportCenter = window.innerHeight / 2 + window.scrollY
    const scrollY = window.scrollY

    let currentPageIndex = 1
    
    for (let i = 0; i < gridContainers.length; i++) {
      const container = gridContainers[i]
      const rect = container.getBoundingClientRect()
      const containerTop = rect.top + scrollY
      const containerBottom = containerTop + rect.height

      if (viewportCenter >= containerTop && viewportCenter <= containerBottom) {
        currentPageIndex = i + 1
        break
      }
      
      if (viewportCenter < containerTop && i === 0) {
        currentPageIndex = 1
        break
      }
      
      if (viewportCenter > containerBottom && i === gridContainers.length - 1) {
        currentPageIndex = gridContainers.length
        break
      }
      
      if (viewportCenter > containerBottom && i < gridContainers.length - 1) {
        const nextContainer = gridContainers[i + 1]
        const nextRect = nextContainer.getBoundingClientRect()
        const nextContainerTop = nextRect.top + scrollY
        
        if (viewportCenter < nextContainerTop) {
          currentPageIndex = i + 1
          break
        }
      }
    }

    return currentPageIndex
  }

  // 执行页码跳转（统一处理跳转逻辑）
  const executePageJump = (pageNumber) => {
    const pageNum = typeof pageNumber === 'number' ? pageNumber : parseInt(pageNumber)
    if (isNaN(pageNum)) return false
    
    const totalPagesFromDOM = document.querySelectorAll('.grid-container[data-group-index]').length || totalPages
    if (pageNum >= 1 && pageNum <= totalPagesFromDOM) {
      scrollToPage(pageNum)
      return true
    }
    return false
  }

  // 上一页 - 实时获取当前页码减1后调用跳转函数
  const goToPreviousPage = () => {
    const currentPageFromDOM = getCurrentPageFromDOM()
    const targetPage = currentPageFromDOM - 1
    executePageJump(targetPage)
  }

  // 下一页 - 实时获取当前页码加1后调用跳转函数
  const goToNextPage = () => {
    const currentPageFromDOM = getCurrentPageFromDOM()
    const targetPage = currentPageFromDOM + 1
    executePageJump(targetPage)
  }

  // 处理输入框确认
  const handleInputSubmit = (e) => {
    e.preventDefault()
    const success = executePageJump(inputValue)
    setIsInputMode(false)
    setInputValue('')
    if (!success) {
      // 输入无效，已重置
    }
  }

  // 处理输入框变化
  const handleInputChange = (e) => {
    const value = e.target.value
    // 只允许输入数字
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value)
    }
  }

  // 点击页码显示区域切换输入模式
  const handlePageNumberClick = () => {
    if (totalPages > 1) {
      setIsInputMode(true)
      setInputValue('')
    }
  }

  return (
    <aside
      id="page-number-area"
      className="hidden md:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-250 ease-linear"
      style={pageNumberStyle}>
      <div className='px-3 py-2 h-full'>
        <div className='w-full h-full flex items-center justify-center gap-2'>
          {/* 上一页按钮 */}
          <button
            onClick={goToPreviousPage}
            disabled={!isMounted}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
              !isMounted || currentPage <= 1
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
            title='上一页'>
            <i className='fas fa-chevron-left text-sm'></i>
          </button>

          {/* 页码显示或输入框 */}
          {isInputMode && isMounted ? (
            <form onSubmit={handleInputSubmit} className='flex items-center gap-1'>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={() => {
                  if (inputValue === '') {
                    setIsInputMode(false)
                  }
                }}
                autoFocus
                className='w-12 h-8 px-2 text-center text-sm border-2 border-black dark:border-white rounded bg-white dark:bg-hexo-black-gray text-gray-600 dark:text-gray-300 focus:outline-none focus:border-black dark:focus:border-white'
                placeholder={isMounted ? currentPage.toString() : '1'}
                maxLength={3}
              />
              <span className='text-gray-400 dark:text-gray-500 text-sm'>/ {totalPages}</span>
            </form>
          ) : (
            <div
              onClick={handlePageNumberClick}
              className='text-gray-600 dark:text-gray-300 text-sm font-medium cursor-pointer hover:text-gray-800 dark:hover:text-gray-100 transition-colors px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800'
              title='点击输入页码'>
              {isMounted ? `${currentPage} / ${totalPages}` : '1 / 1'}
            </div>
          )}

          {/* 下一页按钮 */}
          <button
            onClick={goToNextPage}
            disabled={!isMounted}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
              !isMounted || currentPage >= totalPages
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
            title='下一页'>
            <i className='fas fa-chevron-right text-sm'></i>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default PageNumber

