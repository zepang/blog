import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Login ({ defaulSiteOrigin }) {
  const [siteOrigin, setSiteOrigin] = useState('')

  useEffect(() =>{
    setSiteOrigin(location.origin)
  }, [])

  return (
     <Link href={`https://github.com/login/oauth/authorize?client_id=1f7c31836146cca48edc&redirect_uri=${siteOrigin ? siteOrigin : defaulSiteOrigin}/api/auth/redirect`}>
      <a>
        <button className={`block-inline text-white bg-green-400 p-4 hover:bg-green-500`}>
          github authorcation
        </button>
      </a>
    </Link>
  )
}

Login.getInitialProps = function () {
  console.log('process.env.TEST', process.env.TEST)
  return {
    props: {
      defaulSiteOrigin: ''
    }
  }
}