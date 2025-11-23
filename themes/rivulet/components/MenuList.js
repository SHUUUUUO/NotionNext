import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { MenuItemCollapse } from './MenuItemCollapse'
import { MenuItemDrop } from './MenuItemDrop'
/**
 * 菜单列表
 * @param {*} props
 * @returns
 */
export const MenuList = props => {
  const {
    customNav,
    customMenu,
    showDesktop = true,
    showMobile = true,
    desktopClassName = '',
    mobileClassName = '',
    desktopWrapperClass = 'hidden md:block',
    mobileWrapperClass = 'block md:hidden'
  } = props
  const { locale } = useGlobal()

  let links = [
    { name: locale.NAV.INDEX, href: '/' || '/', show: true },
    {
      name: locale.COMMON.CATEGORY,
      href: '/category',
      show: siteConfig('RIVULET_MENU_CATEGORY', null, CONFIG)
    },
    {
      name: locale.COMMON.TAGS,
      href: '/tag',
      show: siteConfig('RIVULET_MENU_TAG', null, CONFIG)
    },
    {
      name: locale.NAV.ARCHIVE,
      href: '/archive',
      show: siteConfig('RIVULET_MENU_ARCHIVE', null, CONFIG)
    }
  ]

  if (customNav) {
    links = links.concat(customNav)
  }

  // 如果 开启自定义菜单，则覆盖Page生成的菜单
  if (siteConfig('CUSTOM_MENU')) {
    links = customMenu
  }

  if (!links || links.length === 0) {
    return null
  }

  return (
    <>
      {showDesktop && (
        <menu id='nav-pc' className={`${desktopWrapperClass} text-sm z-10 ${desktopClassName}`}>
          {links?.map((link, index) => (
            <MenuItemDrop key={index} link={link} />
          ))}
        </menu>
      )}
      {showMobile && (
        <menu id='nav-mobile' className={`${mobileWrapperClass} text-sm z-10 pb-1 ${mobileClassName}`}>
          {links?.map((link, index) => (
            <MenuItemCollapse
              key={index}
              link={link}
              onHeightChange={props.onHeightChange}
            />
          ))}
        </menu>
      )}
    </>
  )
}
