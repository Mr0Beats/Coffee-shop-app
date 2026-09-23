const validateOrderData = (req, res, next) => {
  const { customerName, phone, pickupTime, items } = req.body;

  if (!customerName || !phone || !pickupTime || !items || items.length === 0) {
    res.status(400); // Bad Request
    return next(new Error("Будь ласка, заповніть всі обов'язкові поля та додайте товари"));
  }

  next();
};

module.exports = { validateOrderData };