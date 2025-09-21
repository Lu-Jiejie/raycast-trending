import _axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(_axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })

const axios = _axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  },
  timeout: 20000,
})

export default axios
