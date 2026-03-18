const express = require('express')
const jwt     = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const User    = require('../models/User')
const auth    = require('../middleware/auth')
const { upload } = require('../cloudinary')

const router = express.Router()

function makeSlug(name) {
  const base = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'user'
  return `${base}-${uuidv4().slice(0, 8)}`
}
function signToken(id) {
  return jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// POST /api/auth/signup
router.post('/signup', upload.single('qrImage'), async (req, res) => {
  try {
    const { name, phone, password } = req.body
    if (!name || !phone || !password) return res.status(400).json({ error: 'সব তথ্য দাও' })
    if (password.length < 6) return res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' })
    if (await User.findOne({ phone })) return res.status(409).json({ error: 'এই নম্বরে আগেই অ্যাকাউন্ট আছে' })

    const qrImage    = req.file?.path || null   // Cloudinary URL
    const publicSlug = makeSlug(name)
    const user       = await User.create({ name, phone, password, publicSlug, qrImage })

    res.status(201).json({
      token: signToken(user._id),
      user:  { _id: user._id, name: user.name, phone: user.phone, publicSlug: user.publicSlug, qrImage: user.qrImage }
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body
    const user = await User.findOne({ phone })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'নম্বর বা পাসওয়ার্ড ভুল' })
    res.json({
      token: signToken(user._id),
      user:  { _id: user._id, name: user.name, phone: user.phone, publicSlug: user.publicSlug, qrImage: user.qrImage }
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/auth/me
router.get('/me', auth, (req, res) => res.json({ user: req.user }))

// POST /api/auth/update-qr
router.post('/update-qr', auth, upload.single('qrImage'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'QR ছবি দাও' })
    req.user.qrImage = req.file.path
    await req.user.save()
    res.json({ qrImage: req.user.qrImage })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
