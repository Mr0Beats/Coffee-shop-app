const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middlewares/authMiddleware');
const { validateOrderData } = require('../middlewares/validate');

router.post('/', validateOrderData, async (req, res, next) => {
  try {
    const { customerName, phone, pickupTime, items } = req.body;
    
    let calculatedTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOne({ name: item.productName });
      
      if (!product) {
        res.status(404);
        throw new Error(`Товар "${item.productName}" не знайдено в меню`);
      }

      calculatedTotal += product.price * item.quantity;
      
      orderItems.push({
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    const newOrder = new Order({
      customerName,
      phone,
      pickupTime,
      items: orderItems,
      totalPrice: calculatedTotal
    });

    await newOrder.save();
    res.status(201).json({ message: 'Замовлення успішно створено!', order: newOrder });
  } catch (err) {
    next(err);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', protect, async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status },
      { new: true }
    );
    
    if (!updatedOrder) {
      res.status(404);
      throw new Error('Замовлення не знайдено');
    }
    
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
});

module.exports = router;