import Link from 'next/link'

export default function PostListItem ({post}) {
  return (
    <li 
      className={`px-6 sm:px-8 block my-8 py-8 shadow-sm bg-white hover:bg-grey-500 xl:px-16`}
    >
      <Link href={`/post/${post.name}`}>
        <a className={`min-h-24 sm:h-24 flex sm:items-stretch flex-col-reverse`}>
          <div className={`flex items-center`}>
            <span className={`inline-block text-2l font-bold text-gray-500`}>{post.frontmatter?.date}</span>
          </div>
          <div style={{width: '100%', minHeight: '1px'}} className={`bg-gray-200 my-4`}></div>
          <div className={`flex items-center`}>
            <span className={`inline-block text-xl font-bold tracking-widest`}>
              {post.frontmatter?.title}
            </span>
          </div>
        </a>
      </Link>
  </li>
  )
}