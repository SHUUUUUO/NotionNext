import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className, maxHeight = '8rem', showTitleOnly = false }) => {
  const { locale } = useGlobal()
  const [isHovered, setIsHovered] = useState(false)

  // 删除导致底部间距过大的特定 Notion 块
  useEffect(() => {
    if (showTitleOnly || !post?.blockMap) return

    const removeProblematicBlock = () => {
      const targetBlock = document.querySelector('#notion-article > main > div.notion-text.notion-block-871da2f901bb41cb8a2080b354987aad')
      if (targetBlock) {
        targetBlock.remove()
      }
    }

    // 延迟执行，等待 NotionPage 内容渲染完成
    const timer = setTimeout(() => {
      removeProblematicBlock()
    }, 500)

    // 使用 MutationObserver 监听 DOM 变化，确保及时删除
    const observer = new MutationObserver(() => {
      removeProblematicBlock()
    })

    // 监听整个文档的变化
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [post, showTitleOnly])
  
  if (post?.blockMap) {
    return <div className={className}>
        <section id='announcement-wrapper' className="dark:text-gray-300 rounded-xl px-2 pt-4 pb-2 text-center">
            <div className='flex justify-center items-center mb-3'><i className='mr-2 fas fa-bullhorn' />{locale.COMMON.ANNOUNCEMENT}</div>
            {post && !showTitleOnly && (
              <div className="relative">
                <div 
                  id="announcement-content" 
                  className={`transition-all duration-300 ${isHovered ? 'overflow-y-auto overflow-x-hidden scrollbar-hide' : 'overflow-hidden'} ${isHovered ? 'ring-1 ring-gray-200 dark:ring-gray-700 rounded-md' : ''}`}
                  style={{ maxHeight }}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className="text-center">
                    <NotionPage post={post} className='text-center' />
                  </div>
                  {!isHovered && (
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-hexo-black-gray to-transparent pointer-events-none z-10"></div>
                  )}
                </div>
                {isHovered && (
                  <div className="absolute bottom-2 right-2 pointer-events-none z-20">
                    <div className="bg-white dark:bg-hexo-black-gray bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 shadow-sm border border-gray-200 dark:border-gray-700">
                      <i className="fas fa-arrows-alt-v text-xs"></i>
                      <span>滚动</span>
                    </div>
                  </div>
                )}
              </div>
            )}
        </section>
    </div>
  } else {
    return <></>
  }
}
export default Announcement
