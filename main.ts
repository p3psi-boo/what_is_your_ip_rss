import { Hono } from 'hono'
import { getConnInfo } from 'hono/cloudflare-workers'

const curlUserAgent = 'curl/7.81.0'
const ipInfoUrl = 'https://ipinfo.io'

const app = new Hono()


app.get('/', async (c) => {
  const info = getConnInfo(c)
  const ip = info.remote.address
  if (!ip) {
    return c.text('No IP address found', 404)
  }
  const ipInfo = await fetch(`${ipInfoUrl}/${ip}`, {
    headers: {
      'User-Agent': curlUserAgent,
    },
  })
  const desc = await ipInfo.text()
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<title>IP Info: ${ip}</title>
<channel>
  <item>
    <title>${ip}</title>
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

Deno.serve(app.fetch)
