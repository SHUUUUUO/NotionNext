import { useTagFilter } from '@/themes/rivulet'

/**
 * 可选中标签组件 - 专门用于右侧卡片的标签多选功能
 * @param {object} props
 * @param {object} props.tag - 标签对象
 * @param {boolean} props.selected - 是否选中
 * @returns {JSX.Element}
 */
const TagItemSelectable = ({ tag, selected = false }) => {
  const { toggleTag } = useTagFilter()
  
  const handleClick = (e) => {
    e.preventDefault()
    toggleTag(tag.name)
  }

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200
        py-0.5 px-1 text-xs whitespace-nowrap dark:hover:text-white h-6 flex items-center
        ${selected
        ? 'text-white dark:text-white bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
        : `text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}`}>
      <div className='font-light dark:text-gray-400 flex items-center'>{selected && <i className='mr-1 fas fa-tag text-[10px]'/>} {tag.name + (tag.count ? `(${tag.count})` : '')} </div>
    </div>
  );
}

export default TagItemSelectable

