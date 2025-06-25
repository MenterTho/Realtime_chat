const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String },
    fileUrl: { type: String },
    fileName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);