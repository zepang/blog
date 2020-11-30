import Head from 'next/head'
import styles from '../styles/Home.module.css'
import ReactMarkdown from 'react-markdown'
import fs from 'fs'
import path from 'path'
import remark from 'remark'
import frontmatter from 'remark-frontmatter'

export default function Home ({ posts }) {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ul>
          {
            posts.map(post => (
              <li key={post}>
                <span className={styles.titleWrapper}>
                  <a className={styles.title}>{post}</a>
                </span>
                <span className={styles.date}></span>
             </li>
            ))
          }
        </ul>
      </main>
    </div>
  )
}

export async function getStaticProps () {
  const postsDirectory = path.resolve(process.cwd(), 'posts')
  const posts = fs.readdirSync(postsDirectory).filter(name => {
    return /\.md$/.test(path.extname(name))
  }).map(name => {
    const markdown = fs.readFileSync(`${postsDirectory}/${name}`, 'utf8')
    // const contents = await remark().use(frontmatter, ['yaml']).process(markdown, (err, file) => {
    //   console.error(err || file)
    //   console.log(String(file))
    // })
    // console.log(contents)
    console.log(typeof markdown)
    return markdown
  })

  const allPost = []

  for (let post of posts) {
    const contents = await remark().use(frontmatter, ['yaml', 'toml']).process(post, (err, file) => {
      console.error(err || file)
      console.log(String(file))
    })

    allPost.push(contents)
  }

  console.log(allPost)
  
  return {
    props: {
      posts
    }
  }
}

// export default function Home() {
//   return (
//     <div className={styles.container}>
//       <Head>
//         <title>Create Next App</title>
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       <main className={styles.main}>
//         <h1 className={styles.title}>
//           Welcome to <a href="https://nextjs.org">Next.js!</a>
//         </h1>

//         <p className={styles.description}>
//           Get started by editing{' '}
//           <code className={styles.code}>pages/index.js</code>
//         </p>

//         <div className={styles.grid}>
//           <a href="https://nextjs.org/docs" className={styles.card}>
//             <h3>Documentation &rarr;</h3>
//             <p>Find in-depth information about Next.js features and API.</p>
//           </a>

//           <a href="https://nextjs.org/learn" className={styles.card}>
//             <h3>Learn &rarr;</h3>
//             <p>Learn about Next.js in an interactive course with quizzes!</p>
//           </a>

//           <a
//             href="https://github.com/vercel/next.js/tree/master/examples"
//             className={styles.card}
//           >
//             <h3>Examples &rarr;</h3>
//             <p>Discover and deploy boilerplate example Next.js projects.</p>
//           </a>

//           <a
//             href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//             className={styles.card}
//           >
//             <h3>Deploy &rarr;</h3>
//             <p>
//               Instantly deploy your Next.js site to a public URL with Vercel.
//             </p>
//           </a>
//         </div>
//       </main>

//       <footer className={styles.footer}>
//         <a
//           href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Powered by{' '}
//           <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
//         </a>
//       </footer>
//     </div>
//   )
// }
