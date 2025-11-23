import { useRouter } from 'next/router'
import { useTagFilter } from '@/themes/rivulet'
import TagItemSelectable from './TagItemSelectable'
import SmartLink from '@/components/SmartLink'

/**
 * 标签组 - 默认显示，支持多选、高亮和跳转
 * @param tags
 * @param currentTag
 * @returns {JSX.Element}
 * @constructor
 */
function GroupTag ({ tags, currentTag }) {
  const router = useRouter()
  const { selectedTags, toggleTag, clearSelectedTags } = useTagFilter()
  
  if (!tags) return <></>

  const displayTags = tags?.slice(0, 20) || []
  
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

  // 处理标签点击 - 支持多选和跳转
  const handleTagClick = (tagName, e) => {
    // 普通点击时，切换多选状态，然后跳转
    // 如果标签已选中，取消选中并阻止跳转
    if (selectedTags?.includes(tagName)) {
      e.preventDefault()
      e.stopPropagation()
      toggleTag(tagName)
      // 如果没有选中的标签了，跳转到首页
      if (selectedTags.length === 1) {
        router.push('/')
      }
      return false
    }
    // 如果标签未选中，切换选中状态，然后跳转（不阻止默认行为）
    toggleTag(tagName)
  }

  // 处理清除所有标签
  const handleClearAll = () => {
    clearSelectedTags()
    // 清除后跳转到首页
    router.push('/')
  }

  return (
    <div className='dark:border-gray-600 w-full flex flex-col items-center'>
      {/* 高亮标签列表 - 单独显示在上方，居中对齐，宽度自适应 */}
      {selectedTagsList.length > 0 && (
        <div 
          id='tags-group-selected' 
          className='inline-flex flex-wrap justify-center items-center gap-1 mb-3 max-w-full'>
          {/* 清除按钮 - 小字样式 */}
          {selectedTags && selectedTags.length > 0 && (
            <button
              onClick={handleClearAll}
              className='text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline cursor-pointer transition-colors duration-200'
              title='清除所有标签'>
              清除
            </button>
          )}
          {
            selectedTagsList.map(tag => {
              const isMultiSelected = selectedTags?.includes(tag.name) || false
              const isSingleSelected = tag.name === currentTag
              const selected = isMultiSelected || isSingleSelected
              
              // 使用 SmartLink 包装，支持跳转，同时支持多选
              return (
                <SmartLink
                  key={tag.name}
                  href={selected && !isMultiSelected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
                  passHref
                  onClick={(e) => handleTagClick(tag.name, e)}
                  className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200
                    py-0.5 px-1 text-xs whitespace-nowrap dark:hover:text-white h-6 flex items-center
                    ${selected
                    ? 'text-white dark:text-white bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
                    : `text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}`}>
                  <div className='font-light dark:text-gray-400 flex items-center'>
                    {selected && <i className='mr-1 fas fa-tag text-[10px]'/>} 
                    {tag.name + (tag.count ? `(${tag.count})` : '')}
                  </div>
                </SmartLink>
              )
            })
          }
        </div>
      )}
      
      {/* 未选中标签列表 - 居中对齐，宽度自适应 */}
      {unselectedTagsList.length > 0 && (
        <div 
          id='tags-group-unselected' 
          className='inline-flex flex-wrap justify-center gap-1 max-w-full'>
          {
            unselectedTagsList.map(tag => {
              return (
                <SmartLink
                  key={tag.name}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  passHref
                  onClick={(e) => handleTagClick(tag.name, e)}
                  className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200
                    py-0.5 px-1 text-xs whitespace-nowrap dark:hover:text-white h-6 flex items-center
                    text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}>
                  <div className='font-light dark:text-gray-400'>
                    {tag.name + (tag.count ? `(${tag.count})` : '')}
                  </div>
                </SmartLink>
              )
            })
          }
        </div>
      )}
    </div>
  )
}

export default GroupTag
