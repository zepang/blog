module.exports = {
  apps : [{
    name: 'ssg-blog',
    script: 'npm',
    args: 'start'
  }],

  deploy : {
    production : {
      user : 'root',
      host : '42.192.233.253',
      ref  : 'origin/main',
      repo : 'https://github.com/zepang/blog.git',
      path : '/root/projects/ssg-blog',
      'pre-deploy-local': '',
      'post-setup': 'yarn install && pm2 reload ecosystem.config.js --env production',
      'post-deploy' : 'yarn install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
