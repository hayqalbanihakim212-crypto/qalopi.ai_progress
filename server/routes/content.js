import { Router } from 'express'
import { getContent, publicContent } from '../lib/content.js'
import { getFunding } from '../lib/funding.js'

const r = Router()

r.get('/content', async (req, res, next) => {
  try { res.json(publicContent(await getContent())) } catch (error) { next(error) }
})

r.get('/funding', async (req, res, next) => {
  try { res.json(await getFunding()) } catch (error) { next(error) }
})

export default r
