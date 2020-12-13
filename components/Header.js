import Head from "next/head";

export default function Header () {
  return (
    <header className={`fixed top-0 inset-x-0 z-100 flex justify-center items-center bg-white border-b border-grey-200 h-20`}>
      <div className={`w-full flex items-center justify-center max-w-screen-xl px-6`}>
        <img className={`h-12`} src="/favicon.png" />
        <h1 className={`text-4xl text-center font-bold tracking-widest`}>.博客</h1>
      </div>
    </header>
  )
}