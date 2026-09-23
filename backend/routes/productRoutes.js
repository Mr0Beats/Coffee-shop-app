const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isAvailable: true });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { name, description, price, imageUrl, category } = req.body;
  try {
    const newProduct = new Product({ name, description, price, imageUrl, category });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Товар видалено' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;