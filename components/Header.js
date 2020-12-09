import Head from "next/head";

export default function Header () {
  return (
    <header className={`fixed top-0 inset-x-0 z-100 flex justify-center items-center bg-white border-b border-grey-200 h-16`}>
      <div className={`w-full max-w-screen-xl px-6`}>
        <h1 className={`text-4xl text-center font-bold`}>wkao</h1>
      </div>
    </header>
  )
}