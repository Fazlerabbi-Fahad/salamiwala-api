const jwt  = require('jsonwebtoken')
const User = require('../models/User')

module.exports = async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ error: 'লগইন করো আগে' })
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    const user    = await User.findById(decoded.userId).select('-password')
    if (!user) return res.status(401).json({ error: 'ইউজার পাওয়া যায়নি' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'টোকেন মেয়াদ শেষ। আবার লগইন করো।' })
  }
}
