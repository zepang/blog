export default function Footer () {
  return (
    <header className={`z-100 flex justify-center items-center bg-transparent border-b border-grey-200 h-16`}>
      <div className={`w-full h-full flex items-center justify-start max-w-screen-xl px-6`}>
        <div style={{width: '300px',margin: '0 auto', padding: '20px 0'}}>
          <a target="_blank" href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36073302000148" style={{display: 'inline-block', 'text-decoration': 'none', height: '20px', 'line-height': '20px'}}>
            <img src="/备案图标.png" style={{float: 'left'}}/>
            <p style={{float: 'left', height: '20px', 'line-height': '20px', margin: '0px 0px 0px 5px', color: '#939393'}}>赣公网安备 36073302000148号</p>
          </a>
        </div>
      </div>
    </header>
  )
}