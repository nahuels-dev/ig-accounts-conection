import axios, { AxiosRequestConfig } from 'axios'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

class Messenger {
  private supabase: any
  private accessToken: string
  private pageId: string

  constructor() {
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '')
    this.accessToken = process.env.TOKEN || ''
    this.pageId = process.env.PAGE_ID || ''
  }

  async sendMessage(senderId: string, recipient: string, message: string): Promise<number>{
    try {
      const { data } = await this.supabase.from('accounts').select().eq('ig_id', recipient)
      if (data.length > 0) {
        const account = data[0]
        const options: AxiosRequestConfig = {
          method: 'POST',
          url: `https://graph.facebook.com/v11.0/${account.page_id}/messages`,
          params: {
            access_token: account.access_token,
            recipient: JSON.stringify({ 'id': senderId }),
            messaging_type: 'RESPONSE',
            message: JSON.stringify({ 'text': message })
          }
        }

        if (message !== "") {
          const response = await axios.request(options)
          return response.status === 200 && response.statusText === 'OK' ? 1 : 0
        }else{
          return 0
        }
      } else {
        return 0
      }
    } catch (error) {
      console.error(error)
      return 0
    }
  }
}

export default Messenger
