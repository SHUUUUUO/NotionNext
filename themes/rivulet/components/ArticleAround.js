import SmartLink from '@/components/SmartLink'

/**
 * 上一篇，下一篇文章
 * @param {prev,next} param0
 * @returns
 */
export default function ArticleAround ({ prev, next }) {
  if (!prev || !next) {
    return <></>
  }
  return (
    <section className='text-gray-800 h-28 flex items-center justify-between space-x-5 my-4'>
      <SmartLink
        href={`/${prev.slug}`}
        passHref
        className='text-sm cursor-pointer justify-center items-center flex w-full h-full bg-gray-100 dark:bg-gray-800 hover:bg-hexo-black-gray dark:hover:bg-gray-700 dark:text-gray-200 hover:text-white duration-300 rounded-lg'>

        <i className='mr-1 fas fa-angle-double-left' />{prev.title}

      </SmartLink>
      <SmartLink
        href={`/${next.slug}`}
        passHref
        className='text-sm  cursor-pointer justify-center items-center flex w-full h-full bg-gray-100 dark:bg-gray-800 hover:bg-hexo-black-gray dark:hover:bg-gray-700 dark:text-gray-200 hover:text-white duration-300 rounded-lg'>
        {next.title}
        <i className='ml-1 my-1 fas fa-angle-double-right' />

      </SmartLink>
    </section>
  );
}
