import Styles from '../styles/PageLoading.module.scss'

export default function Loading () {
  return (
    <div className={`h-24`}>
      <div className={Styles.loader}></div>
    </div>
  )
}