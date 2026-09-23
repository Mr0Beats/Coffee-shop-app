import { useState, useEffect } from 'react';
import { 
  Coffee, ShoppingBag, Settings, User, Phone, 
  Clock, X, Trash2, CheckCircle, ChevronRight, LogIn, LayoutDashboard
} from 'lucide-react';

function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentView, setCurrentView] = useState('menu'); 
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [adminToken, setAdminToken] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    if (currentView === 'menu') {
      setIsLoading(true);
      fetch('http://localhost:5000/api/products')
        .then((res) => res.json())
        .then((data) => { setProducts(data); setIsLoading(false); })
        .catch((error) => { console.error(error); setIsLoading(false); });
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'admin' && isAdminLoggedIn) {
      setIsLoading(true);
      fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      })
        .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
        .then((data) => { setOrders(data); setIsLoading(false); })
        .catch(() => { setIsAdminLoggedIn(false); setIsLoading(false); });
    }
  }, [currentView, isAdminLoggedIn, adminToken]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productName === product.name);
    if (existingItem) {
      setCart(cart.map(item => item.productName === product.name ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { productName: product.name, price: product.price, quantity: 1 }]);
    }
  };

  const removeFromCart = (productName) => {
    setCart(cart.filter(item => item.productName !== productName));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, phone, pickupTime, items: cart })
      });
      if (response.ok) {
        alert('Замовлення прийнято!');
        setCart([]); setIsCartOpen(false); setCustomerName(''); setPhone(''); setPickupTime('');
      } else {
        alert('Помилка сервера');
      }
    } catch (error) {
      alert('Помилка з\'єднання');
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) { alert('Помилка'); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value })
      });
      const data = await res.json();
      if (res.ok) { setAdminToken(data.token); setIsAdminLoggedIn(true); } 
      else { alert(data.message); }
    } catch (error) { alert('Помилка'); }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setCurrentView('menu')}
          >
            <div className="bg-amber-700 p-2 rounded-xl text-white group-hover:bg-amber-600 transition">
              <Coffee size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 hidden sm:block">Beats Coffee</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setCurrentView(currentView === 'menu' ? 'admin' : 'menu')}
              className="p-2 text-stone-400 hover:text-amber-700 hover:bg-amber-50 rounded-full transition"
              title="Панель адміністратора"
            >
              <Settings size={24} />
            </button>
            
            {currentView === 'menu' && (
              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-full font-semibold transition flex items-center gap-2 shadow-sm active:scale-95"
              >
                <ShoppingBag size={20} />
                <span className="hidden sm:inline">Кошик</span>
                {totalItems > 0 && (
                  <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-sm font-bold ml-1">
                    {totalItems}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        
        {currentView === 'menu' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-stone-900">Оберіть свій напій</h2>
              <p className="text-stone-500 mt-2 font-medium">Свіже обсмаження та ідеальний смак.</p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300 group">
                    <div className="h-56 overflow-hidden relative">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-stone-900 shadow-sm">
                        {product.price} ₴
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-stone-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-stone-500 font-medium mb-5 flex-grow line-clamp-2">{product.description}</p>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-amber-50 text-amber-800 border border-amber-200 py-3 rounded-xl font-bold hover:bg-amber-700 hover:text-white transition active:scale-95"
                      >
                        Додати
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'admin' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <LayoutDashboard className="text-amber-700" size={32}/>
              <h2 className="text-3xl font-extrabold text-stone-900">Панель керування</h2>
            </div>
            
            {!isAdminLoggedIn ? (
              <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 max-w-sm mx-auto mt-12">
                <div className="flex justify-center mb-6"><div className="bg-stone-100 p-4 rounded-full"><User size={32} className="text-stone-600"/></div></div>
                <h3 className="text-xl font-bold mb-6 text-center text-stone-800">Вхід для персоналу</h3>
                <input required name="username" type="text" placeholder="Логін" className="w-full mb-4 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition font-medium" />
                <input required name="password" type="password" placeholder="Пароль" className="w-full mb-6 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:border-amber-500 focus:bg-white transition font-medium" />
                <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-bold hover:bg-stone-800 flex justify-center items-center gap-2 transition"><LogIn size={20}/> Увійти</button>
              </form>
            ) : (
              <div className="space-y-4">
                {isLoading ? <p className="text-center">Завантаження...</p> : orders.length === 0 ? <p className="text-center text-stone-500">Замовлень немає.</p> : (
                  orders.map(order => (
                    <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6">
                      <div className="flex-grow">
                        <h4 className="font-bold text-xl text-stone-900 mb-2 flex items-center gap-2">
                          {order.customerName}
                        </h4>
                        <div className="flex flex-col gap-1 text-sm text-stone-500 font-medium mb-4">
                          <span className="flex items-center gap-2"><Phone size={16} className="text-amber-600"/> {order.phone}</span>
                          <span className="flex items-center gap-2"><Clock size={16} className="text-amber-600"/> На {order.pickupTime}</span>
                        </div>
                        <div className="bg-stone-50 p-3 rounded-xl">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm font-medium text-stone-700 mb-1 last:mb-0">
                              <span><span className="text-stone-400 mr-2">{item.quantity}x</span> {item.productName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col justify-between items-end min-w-[140px] border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
                        <span className="font-extrabold text-2xl text-stone-900">{order.totalPrice} ₴</span>
                        <select 
                          value={order.status}
                          onChange={(e) => changeOrderStatus(order._id, e.target.value)}
                          className={`mt-4 w-full px-3 py-2 rounded-lg font-bold text-sm outline-none cursor-pointer border-2 transition ${
                            order.status === 'Готово' ? 'bg-green-50 text-green-700 border-green-200' : 
                            order.status === 'Готується' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-stone-100 text-stone-600 border-stone-200'
                          }`}
                        >
                          <option value="Нове">Нове</option>
                          <option value="Готується">Готується</option>
                          <option value="Готово">Готово</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:fade-in-20 duration-300">
            
            <div className="px-6 py-5 border-b border-stone-100 flex justify-between items-center bg-white sm:rounded-t-3xl rounded-t-3xl sticky top-0">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><ShoppingBag size={24} className="text-amber-700"/> Ваше замовлення</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-full p-2 transition"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                  <ShoppingBag size={48} className="text-stone-200 mb-4" />
                  <p className="text-stone-500 font-medium">Ваш кошик порожній</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                          <div className="bg-stone-100 text-stone-500 font-bold px-2 py-1 rounded-lg text-sm">{item.quantity}x</div>
                          <p className="font-bold text-stone-800">{item.productName}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-stone-900">{item.price * item.quantity} ₴</span>
                          <button onClick={() => removeFromCart(item.productName)} className="text-stone-300 hover:text-red-500 transition p-2"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t border-stone-100 mt-4">
                      <span className="text-stone-500 font-medium">До сплати</span>
                      <span className="text-2xl font-extrabold text-stone-900">{totalPrice} ₴</span>
                    </div>
                  </div>

                  <form onSubmit={submitOrder} className="bg-stone-50 p-5 rounded-2xl border border-stone-100 space-y-4">
                    <h3 className="font-bold text-stone-800 mb-2">Контактні дані</h3>
                    
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-3.5 text-stone-400" />
                      <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition font-medium" placeholder="Ім'я" />
                    </div>
                    
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-3.5 text-stone-400" />
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition font-medium" placeholder="Номер телефону" />
                    </div>
                    
                    <div className="relative">
                      <Clock size={18} className="absolute left-4 top-3.5 text-stone-400" />
                      <input required type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition font-medium text-stone-600" />
                    </div>

                    <button disabled={isSubmitting} type="submit" className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-stone-800 transition disabled:bg-stone-300 mt-2 flex justify-center items-center gap-2 text-lg active:scale-95 shadow-lg shadow-stone-900/20">
                      {isSubmitting ? 'Відправка...' : <><CheckCircle size={20} /> Підтвердити замовлення</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;