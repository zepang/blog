import Link from 'next/link'

export default function Login () {
  return (
    <Link href={`https://github.com/login/oauth/authorize?client_id=1f7c31836146cca48edc&redirect_uri=${location.origin}/api/auth/redirect`}>
      <a>
        <button className={`block-inline text-white bg-green-400 p-4 hover:bg-green-500`}>
          github authorcation
        </button>
      </a>
    </Link>
  )
}