import dynamic from 'next/dynamic'
import 'nprogress/nprogress.css'
import 'tailwindcss/tailwind.css'
import '../styles/globals.scss'
import 'highlight.js/styles/atelier-cave-dark.css'
import '../styles/highlight-reset.scss'

const TopProgressBar = dynamic(
  () => {
    return import('../components/TopProgressBar')
  },
  { ssr: false }
)

function MyApp({ Component, pageProps }) {
  return <>
    <div className={`min-h-full h-full`}>
      <TopProgressBar></TopProgressBar> 
      <Component {...pageProps} />
    </div>
  </>
}

export default MyApp
