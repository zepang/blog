import Styles from '../styles/PageLoading.module.css'

export default function Loading () {
  return (
    <div className={`h-24`}>
      <div className={Styles.loader}></div>
    </div>
  )
}