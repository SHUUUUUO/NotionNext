import { useRouter } from 'next/router'
import { useEffect, useRef, useState, useMemo } from 'react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import Catalog from './Catalog'
import GroupCategory from './GroupCategory'
import GroupTag from './GroupTag'
import SearchInput from './SearchInput'
import TagItemSelectable from './TagItemSelectable'
import { useTagFilter } from '@/themes/rivulet'

/**
 * 文章列表筛选面板组件 - 用于文章列表单功能模式
 * @param {object} props
 * @param {Array} props.categoryOptions - 分类选项
 * @param {string} props.currentCategory - 当前分类
 * @param {Array} props.tagOptions - 标签选项
 * @param {string} props.currentTag - 当前标签
 * @param {string} props.selectedCategory - 选中的分类（受控）
 * @param {function} props.onCategoryChange - 分类变化回调
 * @returns {JSX.Element}
 */
const PostListFilter = ({ categoryOptions = [], currentCategory, tagOptions = [], currentTag, selectedCategory, onCategoryChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { selectedTags, clearSelectedTags } = useTagFilter()
  const { locale } = useGlobal()

  const hasSelectedFilters = selectedTags && selectedTags.length > 0 || selectedCategory !== null

  // 处理分类点击 - 不跳转，只更新筛选状态
  const handleCategoryClick = (categoryName, e) => {
    e.preventDefault()
    e.stopPropagation()
    const newCategory = selectedCategory === categoryName ? null : categoryName
    if (onCategoryChange) {
      onCategoryChange(newCategory)
    }
  }

  // 清除所有筛选
  const handleClearAll = () => {
    clearSelectedTags()
    if (onCategoryChange) {
      onCategoryChange(null)
    }
  }

  return (
    <div className='w-full mb-3 border-b border-gray-200 dark:border-gray-700 pb-3'>
      {/* 展开/收起按钮 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200'>
        <div className='flex items-center gap-2'>
          <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-filter'} text-gray-600 dark:text-gray-300 text-sm`}></i>
          <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>筛选</span>
          {hasSelectedFilters && (
            <span className='bg-gray-600 dark:bg-gray-600 text-white text-xs font-bold rounded-full px-2 py-0.5'>
              {selectedTags.length + (selectedCategory ? 1 : 0)}
            </span>
          )}
        </div>
        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 text-xs transition-transform duration-200`}></i>
      </button>

      {/* 展开的内容区域 */}
      {isExpanded && (
        <div className='mt-3 space-y-4 max-h-[40vh] overflow-y-auto'>
          {/* 分类筛选 */}
          {categoryOptions && categoryOptions.length > 0 && (() => {
            // 将分类分为选中和未选中两组
            const selectedCategoryList = categoryOptions.filter(cat => {
              const isSelected = selectedCategory === cat.name
              return isSelected
            })
            
            const unselectedCategoryList = categoryOptions.filter(cat => {
              return selectedCategory !== cat.name
            })
            
            return (
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                    <i className='fas fa-folder text-xs'></i>
                    {locale.COMMON.CATEGORY || '分类'}
                  </h3>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {/* 选中的分类 - 高亮显示在前面 */}
                  {selectedCategoryList.length > 0 && (
                    <div className='flex flex-wrap gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 w-full'>
                      {/* 全部按钮 */}
                      <button
                        onClick={(e) => handleCategoryClick(null, e)}
                        className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                          selectedCategory === null
                            ? 'bg-gray-600 text-white dark:bg-gray-700 dark:text-white'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-500 hover:text-white dark:hover:bg-gray-600'
                        }`}>
                        <i className="fas fa-list mr-1 text-xs"></i>
                        全部
                      </button>
                      {selectedCategoryList.map(category => {
                        const selected = selectedCategory === category.name
                        return (
                          <button
                            key={category.name}
                            onClick={(e) => handleCategoryClick(category.name, e)}
                            className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                              selected
                                ? 'bg-gray-600 text-white dark:bg-gray-700 dark:text-white'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-500 hover:text-white dark:hover:bg-gray-600'
                            }`}>
                            <i className={`fas ${selected ? 'fa-folder-open' : 'fa-folder'} mr-1 text-xs`}></i>
                            {category.name}
                            {category.count && <span className="ml-1">({category.count})</span>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {/* 未选中的分类 */}
                  {unselectedCategoryList.length > 0 && (
                    <div className='flex flex-wrap gap-2 w-full'>
                      {selectedCategory === null && (
                        <button
                          onClick={(e) => handleCategoryClick(null, e)}
                          className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                            selectedCategory === null
                              ? 'bg-gray-600 text-white dark:bg-gray-700 dark:text-white'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-500 hover:text-white dark:hover:bg-gray-600'
                          }`}>
                          <i className="fas fa-list mr-1 text-xs"></i>
                          全部
                        </button>
                      )}
                      {unselectedCategoryList.map(category => (
                        <button
                          key={category.name}
                          onClick={(e) => handleCategoryClick(category.name, e)}
                          className='text-xs px-2 py-1 rounded transition-colors duration-200 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-500 hover:text-white dark:hover:bg-gray-600'>
                          <i className="fas fa-folder mr-1 text-xs"></i>
                          {category.name}
                          {category.count && <span className="ml-1">({category.count})</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* 标签筛选 */}
          {tagOptions && tagOptions.length > 0 && (() => {
            const displayTags = tagOptions.slice(0, 30) || []
            
            // 将标签分为选中和未选中两组
            const selectedTagsList = displayTags.filter(tag => {
              const isMultiSelected = selectedTags?.includes(tag.name) || false
              const isSingleSelected = tag.name === currentTag
              return isMultiSelected || isSingleSelected
            })
            
            const unselectedTagsList = displayTags.filter(tag => {
              const isMultiSelected = selectedTags?.includes(tag.name) || false
              const isSingleSelected = tag.name === currentTag
              return !isMultiSelected && !isSingleSelected
            })
            
            return (
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                    <i className='fas fa-tags text-xs'></i>
                    {locale.COMMON.TAGS || '标签'}
                  </h3>
                {hasSelectedFilters && (
                  <button
                    onClick={handleClearAll}
                    className='text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 flex items-center gap-1'>
                    <i className='fas fa-times text-xs'></i>
                    清除
                  </button>
                )}
                </div>
                {/* 选中的标签列表 - 高亮显示在前面 */}
                {selectedTagsList.length > 0 && (
                  <div className='flex flex-wrap gap-2 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700'>
                    {selectedTagsList.map(tag => {
                      const isMultiSelected = selectedTags?.includes(tag.name) || false
                      const isSingleSelected = tag.name === currentTag
                      const isSelected = isMultiSelected || isSingleSelected
                      return (
                        <TagItemSelectable
                          key={tag.name}
                          tag={tag}
                          selected={isSelected}
                        />
                      )
                    })}
                  </div>
                )}
                {/* 未选中的标签列表 */}
                {unselectedTagsList.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {unselectedTagsList.map(tag => (
                      <TagItemSelectable
                        key={tag.name}
                        tag={tag}
                        selected={false}
                      />
                    ))}
                  </div>
                )}
                {tagOptions.length > 30 && (
                  <div className='text-xs text-gray-400 dark:text-gray-500 px-2 py-1 mt-2'>
                    共 {tagOptions.length} 个标签
                  </div>
                )}
              </div>
            )
          })()}

          {/* 如果没有分类和标签 */}
          {(!categoryOptions || categoryOptions.length === 0) && (!tagOptions || tagOptions.length === 0) && (
            <div className='text-center text-gray-400 dark:text-gray-500 text-xs py-4'>
              暂无分类和标签
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
  posts,
  onSetFocusedSection,
  isArticlePage,
  ...otherProps
}) => {
  const router = useRouter()
  const { locale } = useGlobal()
  
  // 判断是否为文章页面（如果没有传入 isArticlePage，则根据 post 和路由判断）
  const isArticlePageValue = isArticlePage !== undefined 
    ? isArticlePage 
    : (post && !router.asPath?.match(/^\/(tag|category|archive|search|page)/))
  const cardRef = useRef(null)
  const contentRef = useRef(null)
  const catalogSectionRef = useRef(null)
  const [catalogMaxHeight, setCatalogMaxHeight] = useState(400)
  const [contentMaxHeight, setContentMaxHeight] = useState(null)
  const [focusedSection, setFocusedSection] = useState(null) // 当前聚焦的功能区域：'catalog', 'search', 'tags', 'category', 'archive', 'posts'

  // 直接使用传入的标签选项，不添加测试标签
  const finalTagOptions = tagOptions || []

  // 如果没有传入 posts，尝试从 otherProps 中获取 allPosts 或 allPages 并提取文章
  // 注意：allPages 可能在 processPostData 中被删除，但 allPosts 会被保存
  const { selectedTags, toggleTag } = useTagFilter()
  // 初始化分类筛选状态，与网站当前分类同步
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // 如果当前有分类，初始化为当前分类
    return currentCategory || null
  })
  
  // 记录用户是否手动修改过分类筛选（避免自动同步覆盖用户选择）
  const userModifiedCategoryRef = useRef(false)
  
  // 记录是否已经初始化过筛选状态（避免重复初始化）
  const hasInitializedRef = useRef(false)
  
  // 当进入文章列表单功能模式时，同步筛选状态
  useEffect(() => {
    if (focusedSection === 'posts' && !hasInitializedRef.current) {
      // 同步分类筛选状态
      if (currentCategory && currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory)
      }
      
      // 同步标签筛选状态 - 如果 currentTag 存在且不在选中列表中，则添加
      if (currentTag && !selectedTags?.includes(currentTag)) {
        toggleTag(currentTag)
      }
      
      hasInitializedRef.current = true
    } else if (focusedSection !== 'posts') {
      // 离开文章列表单功能模式时，重置初始化标志和用户修改标志
      hasInitializedRef.current = false
      userModifiedCategoryRef.current = false
    }
  }, [focusedSection, currentCategory, currentTag, selectedCategory, selectedTags, toggleTag])
  
  // 当 currentCategory 变化时，如果用户没有手动修改过，则同步分类筛选状态
  useEffect(() => {
    if (focusedSection === 'posts' && !userModifiedCategoryRef.current) {
      // 只有在用户没有手动修改过的情况下，才自动同步分类筛选状态
      if (currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory || null)
      }
    }
  }, [currentCategory, focusedSection, selectedCategory])
  
  // 同步标签筛选状态 - 当 currentTag 变化且正在文章列表模式时
  useEffect(() => {
    if (focusedSection === 'posts' && currentTag && !selectedTags?.includes(currentTag)) {
      toggleTag(currentTag)
    }
  }, [currentTag, focusedSection, selectedTags, toggleTag])
  
  const finalPosts = useMemo(() => {
    let allPosts = []
    if (posts && posts.length > 0) {
      allPosts = posts
    } else if (otherProps.allPosts && Array.isArray(otherProps.allPosts)) {
      // 优先使用 allPosts（在 processPostData 中保存的）
      allPosts = otherProps.allPosts
    } else if (otherProps.allPages && Array.isArray(otherProps.allPages)) {
      // 如果没有 allPosts，尝试从 allPages 中提取
      allPosts = otherProps.allPages.filter(page => page.type === 'Post' && page.status === 'Published')
    }
    
    // 根据选中的分类过滤文章
    if (selectedCategory && allPosts.length > 0) {
      allPosts = allPosts.filter(post => {
        return post.category === selectedCategory
      })
    }
    
    // 根据选中的标签过滤文章
    if (selectedTags && selectedTags.length > 0 && allPosts.length > 0) {
      allPosts = allPosts.filter(post => {
        // 检查文章是否包含所有选中的标签
        const postTags = post.tagItems?.map(tag => tag.name) || []
        return selectedTags.every(selectedTag => postTags.includes(selectedTag))
      })
    }
    
    return allPosts
  }, [posts, otherProps.allPosts, otherProps.allPages, selectedTags, selectedCategory])
  
  // 计算基于筛选后的文章列表的 prev 和 next，并暴露到全局
  useEffect(() => {
    if (typeof window !== 'undefined' && post && finalPosts && finalPosts.length > 0) {
      const currentIndex = finalPosts.findIndex(p => p.slug === post.slug || p.id === post.id)
      if (currentIndex !== -1) {
        const filteredPrev = currentIndex > 0 
          ? finalPosts[currentIndex - 1] 
          : (finalPosts.length > 1 ? finalPosts[finalPosts.length - 1] : null)
        const filteredNext = currentIndex < finalPosts.length - 1 
          ? finalPosts[currentIndex + 1] 
          : (finalPosts.length > 1 ? finalPosts[0] : null)
        
        // 暴露到全局，供 ArticleDetail 使用
        window.__filteredPrevPost = filteredPrev
        window.__filteredNextPost = filteredNext
        
        // 触发自定义事件，通知 ArticleDetail 更新
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('filteredPostsUpdated'))
        }
      } else {
        // 如果当前文章不在筛选后的列表中，清除筛选后的 prev/next
        window.__filteredPrevPost = null
        window.__filteredNextPost = null
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('filteredPostsUpdated'))
        }
      }
    } else if (typeof window !== 'undefined') {
      // 如果没有文章或筛选后的列表为空，清除筛选后的 prev/next
      window.__filteredPrevPost = null
      window.__filteredNextPost = null
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('filteredPostsUpdated'))
      }
    }
    
    // 清理函数：组件卸载时清除
    return () => {
      if (typeof window !== 'undefined') {
        window.__filteredPrevPost = null
        window.__filteredNextPost = null
      }
    }
  }, [post, finalPosts])
  
  // 处理分类变化
  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName)
    // 标记用户已手动修改分类筛选
    userModifiedCategoryRef.current = true
  }
  
  // 滚动到当前文章并居中显示
  const scrollToCurrentPost = (element) => {
    if (!element || typeof window === 'undefined') return
    
    const container = document.getElementById('posts-list-container')
    if (!container) return
    
    // 使用 requestAnimationFrame 确保 DOM 已更新
    requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      
      // 计算元素相对于容器的位置
      const elementTop = elementRect.top - containerRect.top + container.scrollTop
      const elementHeight = elementRect.height
      const containerHeight = containerRect.height
      
      // 计算居中位置：元素顶部 - (容器高度 - 元素高度) / 2
      const targetScrollTop = elementTop - (containerHeight - elementHeight) / 2
      
      // 确保滚动位置在有效范围内
      const maxScrollTop = container.scrollHeight - containerHeight
      const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop))
      
      // 平滑滚动到目标位置
      container.scrollTo({
        top: finalScrollTop,
        behavior: 'smooth'
      })
    })
  }
  
  // 当文章列表或当前文章变化时，滚动到当前文章
  useEffect(() => {
    if (focusedSection === 'posts' && post && finalPosts && finalPosts.length > 0) {
      // 延迟执行，确保 DOM 已渲染
      const timer = setTimeout(() => {
        const currentPostElement = document.querySelector('[data-is-current="true"]')
        if (currentPostElement) {
          scrollToCurrentPost(currentPostElement)
        }
      }, 200)
      
      return () => clearTimeout(timer)
    }
  }, [focusedSection, post, finalPosts])

  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  const cardBottomGap = '68px' // 卡片下边缘与屏幕下边缘的最小间距
  
  const rightCardStyle = {
    top: cardTop,
    width: cardWidth,
    maxHeight: `calc(100vh - ${cardGapValue} - ${cardBottomGap})`,
    right: cardGapValue,
    display: 'flex',
    flexDirection: 'column'
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
      
      // 获取目录标题的高度（如果存在）
      const catalogTitle = catalogSection.querySelector('div[class*="cursor-pointer"]')
      const catalogTitleHeight = catalogTitle ? catalogTitle.getBoundingClientRect().height + 12 : 0 // 12px 是 mb-3 的间距

      // 遍历目录下方的所有兄弟元素
      let nextSibling = catalogSection.nextElementSibling
      while (nextSibling) {
        const rect = nextSibling.getBoundingClientRect()
        otherContentHeight += rect.height
        // space-y-3 是 12px 的间距，但如果有 border-t，则间距可能不同
        // 检查是否有 border-t，如果有则间距是 12px（pt-3），否则是 0
        const hasBorderTop = nextSibling.classList.contains('border-t')
        if (nextSibling.nextElementSibling) {
          otherContentHeight += (hasBorderTop ? 12 : 0)
        }
        nextSibling = nextSibling.nextElementSibling
      }

      // 计算目录可用的最大高度
      // 卡片高度 - 上下padding - 目录标题高度 - 目录下方内容高度 - 一些余量（10px）
      const availableHeight = cardHeight - paddingTop - paddingBottom - catalogTitleHeight - otherContentHeight - 10
      
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
    // 如果提供了外部回调，也调用它
    if (onSetFocusedSection) {
      onSetFocusedSection(sectionName)
    }
  }

  // 返回正常视图
  const handleBackToNormal = () => {
    setFocusedSection(null)
    // 如果提供了外部回调，也调用它
    if (onSetFocusedSection) {
      onSetFocusedSection(null)
    }
  }

  // 监听文章页面状态变化，离开文章页面时自动退出文章列表单功能模式
  useEffect(() => {
    // 如果当前在文章列表单功能模式，但离开了文章页面，则自动退出
    if (focusedSection === 'posts' && !isArticlePageValue) {
      setFocusedSection(null)
      if (onSetFocusedSection) {
        onSetFocusedSection(null)
      }
    }
  }, [isArticlePageValue, focusedSection, onSetFocusedSection])

  // 监听外部设置的 focusedSection（用于从外部触发）
  useEffect(() => {
    // 创建一个全局函数供外部调用，无论是否有 onSetFocusedSection
    window.__setRightCardFocusedSection = (sectionName) => {
      // 如果尝试设置文章列表，但不在文章页面，则不允许
      if (sectionName === 'posts' && !isArticlePageValue) {
        return
      }
      setFocusedSection(sectionName)
      // 如果提供了外部回调，也调用它
      if (onSetFocusedSection) {
        onSetFocusedSection(sectionName)
      }
    }
    return () => {
      delete window.__setRightCardFocusedSection
    }
  }, [onSetFocusedSection, isArticlePageValue])

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
      },
      posts: {
        icon: 'fas fa-list-ul',
        title: '文章列表'
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
              className='absolute left-0 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center'
              title='返回'>
              <i className='fas fa-arrow-left text-gray-600 dark:text-gray-300' />
            </button>
            <div className='dark:text-gray-300 text-center flex items-center'>
              <i className={`mr-2 ${getSectionInfo(focusedSection).icon} flex items-center`} />
              <span className='font-medium flex items-center'>{getSectionInfo(focusedSection).title}</span>
            </div>
          </div>
        </div>
      )}

      <div 
        ref={contentRef} 
        className={`p-6 flex flex-col items-center text-center ${focusedSection ? 'pt-20 flex-1 min-h-0' : 'space-y-3 overflow-y-auto'}`}
        style={focusedSection ? { 
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        } : (contentMaxHeight ? { maxHeight: `${contentMaxHeight}px` } : { maxHeight: 'none' })}>
        {/* 目录 - 仅在文章详情页显示，放在最上方 */}
        {post && post.toc && post.toc.length > 0 && (!focusedSection || focusedSection === 'catalog') && (
          <section 
            ref={catalogSectionRef} 
            className='flex flex-col items-center w-full flex-shrink-0'
            style={{ 
              maxHeight: `${catalogMaxHeight}px`,
              overflow: 'hidden'
            }}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer flex-shrink-0'
                onClick={() => handleSectionTitleClick('catalog')}>
                <div className='relative inline-flex items-center group'>
                  <i className='mr-2 fas fa-list flex items-center' />
                  <span className='font-medium flex items-center'>{locale.COMMON.TABLE_OF_CONTENTS || '目录'}</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
            <div className={`w-full flex-1 min-h-0 overflow-hidden ${!focusedSection ? 'pb-3 border-b border-gray-200 dark:border-gray-700' : ''}`}>
              <Catalog toc={post.toc} maxHeight={catalogMaxHeight} />
            </div>
          </section>
        )}

        {/* 文章列表标题 - 仅在文章页面显示，在搜索框上方 */}
        {isArticlePageValue && finalPosts && finalPosts.length > 0 && (!focusedSection || focusedSection === 'posts') && (
          <section className={`flex flex-col items-center w-full ${post && post.toc && post.toc.length > 0 ? 'pt-3 border-t border-gray-200 dark:border-gray-700' : ''} ${!focusedSection ? 'pb-0' : ''}`}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-1 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('posts')}>
                <div className='relative inline-flex items-center group'>
                  <i className='mr-2 fas fa-list-ul flex items-center' />
                  <span className='font-medium flex items-center'>文章列表</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 搜索框 */}
        {!focusedSection && (
          <section className={`flex flex-col items-center w-full ${
            // 如果有目录但没有文章列表标题，显示上边框
            post && post.toc && post.toc.length > 0 && (!isArticlePageValue || !finalPosts || finalPosts.length === 0) 
              ? 'pt-3 border-t border-gray-200 dark:border-gray-700' 
              // 如果有文章列表标题，不显示上边框和上边距
              : ''
          }`}>
            <SearchInput {...otherProps} />
          </section>
        )}

        {/* 标签组 */}
        {router.asPath !== '/tag' && finalTagOptions && finalTagOptions.length > 0 && (!focusedSection || focusedSection === 'tags') && (
          <section className={`flex flex-col items-center w-full ${!focusedSection ? 'pt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('tags')}>
                <div className='relative inline-flex items-center group'>
                  <i className='mr-2 fas fa-tags flex items-center' />
                  <span className='font-medium flex items-center'>{locale.COMMON.TAGS}</span>
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
          <section className={`flex flex-col items-center w-full ${!focusedSection ? 'pt-3 border-t border-gray-200 dark:border-gray-700' : ''}`}>
            {!focusedSection && (
              <div 
                className='w-full dark:text-gray-300 mb-3 text-center flex justify-center items-center cursor-pointer'
                onClick={() => handleSectionTitleClick('category')}>
                <div className='relative inline-flex items-center group'>
                  <i className='mr-2 fas fa-folder flex items-center' />
                  <span className='font-medium flex items-center'>{locale.COMMON.CATEGORY}</span>
                  <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
                </div>
              </div>
            )}
            <div className='w-full'>
              <GroupCategory
                categories={categoryOptions}
                currentCategory={currentCategory}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          </section>
        )}

        {/* 文章列表 - 仅在单功能模式下显示，且只在文章页面显示 */}
        {focusedSection === 'posts' && isArticlePageValue && (
          <section className='flex flex-col items-center w-full flex-1 min-h-0'>
            {/* 筛选面板 - 可折叠 */}
            <PostListFilter 
              categoryOptions={categoryOptions}
              currentCategory={currentCategory}
              tagOptions={finalTagOptions}
              currentTag={currentTag}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
            
            {/* 文章列表 */}
            <div 
              id='posts-list-container'
              className='w-full space-y-3 overflow-y-auto flex-1 pr-1'
              style={{ 
                paddingBottom: '0',
                paddingRight: '0.25rem'
              }}>
              {finalPosts && finalPosts.length > 0 ? (
                <>
                  {finalPosts.slice(0, 20).map((postItem, index) => {
                    // 判断是否为当前文章
                    const isCurrentPost = post && (
                      postItem.slug === post.slug || 
                      postItem.id === post.id ||
                      (postItem.href && post.href && postItem.href === post.href) ||
                      (router.asPath && postItem.href && router.asPath === postItem.href) ||
                      (router.asPath && !postItem.href && router.asPath === `/${postItem.slug}`)
                    )
                    const postNumber = index + 1 // 序号从1开始
                    
                    return (
                      <div 
                        key={postItem.id || postItem.slug} 
                        className='w-full'
                        data-post-slug={postItem.slug}
                        data-is-current={isCurrentPost}>
                        <SmartLink href={postItem.href || `/${postItem.slug}`} passHref legacyBehavior>
                          <div className={`p-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                            isCurrentPost 
                              ? 'bg-gray-600 dark:bg-gray-600 text-white dark:text-white' 
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}>
                            <div className={`font-medium text-sm line-clamp-2 text-left flex items-center ${
                              isCurrentPost 
                                ? 'text-white dark:text-white' 
                                : 'text-gray-700 dark:text-gray-200'
                            }`}>
                              <span className={`text-xs mr-2 flex-shrink-0 ${
                                isCurrentPost 
                                  ? 'text-gray-300 dark:text-gray-300' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}>
                                {postNumber}.
                              </span>
                              {isCurrentPost && <i className='fas fa-circle text-[6px] mr-2 align-middle'></i>}
                              {postItem.title}
                            </div>
                          </div>
                        </SmartLink>
                      </div>
                    )
                  })}
                  {finalPosts.length > 20 && (
                    <div className='text-center text-sm text-gray-500 dark:text-gray-400 pt-2'>
                      共 {finalPosts.length} 篇文章，显示前 20 篇
                    </div>
                  )}
                </>
              ) : (
                <div className='w-full flex items-center justify-center py-8'>
                  <div className='text-center'>
                    <div className='text-gray-400 dark:text-gray-500 text-sm mb-2'>
                      <i className='fas fa-inbox text-2xl mb-2 block'></i>
                      {selectedTags && selectedTags.length > 0 || selectedCategory ? '没有找到匹配的文章' : '暂无文章'}
                    </div>
                    {(selectedTags && selectedTags.length > 0 || selectedCategory) && (
                      <div className='text-xs text-gray-400 dark:text-gray-500 mt-2'>
                        请尝试调整筛选条件
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </aside>
  )
}

export default RightCard

