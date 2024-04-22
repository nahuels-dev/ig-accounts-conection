import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import ChatBot from '../classes/ChatBot'
import Messenger from '../classes/Messenger'

dotenv.config()

const router = express.Router()
const chatBot = new ChatBot(process.env.OPENAI_API_KEY || '')
const messenger = new Messenger()

router.get('/', (req: Request, res: Response) => {
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
  }
})

router.post('/', async (req: Request, res: Response) => {
  try {
    let body = req.body
    if(body.entry[0].messaging[0].message){
      let query = body.entry[0].messaging[0].message.text
      let senderId = body.entry[0].messaging[0].sender.id
      let recipient = body.entry[0].messaging[0].recipient.id
      let { response } = await chatBot.chatCompletion(query)
      await messenger.sendMessage(senderId, recipient, response)
    }
  } catch (error) {
    console.log(error)
  }
  res.status(200).send('OK')
})

export default router
