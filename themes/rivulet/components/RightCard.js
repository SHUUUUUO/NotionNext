import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import Catalog from './Catalog'
import GroupCategory from './GroupCategory'
import GroupTag from './GroupTag'
import SearchInput from './SearchInput'
import SiteInfo from './SiteInfo'

/**
 * 右侧卡片组件
 * @param {object} props
 * @param {object} props.post - 当前文章
 * @param {object} props.notice - 公告
 * @param {boolean} props.isCollapsed - 是否折叠
 * @param {string} props.cardGap - 卡片间隙
 * @param {object} props.otherProps - 其他传递给子组件的 props
 * @returns {JSX.Element}
 */
const RightCard = ({
  post,
  notice,
  isCollapsed,
  cardGap,
  tagOptions,
  currentTag,
  categoryOptions,
  currentCategory,
  ...otherProps
}) => {
  const router = useRouter()
  const { locale } = useGlobal()
  const cardRef = useRef(null)
  const contentRef = useRef(null)
  const catalogSectionRef = useRef(null)
  const [catalogMaxHeight, setCatalogMaxHeight] = useState(400)
  const [contentMaxHeight, setContentMaxHeight] = useState(null)
  const [focusedSection, setFocusedSection] = useState(null) // 当前聚焦的功能区域：'catalog', 'search', 'tags', 'category', 'archive'

  // 直接使用传入的标签选项，不添加测试标签
  const finalTagOptions = tagOptions || []

  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  
  const rightCardStyle = {
    top: cardTop,
    width: cardWidth,
    maxHeight: `calc(100vh - ${cardGapValue} - ${cardGapValue})`,
    right: cardGapValue
  }

  // 计算内容区域的最大高度（基于功能按钮位置）
  useEffect(() => {
    if (!cardRef.current || !contentRef.current) {
      return
    }

    const calculateContentMaxHeight = () => {
      const card = cardRef.current
      const content = contentRef.current
      const functionArea = document.querySelector('#sidebar-function-area')

      if (!card || !content) return

      // 获取卡片的位置
      const cardRect = card.getBoundingClientRect()
      const cardTop = cardRect.top

      // 获取功能按钮区域的位置
      let functionAreaTop = window.innerHeight
      if (functionArea) {
        const functionAreaRect = functionArea.getBoundingClientRect()
        functionAreaTop = functionAreaRect.top
      } else {
        // 如果功能按钮不存在，使用默认计算
        const cardGapPx = 16 // 默认 1rem = 16px
        const functionAreaHeight = 44
        functionAreaTop = window.innerHeight - functionAreaHeight - cardGapPx
      }

      // 计算内容区域可用的最大高度
      // 内容区域的下边缘（包括下 padding）应该接近功能按钮顶部，只保留很小间距（4px）
      // 所以：cardTop + maxHeight <= functionAreaTop - 4
      // 即：maxHeight <= functionAreaTop - cardTop - 4
      // 但内容区域有上 padding（24px），所以实际可用内容高度 = maxHeight - 24 - 24
      const availableHeight = functionAreaTop - cardTop - 4
      const maxHeight = Math.max(200, availableHeight) // 最小 200px

      setContentMaxHeight(maxHeight)
    }

    // 初始计算
    calculateContentMaxHeight()

    // 监听窗口大小变化和滚动
    window.addEventListener('resize', calculateContentMaxHeight)
    window.addEventListener('scroll', calculateContentMaxHeight)

    // 使用 MutationObserver 监听功能按钮区域的变化
    const observer = new MutationObserver(calculateContentMaxHeight)
    const functionArea = document.querySelector('#sidebar-function-area')
    if (functionArea) {
      observer.observe(functionArea, {
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
  }, [isCollapsed])

  // 计算目录的最大高度（基于卡片下边缘）
  useEffect(() => {
    if (!post?.toc || !cardRef.current || !contentRef.current || !catalogSectionRef.current) {
      return
    }

    const calculateMaxHeight = () => {
      const card = cardRef.current
      const content = contentRef.current
      const catalogSection = catalogSectionRef.current

      if (!card || !content || !catalogSection) return

      // 获取卡片的高度和位置
      const cardRect = card.getBoundingClientRect()
      const cardHeight = cardRect.height

      // 获取内容容器的 padding（上下各 24px，即 p-6）
      const paddingTop = 24
      const paddingBottom = 24

      // 获取目录下方所有内容的高度
      let otherContentHeight = 0
      const catalogSectionRect = catalogSection.getBoundingClientRect()
      const catalogSectionBottom = catalogSectionRect.bottom

      // 遍历目录下方的所有兄弟元素
      let nextSibling = catalogSection.nextElementSibling
      while (nextSibling) {
        const rect = nextSibling.getBoundingClientRect()
        otherContentHeight += rect.height
        // space-y-6 是 24px 的间距
        if (nextSibling.nextElementSibling) {
          otherContentHeight += 24
        }
        nextSibling = nextSibling.nextElementSibling
      }

      // 计算目录可用的最大高度
      // 卡片高度 - 上下padding - 目录下方内容高度 - 目录标题高度（约40px）- 一些余量
      const availableHeight = cardHeight - paddingTop - paddingBottom - otherContentHeight - 40 - 10
      
      // 在单功能模式下，移除最大高度限制，允许显示更长
      const isFocusedMode = focusedSection === 'catalog'
      const maxHeight = isFocusedMode 
        ? Math.max(200, availableHeight) // 单功能模式：只设置最小值，不限制最大值
        : Math.max(200, Math.min(availableHeight, 600)) // 正常模式：最小200px，最大600px

      setCatalogMaxHeight(maxHeight)
    }

    // 初始计算
    calculateMaxHeight()

    // 监听窗口大小变化
    window.addEventListener('resize', calculateMaxHeight)

    // 使用 MutationObserver 监听内容变化
    const observer = new MutationObserver(calculateMaxHeight)
    if (contentRef.current) {
      observer.observe(contentRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
    }

    // 延迟计算，等待内容渲染完成
    const timer = setTimeout(calculateMaxHeight, 100)
    const timer2 = setTimeout(calculateMaxHeight, 500)

    return () => {
      window.removeEventListener('resize', calculateMaxHeight)
      observer.disconnect()
      clearTimeout(timer)
      clearTimeout(timer2)
    }
  }, [post?.toc, tagOptions, categoryOptions, router.asPath, focusedSection])

  // 处理功能标题点击
  const handleSectionTitleClick = (sectionName) => {
    setFocusedSection(sectionName)
  }

  // 返回正常视图
  const handleBackToNormal = () => {
    setFocusedSection(null)
  }

  // 获取功能标题信息
  const getSectionInfo = (sectionName) => {
    const sectionMap = {
      catalog: {
        icon: 'fas fa-list',
        title: locale.COMMON.TABLE_OF_CONTENTS || '目录'
      },
      tags: {
        icon: 'fas fa-tags',
        title: locale.COMMON.TAGS
      },
      category: {
        icon: 'fas fa-folder',
        title: locale.COMMON.CATEGORY
      }
    }
    return sectionMap[sectionName] || null
  }

  return (
    <aside
      ref={cardRef}
      id="sidebar-right-card"
      className="hidden md:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-300 ease-in-out"
      style={{
        ...rightCardStyle,
        transform: isCollapsed ? 'translateX(100%)' : 'translateX(0)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}>
      {/* 单功能模式下的顶部标题栏 */}
      {focusedSection && getSectionInfo(focusedSection) && (
        <div className='absolute top-0 left-0 right-0 pt-6 px-6 pb-4 bg-white dark:bg-hexo-black-gray rounded-t-lg z-20 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center justify-center relative'>
            <button
              onClick={handleBackToNormal}
              className='absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
              title='返回'>
              <i className='fas fa-arrow-left text-gray-600 dark:text-gray-300' />
            </button>
            <div className='dark:text-gray-300 text-center flex items-center'>
              <i className={`mr-2 ${getSectionInfo(focusedSection).icon}`} />
              <span className='font-medium'>{getSectionInfo(focusedSection).title}</span>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={contentRef} 
        className={`p-6 space-y-6 overflow-y-auto flex flex-col items-center text-center ${focusedSection ? 'pt-20' : ''}`}
        style={contentMaxHeight ? { maxHeight: `${contentMaxHeight}px` } : { maxHeight: 'none' }}>
        {/* 目录 - 仅在文章详情页显示，放在最上方 */}
        {post && post.toc && post.toc.length > 0 && (!focusedSection || focusedSection === 'catalog') && (
          <section 
            ref={catalogSectionRef} 
            className='flex flex-col items-center w-full flex-shrink-0'
            style={{ maxHeight: `${catalogMaxHeight}px` }}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('catalog')}>
                <div className='relative inline-flex group'>
                  <i className='mr-2 fas fa-list' />
                  <span className='font-medium'>{locale.COMMON.TABLE_OF_CONTENTS || '目录'}</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
            <div className={`w-full ${!focusedSection ? 'pb-6 border-b border-gray-200 dark:border-gray-700' : ''}`}>
              <Catalog toc={post.toc} maxHeight={catalogMaxHeight} />
            </div>
          </section>
        )}

        {/* 搜索框 */}
        {!focusedSection && (
          <section className={`flex flex-col items-center w-full ${post && post.toc && post.toc.length > 0 ? 'pt-6' : ''}`}>
            <SearchInput {...otherProps} />
          </section>
        )}

        {/* 标签组 */}
        {router.asPath !== '/tag' && finalTagOptions && finalTagOptions.length > 0 && (!focusedSection || focusedSection === 'tags') && (
          <section className={`flex flex-col items-center w-full ${!focusedSection ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('tags')}>
                <div className='relative inline-flex group'>
                  <i className='mr-2 fas fa-tags' />
                  <span className='font-medium'>{locale.COMMON.TAGS}</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
            <div className='w-full'>
              <GroupTag tags={finalTagOptions} currentTag={currentTag} />
            </div>
          </section>
        )}

        {/* 分类组 */}
        {router.asPath !== '/category' && categoryOptions && categoryOptions.length > 0 && (!focusedSection || focusedSection === 'category') && (
          <section className={`flex flex-col items-center w-full ${!focusedSection ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('category')}>
                <div className='relative inline-flex group'>
                  <i className='mr-2 fas fa-folder' />
                  <span className='font-medium'>{locale.COMMON.CATEGORY}</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
            <div className='w-full'>
              <GroupCategory
                categories={categoryOptions}
                currentCategory={currentCategory}
              />
            </div>
          </section>
        )}

        {/* 版权信息 */}
        {!focusedSection && (
          <section className={`flex flex-col items-center w-full ${(router.asPath !== '/tag' && finalTagOptions && finalTagOptions.length > 0) || (router.asPath !== '/category' && categoryOptions && categoryOptions.length > 0) ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            <SiteInfo />
          </section>
        )}
      </div>
    </aside>
  )
}

export default RightCard

