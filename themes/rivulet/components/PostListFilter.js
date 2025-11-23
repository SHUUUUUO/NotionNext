import { useState } from 'react'
import { useTagFilter } from '@/themes/rivulet'
import { useGlobal } from '@/lib/global'
import TagItemSelectable from './TagItemSelectable'

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
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}>
                        全部
                      </button>
                      {selectedCategoryList.map(cat => (
                        <button
                          key={cat.name}
                          onClick={(e) => handleCategoryClick(cat.name, e)}
                          className={`text-xs px-2 py-1 rounded transition-colors duration-200 ${
                            selectedCategory === cat.name
                              ? 'bg-gray-600 text-white dark:bg-gray-700 dark:text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}>
                          {cat.name}({cat.count || 0})
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* 未选中的分类 */}
                  {unselectedCategoryList.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                      {unselectedCategoryList.map(cat => (
                        <button
                          key={cat.name}
                          onClick={(e) => handleCategoryClick(cat.name, e)}
                          className='text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'>
                          {cat.name}({cat.count || 0})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}

          {/* 标签筛选 */}
          {tagOptions && tagOptions.length > 0 && (
            <div>
              <div className='flex items-center justify-between mb-2'>
                <h3 className='text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2'>
                  <i className='fas fa-tag text-xs'></i>
                  {locale.COMMON.TAGS || '标签'}
                </h3>
                {selectedTags && selectedTags.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className='text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline'>
                    清除所有
                  </button>
                )}
              </div>
              <div className='flex flex-wrap gap-2'>
                {tagOptions.map(tag => {
                  const isSelected = selectedTags?.includes(tag.name) || false
                  return (
                    <TagItemSelectable
                      key={tag.name}
                      tag={tag}
                      selected={isSelected}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PostListFilter

