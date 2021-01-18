import usePagination from '../hooks/usePagination'
import { useEffect , useState } from 'react'
import Loading from '../components/Loading'
import Layout from '../components/Layout'
import PostListItem from '../components/PostListIem'
const posts  = require('../summary.json')

export default function Home () {
  const { next, maxPage, currentPage, getPosts } = usePagination(posts, 8)

  let prevY = 0
  let [currentPosts, setCurrentPosts] = useState([])
  let [loadingElement, setLoadingElement] = useState(null)
  let [loading, setLoading] = useState(true)

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      async entries => {
        const curY = entries[0].boundingClientRect.y

        if (curY < prevY) {
          next()
        }

        prevY = curY
      },
      { threshold: 0.5 }
    )
    if (loadingElement) {
      intersectionObserver.observe(loadingElement)
    }
  }, [loadingElement])

  useEffect(() => {
    setLoading(true)
    getPosts().then(res => {
      setCurrentPosts(res)
      setLoading(false)
    })
    
  }, [currentPage])

  return (
    <Layout>
      <div className={`my-8 flex items-center`}>
        <h2 className={`text-2xl leading-8 font-bold tracking-tight`}>#文章列表</h2>
      </div>
      <div>
        <ul>
          {
            currentPosts.map((post, i) => (
              <PostListItem post={post} key={post.id}></PostListItem>
            ))
          }
        </ul>
      </div>
      {
        (currentPage !== maxPage || loading) && (<div ref={setLoadingElement} className={`h-24`}>
          <Loading></Loading>
        </div>)
      }
    </Layout>
  )
}

export async function getStaticProps () {
  // const allMdFile = require('../summary.json')
  // const props = { posts: allMdFile }
  console.log('process.env.TEST', process.env.TEST)
  return {
    props: {}
  }
}

