import { useState } from 'react'

export default function usaPagination (allPosts, perPage = 10) {
  const [currentPage, setCurrentPage] = useState(1)
  const maxPage = Math.ceil(allPosts.length / perPage)
  const next = () => setCurrentPage((currentPage) => Math.min((currentPage + 1), maxPage))
  
  // 伪造的请求文章的逻辑，暂时放在这里
  let timer
  let delay = 1000
  const getPosts = () => new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      resolve(allPosts.slice(0, currentPage * perPage))
      clearTimeout(timer)
    }, delay)
  })

  return { currentPage, maxPage, getPosts, next }
}