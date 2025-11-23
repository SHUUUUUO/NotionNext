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
    
    /* 瀑布流布局 - 更紧凑的排列 */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: 0.75rem;
    }
    
    /* 所有组：使用column-count瀑布流布局 */
    #theme-fukasawa .grid-container {
        column-gap: 0.75rem;
    }
    
    /* 大屏幕（宽度≥1024px）下显示3列 */
    @media (min-width: 1024px) {
        #theme-fukasawa .grid-container {
            column-count: 3;
        }
    }
    
    /* 小屏幕（宽度≥640px）下显示2列 */
    @media (min-width: 640px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
            column-count: 2;
        }
    }
    
    /* 移动端（宽度<640px）下显示1列 */
    @media (max-width: 639px) {
        #theme-fukasawa .grid-container {
            column-count: 1;
        }
    }

    .container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            padding: 10px;
        }
    
    /* 功能区按钮组线性居中动效 */
    #sidebar-function-area .flex.items-center {
        transition: all 0.25s linear;
        will-change: transform;
    }
    
    /* 黑暗模式下功能区按钮无轮廓 */
    .dark #sidebar-function-area button {
        border: none;
        outline: none;
        box-shadow: none;
    }
    
    .dark #sidebar-function-area button:focus {
        outline: none;
        box-shadow: none;
    }
    
    .dark #sidebar-function-area button:active {
        outline: none;
        box-shadow: none;
    }

    /* 左侧卡片滚动条样式 */
    #sidebar-left-card > div::-webkit-scrollbar {
        width: 6px;
    }
    
    #sidebar-left-card > div::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 3px;
    }
    
    #sidebar-left-card > div::-webkit-scrollbar-thumb {
        background: rgba(156, 163, 175, 0.5);
        border-radius: 3px;
    }
    
    #sidebar-left-card > div::-webkit-scrollbar-thumb:hover {
        background: rgba(156, 163, 175, 0.7);
    }
    
    .dark #sidebar-left-card > div::-webkit-scrollbar-thumb {
        background: rgba(107, 114, 128, 0.5);
    }
    
    .dark #sidebar-left-card > div::-webkit-scrollbar-thumb:hover {
        background: rgba(107, 114, 128, 0.7);
    }

    /* 公告内容滚动条隐藏 */
    #announcement-content.scrollbar-hide {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE and Edge */
    }
    
    #announcement-content.scrollbar-hide::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

  `}</style>
}

export { Style }

