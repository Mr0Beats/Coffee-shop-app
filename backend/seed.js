const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/product');

const sampleProducts = [
  { 
    name: 'Еспресо', 
    description: 'Класичний міцний кавовий напій, заряд бадьорості.', 
    price: 40, 
    category: 'Кава', 
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    name: 'Капучино', 
    description: 'Еспресо з ідеально збитою глянцевою молочною піною.', 
    price: 55, 
    category: 'Кава', 
    imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    name: 'Матча Лате', 
    description: 'Японський зелений чай з гарячим молоком.', 
    price: 70, 
    category: 'Чай', 
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    name: 'Круасан', 
    description: 'Свіжий французький круасан з вершковим маслом.', 
    price: 45, 
    category: 'Десерти', 
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?q=80&w=600&auto=format&fit=crop' 
  },
  { 
    name: 'Канадські млинці', 
    description: 'Смачні та пухкі млинці з кленовим сиропом та ягодами.', 
    price: 100, 
    category: 'Десерти', 
    imageUrl: 'https://img.tsn.ua/cached/226/tsn-1bfeaf6125141ee06e055fc61b5a2fa6/thumbs/1200x630/df/67/188c52563bfb4db2a9e87ed52b4267df.jpeg' 
  }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Підключено до БД. Додаємо товари...');
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('Успіх! 5 товари додано в меню.');
    process.exit();
  })
  .catch(err => {
    console.error('Помилка:', err);
    process.exit(1);
  });