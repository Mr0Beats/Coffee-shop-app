const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  pickupTime: { type: String, required: true },
  items: [
    {
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Нове', enum: ['Нове', 'Готується', 'Готово'] }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);