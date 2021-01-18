const execa = require('execa')
const path = require('path')
const serverConfig = require('./server.config')
const { user, host, path } = serverConfig

async function startDeploy () {
  await execa('rsync', ['-r', '.env.production.local', `${user}@${host}:${path}`, '--progress', '-vv'])
  const subprocess = execa('pm2', ['deploy', path.join(__dirname, 'ecosystem.config.js'), 'production', 'update'])

  (async () => {
    const {stdout} = await subprocess
    console.log('child output:', stdout)
  })()
}

startDeploy()