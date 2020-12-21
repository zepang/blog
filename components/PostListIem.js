import Link from 'next/link'

export default function PostListItem ({post}) {
  return (
    <li 
      className={`block my-8 py-8 shadow-sm bg-white hover:bg-grey-500`}
    >
      <Link href={`/post/${post.name}`}>
        <a className={`h-24 flex items-stretch`}>
          <div className={`flex items-center px-16 border-r`}>
            <span className={`inline-block text-2l font-bold text-gray-500`}>{post.frontmatter?.date}</span>
          </div>
          <div className={`flex items-center px-16`}>
            <span className={`inline-block text-2xl font-bold tracking-widest`}>
              {post.frontmatter?.title}
            </span>
          </div>
        </a>
      </Link>
  </li>
  )
}