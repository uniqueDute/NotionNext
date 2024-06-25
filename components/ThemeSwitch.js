import { useGlobal } from '@/lib/global'
import LANGS from '@/lib/lang'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Draggable } from './Draggable'

/**
 *
 * @returns 主题切换
 */
const ThemeSwitch = () => {
  const { lang, changeLang, locale } = useGlobal()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // 语言切换处理函数
  const onLangSelectChange = e => {
    document.ontouchmove = document.ontouchend = document.onmousemove = document.onmouseup = null
    const newLang = e.target.value
    changeLang(newLang)
  }

  return (
    <>
      <Draggable>
        <div
          id='draggableBox'
          style={{ left: '0px', top: '80vh' }}
          className='fixed group hover:scale-105 transition-all space-y-2 overflow-hidden z-50 p-3 flex flex-col items-start dark:text-white bg-white dark:bg-black rounded-xl shadow-lg '>
          
          {/* 翻译按钮 */}
          <div className='text-sm flex items-center group-hover:w-32 transition-all duration-200'>
            <i className='fa-solid fa-language w-5' />
            <div className='w-0 group-hover:w-24 transition-all duration-200 overflow-hidden'>
              <label htmlFor='langSelect' className='sr-only'>
                选择语言：
              </label>
              <select
                id='langSelect'
                value={lang}
                onChange={onLangSelectChange}
                name='themes'
                className='pl-1 bg-gray-50 dark:bg-black appearance-none outline-none dark:text-white uppercase cursor-pointer'>
                {Object.keys(LANGS)?.map(t => {
                  return (
                    <option key={t} value={t}>
                      {LANGS[t].LOCALE}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>
      </Draggable>

      {/* 切换主题加载时的全屏遮罩 */}
      <div
        className={`${isLoading ? 'opacity-90 ' : 'opacity-0'} 
            w-screen h-screen glassmorphism bg-black text-white shadow-text flex justify-center items-center
            transition-all fixed top-0 left-0 pointer-events-none duration-1000 z-50 shadow-inner`}>
        <i className='text-3xl mr-5 fas fa-spinner animate-spin' />
      </div>
    </>
  )
}

export default ThemeSwitch
