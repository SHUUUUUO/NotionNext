import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'

const Logo = props => {
  // 优先使用主题配置，如果为空则使用全局配置
  const title = siteConfig('RIVULET_LEFT_CARD_TITLE', '', CONFIG) || siteConfig('TITLE')
  
  return (
    <section className='flex justify-center w-full'>
      <SmartLink
        href='/'
        className='logo px-4 py-1 cursor-pointer dark:text-gray-300 font-black text-xl inline-block'>
        <span className='relative inline-block group'>
          {title}
          <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full'></span>
        </span>
      </SmartLink>
    </section>
  )
}

export default Logo
