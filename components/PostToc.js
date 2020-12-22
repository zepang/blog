import styles from '../styles/PostToc.module.scss'

export default function PostToc ({ toc }) {
  return (
    <div id={`${styles.toc}`} className={`bg-gray-100 px-4 py-6 italic`}>
      <strong>文章概览:</strong>
      <div className={`mt-4 px-4`} dangerouslySetInnerHTML={{ __html: toc }}></div>
    </div>
  )
}