import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useState, useEffect, useRef, useMemo } from 'react'
import { isBrowser } from '@/lib/utils'
import { useTagFilter } from '@/themes/rivulet'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'
import CONFIG from '../config'

/**
 * 空白容器组件：高度200px，如果超出同列卡片下边缘则与卡片下边缘平齐
 */
const EmptyPlaceholder = ({ containerId, groupIndex }) => {
  const emptyRef = useRef(null)
  const [height, setHeight] = useState('200px')

  useEffect(() => {
    if (!isBrowser || !emptyRef.current) return

    const updateHeight = () => {
      const emptyElement = emptyRef.current
      if (!emptyElement) return

      const emptyRect = emptyElement.getBoundingClientRect()
      // 找到当前组所在的容器
      const container = emptyElement.closest('.grid-container')
      if (!container) return

      // 找到同一组内同一列中的所有卡片（x坐标相近的元素）
      const allItems = container.querySelectorAll('.grid-item')
      let maxCardBottom = 0 // 同列中卡片的最大下边缘位置

      allItems.forEach(item => {
        if (item === emptyElement || item.contains(emptyElement)) return
        // 跳过空白容器
        if (item.querySelector('[class*="EmptyPlaceholder"]') || item.querySelector('div[style*="minHeight: \'200px\'"]')) return

        const itemRect = item.getBoundingClientRect()
        // 判断是否在同一列（x坐标相近，容差10px）
        if (Math.abs(itemRect.left - emptyRect.left) < 10) {
          // 如果卡片在空白容器上方或同一位置
          if (itemRect.bottom <= emptyRect.top + 5) {
            maxCardBottom = Math.max(maxCardBottom, itemRect.bottom)
          }
        }
      })

      // 空白容器默认高度200px
      const defaultHeight = 200
      const emptyBottom = emptyRect.top + defaultHeight

      // 如果空白容器下边缘超出了卡片下边缘，则与卡片下边缘平齐
      let finalHeight = defaultHeight
      if (maxCardBottom > 0 && emptyBottom > maxCardBottom) {
        finalHeight = maxCardBottom - emptyRect.top
        // 确保高度至少为0
        finalHeight = Math.max(0, finalHeight)
      }

      setHeight(`${finalHeight}px`)
    }

    // 延迟执行，等待布局完成
    const timer = setTimeout(updateHeight, 100)
    // 图片加载完成后重新计算
    const imageTimer = setTimeout(updateHeight, 500)
    
    // 监听窗口大小变化和滚动
    window.addEventListener('resize', updateHeight)
    window.addEventListener('scroll', updateHeight, { passive: true })

    return () => {
      clearTimeout(timer)
      clearTimeout(imageTimer)
      window.removeEventListener('resize', updateHeight)
      window.removeEventListener('scroll', updateHeight)
    }
  }, [containerId, groupIndex])

  return (
    <div
      ref={emptyRef}
      className='w-full'
      style={{ 
        minHeight: '200px',
        height: height,
        transition: 'height 0.3s ease'
      }}
    />
  )
}

/**
 * 计算当前屏幕的列数
 * 考虑左右卡片（各240px）和间距（各16px），总共占用约512px
 * 为了不遮挡内容，需要更大的屏幕宽度才能显示3列
 */
const getColumns = () => {
  if (!isBrowser) return 3
  const width = window.innerWidth
  // 在 1308px 及以上显示3列
  if (width >= 1308) return 3
  // 在 1024px-1307px 之间显示2列
  if (width >= 1024) return 2
  // 在 768px-1023px 之间显示1列（桌面端单列）
  if (width >= 768) return 1
  // 小于768px显示1列（移动端）
  return 1
}

/**
 * 通用的文章排列算法：按照列优先布局，余数文章从左列开始依次分配
 * 示例（3列）：
 * - 6个（排满）：第1列[1,4]，第2列[2,5]，第3列[3,6] → [1,4,2,5,3,6]
 * - 4个（余1）：第1列[1,4]，第2列[2]，第3列[3] → [1,4,2,3]
 * - 5个（余2）：第1列[1,4]，第2列[2,5]，第3列[3] → [1,4,2,5,3]
 * @param {Array} group - 组内所有文章数组（原始顺序）
 * @param {Number} columns - 当前列数
 * @returns {Array} - 重排后的文章数组（列优先顺序）
 */
const arrangePostsInColumns = (group, columns) => {
  if (!group || group.length === 0) return group
  if (columns === 1) return group // 单列不需要重排

  const count = group.length
  const baseRows = Math.floor(count / columns) // 每列的基础行数
  const remainder = count % columns // 余数
  
  // 计算每列的实际行数：余数从左列开始依次分配
  const getColumnRowCount = (colIndex) => {
    return colIndex < remainder ? baseRows + 1 : baseRows
  }
  
  // 计算在列优先布局下，每列的起始索引
  const getColumnStartIndex = (colIndex) => {
    let startIndex = 0
    for (let i = 0; i < colIndex; i++) {
      startIndex += getColumnRowCount(i)
    }
    return startIndex
  }
  
  // 创建重排后的数组
  const reordered = new Array(count).fill(null)
  
  // 按行优先顺序遍历原始数组，计算每个元素在列优先布局下的新位置
  group.forEach((post, originalIndex) => {
    // 计算原始位置的行列坐标（行优先：先填满第一行，再填第二行）
    const row = Math.floor(originalIndex / columns)
    const col = originalIndex % columns
    
    // 计算该列的实际行数
    const columnRowCount = getColumnRowCount(col)
    
    // 如果当前行超出了该列的实际行数，跳过（不应该发生）
    if (row >= columnRowCount) {
      return
    }
    
    // 计算在列优先布局下的目标位置
    const columnStartIndex = getColumnStartIndex(col)
    const targetIndex = columnStartIndex + row
    
    if (targetIndex < count) {
      reordered[targetIndex] = post
    }
  })

  return reordered.filter(Boolean) // 过滤掉 null，确保顺序正确
}

/**
 * 创建空白容器对象
 * @param {string} id - 空白容器ID
 * @returns {Object} - 空白容器对象
 */
const createEmptyContainer = (id) => ({
  id,
  isEmpty: true
})

/**
 * 为文章组生成空白容器并重排
 * @param {Array} actualPosts - 实际文章数组（已过滤空白容器）
 * @param {Number} groupCount - 文章数量
 * @param {Number} remainder - 余数
 * @param {Number} columns - 列数
 * @param {Number} groupIndex - 组索引
 * @returns {Array} - 重排后的文章数组（包含空白容器）
 */
const reorderGroupWithEmptyContainers = (actualPosts, groupCount, remainder, columns, groupIndex) => {
  // 判断是否需要生成空白容器
  const shouldGenerateEmpty = (columns === 3 && remainder !== 0) || groupCount > columns

  if (!shouldGenerateEmpty) {
    // 不满足条件，直接排列，不生成空白容器
    return arrangePostsInColumns(actualPosts, columns)
  }

  // 当余数为1且列数为3，且单组内文章数量大于列数时，使用特殊插入逻辑
  if (remainder === 1 && columns === 3 && groupCount > columns) {
    // 先重排文章（不包含空白容器）
    const reorderedPosts = arrangePostsInColumns(actualPosts, columns)
    
    // 计算 x = Math.floor(n / m)
    const x = Math.floor(groupCount / columns)
    // 在第 2x+1 篇文章后面（索引为 2x）插入一个空白容器
    const insertPosition = 2 * x + 1
    
    // 创建新的数组，在第 insertPosition 个位置后面插入空白容器
    const newArray = []
    reorderedPosts.forEach((post, index) => {
      newArray.push(post)
      if (index === insertPosition - 1) {
        newArray.push(createEmptyContainer(`empty-${groupIndex}-middle`))
      }
    })
    
    // 计算还需要多少个空白容器才能使总数能被列数整除
    const currentCount = newArray.length
    const paddingCount = (Math.ceil(currentCount / columns) * columns) - currentCount
    
    // 在结尾添加空白容器
    for (let i = 0; i < paddingCount; i++) {
      newArray.push(createEmptyContainer(`empty-${groupIndex}-end-${i}`))
    }
    
    return newArray
  }

  // 当余数为2且列数为3，且单组内文章数量大于列数时
  if (remainder === 2 && columns === 3 && groupCount > columns) {
    const postsToArrange = [...actualPosts]
    // 添加1个空白容器，使总数能被列数整除（5个+1个=6个，能被3列整除）
    postsToArrange.push(createEmptyContainer(`empty-${groupIndex}`))
    return arrangePostsInColumns(postsToArrange, columns)
  }

  // 其他情况（满足条件2：文章数量大于列数），先添加空白容器补齐，然后统一排列
  const postsToArrange = [...actualPosts]
  if (remainder !== 0) {
    const paddingCount = columns - remainder
    for (let i = 0; i < paddingCount; i++) {
      postsToArrange.push(createEmptyContainer(`empty-${groupIndex}-${i}`))
    }
  }
  return arrangePostsInColumns(postsToArrange, columns)
}

/**
 * 文章列表（所有文章显示在同一页）
 * @param posts 所有文章
 * @param siteInfo 站点信息
 * @returns {JSX.Element}
 * @constructor
 */
const BlogListPage = ({ posts = [], siteInfo }) => {
  const [columns, setColumns] = useState(getColumns())
  const { selectedTags } = useTagFilter()

  // 每当文章数量发生变化时，清除现有空白容器
  // 使用 useMemo 确保当 posts 变化时自动重新计算并清除空白容器
  const cleanedPosts = useMemo(() => {
    // 清除所有空白容器，确保数据源干净
    let filtered = posts.filter(post => post && !post.isEmpty)
    
    // 根据选中的标签过滤文章
    if (selectedTags && selectedTags.length > 0) {
      filtered = filtered.filter(post => {
        // 检查文章是否包含所有选中的标签
        const postTags = post.tagItems?.map(tag => tag.name) || []
        return selectedTags.every(selectedTag => postTags.includes(selectedTag))
      })
    }
    
    return filtered
  }, [posts, selectedTags])

  // 直接使用清理后的文章，不添加测试文章
  const allPosts = cleanedPosts

  // 根据列数动态调整每组文章数量：单列时每组6张，2列时每组8张，3列时使用配置值
  const defaultPostsPerGroup = siteConfig('RIVULET_POSTS_PER_GROUP', 7, CONFIG)
  const postsPerGroup = columns === 1 ? 6 : (columns === 2 ? 8 : defaultPostsPerGroup)

  // 将文章按指定数量一组进行分组，保持原始顺序
  const postGroups = useMemo(() => {
    if (!allPosts || allPosts.length === 0) return []
    const groups = []
    for (let i = 0; i < allPosts.length; i += postsPerGroup) {
      groups.push(allPosts.slice(i, i + postsPerGroup))
    }
    return groups
  }, [allPosts, postsPerGroup, columns])

  // 监听窗口大小变化，初始化时也设置一次
  useEffect(() => {
    if (!isBrowser) return
    
    // 初始化时设置列数
    setColumns(getColumns())
    
    let resizeTimer = null
    const handleResize = () => {
      // 防抖处理，避免频繁更新
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      resizeTimer = setTimeout(() => {
        setColumns(getColumns())
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
    }
  }, [])

  if (!allPosts || allPosts.length === 0) {
    return <BlogPostListEmpty />
  } else {
    return (
      <div id='posts-wrapper'>
        {/* 文章列表 */}
        {postGroups.map((group, groupIndex) => {
          // 过滤掉空白容器（如果有）
          const actualPosts = group.filter(post => !post || !post.isEmpty)
          const groupCount = actualPosts.length
          const remainder = groupCount % columns
          
          // 使用优化后的函数处理排列和空白容器生成
          const reorderedGroup = reorderGroupWithEmptyContainers(
            actualPosts,
            groupCount,
            remainder,
            columns,
            groupIndex
          )
          
          return (
            <div key={groupIndex}>
              <div className='grid-container' data-group-index={groupIndex}>
                {reorderedGroup.map((item, index) => {
                  // 如果是空白容器
                  if (item && item.isEmpty) {
                    return (
                      <div
                        key={item.id}
                        className='grid-item justify-center flex'
                        style={{ breakInside: 'avoid' }}>
                        {/* 空白容器：高度200px，如果超出同列卡片下边缘则与卡片下边缘平齐 */}
                        <EmptyPlaceholder containerId={`group-${groupIndex}`} groupIndex={groupIndex} />
                      </div>
                    )
                  }
                  
                  // 正常文章卡片
                  return (
                    <div
                      key={item.id}
                      className='grid-item justify-center flex'
                      style={{ breakInside: 'avoid' }}>
                      <BlogCard
                        index={groupIndex * postsPerGroup + group.indexOf(item)}
                        key={item.id}
                        post={item}
                        siteInfo={siteInfo}
                      />
                    </div>
                  )
                })}
              </div>
              
              {groupIndex === 0 && siteConfig('ADSENSE_GOOGLE_ID') && (
                <div className='p-3'>
                  <AdSlot type='flow' />
                </div>
              )}
              
              {/* 分割线 - 最后一组不显示 */}
              {groupIndex < postGroups.length - 1 && (
                <div className='my-8'>
                  {/* 当前页页码（分割线上方） */}
                  <div className='flex justify-center mb-2'>
                    <span className='text-gray-400 dark:text-gray-500 text-sm font-medium'>
                      第 {groupIndex + 1} 页
                    </span>
                  </div>
                  {/* 分割线 */}
                  <div className='flex items-center justify-center'>
                    <div className='flex-grow border-t border-gray-300 dark:border-gray-600'></div>
                    <div className='mx-4 text-gray-400 dark:text-gray-500 text-sm'>
                      <i className='fas fa-ellipsis-h'></i>
                    </div>
                    <div className='flex-grow border-t border-gray-300 dark:border-gray-600'></div>
                  </div>
                  {/* 下一页页码（分割线下方） */}
                  <div className='flex justify-center mt-2'>
                    <span className='text-gray-400 dark:text-gray-500 text-sm font-medium'>
                      第 {groupIndex + 2} 页
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
}

export default BlogListPage
