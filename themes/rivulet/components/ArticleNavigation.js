import SmartLink from '@/components/SmartLink'

/**
 * 文章导航组件
 * 包含：上一篇、文章列表、下一篇三个按钮
 * @param {object} props
 * @param {object} props.prev - 上一篇文章对象
 * @param {object} props.next - 下一篇文章对象
 * @param {function} props.onPostListClick - 文章列表按钮点击回调
 * @returns {JSX.Element}
 */
const ArticleNavigation = ({ prev, next, onPostListClick }) => {
  // 处理文章列表按钮点击
  const handlePostListClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 先展开右侧卡片（如果折叠的话）
    if (typeof window !== 'undefined' && window.__expandRightCard) {
      window.__expandRightCard()
    }
    
    // 延迟一下，确保卡片展开动画完成后再设置 focusedSection
    setTimeout(() => {
      if (onPostListClick) {
        onPostListClick()
      } else if (typeof window !== 'undefined' && window.__setRightCardFocusedSection) {
        // 如果没有提供回调，尝试使用全局函数
        window.__setRightCardFocusedSection('posts')
      } else {
        // 如果全局函数也不存在，尝试直接查找并操作 DOM
        console.warn('文章列表按钮：全局函数未找到，尝试备用方案')
      }
    }, 150)
  }

  return (
    <section className='article-navigation-container text-gray-800 flex items-stretch justify-between gap-3'>
      {/* 上一篇按钮 */}
      {prev ? (
        <SmartLink
          href={`/${prev.slug}`}
          passHref
          className='article-nav-button text-sm cursor-pointer justify-center items-center flex flex-[5] bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 duration-200 rounded-lg px-3'>
          <i className='mr-1 fas fa-angle-double-left flex-shrink-0' />
          <span className='break-words line-clamp-2 text-center'>{prev.title}</span>
        </SmartLink>
      ) : (
        <div className='article-nav-button text-sm justify-center items-center flex flex-[5] bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-lg px-3 cursor-not-allowed'>
          <i className='mr-1 fas fa-angle-double-left flex-shrink-0' />
          <span>无</span>
        </div>
      )}

      {/* 文章列表按钮 */}
      <button
        onClick={handlePostListClick}
        className='article-nav-button text-sm cursor-pointer justify-center items-center flex flex-[3] bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 duration-200 rounded-lg px-6'>
        <i className='fas fa-list' />
      </button>

      {/* 下一篇按钮 */}
      {next ? (
        <SmartLink
          href={`/${next.slug}`}
          passHref
          className='article-nav-button text-sm cursor-pointer justify-center items-center flex flex-[5] bg-white dark:bg-transparent dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 duration-200 rounded-lg px-3'>
          <span className='break-words line-clamp-2 text-center'>{next.title}</span>
          <i className='ml-1 fas fa-angle-double-right flex-shrink-0' />
        </SmartLink>
      ) : (
        <div className='article-nav-button text-sm justify-center items-center flex flex-[5] bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-lg px-3 cursor-not-allowed'>
          <span>无</span>
          <i className='ml-1 fas fa-angle-double-right flex-shrink-0' />
        </div>
      )}
    </section>
  )
}

export default ArticleNavigation

