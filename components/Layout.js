import Header from '../components/Header'

export default function Layout ({ children }) {
  return (
    <div>
      <Header></Header>
      <main className={`w-full max-w-screen-xl mx-auto px-6`}>
        <div className={`pt-16`}>
          {children}
        </div>
      </main>
    </div>
  )
}