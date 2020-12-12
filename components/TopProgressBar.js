import Router from 'next/router'
import NProgress from 'nprogress'

let timer, state, activeRequests = 0, delay = 200

NProgress.configure({ showSpinner: false })

function load () {
  if (state === 'loading') return

  state = 'loading'

  timer = setTimeout(() => {
    NProgress.start()
  }, delay)
}

function stop () {
  if (activeRequests > 0) return

  state = 'stop'

  clearTimeout(timer)
  NProgress.set(1.0)
}

Router.events.on('routerChangeState', load)
Router.events.on('routerChangeComplete', stop)
Router.events.on('routerChangeError', stop)

const originalFetch = window.fetch

window.fetch = async function (...args) {
  if (activeRequests === 0) {
    load()
  }

  activeRequests++

  try {
    const response = await originalFetch(...args)
    return response
  } catch (error) {
    return Promise.reject(error)
  } finally {
    activeRequests -= 1
    if (activeRequests === 0) {
      stop()
    }
  }
}

export default function TopProgressBar () {
  return null
}