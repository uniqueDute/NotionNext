import Link from 'next/link'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { siteConfig } from '@/lib/config'
import { formatDateFmt } from '@/lib/utils/formatDate'
import NotionIcon from '@/components/NotionIcon'
import WordCount from './WordCount'

/**
 * 文章描述
 * @param {*} props
 * @returns
 */
export default function ArticleInfo (props) {
  const { post } = props

  const { locale } = useGlobal()

  return (
        <section className="mt-2 text-gray-600 dark:text-gray-400 leading-8">
            <h2
                className="blog-item-title mb-5 font-bold text-black text-xl md:text-2xl no-underline">
                {siteConfig('POST_TITLE_ICON') && <NotionIcon icon={post?.pageIcon} />}{post?.title}
            </h2>

            <div className='flex flex-wrap text-gray-700 dark:text-gray-300'>
                {post?.type !== 'Page' && (
                    <div className="space-x-3 mr-4" style="display: flex; align-items: center;">
                        <span> <object type="image/svg+xml" data="/svg/xiaoxin.svg"/>:</span>
                        <a href={siteConfig('SIMPLE_AUTHOR_LINK', null, CONFIG)}>{siteConfig('AUTHOR')}</a>
                        {post?.category && <span>  <i className="fa-regular fa-folder"></i> <a href={`/category/${post?.category}`} className="hover:text-red-400 transition-all duration-200">{post?.category}</a></span>}
                        {post?.tags && post?.tags?.length > 0 && post?.tags.map(t => <span style={{marginLeft:"0px"}} key={t}>/ <Link href={`/tag/${t}`}><span className=' hover:text-red-400 transition-all duration-200'>{t}</span></Link></span>)}
                    </div>)}

                {post?.type !== 'Page' && (<div className=''>
                    <span> <object type="image/svg+xml" data="/svg/fabu.svg"/>:</span>
                        <Link
                            href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                            passHref
                            className="pl-1 mr-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 border-b dark:border-gray-500 border-dashed">
                            {post?.publishDay}
                        </Link>
                    <span className='mr-2'>|</span>
                    <span className="hidden busuanzi_container_page_pv font-light mr-2">
                        <i className='mr-1 fas fa-eye' />
                        &nbsp;
                        <span className="mr-2 busuanzi_value_page_pv" />
                    </span>
                    <span className='mr-2'>|</span>
                </div>)}
                <WordCount />
            </div>
        </section>
  )
}
