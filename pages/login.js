import Link from 'next/link'

export default function Login ({ siteOrigin }) {
  return (
     <Link href={`https://github.com/login/oauth/authorize?client_id=1f7c31836146cca48edc&redirect_uri=${siteOrigin}/api/auth/redirect`}>
      <a>
        <button className={`block-inline text-white bg-green-400 p-4 hover:bg-green-500`}>
          github authorcation
        </button>
      </a>
    </Link>
  )
}

Login.getInitialProps = function () {
  const siteOrigin = process.env.SITE_ORIGIN
  console.log(process.env.SITE_ORIGIN)
  console.log(process.env.GITHUB_CLIENT_ID)
  console.log(process.env.GITHUB_CLIENT_SECRET)
  return {
    siteOrigin
  }
}