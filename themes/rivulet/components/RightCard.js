import { useRouter } from 'next/router'
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import Catalog from './Catalog'
import GroupCategory from './GroupCategory'
import GroupTag from './GroupTag'
import SearchInput from './SearchInput'
import PostListFilter from './PostListFilter'
import { useTagFilter } from '@/themes/rivulet'

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
  const baseTagOptions = tagOptions || []

  // 如果没有传入 posts，尝试从 otherProps 中获取 allPosts 或 allPages 并提取文章
  // 注意：allPages 可能在 processPostData 中被删除，但 allPosts 会被保存
  const { selectedTags, toggleTag } = useTagFilter()
  // 初始化分类筛选状态，与网站当前分类同步
  const [selectedCategory, setSelectedCategory] = useState(() => {
    // 如果当前有分类，初始化为当前分类
    return currentCategory || null
  })
  
  // 根据已选中的标签和分类筛选文章后，计算剩余标签及其数量
  const filteredTagOptions = useMemo(() => {
    // 如果没有选中任何标签和分类，返回原始标签列表
    if ((!selectedTags || selectedTags.length === 0) && !selectedCategory) {
      return baseTagOptions
    }
    
    // 获取筛选后的文章（基于已选中的标签和分类）
    let filteredPosts = []
    if (posts && posts.length > 0) {
      filteredPosts = posts
    } else if (otherProps.allPosts && Array.isArray(otherProps.allPosts)) {
      filteredPosts = otherProps.allPosts
    } else if (otherProps.allPages && Array.isArray(otherProps.allPages)) {
      filteredPosts = otherProps.allPages.filter(page => page.type === 'Post' && page.status === 'Published')
    }
    
    // 根据选中的分类过滤文章
    if (selectedCategory && filteredPosts.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        return post.category === selectedCategory
      })
    }
    
    // 根据选中的标签过滤文章
    if (selectedTags && selectedTags.length > 0 && filteredPosts.length > 0) {
      filteredPosts = filteredPosts.filter(post => {
        // 检查文章是否包含所有选中的标签
        const postTags = post.tagItems?.map(tag => tag.name) || []
        return selectedTags.every(selectedTag => postTags.includes(selectedTag))
      })
    }
    
    // 从筛选后的文章中提取所有标签，并计算每个标签的数量
    const tagCountMap = new Map()
    filteredPosts.forEach(post => {
      if (post.tagItems && Array.isArray(post.tagItems)) {
        post.tagItems.forEach(tag => {
          const tagName = tag.name
          const currentCount = tagCountMap.get(tagName) || 0
          tagCountMap.set(tagName, currentCount + 1)
        })
      }
    })
    
    // 创建新的标签列表，包含：
    // 1. 已选中的标签（显示筛选后的数量）
    // 2. 未选中但在筛选后文章中出现的标签
    const filteredTags = baseTagOptions
      .filter(tag => {
        // 如果标签已选中，始终显示
        if (selectedTags && selectedTags.includes(tag.name)) {
          return true
        }
        // 如果标签未选中，只在筛选后文章中出现时才显示
        return tagCountMap.has(tag.name)
      })
      .map(tag => ({
        ...tag,
        count: tagCountMap.get(tag.name) || 0 // 更新为筛选后的数量
      }))
      .sort((a, b) => {
        // 已选中的标签排在前面
        const aSelected = selectedTags && selectedTags.includes(a.name)
        const bSelected = selectedTags && selectedTags.includes(b.name)
        if (aSelected && !bSelected) return -1
        if (!aSelected && bSelected) return 1
        // 然后按数量降序排序
        return b.count - a.count
      })
    
    return filteredTags
  }, [baseTagOptions, selectedTags, selectedCategory, posts, otherProps.allPosts, otherProps.allPages])
  
  // 使用筛选后的标签选项
  const finalTagOptions = filteredTagOptions
  
  // 记录用户是否手动修改过分类筛选（避免自动同步覆盖用户选择）
  const userModifiedCategoryRef = useRef(false)
  
  // 记录是否已经初始化过筛选状态（避免重复初始化）
  const hasInitializedRef = useRef(false)
  
  // 当进入文章列表单功能模式时，同步筛选状态
  useEffect(() => {
    if (focusedSection === 'posts' && !hasInitializedRef.current) {
      // 同步分类筛选状态
      // 重要：如果用户已经手动修改过分类（userModifiedCategoryRef.current === true），不要覆盖用户的选择
      if (!userModifiedCategoryRef.current && currentCategory && currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory)
      }
      
      // 同步标签筛选状态 - 如果 currentTag 存在且不在选中列表中，则添加
      if (currentTag && !selectedTags?.includes(currentTag)) {
        toggleTag(currentTag)
      }
      
      hasInitializedRef.current = true
    } else if (focusedSection !== 'posts') {
      // 离开文章列表单功能模式时，重置初始化标志
      // 注意：不要重置 userModifiedCategoryRef，以保持用户手动选择的分类筛选状态
      hasInitializedRef.current = false
      // 只有当 selectedCategory 为 null 时，才重置 userModifiedCategoryRef
      // 这样可以避免在用户手动选择分类后，切换功能区域导致分类被清除
      if (selectedCategory === null) {
        userModifiedCategoryRef.current = false
      }
    }
  }, [focusedSection, currentCategory, currentTag, selectedCategory, selectedTags, toggleTag])
  
  // 当 currentCategory 变化时，如果用户没有手动修改过，则同步分类筛选状态
  useEffect(() => {
    if (focusedSection === 'posts' && !userModifiedCategoryRef.current) {
      // 只有在用户没有手动修改过的情况下，才自动同步分类筛选状态
      // 重要：如果用户已经手动选择了分类（selectedCategory 不为 null），即使 currentCategory 变成 null（路由变化），也绝对不应该清除分类筛选
      if (currentCategory !== selectedCategory) {
        // 只有当 currentCategory 有值，且 selectedCategory 为 null 时，才同步
        // 这样可以避免在用户手动选择分类后，路由变化导致分类被清除
        // 如果 currentCategory 为 null/undefined，但 selectedCategory 有值（用户手动选择），则不执行任何操作
        if (currentCategory && selectedCategory === null) {
          setSelectedCategory(currentCategory)
        } else if (currentCategory && currentCategory !== selectedCategory) {
          // 如果 currentCategory 有值且与 selectedCategory 不同，且用户没有手动修改过，才同步
          setSelectedCategory(currentCategory)
        }
        // 如果 currentCategory 为 null/undefined，但 selectedCategory 有值，不执行任何操作（保护用户手动选择）
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
  
  // 处理分类变化 - 使用 useCallback 优化
  const handleCategoryChange = useCallback((categoryName) => {
    setSelectedCategory(categoryName)
    // 标记用户已手动修改分类筛选
    // 如果用户明确取消分类选择（传入 null），重置标志，允许后续自动同步
    if (categoryName === null) {
      userModifiedCategoryRef.current = false
    } else {
      userModifiedCategoryRef.current = true
    }
  }, [])
  
  // 将选中的分类暴露到全局，供 BlogListPage 和 BlogListScroll 使用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__selectedCategory = selectedCategory
      // 暴露清除分类的函数
      window.__clearSelectedCategory = () => {
        setSelectedCategory(null)
        userModifiedCategoryRef.current = true
      }
      // 触发自定义事件，通知其他组件更新
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('selectedCategoryUpdated'))
      }
      return () => {
        delete window.__selectedCategory
        delete window.__clearSelectedCategory
      }
    }
  }, [selectedCategory])
  
  // 滚动到当前文章并居中显示 - 使用 useCallback 优化
  const scrollToCurrentPost = useCallback((element) => {
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
  }, [])
  
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
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'
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

  // 处理功能标题点击 - 使用 useCallback 优化
  const handleSectionTitleClick = useCallback((sectionName) => {
    setFocusedSection(sectionName)
    // 如果提供了外部回调，也调用它
    if (onSetFocusedSection) {
      onSetFocusedSection(sectionName)
    }
  }, [onSetFocusedSection])

  // 返回正常视图 - 使用 useCallback 优化
  const handleBackToNormal = useCallback(() => {
    setFocusedSection(null)
    // 如果提供了外部回调，也调用它
    if (onSetFocusedSection) {
      onSetFocusedSection(null)
    }
  }, [onSetFocusedSection])

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

  // 获取功能标题信息 - 使用 useMemo 优化
  const sectionInfoMap = useMemo(() => ({
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
  }), [locale])

  const getSectionInfo = useCallback((sectionName) => {
    return sectionInfoMap[sectionName] || null
  }, [sectionInfoMap])

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
                    // 只在客户端使用 router.asPath，避免服务器端和客户端不一致
                    const isCurrentPost = post && (
                      postItem.slug === post.slug || 
                      postItem.id === post.id ||
                      (postItem.href && post.href && postItem.href === post.href) ||
                      (typeof window !== 'undefined' && router.asPath && postItem.href && router.asPath === postItem.href) ||
                      (typeof window !== 'undefined' && router.asPath && !postItem.href && router.asPath === `/${postItem.slug}`)
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

