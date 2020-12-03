import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { getAllPosts } from '../utils'
import Link from 'next/link'

export default function Home ({ posts }) {
  return (
    <div className={`container mx-auto px-4`}>
      <h1>#posts</h1>
      <main className={styles.main}>
        <ul>
          {
            posts.map((post, i) => (
              <li key={i}>
                <Link href={`/post/${post.meta.filename}`}>
                  <a>
                    <span className={styles.titleWrapper}>
                      <a className={styles.title}>{post.meta.title}</a>
                    </span>
                    <span className={styles.date}>{post.meta.date}</span>
                  </a>
                </Link>
             </li>
            ))
          }
        </ul>
      </main>
    </div>
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

