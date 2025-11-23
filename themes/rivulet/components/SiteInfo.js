import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import { siteConfig } from '@/lib/config'
import { useEffect, useState } from 'react'

function SiteInfo({ title }) {
  const [currentYear, setCurrentYear] = useState(() => {
    // 服务器端使用默认值，避免 hydration 错误
    if (typeof window === 'undefined') {
      return new Date().getFullYear()
    }
    return new Date().getFullYear()
  })
  
  // 客户端挂载后更新年份（如果需要）
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])
  
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  return (
    <footer className='relative leading-4 justify-center w-full text-gray-600 dark:text-gray-300 text-xs text-center'>
      <span>
        © {`${copyrightDate}`}
        <span>
          <a href={siteConfig('LINK')}>
            <i className='mx-1 animate-pulse fas fa-heart' />
            {siteConfig('AUTHOR')}
          </a>
          .
        </span>
        {siteConfig('BEI_AN') && (
          <>
            {' '}
            <i className='fas fa-shield-alt' />
            <a href={siteConfig('BEI_AN_LINK')} className='ml-1 mr-2'>
              {siteConfig('BEI_AN')}
            </a>
          </>
        )}
        <BeiAnGongAn />
        <span className='hidden busuanzi_container_site_pv'>
          <i className='fas fa-eye' />
          <span className='px-1 busuanzi_value_site_pv'> </span>
        </span>
        <span className='pl-2 hidden busuanzi_container_site_uv'>
          <i className='fas fa-users' />
          <span className='px-1 busuanzi_value_site_uv'> </span>
        </span>
        <br />
        <span className='text-xs font-serif'>
          Powered by
          <a
            href='https://github.com/tangly1024/NotionNext'
            className='underline'>
            NotionNext {siteConfig('VERSION')}
          </a>
        </span>
      </span>
      <h1>{title}</h1>
    </footer>
  )
}
export default SiteInfo
