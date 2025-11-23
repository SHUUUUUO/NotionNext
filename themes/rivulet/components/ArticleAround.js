import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'

/**
 * 上一篇，文章列表，下一篇文章
 * @param {prev,next} param0
 * @returns
 */
export default function ArticleAround ({ prev, next }) {
  const router = useRouter()
  
  return (
    <section className='text-gray-800 h-28 flex items-center justify-between space-x-3 my-4'>
      {/* 上一篇 */}
      {prev ? (
        <SmartLink
          href={`/${prev.slug}`}
          passHref
          className='text-sm cursor-pointer justify-center items-center flex flex-1 h-full bg-gray-100 dark:bg-gray-800 hover:bg-hexo-black-gray dark:hover:bg-gray-700 dark:text-gray-200 hover:text-white duration-300 rounded-lg px-3'>
          <i className='mr-1 fas fa-angle-double-left' />
          <span className='truncate'>{prev.title}</span>
        </SmartLink>
      ) : (
        <div className='flex-1'></div>
      )}

      {/* 文章列表 */}
      <SmartLink
        href='/'
        passHref
        className='text-sm cursor-pointer justify-center items-center flex h-full bg-gray-100 dark:bg-gray-800 hover:bg-hexo-black-gray dark:hover:bg-gray-700 dark:text-gray-200 hover:text-white duration-300 rounded-lg px-4'>
        <i className='fas fa-list' />
      </SmartLink>

      {/* 下一篇 */}
      {next ? (
        <SmartLink
          href={`/${next.slug}`}
          passHref
          className='text-sm cursor-pointer justify-center items-center flex flex-1 h-full bg-gray-100 dark:bg-gray-800 hover:bg-hexo-black-gray dark:hover:bg-gray-700 dark:text-gray-200 hover:text-white duration-300 rounded-lg px-3'>
          <span className='truncate'>{next.title}</span>
          <i className='ml-1 fas fa-angle-double-right' />
        </SmartLink>
      ) : (
        <div className='flex-1'></div>
      )}
    </section>
  );
}
