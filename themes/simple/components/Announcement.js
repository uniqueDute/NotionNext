
import dynamic from 'next/dynamic'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className }) => {
  if (!post) {
    return <></>
  }
  return <></>}
export default Announcement


