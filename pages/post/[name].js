import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PageLoading from '../../components/PageLoading'
import styles from '../../styles/post.module.scss'
import 'prismjs/themes/prism-tomorrow.css'
const allMdFile = require('../../summary.json')

export default function post ({ post = {} }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const oldTimeStamp = Date.now()

  const { contents, next, prev } = post

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
          <h1 className={`py-8 text-6xl font-bold tracking-widest`}>#{router.query.name}</h1>
            <div id={`article`} className={`px-6`}>
            {/* {
              current && current.content && (<ReactMarkdown source={current.content} renderers={{ code: CodeBlock }}></ReactMarkdown>)
            } */}
            <div dangerouslySetInnerHTML={{ __html: contents }}></div>
          </div>
          <div className={`flex justify-between items-center px-6 py-12`}>
            <div className={`${styles.prevPost}`}>
              {
                prev && (
                  <Link href={`/post/${prev}`}>
                    <div className={`font-bold text-left cursor-pointer hover:underline`}>上一篇：{prev.title}</div>
                  </Link>
                )
              }
            </div>
            <div className={`${styles.nextPost}`}>
              {
                next && (
                  <Link href={`/post/${next}`}>
                    <div className={`font-bold text-right cursor-pointer hover:underline`}>下一篇：{next.title}</div>
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
  let next, prev

  let current = allMdFile.find(file => file.name === contxt.params.name)

  if (current.prev) {
    prev = allMdFile.find(file => file.name === current.prev.name)
  }

  if (current.next) {
    next = allMdFile.find(file => file.name === current.next.name)
  }

  return {
    props: {
      post: {
        contents: current && current.contents || '',
        next: next && next.frontmatter || '',
        prev: prev && prev.frontmatter || ''
      }
    }
  }
}

export async function getStaticPaths () {
  const paths = allMdFile.map(({ name }) => {
    return {
      params: { 
        // 兼容中文命名需要使用 encodeURIComponent，否则无法根据URL的文件名找到对应文件
        name: encodeURIComponent(name) 
      }
    }
  })

  return {
    paths,
    // 不存在的文章显示404
    fallback: false
  }
} 