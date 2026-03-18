const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const REQUIRED = ['MONGODB_URI', 'JWT_SECRET']
const missing = REQUIRED.filter(k => !process.env[k])
if (missing.length) {
    console.error('❌ Missing:', missing.join(', '))
    process.exit(1)
}

const app = express()

const allowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://salamiwala.web.app',
    'https://salamiwala.firebaseapp.com',
    'https://salamiwala-9022d.web.app',
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

let dbReady = false
async function connectDB() {
    if (dbReady) return
    await mongoose.connect(process.env.MONGODB_URI)
    dbReady = true
    console.log('✅ MongoDB connected')
}

app.use(async(_req, _res, next) => {
    try {
        await connectDB();
        next()
    } catch (e) { next(e) }
})

app.get('/health', (_req, res) =>
    res.json({
        status: 'ok',
        app: 'SalamiWala 💸',
        time: new Date(),
        db: dbReady ? 'connected' : 'disconnected',
        env: {
            MONGODB_URI: process.env.MONGODB_URI ? '✅ set' : '❌ MISSING',
            JWT_SECRET: process.env.JWT_SECRET ? '✅ set' : '❌ MISSING',
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '✅ set' : '❌ MISSING',
        }
    })
)

app.use('/api/auth', require('./routes/auth'))
app.use('/api/salami', require('./routes/salami'))

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, _req, res, _next) => {
    console.error('❌ Error:', err.message)
    res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`🌙 SalamiWala API → http://localhost:${PORT}`)
    console.log(`   Health check  → http://localhost:${PORT}/health`)
})

module.exports = app