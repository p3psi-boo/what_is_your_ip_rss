import { Hono } from 'hono'

const curlUserAgent = 'curl/7.81.0'
const ipInfoUrl = 'https://ipinfo.io'

const app = new Hono()


app.get('/', async (c) => {
  const ip = c.env.remoteAddr.hostname
  if (!ip) {
    return c.text('No IP address found', 404)
  }
  const link = `${ipInfoUrl}/${ip}`
  const ipInfo = await fetch(link, {
    headers: {
      'User-Agent': curlUserAgent,
    },
  })
  const desc = await ipInfo.text()
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<title>Your IP Info</title>
<channel>
  <title>IP Info: ${ip}</title>
  <link>${c.req.url}</link>
  <item>
    <title>${ip}</title>
    <link>${link}</link>
    <description>
    <pre>
    <code>  
${desc}
    </code>
    </pre>
    </description>
  </item>
</channel>
</rss>`
  return c.text(rss, {
    headers: {
      'Content-Type': 'application/xml+rss'
    }
  })
})

Deno.serve((req, info) => {
  return app.fetch(req, info)
})
