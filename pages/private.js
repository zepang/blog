import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import styles from '../styles/Private.module.scss'
// import data from '../private/FeHelper-20201226121201.json'

export default function Private () {
  let [list, setList] = useState([])
  let [page, setPage] = useState(1)
  useEffect(async () => {
    let res = await fetch(`/api/private?page=${page}`).then(res => res.json()  )    
    setList([...list, ...res.response.themeMessage])
  }, [page])
  return (
    <Layout>
      {
        list.length ? (
          <ul className={`${styles.privateList}`}>
            {
              list.map((item, i) => (
                <li className={`bg-white mb-20 p-8 shadow`} key={item.themeMsg.id}>
                  <h1 className={`text-2xl font-bold mb-6`}>第: {i} 篇 ID: {item.themeMsg.id} {item.themeMsg.title}</h1>
                  <div dangerouslySetInnerHTML={{ __html: item.themeMsg.content.replace('<br>', '') }}></div>
                </li>
              ))
            }
          </ul>
        ) : (<div>loading</div>)
      }
      <div className={`bg-green-500 text-center cursor-pointer text-white text-2xl`} onClick={() => setPage(page + 1)}>下一页</div>
    </Layout>
  )
}