import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useGlobal } from '@/lib/global'
import { siteConfig } from '@/lib/config'

/**
 * 简化的分享按钮 - 复制链接
 * @param {object} props
 * @param {object} props.post - 文章对象
 * @returns {JSX.Element}
 */
const ShareButton = ({ post }) => {
  const router = useRouter()
  const { locale } = useGlobal()
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 获取当前页面完整URL
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [router.asPath])

  // 复制链接到剪贴板
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } else {
        // 降级方案：使用传统方法
        fallbackCopyToClipboard(shareUrl)
      }
    } catch (err) {
      console.error('复制失败:', err)
      // 如果复制失败，显示链接让用户手动复制
      showLinkModal()
    }
  }

  // 降级复制方案
  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('降级复制失败:', err)
      showLinkModal()
    }
    document.body.removeChild(textArea)
  }

  // 显示链接弹窗，让用户手动复制
  const showLinkModal = () => {
    const link = prompt(locale.COMMON.URL_COPIED || '请复制以下链接：', shareUrl)
    if (link) {
      // 用户可能已经复制了
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  // 如果配置中禁用了分享栏，或者不是文章类型，则不显示
  if (
    !JSON.parse(siteConfig('POST_SHARE_BAR_ENABLE', 'true')) ||
    !post ||
    post?.type !== 'Post'
  ) {
    return <></>
  }

  return (
    <div className='flex justify-center mt-8 mb-4'>
      <button
        onClick={copyToClipboard}
        onDoubleClick={showLinkModal}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-gray-100 dark:bg-gray-800 
          hover:bg-gray-200 dark:hover:bg-gray-700
          text-gray-700 dark:text-gray-300
          transition-colors duration-200
          ${copied ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}
        `}
        title={copied ? (locale.COMMON.URL_COPIED || '链接已复制') : '点击复制链接（双击显示链接）'}>
        <i className={`fas ${copied ? 'fa-check' : 'fa-link'} text-sm`}></i>
        <span className='text-sm font-medium'>
          {copied ? (locale.COMMON.URL_COPIED || '已复制') : '复制链接'}
        </span>
      </button>
    </div>
  )
}

export default ShareButton

