import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import PageLoading from '../../components/PageLoading'
import styles from '../../styles/post.module.scss'
import PostToc from '../../components/PostToc'
import 'prismjs/themes/prism-tomorrow.css'

const allMdFile = require('../../summary.json')


export default function post () {
  const router = useRouter()

  let next, prev

  let current = allMdFile.find(file => file.id === router.query.id)

  if (current.prev) {
    prev = allMdFile.find(file => file.id === current.prev.id)
  }

  if (current.next) {
    next = allMdFile.find(file => file.id === current.next.id)
  }
  const [loading, setLoading] = useState(true)
  const oldTimeStamp = Date.now()

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

    const SmoothScroll = require('smooth-scroll')

    new SmoothScroll('#toc-wrapper a[href*="#"]', {
      updateURL: false,
      offset: 80,
      speed: 300
    })
  }, [])
  return (
    loading ? (<PageLoading></PageLoading>) : (<Layout>
       {/* <PostToc toc={current?.toc}></PostToc> */}
       <div className={`mt-16 mb-24 sm:px-6 py-8 bg-white shadow`}>
          <h1 className={`py-8 px-6 text-4xl font-bold tracking-widest`}>#{current?.frontmatter?.title}</h1>
          <div id={`toc-wrapper`} className={`py-8 px-6`}>
            <PostToc toc={current?.toc}></PostToc>
          </div>
          <div id={`article`} className={`px-6`}>
          {/* {
            current && current.content && (<ReactMarkdown source={current.content} renderers={{ code: CodeBlock }}></ReactMarkdown>)
          } */}
            <div dangerouslySetInnerHTML={{ __html: current?.contents }}></div>
          </div>
          <div className={`flex justify-between items-center px-6 py-12`}>
            <div className={`${styles.prevPost}`}>
              {
                prev && (
                  <Link href={`/post/${prev?.id}`}>
                    <div className={`font-bold text-left cursor-pointer hover:underline`}>上一篇：{prev?.frontmatter?.title}</div>
                  </Link>
                )
              }
            </div>
            <div className={`${styles.nextPost}`}>
              {
                next && (
                  <Link href={`/post/${next?.id}`}>
                    <div className={`font-bold text-right cursor-pointer hover:underline`}>下一篇：{next?.frontmatter?.title}</div>
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
  return {
    props: {}
  }
}

export async function getStaticPaths () {
  const paths = allMdFile.map(({ id }) => {
    return {
      params: { 
        // 兼容中文命名需要使用 encodeURIComponent，否则无法根据URL的文件名找到对应文件
        id: encodeURIComponent(id) 
      }
    }
  })

  return {
    paths,
    // 不存在的文章显示404
    fallback: false
  }
} 