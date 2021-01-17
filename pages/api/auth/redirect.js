import { serialize } from 'cookie'
import axios from 'axios'

export default async (req, res) => {
  let { code } = req.query
  
  try {
    let { data: result } = await axios({
      method: 'POST',
      url: `https://github.com/login/oauth/access_token`,
      headers: {
        'Accept': 'application/json',
      },
      data: {
        code: code,
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
      }
    })

    let options = {
      httpOnly: true,
      path: '/'
    }

    if (result.access_token) {
      res.setHeader('Set-Cookie', serialize('access_token', String(result.access_token), options))
    }
    res.writeHead(302, { Location: '/' })
    res.end()
  } catch (error) {
    res.send(error)
  }
}