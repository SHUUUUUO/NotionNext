import { useGlobal } from '@/lib/global'
import { useTagFilter } from '@/themes/rivulet'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

/**
 * 结果提示头部组件
 * 用于显示搜索、标签、分类等页面的结果提示信息
 * @param {object} props
 * @param {string} props.type - 类型：'search' | 'tag' | 'category' | 'tags'
 * @param {string} props.keyword - 搜索关键词（type为'search'时使用）
 * @param {string} props.name - 标签名或分类名（type为'tag'或'category'时使用）
 * @param {number} props.count - 结果数量
 * @param {string} props.className - 自定义样式类名
 * @returns {JSX.Element}
 */
const ResultHeader = ({ type, keyword, name, count, className = '' }) => {
  const { locale } = useGlobal()
  const { selectedTags, clearSelectedTags } = useTagFilter()
  const router = useRouter()
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

  // 清除搜索，清空搜索栏并跳转到首页
  const clearSearch = () => {
    // 清空右侧卡片中的搜索栏
    const searchInput = document.querySelector('#sidebar-right-card input[type="text"]')
    if (searchInput) {
      searchInput.value = ''
    }
    // 清空移动端导航栏中的搜索栏（如果存在）
    const mobileSearchInput = document.querySelector('#top-nav input[type="text"]')
    if (mobileSearchInput) {
      mobileSearchInput.value = ''
    }
    // 跳转到首页
    router.push('/')
  }

  // 返回首页
  const goToHome = () => {
    router.push('/')
  }

  // 清除所有筛选（分类 + 标签）
  const clearAllFilters = () => {
    // 清除所有选中的标签
    clearSelectedTags()
    
    // 清除选中的分类
    if (typeof window !== 'undefined' && window.__clearSelectedCategory) {
      window.__clearSelectedCategory()
    }
    
    // 更新本地状态
    setSelectedCategory(null)
    
    // 跳转到首页
    router.push('/')
  }

  // 根据类型生成提示文本
  const getText = () => {
    const countText = count !== undefined ? count : 0
    
    // 检查是否有复合筛选（分类 + 标签）
    const hasCategoryFilter = selectedCategory && selectedCategory !== null
    const hasTagFilter = selectedTags && selectedTags.length > 0
    
    // 复合筛选：分类 + 标签
    if (hasCategoryFilter && hasTagFilter) {
      const tagsText = selectedTags.join('"、"')
      return `分类"${selectedCategory}"下含有标签"${tagsText}"的内容，共 ${countText} 个结果`
    }
    
    switch (type) {
      case 'search':
        if (keyword) {
          return `包含"${keyword}"有以下 ${countText} 个结果`
        }
        return `${locale.COMMON.RESULT_OF_SEARCH || '搜索结果'}: ${countText}`
      
      case 'tag':
        if (name) {
          return `标签"${name}"有以下 ${countText} 个结果`
        }
        return `${locale.COMMON.TAGS || '标签'}: ${countText}`
      
      case 'tags':
        if (selectedTags && selectedTags.length > 0) {
          const tagsText = selectedTags.join('"、"')
          return `包含标签"${tagsText}"有以下 ${countText} 个结果`
        }
        return `${locale.COMMON.TAGS || '标签'}: ${countText}`
      
      case 'category':
        if (name) {
          return `分类"${name}"有以下 ${countText} 个结果`
        }
        return `${locale.COMMON.CATEGORY || '分类'}: ${countText}`
      
      default:
        return `共有 ${countText} 个结果`
    }
  }

  // 根据类型选择图标
  const getIcon = () => {
    switch (type) {
      case 'search':
        return 'fa-search'
      case 'tag':
        return 'fa-tag'
      case 'category':
        return 'fa-folder'
      default:
        return 'fa-list'
    }
  }

  return (
    <div className={`flex items-center justify-between py-3 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-4 ${className}`}>
      <div className='flex items-center text-gray-600 dark:text-gray-300'>
        <i className={`mr-2 fas ${getIcon()}`} />
        <span className='text-sm font-medium'>{getText()}</span>
      </div>
      {type === 'search' && keyword && (
        <button
          onClick={clearSearch}
          className='ml-4 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline'
          title='清除搜索'>
          清除
        </button>
      )}
      {type === 'tags' && selectedTags && selectedTags.length > 0 && (
        <button
          onClick={clearSelectedTags}
          className='ml-4 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline'
          title='清除所有标签'>
          清除
        </button>
      )}
      {type === 'category' && name && (
        <button
          onClick={goToHome}
          className='ml-4 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline'
          title='返回首页'>
          返回首页
        </button>
      )}
      {type === 'combined' && (
        <button
          onClick={clearAllFilters}
          className='ml-4 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline'
          title='清除所有筛选'>
          清除
        </button>
      )}
    </div>
  )
}

export default ResultHeader

