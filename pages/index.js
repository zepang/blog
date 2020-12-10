import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getAllPosts } from '../utils'
import Link from 'next/link'
import Header from '../components/Header'
import Layout from '../components/Layout'

export default function Home ({ posts }) {
  return (
    <Layout>
      <div className={`my-8 flex items-center`}>
        <h2 className={`text-2xl leading-8 font-bold tracking-tight`}>#文章列表</h2>
      </div>
      <div className={`container`}>
        <ul>
          {
            posts.map((post, i) => (
              <li 
                key={i}
                className={`block my-8 py-8 shadow bg-white`}
              >
                <Link href={`/post/${post.meta.filename}`}>
                  <a className={`h-24 flex items-stretch`}>
                    <div className={`flex items-center px-16 border-r`}>
                      <span className={`inline-block text-2l font-bold text-gray-500`}>{post.meta.date}</span>
                    </div>
                    <div className={`flex items-center px-16`}>
                      <span className={`inline-block text-2xl font-bold tracking-widest`}>
                        {post.meta.title}
                      </span>
                    </div>
                  </a>
                </Link>
            </li>
            ))
          }
        </ul>
      </div>
    </Layout>
  )
}

export async function getStaticProps () {
  const posts = getAllPosts()
  
  return {
    props: {
      posts
    }
  }
}

