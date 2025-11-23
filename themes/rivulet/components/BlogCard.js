import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'
import { useTagFilter } from '@/themes/rivulet'
import { useState } from 'react'

/**
 * 文章列表卡片
 * @param {*} param0
 * @returns
 */
const BlogCard = ({ showAnimate, post, showSummary }) => {
  const {siteInfo} = useGlobal()
  const { selectedTags, toggleTag } = useTagFilter()
  const [isHoveringCard, setIsHoveringCard] = useState(false)
  const [isHoveringMeta, setIsHoveringMeta] = useState(false)
  const showPreview =
    siteConfig('RIVULET_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap
  // rivulet 强制显示图片
  if (
    siteConfig('RIVULET_POST_LIST_COVER_FORCE', null, CONFIG) &&
    post &&
    !post.pageCover
  ) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }
  const showPageCover =
    siteConfig('RIVULET_POST_LIST_COVER', null, CONFIG) &&
    post?.pageCoverThumbnail
    
  const RIVULET_POST_LIST_ANIMATION = siteConfig(
    'RIVULET_POST_LIST_ANIMATION',
    null,
    CONFIG
  ) || showAnimate 

  // 动画样式  首屏卡片不用，后面翻出来的加动画
  const aosProps = RIVULET_POST_LIST_ANIMATION
    ? {
        'data-aos': 'fade-up',
        'data-aos-duration': '300',
        'data-aos-once': 'true',
        'data-aos-anchor-placement': 'top-bottom'
      }
    : {}

  // 阻止事件冒泡，用于分类和标签
  const handleCategoryClick = (e) => {
    e.stopPropagation()
  }

  const handleTagClick = (e) => {
    e.stopPropagation()
  }

  // 处理标签点击，切换选中状态
  const handleTagToggle = (tagName, e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleTag(tagName)
  }

  return (
    <article
      {...aosProps}
      style={{ maxHeight: '60rem', filter: isHoveringCard && !isHoveringMeta ? 'brightness(0.9)' : 'none' }}
      className='w-full lg:max-w-sm bg-white dark:bg-hexo-black-gray rounded-lg duration-200 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer'
      onMouseEnter={() => setIsHoveringCard(true)}
      onMouseLeave={() => {
        setIsHoveringCard(false)
        setIsHoveringMeta(false)
      }}>
      <SmartLink href={post?.href} passHref legacyBehavior>
        <div className='flex flex-col justify-between h-full cursor-pointer'>
          {/* 封面图 */}
          {showPageCover && (
            <div className='flex-grow mb-3 w-full duration-200 transform overflow-hidden rounded-t-lg'>
              <LazyImage
                src={post?.pageCoverThumbnail}
                alt={post?.title || siteConfig('TITLE')}
                className='object-cover w-full h-full'
              />
            </div>
          )}

          {/* 文字部分 */}
          <div className='flex flex-col w-full px-3 pb-3'>
            <h2>
              <span className={`break-words font-bold text-xl ${showPreview ? 'justify-center' : 'justify-start'} leading-tight text-gray-700 dark:text-gray-100`}>
                {siteConfig('POST_TITLE_ICON') && (
                  <NotionIcon icon={post.pageIcon} />
                )}{' '}
                {post.title}
              </span>
            </h2>

            {(!showPreview || showSummary) && (
              <main className='my-2 tracking-wide line-clamp-3 text-gray-800 dark:text-gray-300 text-md font-light leading-6'>
                {post.summary}
              </main>
            )}

            {/* 分类标签 */}
            <div 
              className='mt-auto justify-between flex' 
              onClick={(e) => e.stopPropagation()}
              onMouseEnter={() => setIsHoveringMeta(true)}
              onMouseLeave={() => setIsHoveringMeta(false)}>
              {post.category && (
                <SmartLink
                  href={`/category/${post.category}`}
                  passHref
                  onClick={handleCategoryClick}
                  className='cursor-pointer dark:text-gray-300 font-light text-sm hover:underline hover:text-indigo-700 dark:hover:text-indigo-400 transform px-2 py-1 -mx-2 -my-1'>
                  <i className='mr-1 far fa-folder' />
                  {post.category}
                </SmartLink>
              )}
              <div className='md:flex-nowrap flex-wrap md:justify-start inline-flex flex-wrap px-2 py-1 -mx-2 -my-1' onClick={handleTagClick}>
                {post.tagItems?.map(tag => {
                  return (
                    <div
                      key={tag.name}
                      onClick={(e) => handleTagToggle(tag.name, e)}
                      className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200
                        mr-2 py-0.5 px-1 text-xs whitespace-nowrap dark:hover:text-white
                        text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}>
                      <div className='font-light dark:text-gray-400'>
                        {tag.name + (tag.count ? `(${tag.count})` : '')}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </SmartLink>
    </article>
  )
}

export default BlogCard
