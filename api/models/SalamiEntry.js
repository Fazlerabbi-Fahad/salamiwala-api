const mongoose = require('mongoose')

const salamiEntrySchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:     { type: String, required: true, trim: true },
  relation: { type: String, required: true },
  amount:   { type: Number, default: 0 },
  paid:     { type: Boolean, default: false },
  paidAt:   { type: Date, default: null },
  note:     { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('SalamiEntry', salamiEntrySchema)
