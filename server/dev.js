import 'dotenv/config'
const { default: app } = await import('./app.js')
const port = process.env.PORT || 8787
app.listen(port, () => console.log('API on http://localhost:' + port))
