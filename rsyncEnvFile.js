(async function startDeploy () {
  const execa = require('execa')
  const serverConfig = require('./server.config')

  let { stdout } = await execa('rsync', ['-r', '.env.production.local', 'server.config.js', `${serverConfig.user}@${serverConfig.host}:${serverConfig.path}`, '--progress', '-vv'])
  console.log(stdout)
})()