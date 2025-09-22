import { getPreferenceValues } from '@raycast/api'
import _axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(_axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })
const proxyUrl = getPreferenceValues<Preferences>().proxyUrl
// get protocol, host, port from proxyUrl
if (proxyUrl) {
  try {
    const url = new URL(proxyUrl)
    const protocol = url.protocol.replace(':', '')
    const host = url.hostname
    const port = Number.parseInt(url.port, 10)
    if (protocol && host && port) {
      console.log(`Using proxy: ${protocol}://${host}:${port}`)
      _axios.defaults.proxy = { protocol, host, port }
    }
  }
  catch {
    console.error('Invalid proxy URL:', proxyUrl)
  }
}

const axios = _axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  },
  timeout: 20000,
})

export default axios
