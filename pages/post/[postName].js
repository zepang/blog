import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { getAllPosts, getPost } from '../../utils'
import ReactMarkdown from 'react-markdown'
import Layout from '../../components/Layout'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'

export default function post ({ post = {} }) {
  const router = useRouter()
  
  hljs.registerLanguage('javascript', javascript)

  useEffect(() => {
    hljs.initHighlighting()
  }, [])

  return (
    <Layout>
       <div className={`pt-8 mb-24`}>
        <h1 className={`py-8 text-6xl font-bold tracking-widest`}>#{router.query.postName}</h1>
        <div id={`article`} className={`px-12`}>{post.content && (<ReactMarkdown children={post.content}></ReactMarkdown>)}</div>
      </div>
    </Layout>
  ) 
}

export async function getStaticProps (contxt) {
  let post = getPost(contxt.params.postName)

  return {
    props: {
      post
    }
  }
}

export async function getStaticPaths () {
  const posts = getAllPosts()
  const paths = posts.map(post => {
    return {
      params: { 
        // 兼容中文命名需要使用 encodeURIComponent，否则无法根据URL的文件名找到对应文件
        postName: encodeURIComponent(post.meta.filename) 
      }
    }
  })

  return {
    paths,
    // 不存在的文章显示404
    fallback: false
  }
} 