import SmartLink from '@/components/SmartLink'

function GroupCategory ({ currentCategory, categories, selectedCategory, onCategoryChange }) {
  if (!categories) {
    return <></>
  }

  // 处理分类点击 - 如果已选中则取消，否则跳转
  const handleCategoryClick = (categoryName, e) => {
    // 如果点击的是已选中的分类（selectedCategory），则取消选择
    if (selectedCategory === categoryName && onCategoryChange) {
      e.preventDefault()
      e.stopPropagation()
      onCategoryChange(null)
    }
    // 否则正常跳转（SmartLink 会处理）
  }

  // 将分类分为选中和未选中两组
  const selectedCategoryList = categories.filter(cat => {
    const isCurrentCategory = currentCategory === cat.name
    const isSelectedCategory = selectedCategory === cat.name
    return isCurrentCategory || isSelectedCategory
  })
  
  const unselectedCategoryList = categories.filter(cat => {
    const isCurrentCategory = currentCategory === cat.name
    const isSelectedCategory = selectedCategory === cat.name
    return !isCurrentCategory && !isSelectedCategory
  })

  return <>
    <div id='category-list' className='dark:border-gray-600 flex flex-col items-center w-full'>
      {/* 选中的分类列表 - 高亮显示在前面 */}
      {selectedCategoryList.length > 0 && (
        <div className='flex flex-wrap justify-center w-full'>
          {selectedCategoryList.map(category => {
            const isCurrentCategory = currentCategory === category.name
            const isSelectedCategory = selectedCategory === category.name
            const selected = isCurrentCategory || isSelectedCategory
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                onClick={(e) => handleCategoryClick(category.name, e)}
                className={(selected
                  ? 'hover:text-white dark:hover:text-white bg-gray-600 text-white '
                  : 'dark:text-gray-400 text-gray-500 hover:text-white hover:bg-gray-500 dark:hover:text-white') +
                  '  text-sm w-full items-center justify-center duration-300 px-2  cursor-pointer py-1 font-light flex'}>
                <i className={`${selected ? 'text-white fa-folder-open' : 'fa-folder text-gray-400'} fas mr-2`} />{category.name}({category.count})
              </SmartLink>
            )
          })}
        </div>
      )}
      
      {/* 未选中的分类列表 */}
      {unselectedCategoryList.length > 0 && (
        <div className='flex flex-wrap justify-center w-full'>
          {unselectedCategoryList.map(category => {
            const selected = false
            return (
              <SmartLink
                key={category.name}
                href={`/category/${category.name}`}
                passHref
                className={(selected
                  ? 'hover:text-white dark:hover:text-white bg-gray-600 text-white '
                  : 'dark:text-gray-400 text-gray-500 hover:text-white hover:bg-gray-500 dark:hover:text-white') +
                  '  text-sm w-full items-center justify-center duration-300 px-2  cursor-pointer py-1 font-light flex'}>
                <i className={`${selected ? 'text-white fa-folder-open' : 'fa-folder text-gray-400'} fas mr-2`} />{category.name}({category.count})
              </SmartLink>
            )
          })}
        </div>
      )}
    </div>
  </>
}

export default GroupCategory
