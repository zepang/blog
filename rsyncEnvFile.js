const execa = require('execa')
const path = require('path')
const serverConfig = require('./server.config')

(async function startDeploy () {
  let { stdout } = await execa('rsync', ['-r', '.env.production.local', `${serverConfig.user}@${serverConfig.host}:${serverConfig.path}`, '--progress', '-vv'])
  console.log(stdout)
})()