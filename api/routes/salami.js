const express     = require('express')
const auth        = require('../middleware/auth')
const SalamiEntry = require('../models/SalamiEntry')
const ShareVisit  = require('../models/ShareVisit')
const User        = require('../models/User')

const router = express.Router()

router.get('/entries', auth, async (req, res) => {
  try {
    res.json(await SalamiEntry.find({ userId: req.user._id }).sort({ createdAt: -1 }))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/entries', auth, async (req, res) => {
  try {
    const { name, relation, amount, note } = req.body
    if (!name || !relation) return res.status(400).json({ error: 'নাম ও সম্পর্ক দাও' })
    const entry = await SalamiEntry.create({ userId: req.user._id, name, relation, amount: parseFloat(amount) || 0, note: note || '' })
    res.status(201).json(entry)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/entries/:id/pay', auth, async (req, res) => {
  try {
    const entry = await SalamiEntry.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ error: 'পাওয়া যায়নি' })
    entry.paid = true; entry.paidAt = new Date(); await entry.save()
    res.json(entry)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.patch('/entries/:id/unpay', auth, async (req, res) => {
  try {
    const entry = await SalamiEntry.findOne({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ error: 'পাওয়া যায়নি' })
    entry.paid = false; entry.paidAt = null; await entry.save()
    res.json(entry)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/entries/:id', auth, async (req, res) => {
  try {
    await SalamiEntry.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/stats', auth, async (req, res) => {
  try {
    const entries  = await SalamiEntry.find({ userId: req.user._id })
    const total    = entries.reduce((s, e) => s + e.amount, 0)
    const received = entries.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
    const visits   = await ShareVisit.countDocuments({ userId: req.user._id })
    res.json({ total, received, pending: total - received, count: entries.length, paidCount: entries.filter(e => e.paid).length, visits })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/public/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ publicSlug: req.params.slug }).select('-password')
    if (!user) return res.status(404).json({ error: 'পেজ পাওয়া যায়নি' })
    await ShareVisit.create({ userId: user._id, visitorIp: req.headers['x-forwarded-for'] || req.ip, userAgent: req.headers['user-agent'] })
    const entries  = await SalamiEntry.find({ userId: user._id })
    const total    = entries.reduce((s, e) => s + e.amount, 0)
    const received = entries.filter(e => e.paid).reduce((s, e) => s + e.amount, 0)
    res.json({ name: user.name, phone: user.phone, qrImage: user.qrImage, publicSlug: user.publicSlug, stats: { total, received, pending: total - received, count: entries.length } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
