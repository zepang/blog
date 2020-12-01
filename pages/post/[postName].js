import { useRouter } from 'next/router'
import { getAllPosts, getPost } from '../../utils'
import ReactMarkdown from 'react-markdown'

export default function post ({ post = {} }) {
  const router = useRouter()

  return (
    <div>
      <h1>这是文章{router.query.postName}的详情页面</h1>
      {post.content && (<ReactMarkdown children={post.content}></ReactMarkdown>)}
    </div>
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