import { useTagFilter } from '@/themes/rivulet'
import TagItemSelectable from './TagItemSelectable'

/**
 * 标签组 - 默认显示，支持多选和高亮
 * @param tags
 * @param currentTag
 * @returns {JSX.Element}
 * @constructor
 */
function GroupTag ({ tags, currentTag }) {
  const { selectedTags } = useTagFilter()
  
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

  return (
    <div className='dark:border-gray-600 w-full flex flex-col items-center'>
      {/* 高亮标签列表 - 单独显示在上方，居中对齐，宽度自适应 */}
      {selectedTagsList.length > 0 && (
        <div 
          id='tags-group-selected' 
          className='inline-flex flex-wrap justify-center gap-1 mb-3 max-w-full'>
          {
            selectedTagsList.map(tag => {
              const isMultiSelected = selectedTags?.includes(tag.name) || false
              const isSingleSelected = tag.name === currentTag
              const selected = isMultiSelected || isSingleSelected
              
              return <TagItemSelectable key={tag.name} tag={tag} selected={selected} />
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
              return <TagItemSelectable key={tag.name} tag={tag} selected={false} />
            })
          }
        </div>
      )}
    </div>
  )
}

export default GroupTag
