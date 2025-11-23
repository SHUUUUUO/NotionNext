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
        margin-left: 16px !important;
        margin-right: 16px !important;
        justify-content: flex-start !important;
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
    }

    /* ========== 文章详情页容器宽度适配 ========== */
    /* 与瀑布流相同的适配方式：左右最小间距264px，容器最大宽度1024px */
    /* 注意：#container 在 #container-inner 内部，而 #wrapper 已经有 264px 的左右边距 */
    
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
        
        /* 当容器宽度小于1024px时，article 的内边距按比例缩小，保持12.5%占比 */
        /* 1024px 时 padding 是 128px (md:px-32)，占比 12.5% */
        #container > article {
            padding-left: clamp(20px, 12.5%, 128px) !important;
            padding-right: clamp(20px, 12.5%, 128px) !important;
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
    }

  `}</style>
}

export { Style }
