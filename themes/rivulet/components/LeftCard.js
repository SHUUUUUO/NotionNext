import { useRouter } from 'next/router'
import { siteConfig } from '@/lib/config'
import CONFIG from '../config'
import Announcement from './Announcement'
import SiteInfo from './SiteInfo'
import SocialButton from './SocialButton'
import Logo from './Logo'

/**
 * 左侧卡片组件
 * @param {object} props
 * @param {array} props.tagOptions - 标签选项
 * @param {string} props.currentTag - 当前标签
 * @param {array} props.categoryOptions - 分类选项
 * @param {string} props.currentCategory - 当前分类
 * @param {boolean} props.isCollapsed - 是否折叠
 * @param {string} props.cardGap - 卡片间隙
 * @returns {JSX.Element}
 */
const LeftCard = ({
  isCollapsed,
  cardGap,
  notice,
  ...otherProps
}) => {
  const router = useRouter()
  // 计算卡片样式
  const cardGapValue = cardGap || siteConfig('CARD_GAP', null, CONFIG) || '1rem'
  const cardWidth = '240px'
  const cardTop = cardGapValue
  
  const cardStyle = {
    top: cardTop,
    width: cardWidth,
    maxHeight: `calc(100vh - ${cardGapValue} - ${cardGapValue})`,
    left: cardGapValue
  }

  // 获取头像配置，如果为空则使用默认头像
  const avatarUrl = siteConfig('RIVULET_LEFT_CARD_AVATAR', '/avatar.png', CONFIG) || '/avatar.png'

  // 点击头像返回首页
  const handleAvatarClick = () => {
    router.push('/')
  }

  return (
    <aside
      id="sidebar-left-card"
      className="hidden lg:block fixed bg-white dark:bg-hexo-black-gray rounded-lg z-20 transition-all duration-300 ease-in-out"
      style={{
        ...cardStyle,
        transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto'
      }}>
      <div className='p-6 space-y-3 flex flex-col items-center text-center'>
        {/* 头像 */}
        {avatarUrl && (
          <section className='flex flex-col items-center w-full mb-1'>
            <div
              onClick={handleAvatarClick}
              className='cursor-pointer hover:opacity-80 transition-opacity duration-200'
              title='返回首页'>
              <img
                src={avatarUrl}
                alt='Avatar'
                className='w-28 h-28 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700'
              />
            </div>
          </section>
        )}

        {/* Logo */}
        <section className='flex flex-col items-center w-full -my-1'>
          <Logo {...otherProps} />
        </section>

        {/* 站点描述 */}
        <section className='siteInfo flex flex-col items-center dark:text-gray-300 w-full'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {siteConfig('RIVULET_LEFT_CARD_DESCRIPTION', '', CONFIG) || siteConfig('DESCRIPTION')}
          </p>
        </section>

        {/* 社交按钮 */}
        <section className='flex flex-col items-center w-full'>
          <SocialButton />
        </section>

        {/* 公告 */}
        {notice && (
          <section className='flex flex-col items-center dark:text-gray-300 w-full pt-6 border-t border-gray-200 dark:border-gray-700'>
            <Announcement post={notice} />
          </section>
        )}

        {/* 站点信息 */}
        <section className={`flex flex-col items-center w-full ${notice ? 'pt-6 border-t border-gray-200 dark:border-gray-700' : ''}`}>
          <SiteInfo />
        </section>
      </div>
    </aside>
  )
}

export default LeftCard

