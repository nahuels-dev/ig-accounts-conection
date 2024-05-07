import express, { Express, Request, Response, NextFunction } from 'express'
import axios from 'axios'
import path from 'path'
import homeRoute from '../routes/HomeRoute'
import router from '../routes/WebHooks'
import { createClient } from '@supabase/supabase-js'

class WebApp {
  private webApp: Express
  private supabase: any

  constructor() {
    this.webApp = express()
    this.supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '')


    this.webApp.use(express.urlencoded({ extended: true }))
    this.webApp.use(express.json())
    this.webApp.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`Path ${req.path} with Method ${req.method}`)
      next()
    })

    this.webApp.use('/', homeRoute)
    this.webApp.use('/facebook', router)

    this.webApp.post('/auth/instagram', this.authInstagram.bind(this))
    this.webApp.get('/auth/instagram/callback', this.instagramCallback.bind(this))
  }

  private async searchByScope(data: any, scope: string): Promise<any> {
    const granularScopes = data.data.granular_scopes

    for (const object of granularScopes) {
      if (object.scope === scope) {
        return object
      }
    }

    return null
  }

  private async saveData(access_token: string, tokenInfo: any, res: Response): Promise<void> {
    const user_id = tokenInfo.data.data.user_id
    const pagesScope = await this.searchByScope(tokenInfo.data, 'pages_show_list')
    const page_id = pagesScope ? pagesScope.target_ids[0] : null
  
    const instagramScope = await this.searchByScope(tokenInfo.data, 'instagram_basic')
    const ig_id = instagramScope ? instagramScope.target_ids[0] : null

    const accountInfo = {
      user_id,
      page_id,
      ig_id,
      access_token,
      user_app_id: 'email@domain.com'
    }

    let { data } = await this.supabase
      .from('accounts')
      .select()
      .eq('user_app_id', "email@domain.com")

    if (data && data.length > 0) {
      const { error } = await this.supabase
        .from('accounts')
        .delete()
        .eq('user_app_id', "email@domain.com")
    }
    const { error } = await this.supabase
      .from('accounts')
      .insert(accountInfo)

    res.send({ action: "close" })
  }

  private async authInstagram(req: Request, res: Response): Promise<void> {
    const accessToken = req.body.access_token

    const debugTokenURL = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${process.env.APP_ID}|${process.env.APP_SECRET}`

    const tokenInfo = await axios.get(debugTokenURL)

    const pagesList = tokenInfo.data.data.granular_scopes[0].target_ids

    pagesList.forEach(async (pageId: string) => {
      const subscriptionUrl = `https://graph.facebook.com/v13.0/${pageId}/subscribed_apps`

      const pageToken = await axios.get(`https://graph.facebook.com/${pageId}?fields=access_token&access_token=${accessToken}`)

      const shortLiveToken = await axios.get(`https://graph.facebook.com/v2.8/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.APP_ID}&client_secret=${process.env.APP_SECRET}&fb_exchange_token=${accessToken}`)

      const permanentToken = await axios.get(`https://graph.facebook.com/${pageId}?fields=access_token&access_token=${shortLiveToken.data.access_token}`)

      await this.saveData(permanentToken.data.access_token, tokenInfo, res)

      const subscriptionData = {
        callback_url: process.env.CALLBACK_URL,
        subscribed_fields: 'messages',
        include_values: 'true',
        verify_token: 'string',
      }

      axios.post(subscriptionUrl, subscriptionData, {
        params: {
          access_token: pageToken.data.access_token,
        },
      }).then(response => {
        console.log('Subscription successful:', response.data)
      }).catch(error => {
        console.error('Error during subscription:', error.response.data)
      })
    })
  }

  private instagramCallback(req: Request, res: Response): void {
    res.sendFile(path.join(__dirname, 'views/token.html'))
  }

  public startServer(port: number | string): void {
    this.webApp.listen(port, () => {
      console.log(`Server is up and running at ${port}`)
    })
  }
}

export default WebApp