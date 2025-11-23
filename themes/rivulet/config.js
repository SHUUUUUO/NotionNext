const CONFIG = {
  RIVULET_MAILCHIMP_FORM: false, // 邮件订阅表单

  RIVULET_POST_LIST_COVER: true, // 文章列表显示图片封面
  RIVULET_POST_LIST_COVER_FORCE: false, // 即使没有封面也将站点背景图设置为封面
  RIVULET_POST_LIST_PREVIEW: false, // 显示文章预览
  RIVULET_POST_LIST_ANIMATION: false, // 博客列表淡入动画

  // 菜单
  RIVULET_MENU_CATEGORY: true, // 显示分类
  RIVULET_MENU_TAG: true, // 显示标签
  RIVULET_MENU_ARCHIVE: true, // 显示归档

  RIVULET_SIDEBAR_COLLAPSE_BUTTON: true, // 侧边栏折叠按钮
  RIVULET_SIDEBAR_COLLAPSE_SATUS_DEFAULT: false, // 侧边栏默认折叠收起
  RIVULET_SIDEBAR_COLLAPSE_ON_SCROLL: false // 侧边栏滚动时折叠 仅文章阅读页有效
  ,
  // 是否反转侧栏位置（此设置只对 rivulet 主题生效）
  LAYOUT_SIDEBAR_REVERSE: true,

  // 卡片与瀑布流的间隙（单位：rem）- 与瀑布流文章卡片内部间隙保持一致
  CARD_GAP: '0.75rem', // 卡片之间的间隙，与瀑布流 column-gap 一致

  // 文章列表配置
  RIVULET_POSTS_PER_GROUP: 12, // 每组文章数量

  // 社交链接配置（优先使用主题配置，如果为空则使用全局配置）
  // 格式：'数字,链接' 或直接 '链接'，有数字的按数字排序在前，没有数字的按默认顺序在后
  // 例如：'1,https://space.bilibili.com/161289723' 或 'https://github.com/yourusername'
  CONTACT_GITHUB: '', // GitHub主页
  CONTACT_BILIBILI: '', // B站主页（数字1表示第一个显示）
  CONTACT_XIAOHONGSHU: '', // 小红书主页
  CONTACT_TWITTER: '', // Twitter主页
  CONTACT_TELEGRAM: '', // Telegram地址
  CONTACT_LINKEDIN: '', // LinkedIn首页
  CONTACT_WEIBO: '', // 微博个人主页
  CONTACT_INSTAGRAM: '', // Instagram地址
  CONTACT_EMAIL: '', // 邮箱地址（会自动加密）
  CONTACT_YOUTUBE: '', // Youtube主页
  CONTACT_ZHISHIXINGQIU: '', // 知识星球
  CONTACT_WEHCHAT_PUBLIC: '', // 微信公众号（格式：https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=【xxxxxx】==#wechat_redirect）
  ENABLE_RSS: true, // 是否显示RSS订阅链接

  // 左侧卡片头像配置
  RIVULET_LEFT_CARD_AVATAR: '/avatar.png', // 左侧卡片头像图片URL，默认使用 /avatar.png

  // 左侧卡片文字配置
  RIVULET_LEFT_CARD_TITLE: '', // 左侧卡片Logo文字，留空则使用全局 TITLE
  RIVULET_LEFT_CARD_DESCRIPTION: '' // 左侧卡片副标题，留空则使用全局 DESCRIPTION
}
export default CONFIG
