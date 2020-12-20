import Link from 'next/link'
import usePagination from '../hooks/usePagination'
import { useEffect , useState } from 'react'
import Loading from '../components/Loading'
import Layout from '../components/Layout'
const allMdFile = require('../summary.json')

export default function Home ({ posts }) {
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
      <div className={`container`}>
        <ul>
          {
            currentPosts.map((post, i) => (
              <li 
                key={i}
                className={`block my-8 py-8 shadow-sm bg-white hover:bg-grey-500`}
              >
                <Link href={`/post/${post.name}`} prefetch={false}>
                  <a className={`h-24 flex items-stretch`}>
                    <div className={`flex items-center px-16 border-r`}>
                      <span className={`inline-block text-2l font-bold text-gray-500`}>{post.frontmatter.date}</span>
                    </div>
                    <div className={`flex items-center px-16`}>
                      <span className={`inline-block text-2xl font-bold tracking-widest`}>
                        {post.frontmatter.title}
                      </span>
                    </div>
                  </a>
                </Link>
            </li>
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
  return {
    props: {
      posts: allMdFile
    }
  }
}

