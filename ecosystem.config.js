const serverConfig = require('./server.config')
const { user, host, path } = serverConfig

module.exports = {
  apps : [{
    name: 'ssg-blog',
    script: 'npm',
    args: 'start'
  }],

  deploy : {
    production : {
      user,
      host,
      path,
      ref: 'origin/main',
      repo: 'https://github.com/zepang/blog.git',
      'pre-deploy': 'git pull',
      'pre-deploy-local': '',
      'post-setup': 'yarn install && yarn run build:production && pm2 start ecosystem.config.js --env production',
      'post-deploy': 'yarn install && yarn run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
