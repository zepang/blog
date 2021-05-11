---
title: 'NPM:如何指定发包的registry?'
date: '2021-03-22'
---

# toc

There's multiple ways to accomplish this.

1) use npm config to set the registry globally:

```
npm config set registry http://nexus.dsv.myhost/nexus/repository/npmjs
```

2) use npm config to set the registry for the package scope:

```
npm config set @<your scope here>:registry http://nexus.dsv.myhost/nexus/repository/npmjs
```

3) configure your package.json with a publish config:

```json
{
  ...
  "publishConfig": {
    "registry": "http://nexus.dsv.myhost/nexus/repository/npmjs"
  },
  ...
}
```

4) use npmrc to configure the registry

```
registry=http://nexus.dsv.myhost/nexus/repository/npmjs
```