import WebApp from './classes/WebApp'

const webApp = new WebApp()
const PORT = process.env.PORT || 5000

webApp.startServer(PORT)