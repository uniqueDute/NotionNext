import { siteConfig } from '@/lib/config'
import { compressImage, mapImgUrl } from '@/lib/notion/mapImage'
import { isBrowser } from '@/lib/utils'
import mediumZoom from '@fisch0920/medium-zoom'
import 'katex/dist/katex.min.css'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import { NotionRenderer } from 'react-notion-x'
import {clearSummaryBox,createSummaryBox } from '@/components/NotionArticleSummary';

/**
 * 整个站点的核心组件
 * 将Notion数据渲染成网页
 * @param {*} param0
 * @returns
 */
const NotionPage = ({ post, className }) => {
  // 是否关闭数据库和画册的点击跳转
  const POST_DISABLE_GALLERY_CLICK = siteConfig('POST_DISABLE_GALLERY_CLICK')
  const POST_DISABLE_DATABASE_CLICK = siteConfig('POST_DISABLE_DATABASE_CLICK')

  const zoom =
    isBrowser &&
    mediumZoom({
      //   container: '.notion-viewport',
      background: 'rgba(0, 0, 0, 0.2)',
      margin: getMediumZoomMargin()
    })

  const zoomRef = useRef(zoom ? zoom.clone() : null)

  useEffect(() => {
    // 获取当前 URL 的基础路径部分
    const getBasePath = () => {
        const pathParts = window.location.pathname.split('/');
        // 返回路径的前两部分，例如 "article/example-4"
        return pathParts.slice(1, 3).join('/');
    };

    // 存储初始的基础路径部分
    let previousBasePath = getBasePath();

    // 自动滚动到当前 URL 哈希值对应的页面部分
    autoScrollToHash();

    const articleWrapper = document.getElementById('article-wrapper');
    if (articleWrapper) {
        const articleBox = document.getElementById('notion-article');
        createSummaryBox(articleBox); // 如果文章存在，创建摘要框
    }

    // 定义处理 URL 变化的函数
    const handleUrlChange = () => {
        const currentBasePath = getBasePath();
        console.log(currentBasePath);
        console.log(previousBasePath);

        // 仅在基础路径部分变化时进行清理
        if (previousBasePath !== currentBasePath) {
            clearSummaryBox(); // 清除现有摘要框
            const articleWrapper = document.getElementById('article-wrapper');
            if (articleWrapper) {
                const articleBox = document.getElementById('notion-article');
                createSummaryBox(articleBox); // 重新创建摘要框
            }
            previousBasePath = currentBasePath; // 更新基础路径
        }

        // 无论路径是否变化，都要执行滚动操作
        autoScrollToHash(); // 滚动到新哈希值指定的部分
    };

    // 添加 hashchange 和 popstate 事件监听器
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // 返回清理函数
    return () => {
        // 移除事件监听器
        window.removeEventListener('hashchange', handleUrlChange);
        window.removeEventListener('popstate', handleUrlChange);
    };
}, []); // 空依赖数组表示该 effect 在组件挂载时运行一次，并在组件卸载时进行清理



  // 页面文章发生变化时会执行的勾子
  useEffect(() => {
    // 相册视图点击禁止跳转，只能放大查看图片
    if (POST_DISABLE_GALLERY_CLICK) {
      // 针对页面中的gallery视图，点击后是放大图片还是跳转到gallery的内部页面
      processGalleryImg(zoomRef?.current)
    }

    // 页内数据库点击禁止跳转，只能查看
    if (POST_DISABLE_DATABASE_CLICK) {
      processDisableDatabaseUrl()
    }

    /**
     * 放大查看图片时替换成高清图像
     */
    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          if (mutation.target.classList.contains('medium-zoom-image--opened')) {
            // 等待动画完成后替换为更高清的图像
            setTimeout(() => {
              // 获取该元素的 src 属性
              const src = mutation?.target?.getAttribute('src')
              //   替换为更高清的图像
              mutation?.target?.setAttribute(
                'src',
                compressImage(src, siteConfig('IMAGE_ZOOM_IN_WIDTH', 1200))
              )
            }, 800)
          }
        }
      })
    })

    // 监视页面元素和属性变化
    observer.observe(document.body, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class']
    })

    return () => {
      observer.disconnect()
    }
  }, [post])

  return (
    <div id='notion-article' className={`mx-auto overflow-hidden ${className || ''}`}>

      <NotionRenderer
        recordMap={post?.blockMap}
        mapPageUrl={mapPageUrl}
        mapImageUrl={mapImgUrl}
        components={{
          Code,
          Collection,
          Equation,
          Modal,
          Pdf,
          Tweet
        }}
      />

      <AdEmbed />
      <PrismMac />
    </div>
  )
}

/**
 * 页面的数据库链接禁止跳转，只能查看
 */
const processDisableDatabaseUrl = () => {
  console.log("数据库链接禁止跳转，只能查看");
  if (isBrowser) {
    const links = document.querySelectorAll('.notion-table a')
    for (const e of links) {
      e.removeAttribute('href')
    }
  }
}

/**
 * gallery视图，点击后是放大图片还是跳转到gallery的内部页面
 */
const processGalleryImg = zoom => {
  setTimeout(() => {
    if (isBrowser) {
      const imgList = document?.querySelectorAll(
        '.notion-collection-card-cover img'
      )
      if (imgList && zoom) {
        for (let i = 0; i < imgList.length; i++) {
          zoom.attach(imgList[i])
        }
      }

      const cards = document.getElementsByClassName('notion-collection-card')
      for (const e of cards) {
        e.removeAttribute('href')
      }
    }
  }, 800)
}

/**
 * 根据url参数自动滚动到锚位置
 */
const autoScrollToHash = () => {
  setTimeout(() => {
    // 跳转到指定标题
    const needToJumpToTitle = window.location.hash
    if (needToJumpToTitle) {
      const tocNode = document.getElementById(window.location.hash.substring(1))
      if (tocNode && tocNode?.className?.indexOf('notion') > -1) {
        tocNode.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }
  }, 180)
}

/**
 * 将id映射成博文内部链接。
 * @param {*} id
 * @returns
 */
const mapPageUrl = id => {
  // return 'https://www.notion.so/' + id.replace(/-/g, '')
  return '/' + id.replace(/-/g, '')
}

/**
 * 缩放
 * @returns
 */
function getMediumZoomMargin() {
  const width = window.innerWidth

  if (width < 500) {
    return 8
  } else if (width < 800) {
    return 20
  } else if (width < 1280) {
    return 30
  } else if (width < 1600) {
    return 40
  } else if (width < 1920) {
    return 48
  } else {
    return 72
  }
}

// 代码
const Code = dynamic(
  () =>
    import('react-notion-x/build/third-party/code').then(async m => {
      return m.Code
    }),
  { ssr: false }
)

// 公式
const Equation = dynamic(
  () =>
    import('@/components/Equation').then(async m => {
      // 化学方程式
      await import('@/lib/plugins/mhchem')
      return m.Equation
    }),
  { ssr: false }
)

// 原版文档
// const Pdf = dynamic(
//   () => import('react-notion-x/build/third-party/pdf').then(m => m.Pdf),
//   {
//     ssr: false
//   }
// )
const Pdf = dynamic(() => import('@/components/Pdf').then(m => m.Pdf), {
  ssr: false
})

// 美化代码 from: https://github.com/txs
const PrismMac = dynamic(() => import('@/components/PrismMac'), {
  ssr: false
})

/**
 * tweet嵌入
 */
const TweetEmbed = dynamic(() => import('react-tweet-embed'), {
  ssr: false
})

/**
 * 文内google广告
 */
const AdEmbed = dynamic(
  () => import('@/components/GoogleAdsense').then(m => m.AdEmbed),
  { ssr: true }
)

const Collection = dynamic(
  () =>
    import('react-notion-x/build/third-party/collection').then(
      m => m.Collection
    ),
  {
    ssr: true
  }
)

const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then(m => m.Modal),
  { ssr: false }
)

const Tweet = ({ id }) => {
  return <TweetEmbed tweetId={id} />
}

export default NotionPage
