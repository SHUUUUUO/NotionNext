import { useMemo } from 'react'
import { useTagFilter } from '@/themes/rivulet'

/**
 * 自定义 Hook：根据已选中的标签和分类筛选文章后，计算剩余标签及其数量
 * @param {Array} baseTagOptions - 基础标签选项
 * @param {string} selectedCategory - 选中的分类
 * @param {Array} posts - 文章列表
 * @param {Array} allPosts - 所有文章（备用）
 * @param {Array} allPages - 所有页面（备用）
 * @returns {Array} 筛选后的标签选项
 */
export const useFilteredTags = (baseTagOptions = [], selectedCategory, posts, allPosts, allPages) => {
  const { selectedTags } = useTagFilter()
  
  const filteredTagOptions = useMemo(() => {
    // 如果没有选中任何标签和分类，返回原始标签列表
    if ((!selectedTags || selectedTags.length === 0) && !selectedCategory) {
      return baseTagOptions
    }
    
    // 获取筛选后的文章（基于已选中的标签和分类）
    let filteredPosts = []
    if (posts && posts.length > 0) {
      filteredPosts = posts
    } else if (allPosts && Array.isArray(allPosts)) {
      filteredPosts = allPosts
    } else if (allPages && Array.isArray(allPages)) {
      filteredPosts = allPages.filter(page => page.type === 'Post' && page.status === 'Published')
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
  }, [baseTagOptions, selectedTags, selectedCategory, posts, allPosts, allPages])
  
  return filteredTagOptions
}

