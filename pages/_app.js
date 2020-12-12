import dynamic from 'next/dynamic'
import 'nprogress/nprogress.css'
import '../styles/globals.css'
import 'highlight.js/styles/atelier-cave-dark.css'
import '../styles/highlight-reset.css'

const TopProgressBar = dynamic(
  () => {
    return import('../components/TopProgressBar')
  },
  { ssr: false },
)

function MyApp({ Component, pageProps }) {
  return <>
    <TopProgressBar></TopProgressBar> 
    <Component {...pageProps} />
  </>
}

export default MyApp
