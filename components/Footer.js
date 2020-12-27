export default function Footer () {
  return (
    <footer className={`flex justify-center items-center bg-transparent border-b border-grey-200 h-16`}>
      <div className={`w-full h-full flex items-center justify-center max-w-screen-xl px-6`}>
        <div>
          <a className={`block flex items-center`} target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36073302000148">
            <img src="/备案图标.png" />
            <p className={`pl-2 flex flex-wrap text-gray-400 text-sm sm:text-base`}>
              <span>赣公网安备 36073302000148号 </span>|
              <span> 赣ICP备2020014177号-1</span>  
            </p>
          </a>
        </div>
      </div>
    </footer>
  )
}