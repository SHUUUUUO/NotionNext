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
        }
        
        /* 确保 container-inner 填满可用空间，避免多余的 margin */
        #container-inner {
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

  `}</style>
}

export { Style }
