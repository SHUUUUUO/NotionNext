import SmartLink from '@/components/SmartLink'

const TagItemMini = ({ tag, selected = false }) => {
  return (
    <SmartLink
      key={tag}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`cursor-pointer inline-block rounded hover:bg-gray-500 hover:text-white duration-200
        mr-2 py-0.5 px-1 text-xs whitespace-nowrap dark:hover:text-white
         ${selected
        ? 'text-white dark:text-white bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-500'
        : `text-gray-600 hover:shadow-xl dark:border-gray-400 notion-${tag.color}_background dark:bg-gray-800`}` }>

      <div className='font-light dark:text-gray-400'>{selected && <i className='mr-1 fas fa-tag'/>} {tag.name + (tag.count ? `(${tag.count})` : '')} </div>

    </SmartLink>
  );
}

export default TagItemMini
