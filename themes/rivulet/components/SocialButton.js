import QrCode from '@/components/QrCode'
import { siteConfig } from '@/lib/config'
import { useRef, useState } from 'react'
import { handleEmailClick } from '@/lib/plugins/mailEncrypt'
import CONFIG from '../config'

/**
 * 社交联系方式按钮组
 * @returns {JSX.Element}
 * @constructor
 */
const SocialButton = () => {
  // 解析链接，支持格式：'数字,链接' 或直接 '链接'
  const parseLink = (value) => {
    if (!value) return { order: null, link: null }
    if (typeof value !== 'string') return { order: null, link: value }
    
    const match = value.match(/^(\d+),(.+)$/)
    if (match) {
      return { order: parseInt(match[1], 10), link: match[2] }
    }
    return { order: null, link: value }
  }

  // 优先从主题配置读取，如果没有则从全局配置读取
  const CONTACT_GITHUB_RAW = siteConfig('CONTACT_GITHUB', null, CONFIG)
  const CONTACT_TWITTER_RAW = siteConfig('CONTACT_TWITTER', null, CONFIG)
  const CONTACT_TELEGRAM_RAW = siteConfig('CONTACT_TELEGRAM', null, CONFIG)
  const CONTACT_LINKEDIN_RAW = siteConfig('CONTACT_LINKEDIN', null, CONFIG)
  const CONTACT_WEIBO_RAW = siteConfig('CONTACT_WEIBO', null, CONFIG)
  const CONTACT_INSTAGRAM_RAW = siteConfig('CONTACT_INSTAGRAM', null, CONFIG)
  const CONTACT_EMAIL_RAW = siteConfig('CONTACT_EMAIL', null, CONFIG)
  const ENABLE_RSS = siteConfig('ENABLE_RSS', true, CONFIG)
  const CONTACT_BILIBILI_RAW = siteConfig('CONTACT_BILIBILI', null, CONFIG)
  const CONTACT_YOUTUBE_RAW = siteConfig('CONTACT_YOUTUBE', null, CONFIG)
  const CONTACT_XIAOHONGSHU_RAW = siteConfig('CONTACT_XIAOHONGSHU', null, CONFIG)
  const CONTACT_ZHISHIXINGQIU_RAW = siteConfig('CONTACT_ZHISHIXINGQIU', null, CONFIG)
  const CONTACT_WEHCHAT_PUBLIC_RAW = siteConfig('CONTACT_WEHCHAT_PUBLIC', null, CONFIG)

  // 解析所有链接
  const CONTACT_GITHUB = parseLink(CONTACT_GITHUB_RAW)
  const CONTACT_TWITTER = parseLink(CONTACT_TWITTER_RAW)
  const CONTACT_TELEGRAM = parseLink(CONTACT_TELEGRAM_RAW)
  const CONTACT_LINKEDIN = parseLink(CONTACT_LINKEDIN_RAW)
  const CONTACT_WEIBO = parseLink(CONTACT_WEIBO_RAW)
  const CONTACT_INSTAGRAM = parseLink(CONTACT_INSTAGRAM_RAW)
  const CONTACT_EMAIL = parseLink(CONTACT_EMAIL_RAW)
  const CONTACT_BILIBILI = parseLink(CONTACT_BILIBILI_RAW)
  const CONTACT_YOUTUBE = parseLink(CONTACT_YOUTUBE_RAW)
  const CONTACT_XIAOHONGSHU = parseLink(CONTACT_XIAOHONGSHU_RAW)
  const CONTACT_ZHISHIXINGQIU = parseLink(CONTACT_ZHISHIXINGQIU_RAW)
  const CONTACT_WEHCHAT_PUBLIC = parseLink(CONTACT_WEHCHAT_PUBLIC_RAW)

  const [qrCodeShow, setQrCodeShow] = useState(false)

  const openPopover = () => {
    setQrCodeShow(true)
  }
  const closePopover = () => {
    setQrCodeShow(false)
  }

  const emailIcon = useRef(null)

  // 定义所有按钮的渲染函数
  const buttonRenderers = {
    CONTACT_GITHUB: CONTACT_GITHUB.link ? (
      <a
        key="github"
        target='_blank'
        rel='noreferrer'
        title={'github'}
        href={CONTACT_GITHUB.link}>
        <i className='transform hover:scale-125 duration-150 fab fa-github dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_TWITTER: CONTACT_TWITTER.link ? (
      <a
        key="twitter"
        target='_blank'
        rel='noreferrer'
        title={'twitter'}
        href={CONTACT_TWITTER.link}>
        <i className='transform hover:scale-125 duration-150 fab fa-twitter dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_TELEGRAM: CONTACT_TELEGRAM.link ? (
      <a
        key="telegram"
        target='_blank'
        rel='noreferrer'
        href={CONTACT_TELEGRAM.link}
        title={'telegram'}>
        <i className='transform hover:scale-125 duration-150 fab fa-telegram dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_LINKEDIN: CONTACT_LINKEDIN.link ? (
      <a
        key="linkedin"
        target='_blank'
        rel='noreferrer'
        href={CONTACT_LINKEDIN.link}
        title={'linkIn'}>
        <i className='transform hover:scale-125 duration-150 fab fa-linkedin dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_WEIBO: CONTACT_WEIBO.link ? (
      <a
        key="weibo"
        target='_blank'
        rel='noreferrer'
        title={'weibo'}
        href={CONTACT_WEIBO.link}>
        <i className='transform hover:scale-125 duration-150 fab fa-weibo dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_INSTAGRAM: CONTACT_INSTAGRAM.link ? (
      <a
        key="instagram"
        target='_blank'
        rel='noreferrer'
        title={'instagram'}
        href={CONTACT_INSTAGRAM.link}>
        <i className='transform hover:scale-125 duration-150 fab fa-instagram dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_EMAIL: CONTACT_EMAIL.link ? (
      <a
        key="email"
        onClick={e => handleEmailClick(e, emailIcon, CONTACT_EMAIL.link)}
        title='email'
        className='cursor-pointer'
        ref={emailIcon}>
        <i className='transform hover:scale-125 duration-150 fas fa-envelope dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    ENABLE_RSS: ENABLE_RSS ? (
      <a
        key="rss"
        target='_blank'
        rel='noreferrer'
        title={'RSS'}
        href={'/rss/feed.xml'}>
        <i className='transform hover:scale-125 duration-150 fas fa-rss dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_BILIBILI: CONTACT_BILIBILI.link ? (
      <a
        key="bilibili"
        target='_blank'
        rel='noreferrer'
        title={'bilibili'}
        href={CONTACT_BILIBILI.link}>
        <i className='transform hover:scale-125 duration-150 dark:hover:text-green-400 hover:text-green-600 fab fa-bilibili' />
      </a>
    ) : null,
    CONTACT_YOUTUBE: CONTACT_YOUTUBE.link ? (
      <a
        key="youtube"
        target='_blank'
        rel='noreferrer'
        title={'youtube'}
        href={CONTACT_YOUTUBE.link}>
        <i className='transform hover:scale-125 duration-150 fab fa-youtube dark:hover:text-green-400 hover:text-green-600' />
      </a>
    ) : null,
    CONTACT_XIAOHONGSHU: CONTACT_XIAOHONGSHU.link ? (
      <a
        key="xiaohongshu"
        target='_blank'
        rel='noreferrer'
        title={'小红书'}
        href={CONTACT_XIAOHONGSHU.link}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='transform hover:scale-125 duration-150 w-6'
          src='/svg/xiaohongshu.svg'
          alt='小红书'
        />
      </a>
    ) : null,
    CONTACT_ZHISHIXINGQIU: CONTACT_ZHISHIXINGQIU.link ? (
      <a
        key="zhishixingqiu"
        target='_blank'
        rel='noreferrer'
        title={'知识星球'}
        className='flex justify-center items-center'
        href={CONTACT_ZHISHIXINGQIU.link}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='transform hover:scale-125 duration-150 w-6'
          src='/svg/zhishixingqiu.svg'
          alt='知识星球'
        />
      </a>
    ) : null,
    CONTACT_WEHCHAT_PUBLIC: CONTACT_WEHCHAT_PUBLIC.link ? (
      <button
        key="wechat"
        onMouseEnter={openPopover}
        onMouseLeave={closePopover}
        aria-label={'微信公众号'}>
        <div id='wechat-button'>
          <i className='transform scale-105 hover:scale-125 duration-150 fab fa-weixin  dark:hover:text-green-400 hover:text-green-600' />
        </div>
        {/* 二维码弹框 */}
        <div className='absolute'>
          <div
            id='pop'
            className={
              (qrCodeShow ? 'opacity-100 ' : ' invisible opacity-0') +
              ' z-40 absolute bottom-10 -left-10 bg-white shadow-xl transition-all duration-200 text-center'
            }>
            <div className='p-2 mt-1 w-28 h-28'>
              {qrCodeShow && <QrCode value={CONTACT_WEHCHAT_PUBLIC.link} />}
            </div>
          </div>
        </div>
      </button>
    ) : null
  }

  // 定义按钮顺序信息（包含order和key）
  const buttonInfos = [
    { key: 'CONTACT_GITHUB', order: CONTACT_GITHUB.order },
    { key: 'CONTACT_TWITTER', order: CONTACT_TWITTER.order },
    { key: 'CONTACT_TELEGRAM', order: CONTACT_TELEGRAM.order },
    { key: 'CONTACT_LINKEDIN', order: CONTACT_LINKEDIN.order },
    { key: 'CONTACT_WEIBO', order: CONTACT_WEIBO.order },
    { key: 'CONTACT_INSTAGRAM', order: CONTACT_INSTAGRAM.order },
    { key: 'CONTACT_EMAIL', order: CONTACT_EMAIL.order },
    { key: 'ENABLE_RSS', order: null }, // RSS没有链接，不支持数字排序
    { key: 'CONTACT_BILIBILI', order: CONTACT_BILIBILI.order },
    { key: 'CONTACT_YOUTUBE', order: CONTACT_YOUTUBE.order },
    { key: 'CONTACT_XIAOHONGSHU', order: CONTACT_XIAOHONGSHU.order },
    { key: 'CONTACT_ZHISHIXINGQIU', order: CONTACT_ZHISHIXINGQIU.order },
    { key: 'CONTACT_WEHCHAT_PUBLIC', order: CONTACT_WEHCHAT_PUBLIC.order }
  ]

  // 分离有数字和没有数字的按钮
  const withOrder = buttonInfos
    .filter(info => info.order !== null && buttonRenderers[info.key])
    .sort((a, b) => a.order - b.order)
    .map(info => buttonRenderers[info.key])

  const withoutOrder = buttonInfos
    .filter(info => info.order === null && buttonRenderers[info.key])
    .map(info => buttonRenderers[info.key])


  return (
    <div className='w-full justify-center flex-wrap flex'>
      <div className='space-x-3 text-xl flex items-center text-gray-600 dark:text-gray-300 '>
        {[...withOrder, ...withoutOrder]}
      </div>
    </div>
  )
}
export default SocialButton
