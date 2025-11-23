'use client'

import AlgoliaSearchModal from '@/components/AlgoliaSearchModal'
import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { debounce } from 'lodash'
import ArticleDetail from './components/ArticleDetail'
import ArticleLock from './components/ArticleLock'
import LeftCard from './components/LeftCard'
import RightCard from './components/RightCard'
import FunctionArea from './components/FunctionArea'
import PageNumber from './components/PageNumber'
import ResultHeader from './components/ResultHeader'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import BlogArchiveItem from './components/BlogPostArchive'
import Header from './components/Header'
import TagItemMini from './components/TagItemMini'
import { MenuList } from './components/MenuList'
import CONFIG from './config'
import { Style } from './style'

// 主题全局状态
const ThemeGlobalRivulet = createContext()
export const useRivuletGlobal = () => useContext(ThemeGlobalRivulet)

// 标签过滤的全局状态管理
const TagFilterContext = createContext()
export const useTagFilter = () => useContext(TagFilterContext)

/**
 * 基础布局 采用左右两侧布局，移动端使用顶部导航栏
 * @param children
 * @param layout
 * @param tags
 * @param meta
 * @param post
 * @param currentSearch
 * @param currentCategory
 * @param currentTag
 * @param categories
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, headerSlot } = props
  // Live2D 组件已移除
  const leftAreaSlot = null
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  const router = useRouter()
  
  // 标签多选状态管理
  // 初始状态设为空数组，避免服务器端和客户端渲染不一致
  const [selectedTags, setSelectedTags] = useState([])
  const [isClient, setIsClient] = useState(false)
  
  // 客户端挂载后从 localStorage 读取保存的标签
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rivulet-selected-tags')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) {
            setSelectedTags(parsed)
          }
        } catch (e) {
          console.error('Failed to parse saved tags:', e)
        }
      }
    }
  }, [])
  
  // 保存选中的标签到 localStorage
  useEffect(() => {
    if (isBrowser && isClient) {
      localStorage.setItem('rivulet-selected-tags', JSON.stringify(selectedTags))
    }
  }, [selectedTags, isClient])
  
  // 切换标签选中状态 - 使用 useCallback 优化
  const toggleTag = useCallback((tagName) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName)
      } else {
        return [...prev, tagName]
      }
    })
  }, [])
  
  // 清除所有选中的标签 - 使用 useCallback 优化
  const clearSelectedTags = useCallback(() => {
    setSelectedTags([])
  }, [])
  
  // 侧边栏折叠状态管理
  const RIVULET_SIDEBAR_COLLAPSE_SATUS_DEFAULT =
    fullWidth ||
    siteConfig('RIVULET_SIDEBAR_COLLAPSE_SATUS_DEFAULT', null, CONFIG)

  const RIVULET_SIDEBAR_COLLAPSE_ON_SCROLL = siteConfig(
    'RIVULET_SIDEBAR_COLLAPSE_ON_SCROLL',
    false,
    CONFIG
  )

  const RIVULET_SIDEBAR_COLLAPSE_BUTTON = siteConfig(
    'RIVULET_SIDEBAR_COLLAPSE_BUTTON',
    null,
    CONFIG
  )

  // 侧边栏折叠从本地存储中获取 open 状态的初始值
  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('rivulet-sidebar-collapse') === 'true' ||
        RIVULET_SIDEBAR_COLLAPSE_SATUS_DEFAULT
      )
    }
    return RIVULET_SIDEBAR_COLLAPSE_SATUS_DEFAULT
  })

  // 在组件卸载时保存 open 状态到本地存储中
  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('rivulet-sidebar-collapse', isCollapsed)
    }
  }, [isCollapsed])

  // 判断是否为文章页面
  const isArticlePage = props.post && !router.asPath?.match(/^\/(tag|category|archive|search|page)/)
  
  // 判断是否为瀑布流页面（有 grid-container 的页面）
  const [isWaterfallPage, setIsWaterfallPage] = useState(false)
  
  // 在客户端检测是否为瀑布流页面
  useEffect(() => {
    if (!isBrowser) return
    
    const checkWaterfallPage = () => {
      const hasGridContainer = document.querySelector('.grid-container') !== null
      setIsWaterfallPage(hasGridContainer)
    }
    
    // 初始检测
    checkWaterfallPage()
    
    // 监听路由变化
    const handleRouteChange = () => {
      // 延迟检测，确保 DOM 已更新
      setTimeout(checkWaterfallPage, 100)
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.asPath, router.events])

  // 满屏阅读状态管理（允许在所有页面使用）
  const [isFullScreenReading, setIsFullScreenReading] = useState(() => {
    if (typeof window !== 'undefined') {
      // 文章页面从本地存储读取
      if (isArticlePage) {
        return localStorage.getItem('rivulet-fullscreen-reading') === 'true'
      }
      // 瀑布流页面默认不进入全屏，但可以通过收起卡片触发
      return false
    }
    return false
  })

  // 保存满屏阅读状态到本地存储（仅在文章页面）
  useEffect(() => {
    if (isBrowser && isArticlePage) {
      localStorage.setItem('rivulet-fullscreen-reading', isFullScreenReading)
    }
  }, [isFullScreenReading, isArticlePage])
  
  // 在瀑布流页面，当卡片收起时自动进入全屏模式
  useEffect(() => {
    if (!isBrowser || !isWaterfallPage || isArticlePage) {
      return
    }
    
    // 如果卡片收起，自动进入全屏模式
    if (isCollapsed && !isFullScreenReading) {
      setIsFullScreenReading(true)
    }
    // 如果卡片展开，自动退出全屏模式
    else if (!isCollapsed && isFullScreenReading) {
      setIsFullScreenReading(false)
    }
  }, [isCollapsed, isWaterfallPage, isArticlePage, isFullScreenReading])

  // 折叠侧边栏 - 使用 useCallback 优化
  const toggleOpen = useCallback(() => {
    // 在瀑布流页面的全屏模式下，展开卡片时自动退出全屏模式
    if (isFullScreenReading && isCollapsed && isWaterfallPage && !isArticlePage) {
      // 先退出全屏模式
      setIsFullScreenReading(false)
      // 然后展开卡片
      requestAnimationFrame(() => {
        setIsCollapse(false)
      })
      return
    }
    // 在文章页面的满屏阅读模式下，阻止呼出卡片
    if (isFullScreenReading && isCollapsed && isArticlePage) {
      return
    }
    setIsCollapse(!isCollapsed)
  }, [isFullScreenReading, isCollapsed, isWaterfallPage, isArticlePage])

  // 展开侧边栏（用于外部调用）- 使用 useCallback 优化
  const expandSidebar = useCallback(() => {
    if (!isFullScreenReading && isCollapsed) {
      setIsCollapse(false)
    }
  }, [isFullScreenReading, isCollapsed])

  // 切换满屏阅读模式（允许在所有页面使用）- 使用 useCallback 优化
  const toggleFullScreenReading = useCallback(() => {
    const willEnterFullScreen = !isFullScreenReading
    // 进入满屏阅读模式时先收起侧边栏，再设置全屏状态
    if (willEnterFullScreen) {
      setIsCollapse(true)
      // 使用 requestAnimationFrame 确保折叠状态先更新
      requestAnimationFrame(() => {
        setIsFullScreenReading(true)
      })
    } else {
      // 退出满屏阅读模式时先设置状态，再呼出侧边卡片
      setIsFullScreenReading(false)
      // 先移除 fullscreen-reading-mode 类，然后延迟呼出卡片，确保动画流畅
      // 使用双重 requestAnimationFrame 确保 CSS 类完全移除后再更新状态
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsCollapse(false)
        })
      })
    }
  }, [isFullScreenReading])

  // 将展开函数和全屏切换函数暴露到全局，供 ArticleNavigation 使用
  useEffect(() => {
    if (isBrowser) {
      window.__expandRightCard = expandSidebar
      window.__toggleFullScreenReading = toggleFullScreenReading
      window.__isFullScreenReading = isFullScreenReading // 暴露全屏状态，方便检测
      return () => {
        delete window.__expandRightCard
        delete window.__toggleFullScreenReading
        delete window.__isFullScreenReading
      }
    }
  }, [isCollapsed, isFullScreenReading, toggleFullScreenReading])


  // 自动折叠侧边栏 onResize 窗口宽度小于1366 || 滚动条滚动至页面的300px时 ; 将open设置为false
  useEffect(() => {
    if (!RIVULET_SIDEBAR_COLLAPSE_ON_SCROLL || isFullScreenReading) {
      return
    }
    const handleResize = debounce(() => {
      if (window.innerWidth < 1366 || window.scrollY >= 1366) {
        setIsCollapse(true)
      } else {
        setIsCollapse(false)
      }
    }, 100)

    if (props.post) {
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize, { passive: true })
    }

    return () => {
      if (props.post) {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize, { passive: true })
      }
    }
  }, [props.post, isFullScreenReading])

  // 页面切换时保持滚动条可见
  useEffect(() => {
    if (!isBrowser) return

    let savedPageHeight = 0
    let minHeightTimer = null

    const handleRouteChangeStart = () => {
      // 保存当前页面高度
      savedPageHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )

      // 设置 body 的最小高度，保持滚动条可见
      if (savedPageHeight > window.innerHeight) {
        document.body.style.minHeight = `${savedPageHeight}px`
        document.documentElement.style.minHeight = `${savedPageHeight}px`
      }
    }

    const handleRouteChangeComplete = () => {
      // 清除之前的定时器
      if (minHeightTimer) {
        clearTimeout(minHeightTimer)
      }

      // 等待新页面内容加载和渲染
      minHeightTimer = setTimeout(() => {
        const newPageHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        )

        // 如果新页面高度足够，移除最小高度限制
        if (newPageHeight >= savedPageHeight) {
          document.body.style.minHeight = ''
          document.documentElement.style.minHeight = ''
        } else {
          // 新页面高度不够，保持最小高度，等待内容加载
          // 再次检查，确保内容加载完成
          minHeightTimer = setTimeout(() => {
            const finalPageHeight = Math.max(
              document.body.scrollHeight,
              document.body.offsetHeight,
              document.documentElement.clientHeight,
              document.documentElement.scrollHeight,
              document.documentElement.offsetHeight
            )
            if (finalPageHeight >= savedPageHeight) {
              document.body.style.minHeight = ''
              document.documentElement.style.minHeight = ''
            }
          }, 200)
        }
      }, 100)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
      if (minHeightTimer) {
        clearTimeout(minHeightTimer)
      }
      // 清理样式
      if (isBrowser) {
        document.body.style.minHeight = ''
        document.documentElement.style.minHeight = ''
      }
    }
  }, [router])

  // 当页面加载完成时，移除最小高度限制
  useEffect(() => {
    if (!isBrowser) return
    if (!onLoading) {
      // 页面加载完成，延迟移除最小高度，确保内容已渲染
      const timer = setTimeout(() => {
        document.body.style.minHeight = ''
        document.documentElement.style.minHeight = ''
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [onLoading])
  
  return (
    <ThemeGlobalRivulet.Provider value={{ searchModal }}>
      <TagFilterContext.Provider value={{ selectedTags, toggleTag, clearSelectedTags }}>
        <div
        id='theme-fukasawa'
        className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth ${isFullScreenReading ? 'fullscreen-reading-mode' : ''}`}>
        <Style />
        {/* 页头导航，此主题只在移动端生效 */}
        <Header {...props} />

        <div className='flex'>

          {/* 中间主内容区 */}
          <main
            id='wrapper'
            className='relative flex flex-1 w-full justify-center bg-day dark:bg-night'
            style={{
              paddingBottom: siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'
            }}>
            <div
              id='container-inner'
              className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10`}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-in-out duration-700 transform order-first'
                enterFrom='opacity-0 translate-y-16'
                enterTo='opacity-100'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-16'
                unmount={false}>
                <div> {headerSlot} </div>
                <div> {children} </div>
              </Transition>

              <div className='mt-2'>
                <AdSlot type='native' />
              </div>
            </div>
          </main>

          {/* 左侧卡片 */}
          <LeftCard
            isCollapsed={isCollapsed || isFullScreenReading}
            cardGap={siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'}
            isFullScreenReading={isFullScreenReading}
            {...props}
          />

          {/* 右侧卡片 */}
          <RightCard
            post={props.post}
            notice={props.notice}
            isCollapsed={isCollapsed || isFullScreenReading}
            cardGap={siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'}
            tagOptions={props.tagOptions}
            currentTag={props.currentTag}
            categoryOptions={props.categoryOptions}
            currentCategory={props.currentCategory}
            isFullScreenReading={isFullScreenReading}
            posts={props.posts || props.allPosts || []}
            isArticlePage={isArticlePage}
            {...props}
          />

          {/* 功能按键区域 */}
          <FunctionArea
            isCollapsed={isCollapsed}
            toggleOpen={toggleOpen}
            showCollapseButton={RIVULET_SIDEBAR_COLLAPSE_BUTTON}
            isFullScreenReading={isFullScreenReading}
            toggleFullScreenReading={toggleFullScreenReading}
            isArticlePage={isArticlePage}
            isWaterfallPage={isWaterfallPage}
          />
        </div>

        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
      </TagFilterContext.Provider>
    </ThemeGlobalRivulet.Provider>
  )
}

/**
 * 首页
 * @param {*} props notion数据
 * @returns 首页就是一个博客列表
 */
const LayoutIndex = props => {
  return <LayoutPostList {...props} />
}

/**
 * 博客列表
 * @param {*} props
 */
const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  const cardGap = siteConfig('CARD_GAP', null, CONFIG) || '0.75rem'
  const { currentTag, currentCategory, category, posts } = props
  const router = useRouter()
  
  // 从多个来源获取分类名称：优先使用 currentCategory，其次使用 category prop，最后从路由中获取
  const actualCategory = currentCategory || category || router.query?.category || 
    (router.asPath?.match(/\/category\/([^\/]+)/)?.[1])
  
  // 瀑布流顶部间距 - 只包含间隙，与卡片顶部平齐
  // 注意：单独页面（文章、归档、分类、标签）使用 10px，瀑布流列表使用 cardGap
  const topMargin = cardGap // 等于 1rem (16px)，不含顶栏高度
  
  // 修改 #container-inner 的上边缘间距，使其与左右卡片顶部对齐
  // 注意：这个只对瀑布流列表页面生效，单独页面由 CSS 控制
  useEffect(() => {
    if (isBrowser) {
      const containerInner = document.querySelector('#container-inner')
      // 检查是否是单独页面（文章、归档、分类、标签）
      const isSinglePage = containerInner?.querySelector('#container') || 
                          containerInner?.querySelector('#category-list') ||
                          containerInner?.querySelector('#tags-list') ||
                          containerInner?.querySelector('[id^="20"]')
      
      if (containerInner && !isSinglePage) {
        // 只有瀑布流列表页面才设置 topMargin
        containerInner.style.paddingTop = topMargin
      }
      // 清理函数：组件卸载时恢复
      return () => {
        if (containerInner) {
          containerInner.style.paddingTop = ''
        }
      }
    }
  }, [topMargin])
  
  // 判断是否显示结果提示（标签或分类页面，或多标签筛选，或分类筛选）
  const { selectedTags } = useTagFilter()
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  // 从全局获取选中的分类
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkSelectedCategory = () => {
        if (window.__selectedCategory !== undefined) {
          setSelectedCategory(window.__selectedCategory)
        }
      }
      
      // 初始检查
      checkSelectedCategory()
      
      // 监听自定义事件
      const handleCategoryUpdate = () => {
        checkSelectedCategory()
      }
      window.addEventListener('selectedCategoryUpdated', handleCategoryUpdate)
      
      return () => {
        window.removeEventListener('selectedCategoryUpdated', handleCategoryUpdate)
      }
    }
  }, [])
  
  const showResultHeader = currentTag || actualCategory || (selectedTags && selectedTags.length > 0) || (selectedCategory && selectedCategory !== null)
  
  // 计算过滤后的文章数量（用于显示在 ResultHeader 中）
  const filteredCount = useMemo(() => {
    if (!posts) return 0
    
    let filtered = posts
    
    // 根据选中的分类过滤
    if (selectedCategory && selectedCategory !== null) {
      filtered = filtered.filter(post => post.category === selectedCategory)
    }
    
    // 根据选中的标签过滤
    if (selectedTags && selectedTags.length > 0) {
      filtered = filtered.filter(post => {
        const postTags = post.tagItems?.map(tag => tag.name) || []
        return selectedTags.every(selectedTag => postTags.includes(selectedTag))
      })
    }
    
    return filtered.length
  }, [posts, selectedTags, selectedCategory])
  
  const resultCount = showResultHeader && (selectedTags?.length > 0 || selectedCategory) ? filteredCount : (posts?.length || 0)
  
  // 确定 ResultHeader 的类型 - 使用 useMemo 优化
  const resultHeaderType = useMemo(() => {
    const hasCategoryFilter = selectedCategory && selectedCategory !== null
    const hasTagFilter = selectedTags && selectedTags.length > 0
    
    // 复合筛选：分类 + 标签
    if (hasCategoryFilter && hasTagFilter) {
      return 'combined'
    }
    
    // 只有标签筛选
    if (hasTagFilter) {
      return 'tags'
    }
    
    // 只有分类筛选
    if (hasCategoryFilter) {
      return 'category'
    }
    
    // 默认：标签或分类详情页
    return currentTag ? 'tag' : 'category'
  }, [selectedCategory, selectedTags, currentTag])
  
  // 判断是否是分类/标签详情页（需要圆角容器）
  const isCategoryOrTagDetailPage = currentTag || actualCategory

  return (
    <div className={isCategoryOrTagDetailPage ? 'bg-white dark:bg-hexo-black-gray rounded-lg overflow-hidden p-6' : ''}>
      {/* WWAds 放在顶部 */}
      <div className='w-full mb-0'>
        <WWAds className='w-full' orientation='horizontal' />
      </div>
      
      {/* 结果提示头部 - 标签或分类页面，或多标签筛选，或分类筛选，或复合筛选 */}
      {showResultHeader && (
        <ResultHeader 
          type={resultHeaderType} 
          name={currentTag || actualCategory || selectedCategory} 
          count={resultCount} 
        />
      )}
      
      {/* 瀑布流内容 */}
      { POST_LIST_STYLE=== 'page' ? (
        <BlogListPage {...props} />
      ) : (
        <BlogListScroll {...props} />
      )}
      
      {/* 页码组件 - 只在瀑布流页面显示 */}
      <PageNumber />
    </div>
  )
}

/**
 * 文章详情
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // 404
    if (!post) {
      setTimeout(
        () => {
          if (isBrowser) {
            const article = document.querySelector('#article-wrapper #notion-article')
            if (!article) {
              router.push('/404').then(() => {
                console.warn('找不到页面', router.asPath)
              })
            }
          }
        },
        waiting404
      )
    }
  }, [post])
  return (
    <>
      {lock ? (
        <ArticleLock validPassword={validPassword} />
      ) : post && (
        <ArticleDetail {...props} />
      )}
    </>
  )
}

/**
 * 搜索页
 */
const LayoutSearch = props => {
  const { keyword, posts } = props
  const router = useRouter()
  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: {
          element: 'span',
          className: 'text-red-500 border-b border-dashed'
        }
      })
    }
  }, [router])
  return (
    <div className='bg-white dark:bg-hexo-black-gray rounded-lg overflow-hidden p-6'>
      <ResultHeader 
        type="search" 
        keyword={keyword} 
        count={posts?.length || 0} 
      />
      <LayoutPostList {...props} />
    </div>
  )
}

/**
 * 归档页面
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <>
      <div className='mb-10 pb-20 bg-white dark:bg-hexo-black-gray md:p-12 p-3 min-h-full rounded-lg overflow-hidden'>
        {Object.keys(archivePosts).map(archiveTitle => (
          <BlogArchiveItem
            key={archiveTitle}
            posts={archivePosts[archiveTitle]}
            archiveTitle={archiveTitle}
          />
        ))}
      </div>
    </>
  )
}

/**
 * 404
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const router = useRouter()
  const { locale } = useGlobal()
  useEffect(() => {
    // 延时3秒如果加载失败就返回首页
    setTimeout(() => {
      const article = isBrowser && document.getElementById('article-wrapper')
      if (!article) {
        router.push('/').then(() => {
          // console.log('找不到页面', router.asPath)
        })
      }
    }, 3000)
  }, [])

  return <>
        <div className='md:-mt-20 text-black w-full h-screen text-center justify-center content-center items-center flex flex-col'>
            <div className='dark:text-gray-200'>
                <h2 className='inline-block border-r-2 border-gray-600 mr-2 px-3 py-2 align-top'><i className='mr-2 fas fa-spinner animate-spin' />404</h2>
                <div className='inline-block text-left h-32 leading-10 items-center'>
                    <h2 className='m-0 p-0'>{locale.NAV.PAGE_NOT_FOUND_REDIRECT}</h2>
                </div>
            </div>
        </div>
    </>
}

/**
 * 分类列表
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { locale } = useGlobal()
  const { categoryOptions } = props
  return (
    <>
      <div className='bg-white dark:bg-hexo-black-gray px-10 py-10 rounded-lg overflow-hidden'>
        <div className='dark:text-gray-200 mb-5'>
          <i className='mr-4 fas fa-th' />
          {locale.COMMON.CATEGORY}:
        </div>
        <div id='category-list' className='duration-200 flex flex-wrap'>
          {categoryOptions?.map(category => {
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                legacyBehavior>
                <div
                  className={
                    'hover:text-black dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'
                  }>
                  <i className='mr-4 fas fa-folder' />
                  {category.name}({category.count})
                </div>
              </SmartLink>
            )
          })}
        </div>
      </div>
    </>
  )
}

/**
 * 标签列表
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { locale } = useGlobal()
  const { tagOptions } = props
  return (
    <>
      <div className='bg-white dark:bg-hexo-black-gray px-10 py-10 rounded-lg overflow-hidden'>
        <div className='dark:text-gray-200 mb-5'>
          <i className='mr-4 fas fa-tag' />
          {locale.COMMON.TAGS}:
        </div>
        <div id='tags-list' className='duration-200 flex flex-wrap ml-8'>
          {tagOptions.map(tag => {
            return (
              <div key={tag.name} className='p-2'>
                <TagItemMini key={tag.name} tag={tag} />
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
