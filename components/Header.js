import Link from 'next/link'
import styles from '../styles/Header.module.scss'

export default function Header () {
  return (
    <header className={`fixed top-0 inset-x-0 z-100 flex justify-center items-center bg-white border-b border-grey-200 h-16`}>
      <div className={`w-full h-full flex items-center justify-start max-w-screen-xl px-6`}>
        <Link href="/">
          <h1 className={`h-full text-3xl text-left font-bold cursor-pointer`}>
            <span className={`${styles.title} inline-block h-full flex items-center px-4 text-white`}>
              wkao.top
            </span>
          </h1>
        </Link>
      </div>
    </header>
  )
}