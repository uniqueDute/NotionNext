import Link from 'next/link'
import {useClearSummaryBox,useCreateSummaryBox } from '@/components/NotionArticleSummary';

/**
 * 上一篇，下一篇文章
 * @param {prev,next} param0
 * @returns
 */
export default function ArticleAround({ prev, next }) {
  if (!prev || !next) {
    return <></>
  }

  const clearSummaryBox = useClearSummaryBox();
  const createSummaryBox = useCreateSummaryBox();

  const handleClick = () => {
    clearSummaryBox();

    const articleWrapper = document.getElementById('article-wrapper');
    if (articleWrapper) {
      const articleBox = document.getElementById('notion-article');
      createSummaryBox(articleBox); // 如果文章存在，创建摘要框
    }
  };
  return (
        <section className='text-gray-800 dark:text-gray-400 h-12 flex items-center justify-between space-x-5 my-4'>
            {prev && <Link
                href={`/${prev.slug}`}
                onClick={handleClick}
                passHref
                className='text-sm cursor-pointer justify-start items-center flex hover:underline duration-300'>
                <i className='mr-1 fas fa-angle-double-left' />{prev.title}

            </Link>}
            {next && <Link
                href={`/${next.slug}`}
                onClick={handleClick}
                passHref
                className='text-sm cursor-pointer justify-end items-center flex hover:underline duration-300'>
                {next.title}
                <i className='ml-1 my-1 fas fa-angle-double-right' />

            </Link>}
        </section>
  )
}
