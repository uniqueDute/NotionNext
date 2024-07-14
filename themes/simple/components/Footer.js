import DarkModeButton from '@/components/DarkModeButton'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'


/**
 * 页脚
 * @param {*} props
 * @returns
 */
export default function Footer(props) {
  const { isDarkMode } = useGlobal()
  const newStatus = !isDarkMode;
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate = parseInt(since) < currentYear ? since + '-' + currentYear : currentYear
  return (
    <footer className="relative w-full px-6 border-t ${newStatus ? 'bg-white' : 'bg-black'}`}" id="footers">
      <DarkModeButton className="text-center pt-4" />

      <div className="container mx-auto max-w-4xl py-6 md:flex flex-wrap md:flex-no-wrap md:justify-between items-center text-sm">
        <div className="text-center footer-text ${newStatus ? 'text-white' : 'text-black'}`}"> &copy;{`${copyrightDate}`} {siteConfig('AUTHOR')}. All rights reserved.</div>
        <div className="md:p-0 text-center md:text-right text-xs footer-text ${newStatus ? 'text-white' : 'text-black'}`}">
          {/* 右侧链接 */}
          {siteConfig('BEI_AN') && (
            <a href="https://beian.miit.gov.cn/" className=" dark:text-gray-200 no-underline hover:underline ml-4 footer-text ${newStatus ? 'text-white' : 'text-black'}`}">
              {siteConfig('BEI_AN')}
            </a>
          )}
          <span className="no-underline ml-4 footer-text ${newStatus ? 'text-white' : 'text-black'}`}">
            Powered by
            <a href="https://github.com/tangly1024/NotionNext" className="hover:underline footer-text ${newStatus ? 'text-white' : 'text-black'}`}">
              {' '}
              NotionNext {siteConfig('VERSION')}{' '}
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
