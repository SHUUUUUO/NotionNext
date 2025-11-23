/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    // 底色
    body{
        background-color: #eeedee;
    }
    .dark body{
        background-color: black;
    }

    /* ========== 瀑布流布局基础样式 ========== */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: 0.75rem;
    }

    /* 所有组：使用column-count瀑布流布局 */
    #theme-fukasawa .grid-container {
        column-gap: 0.75rem;
    }

    /* ========== 列数控制 ========== */
    /* 大屏幕（宽度≥1308px）下显示3列 */
    @media (min-width: 1308px) {
        #theme-fukasawa .grid-container {
            column-count: 3;
        }
    }

    /* 中等屏幕（宽度≥1024px 且 <1308px）下显示2列 */
    @media (min-width: 1024px) and (max-width: 1307px) {
        #theme-fukasawa .grid-container {
            column-count: 2;
        }
    }

    /* 桌面端单列（宽度≥768px 且 <1024px）下显示1列 */
    @media (min-width: 768px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
            column-count: 1;
        }
    }

    /* 移动端（宽度<768px）下显示1列 */
    @media (max-width: 767px) {
        #theme-fukasawa .grid-container {
            column-count: 1;
        }
    }

    /* ========== 恒定边缘宽度计算博文卡片宽度 ========== */
    /* 大屏（≥1024px）：#wrapper 与屏幕左右边缘保持264px间距 */
    /* 264px = 16px(左间距) + 240px(左卡片) + 8px(容器与左卡片间距) */
    @media (min-width: 1024px) {
        /* 强制隐藏移动端顶栏 */
        #top-nav,
        #sticky-nav {
            display: none !important;
            visibility: hidden !important;
        }
        
        #wrapper {
            margin-left: 264px !important;
            margin-right: 264px !important;
            /* 移除 justify-center，避免内容居中导致多余 margin */
            justify-content: flex-start !important;
            /* 确保 wrapper 宽度正确计算，考虑左右边距 */
            width: calc(100% - 528px) !important;
            max-width: calc(100% - 528px) !important;
            /* 确保 wrapper 顶部没有额外的 padding */
            padding-top: 0 !important;
        }
        
        /* 确保 container-inner 填满可用空间 */
        #container-inner {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* 文章页面时，确保 container-inner 完全填满 wrapper，覆盖 Tailwind max-width 类 */
        #container-inner:has(#container) {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* 博文卡片宽度实时计算，填满列宽 */
        /* 覆盖 lg:max-w-sm，确保卡片宽度基于剩余空间实时计算 */
        #theme-fukasawa .grid-item article {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
        }
    }

    /* 桌面端单列（768px-1023px）：左右卡片显示，使用264px边距 */
    @media (min-width: 768px) and (max-width: 1023px) {
        /* 强制隐藏移动端顶栏 */
        #top-nav,
        #sticky-nav {
            display: none !important;
            visibility: hidden !important;
        }
        
        #wrapper {
            margin-left: 264px !important;
            margin-right: 264px !important;
            /* 移除 justify-center，避免内容居中导致多余 margin */
            justify-content: flex-start !important;
            /* 确保 wrapper 宽度正确计算，考虑左右边距 */
            width: calc(100% - 528px) !important;
            max-width: calc(100% - 528px) !important;
            /* 确保 wrapper 顶部没有额外的 padding */
            padding-top: 0 !important;
        }
        
        /* 确保 container-inner 填满可用空间 */
        #container-inner {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* 文章页面时，确保 container-inner 完全填满 wrapper */
        #container-inner:has(#container) {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* 博文卡片宽度实时计算，填满列宽 */
        #theme-fukasawa .grid-item article {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
        }
    }

    /* 移动端（<768px）：左右卡片不显示，使用16px边距 */
    @media (max-width: 767px) {
        /* 强制隐藏左右卡片和功能区按钮 */
        #sidebar-left-card,
        #sidebar-right-card,
        #sidebar-function-area {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
        }
        
        /* 强制显示移动端顶栏 */
        #top-nav,
        #sticky-nav {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        
        #wrapper {
            margin-left: 16px !important;
            margin-right: 16px !important;
            /* 移除 justify-center，避免内容居中导致多余 margin */
            justify-content: flex-start !important;
        }
        
        /* 确保 container-inner 填满可用空间 */
        #container-inner {
            max-width: 100% !important;
            width: 100% !important;
        }
        
        /* 博文卡片宽度实时计算，填满列宽 */
        #theme-fukasawa .grid-item article {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
        }
    }

    /* ========== 满屏阅读模式样式 ========== */
    /* 满屏阅读模式下，强制使用16px边距，隐藏左右卡片 */
    .fullscreen-reading-mode {
        /* 在桌面端也应用移动端的边距样式 */
    }
    
    .fullscreen-reading-mode #wrapper {
        margin-left: 12px !important;
        margin-right: 12px !important;
        justify-content: flex-start !important;
        width: calc(100% - 24px) !important;
        max-width: calc(100% - 24px) !important;
    }
    
    /* 满屏阅读模式下，通过 transform 和 opacity 隐藏卡片，保持动画效果 */
    /* 注意：不使用 display: none，以保持退出时的动画过渡 */
    /* 使用更高的特异性，但避免 !important 影响退出动画 */
    #theme-fukasawa.fullscreen-reading-mode #sidebar-left-card {
        transform: translateX(-100%);
        opacity: 0;
        pointer-events: none;
    }
    
    #theme-fukasawa.fullscreen-reading-mode #sidebar-right-card {
        transform: translateX(100%);
        opacity: 0;
        pointer-events: none;
    }
    
    .fullscreen-reading-mode #container-inner {
        max-width: 100% !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
    }

    /* ========== 文章详情页容器宽度适配 ========== */
    /* 与瀑布流相同的适配方式：左右最小间距264px，容器最大宽度1024px */
    /* 注意：#container 在 #container-inner 内部，而 #wrapper 已经有 264px 的左右边距 */
    
    /* 文章容器顶部对齐：与左右卡片顶部对齐（顶部间距 12px） */
    /* 文章页面时，container-inner 顶部间距与左右卡片对齐 */
    @media (min-width: 768px) {
        /* 确保 wrapper 没有额外的 padding-top */
        #wrapper:has(#container-inner:has(#container)) {
            padding-top: 0 !important;
        }
        
        /* 文章页面时，container-inner 顶部间距 12px */
        #container-inner:has(#container) {
            padding-top: 12px !important;
            margin-top: 0 !important;
        }
        
        /* 确保 container 没有额外的 margin-top */
        #container-inner:has(#container) #container {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }
        
        /* 归档、分类、标签等子菜单页面顶部对齐（顶部间距 12px） */
        /* 这些页面在 container-inner 中直接包含内容，需要添加顶部间距 */
        /* 通过检查 container-inner 是否包含归档、分类、标签页面的特征元素来判断 */
        #container-inner:has(> div.rounded-lg),
        #container-inner:has(#category-list),
        #container-inner:has(#tags-list),
        #container-inner:has([id^="20"]) {
            padding-top: 12px !important;
        }
        
        /* 搜索页面、分类详情页、标签详情页也使用顶部对齐 */
        #container-inner:has(> div.rounded-lg > div:has(#posts-wrapper)),
        #container-inner:has(> div.rounded-lg > div:has(.grid-container)) {
            padding-top: 12px !important;
        }
        
        /* 确保归档、分类、标签页面的容器没有额外的 margin-top */
        #container-inner > div.rounded-lg {
            margin-top: 0 !important;
        }
    }
    
    /* 大屏（≥1552px）：容器最大宽度1024px，居中显示 */
    /* 1552px = 1024px(容器) + 264px*2(左右边距) */
    @media (min-width: 1552px) {
        #container {
            max-width: 1024px !important;
            width: 1024px !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
    }

    /* 中等屏幕和桌面端单列（768px-1551px）：固定边距264px，容器宽度自动缩小 */
    /* 由于 #wrapper 已经有 264px 边距，所以 #container 填满 #container-inner 即可 */
    @media (min-width: 768px) and (max-width: 1551px) {
        #container {
            max-width: 100% !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        
        /* 当容器宽度小于1024px时，article 的内边距按比例缩小，保持12px占比 */
        /* 1024px 时 padding 是 48px (md:px-12)，占比约 4.7% */
        #container > article {
            padding-left: clamp(12px, 4.7%, 48px) !important;
            padding-right: clamp(12px, 4.7%, 48px) !important;
        }
    }

    /* 移动端（<768px）：容器填满可用空间，由 #wrapper 的 16px 边距控制 */
    @media (max-width: 767px) {
        #container {
            max-width: 100% !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
    }

    /* 满屏阅读模式下，文章容器填满可用空间 */
    .fullscreen-reading-mode #container {
        max-width: 100% !important;
        width: 100% !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
    }

    /* ========== 文章导航按钮高度一致 ========== */
    /* 确保三个导航按钮的高度遵循最高的那个按钮 */
    .article-navigation-container {
        align-items: stretch !important;
        display: flex !important;
    }
    
    /* 确保所有直接子元素（包括按钮和占位元素）高度一致 */
    /* 关键：使用 align-self: stretch 确保每个子元素都拉伸到容器高度 */
    .article-navigation-container > * {
        align-self: stretch !important;
        min-height: 44px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
        box-sizing: border-box !important;
    }
    
    /* 确保宽度比例为 5:3:5 */
    .article-navigation-container > *:first-child,
    .article-navigation-container > *:last-child {
        flex: 5 1 0% !important;
    }
    
    .article-navigation-container > *:nth-child(2) {
        flex: 3 1 0% !important;
    }

  `}</style>
}

export { Style }
