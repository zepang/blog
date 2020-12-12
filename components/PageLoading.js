import Layout from './Layout'
import Styles from '../styles/PageLoading.module.css'

export default function PageLoading () {
  return (
    <Layout>
      <div>
        <div className={Styles.loader}></div>
      </div>
    </Layout>
  )
}