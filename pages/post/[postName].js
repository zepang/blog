import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getAllPosts } from '../../utils'
import ReactMarkdown from 'react-markdown'
import Layout from '../../components/Layout'
import CodeBlock from '../../components/CodeBlock'
import PageLoading from '../../components/PageLoading'
import styles from '../../styles/post.module.scss'

export default function post ({ post = {} }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const oldTimeStamp = Date.now()

  const { current, next, prev } = post

  useEffect(() => {
    const newTimeStamp = Date.now()
    let delay = 1500 - (newTimeStamp - oldTimeStamp)

    if (delay < 0) {
      delay = newTimeStamp - oldTimeStamp
    }

    const timer = setTimeout(() => {
      setLoading(false)
      clearTimeout(timer)
    }, delay)
  }, [])
  return (
    loading ? (<PageLoading></PageLoading>) : (<Layout>
       <div className={`pt-8 mb-24`}>
          <h1 className={`py-8 text-6xl font-bold tracking-widest`}>#{router.query.postName}</h1>
            <div id={`article`} className={`px-6`}>
            {
              current && current.content && (<ReactMarkdown source={current.content} renderers={{ code: CodeBlock }}></ReactMarkdown>)
            }
          </div>
          <div className={`flex justify-between items-center px-6 py-12`}>
            <div className={`${styles.prevPost}`}>
              {
                prev && prev.meta && (
                  <Link href={`/post/${next.meta.filename}`}>
                    <div className={`font-bold text-left cursor-pointer hover:underline`}>上一篇：{prev.meta.title}</div>
                  </Link>
                )
              }
            </div>
            <div className={`${styles.nextPost}`}>
              {
                next && next.meta && (
                  <Link href={`/post/${next.meta.filename}`}>
                    <div className={`font-bold text-right cursor-pointer hover:underline`}>下一篇：{next.meta.title}</div>
                  </Link>
                )
              }
            </div>
          </div>
        </div>
    </Layout>)
  ) 
}

export async function getStaticProps (contxt) {
  const posts = getAllPosts()
  const current = posts.find(post => post.meta.filename === contxt.params.postName)
  const next = posts.find(post => post.index === current.index + 1)
  const prev = posts.find(post => post.index === current.index - 1)
  console.log(current, next, prev)
  return {
    props: {
      post: {
        current: current || '',
        next: next || '',
        prev: prev || ''
      }
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