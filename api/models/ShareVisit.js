const mongoose = require('mongoose')

const shareVisitSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  visitorIp: { type: String },
  userAgent: { type: String },
}, { timestamps: true })

module.exports = mongoose.model('ShareVisit', shareVisitSchema)
