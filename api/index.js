require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const app = express()

// ── CORS ──
const allowed = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://salamiwala.web.app',
  'https://salamiwala.firebaseapp.com',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowed.some(o => origin.startsWith(o))) return cb(null, true)
    cb(new Error('CORS blocked: ' + origin))
  },
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── DB connection (cached for serverless) ──
let dbReady = false
async function connectDB() {
  if (dbReady) return
  await mongoose.connect(process.env.MONGODB_URI)
  dbReady = true
}
app.use(async (_req, _res, next) => {
  try { await connectDB(); next() }
  catch (e) { next(e) }
})

// ── HEALTH ──
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', app: 'SalamiWala 💸', time: new Date() }))

// ── ROUTES ──
app.use('/api/auth',   require('./routes/auth'))
app.use('/api/salami', require('./routes/salami'))

// ── 404 + Error ──
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, _req, res, _next) => res.status(500).json({ error: err.message }))

// Local dev
if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`🌙 SalamiWala API → http://localhost:${PORT}`))
}

module.exports = app
