import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'
import contentRoutes from './routes/content.js'

export function createApp() {
  const app = express()
  app.set('trust proxy', 1)
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(express.json({ limit: '20kb' }))
  app.use(cookieParser())
  app.use('/api/admin', adminRoutes)
  app.use('/api', contentRoutes)
  app.use('/api', publicRoutes)
  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({ error: 'Bad request body' })
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  })
  return app
}
export default createApp()
