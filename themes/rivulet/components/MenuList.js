import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useState } from 'react'
import CONFIG from '../config'
import { MenuItemCollapse } from './MenuItemCollapse'
import { MenuItemDrop } from './MenuItemDrop'
import { MenuItemVertical } from './MenuItemVertical'
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
    mobileWrapperClass = 'block md:hidden',
    vertical = false, // 是否使用垂直布局（用于左侧卡片）
    onSubMenuToggle // 子菜单展开状态变化回调
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

  // 过滤掉不显示的菜单项
  const visibleLinks = links?.filter(link => link && link.show !== false) || []

  // 跟踪当前展开的菜单项索引（一次只能展开一个）
  const [openIndex, setOpenIndex] = useState(null)

  // 当有子菜单展开状态变化时，更新状态并通知父组件
  const handleSubMenuToggle = (index, isOpen) => {
    if (isOpen) {
      // 如果当前菜单要展开，先关闭其他已展开的菜单
      setOpenIndex(index)
    } else {
      // 如果当前菜单要关闭
      setOpenIndex(null)
    }
    
    // 通知父组件是否有任何子菜单展开
    if (onSubMenuToggle) {
      onSubMenuToggle(isOpen)
    }
  }

  if (visibleLinks.length === 0) {
    return null
  }

  return (
    <>
      {showDesktop && (
        <menu id='nav-pc' className={`${desktopWrapperClass} text-sm z-10 ${desktopClassName} ${vertical ? 'list-none' : ''}`}>
          {visibleLinks.map((link, index) => {
            if (vertical) {
              return (
                <MenuItemVertical 
                  key={index} 
                  link={link} 
                  isOpen={openIndex === index}
                  onToggle={(isOpen) => handleSubMenuToggle(index, isOpen)}
                />
              )
            }
            return <MenuItemDrop key={index} link={link} />
          })}
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
