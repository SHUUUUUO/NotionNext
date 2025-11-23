import { useRouter } from 'next/router'
import SmartLink from '@/components/SmartLink'
import PostListFilter from './PostListFilter'
import { useTagFilter } from '@/themes/rivulet'

/**
 * 文章列表区域组件
 * @param {object} props
 * @param {Array} props.posts - 筛选后的文章列表
 * @param {object} props.currentPost - 当前文章
 * @param {Array} props.categoryOptions - 分类选项
 * @param {string} props.currentCategory - 当前分类
 * @param {Array} props.tagOptions - 标签选项
 * @param {string} props.currentTag - 当前标签
 * @param {string} props.selectedCategory - 选中的分类
 * @param {function} props.onCategoryChange - 分类变化回调
 * @returns {JSX.Element}
 */
const PostListSection = ({
  posts = [],
  currentPost,
  categoryOptions,
  currentCategory,
  tagOptions,
  currentTag,
  selectedCategory,
  onCategoryChange
}) => {
  const router = useRouter()
  const { selectedTags } = useTagFilter()

  return (
    <section className='flex flex-col items-center w-full flex-1 min-h-0'>
      {/* 筛选面板 - 可折叠 */}
      <PostListFilter 
        categoryOptions={categoryOptions}
        currentCategory={currentCategory}
        tagOptions={tagOptions}
        currentTag={currentTag}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />
      
      {/* 文章列表 */}
      <div 
        id='posts-list-container'
        className='w-full space-y-3 overflow-y-auto flex-1 pr-1'
        style={{ 
          paddingBottom: '0',
          paddingRight: '0.25rem'
        }}>
        {posts && posts.length > 0 ? (
          <>
            {posts.slice(0, 20).map((postItem, index) => {
              // 判断是否为当前文章
              // 只在客户端使用 router.asPath，避免服务器端和客户端不一致
              const isCurrentPost = currentPost && (
                postItem.slug === currentPost.slug || 
                postItem.id === currentPost.id ||
                (postItem.href && currentPost.href && postItem.href === currentPost.href) ||
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
            {posts.length > 20 && (
              <div className='text-center text-sm text-gray-500 dark:text-gray-400 pt-2'>
                共 {posts.length} 篇文章，显示前 20 篇
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
  )
}

export default PostListSection

