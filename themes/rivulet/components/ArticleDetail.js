import Comment from '@/components/Comment'
import { AdSlot } from '@/components/GoogleAdsense'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import ShareButton from './ShareButton'
import ArticleNavigation from './ArticleNavigation'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import TagItemMini from './TagItemMini'
import { useState, useEffect } from 'react'

/**
 *
 * @param {*} param0
 * @returns
 */
export default function ArticleDetail(props) {
  const { post, prev, next } = props
  const { locale } = useGlobal()
  const [filteredPrev, setFilteredPrev] = useState(null)
  const [filteredNext, setFilteredNext] = useState(null)

  // 获取筛选后的 prev 和 next
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkFilteredPosts = () => {
        // 优先使用筛选后的 prev/next，如果不存在则使用原始的
        const hasFiltered = window.__filteredPrevPost !== undefined || window.__filteredNextPost !== undefined
        if (hasFiltered) {
          setFilteredPrev(window.__filteredPrevPost || null)
          setFilteredNext(window.__filteredNextPost || null)
        } else {
          // 如果没有筛选后的，使用原始的
          setFilteredPrev(prev)
          setFilteredNext(next)
        }
      }
      
      // 初始检查
      checkFilteredPosts()
      
      // 使用 requestAnimationFrame 来检查更新（更高效）
      let rafId = null
      const scheduleCheck = () => {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          checkFilteredPosts()
          // 只在组件挂载后的一段时间内检查，避免无限循环
          setTimeout(() => {
            rafId = null
          }, 1000)
        })
      }
      
      // 初始延迟检查（等待 RightCard 渲染）
      const initialTimeout = setTimeout(() => {
        checkFilteredPosts()
      }, 200)
      
      // 监听自定义事件（如果 RightCard 触发的话）
      const handleFilterUpdate = () => {
        checkFilteredPosts()
      }
      window.addEventListener('filteredPostsUpdated', handleFilterUpdate)
      
      return () => {
        clearTimeout(initialTimeout)
        if (rafId) cancelAnimationFrame(rafId)
        window.removeEventListener('filteredPostsUpdated', handleFilterUpdate)
      }
    } else {
      // 服务端渲染时使用原始的
      setFilteredPrev(prev)
      setFilteredNext(next)
    }
  }, [prev, next, post])

  if (!post) {
    return <></>
  }

  // 检查是否配置了任何评论插件（包括 Vercel 环境变量、Notion 配置表）
  // siteConfig 会按优先级读取：1. Notion配置表 2. 环境变量 3. blog.config.js
  // 只有当配置值存在且不为空字符串时才认为已配置
  const checkCommentConfig = (key) => {
    const val = siteConfig(key)
    return val && val !== '' && val !== 'false' && val !== '0'
  }

  const hasCommentPlugin =
    checkCommentConfig('COMMENT_ARTALK_SERVER') ||
    checkCommentConfig('COMMENT_TWIKOO_ENV_ID') ||
    checkCommentConfig('COMMENT_WALINE_SERVER_URL') ||
    checkCommentConfig('COMMENT_VALINE_APP_ID') ||
    checkCommentConfig('COMMENT_GISCUS_REPO') ||
    checkCommentConfig('COMMENT_CUSDIS_APP_ID') ||
    checkCommentConfig('COMMENT_UTTERRANCES_REPO') ||
    checkCommentConfig('COMMENT_GITALK_CLIENT_ID') ||
    checkCommentConfig('COMMENT_WEBMENTION_ENABLE')
  return (
    <div
      id='container'
      className='flex-grow w-full rounded-lg overflow-hidden'>
      {post?.type && !post?.type !== 'Page' && post?.pageCover && (
        <div className='w-full relative md:flex-shrink-0 overflow-hidden rounded-t-lg'>
          <LazyImage
            alt={post.title}
            src={post?.pageCover}
            className='object-cover max-h-[60vh] w-full'
          />
        </div>
      )}

      <article
        itemScope
        itemType='https://schema.org/Movie'
        className={`subpixel-antialiased overflow-y-hidden py-10 px-3 lg:pt-24 md:px-12 dark:border-gray-700 bg-white dark:bg-hexo-black-gray ${
          post?.pageCover ? '' : 'rounded-t-lg'
        } rounded-b-lg`}>
        <header>
          {/* 文章Title */}
          <div className='font-bold text-4xl text-black dark:text-white'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {post.title}
          </div>

          <section className='flex-wrap flex mt-2 text-gray-400 dark:text-gray-400 font-light leading-8'>
            <div>
              {post?.category && (
                <>
                  <SmartLink
                    href={`/category/${post.category}`}
                    passHref
                    className='cursor-pointer text-md mr-2 hover:text-black dark:hover:text-white border-b dark:border-gray-500 border-dashed'>
                    <i className='mr-1 fas fa-folder-open' />
                    {post.category}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                </>
              )}

              {post?.type !== 'Page' && (
                <>
                  <SmartLink
                    href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                    passHref
                    className='pl-1 mr-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 border-b dark:border-gray-500 border-dashed'>
                    {post?.publishDay}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                  <span className='mx-2 text-gray-400 dark:text-gray-500'>
                    {locale.COMMON.LAST_EDITED_TIME}: {post.lastEditedDay}
                  </span>
                </>
              )}

              <div className='my-2'>
                {post.tagItems && (
                  <div className='flex flex-nowrap overflow-x-auto'>
                    {post.tagItems.map(tag => (
                      <TagItemMini key={tag.name} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <WWAds className='w-full' orientation='horizontal' />
        </header>

        {/* Notion文章主体 */}
        <section id='article-wrapper'>
          {post && <NotionPage post={post} />}
        </section>

        <section>
          <AdSlot type='in-article' />
          {/* 分享 - 简化的复制链接按钮 */}
          <ShareButton post={post} />
        </section>
      </article>

      {/* 上一篇、文章列表、下一篇 */}
      {post?.type === 'Post' && (
        <div className='my-3 -mx-3 md:-mx-12 px-3 md:px-12'>
          <ArticleNavigation prev={filteredPrev !== null ? filteredPrev : prev} next={filteredNext !== null ? filteredNext : next} />
        </div>
      )}

      {/* 评论区域 - 临时显示，参考 Cusdis 布局 */}
      {post?.type === 'Post' && (
        <div className='bg-white dark:bg-hexo-black-gray rounded-lg px-3 md:px-12 py-6 mt-3'>
          <Comment frontMatter={post} />
        </div>
      )}
    </div>
  )
}
