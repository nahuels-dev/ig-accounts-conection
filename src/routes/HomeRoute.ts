import express, { Router, Request, Response } from 'express'

const homeRoute = express.Router()

homeRoute.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the homepage!')
});

export default homeRoute