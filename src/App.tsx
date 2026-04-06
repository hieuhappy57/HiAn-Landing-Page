import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Instagram, Menu, X, Leaf, Coffee, Star, Sparkles, Loader2, Send, Settings, Save, Trash2, Plus, ArrowLeft, ShieldCheck, Edit, Upload, RefreshCw, ShoppingCart, Minus } from 'lucide-react';
import html2canvas from 'html2canvas';

// --- FIREBASE SETUP ---
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.error("Firebase initialization error:", e);
}

const appId = 'default-app-id';

// --- DỮ LIỆU MẶC ĐỊNH ---
const defaultMenuItems = [
  { id: "1", name: 'Matcha Latte', price: 30000, image: '/HiAn_MatchaLatte.png', category: 'Matcha', isBest: false, description: 'Matcha nguyên chất kết hợp cùng sữa tươi thanh trùng mềm mịn.', discount: 0 },
  { id: "2", name: 'Matcha Cold Whisk', price: 35000, image: '/Matcha_Cold_whish.png', category: 'Matcha', isBest: true, description: 'Trà xanh nguyên bản đậm vị, đánh bọt thủ công chuẩn phong cách Nhật Bản.', discount: 0 },
  { id: "3", name: 'Matcha Kem Muối', price: 35000, image: '/Matcha_Kem_Muối.png', category: 'Matcha', isBest: false, description: 'Matcha nguyên chất đậm đà phủ một lớp kem muối mặn ngọt bồng bềnh.', discount: 0 },
  { id: "4", name: 'Coco Matcha Cream', price: 35000, image: '/Coco_Matcha_Cream.png', category: 'Matcha', isBest: true, description: 'Sự kết hợp hoàn hảo giữa matcha thanh mát và lớp kem dừa béo ngậy.', discount: 0 },
  { id: "5", name: 'Sữa Dừa Matcha Cream', price: 35000, image: '/Sua_Dua_Matcha_Cream.png', category: 'Matcha', isBest: true, description: 'Sữa dừa thơm lừng hòa quyện cùng lớp kem matcha đặc biệt.', discount: 0 },
  { id: "6", name: 'Sữa Dừa Sương Sáo', price: 25000, image: '/Sua_Dua_Suong_Sao.png', category: 'Matcha', isBest: true, description: 'Sữa dừa béo ngậy kết hợp sương sáo thanh mát dai giòn.', discount: 0 },
  { id: "7", name: 'Nâu Lắc', price: 20000, image: '/Ca_Nau.png', category: 'Coffee', isBest: false, description: 'Cà phê nâu lắc đá mát lạnh, đậm đà hương vị truyền thống.', discount: 0 },
  { id: "8", name: 'Xỉu Muối', price: 29000, image: '/Bac_xiu_muoi.png', category: 'Coffee', isBest: false, description: 'Bạc xỉu truyền thống phá cách với chút kem muối béo mặn.', discount: 0 },
  { id: "9", name: 'Cà Muối', price: 25000, image: '/Ca_Muoi.png', category: 'Coffee', isBest: false, description: 'Cà phê đen nguyên bản mạnh mẽ phủ lớp kem muối đặc trưng.', discount: 0 },
  { id: "10", name: 'Cà Đậu Phộng', price: 25000, image: '/Ca_Dau_Phong.jpg', category: 'Coffee', isBest: false, description: 'Cà phê rang xay đậm vị kết hợp vị bùi béo đặc trưng của bơ đậu phộng.', discount: 0 },
];

const toppings = [
  { name: 'Sương sáo', price: '3K' },
  { name: 'Trân châu trắng', price: '5K' },
  { name: 'Kem muối', price: '10K' },
];

const formatPrice = (price) => `${(price / 1000)}K`;

// --- COMPONENT LOGO THÔNG MINH ---
const BrandLogo = ({ isFooter = false }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <span className={`font-extrabold tracking-tighter ${isFooter ? 'text-5xl text-[#c3d9a1]' : 'text-4xl text-[#5d821a]'}`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        HiAn
      </span>
    );
  }
  const containerClass = isFooter 
    ? "w-24 h-24 rounded-2xl shadow-xl border-4 border-[#c3d9a1]/20 bg-white" 
    : "w-14 h-14 rounded-xl shadow-sm border border-[#c3d9a1]/50 bg-white";
  return (
    <div className={`overflow-hidden flex items-center justify-center ${containerClass}`}>
      <img 
        src="/logo.png" 
        alt="HiAn Logo" 
        className="w-full h-full object-contain p-1" 
        onError={() => setImgError(true)}
      />
    </div>
  );
};

// --- CẤU HÌNH GEMINI API ---
const apiKey = process.env.GEMINI_API_KEY || "";
const fetchWithRetry = async (url, options, retries = 5) => {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delays[i]));
    }
  }
};

// --- CÁC COMPONENT SVG ---
const BlobShape1 = ({ className }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}><path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.4,-46.3C91,-33.5,97.1,-18,97.4,-2.3C97.7,13.4,92.1,28.7,83.3,42.4C74.4,56.1,62.2,68.2,47.9,76.5C33.6,84.8,17.2,89.3,0.7,88.1C-15.8,87,-31.6,80.3,-45.5,71.2C-59.4,62.1,-71.4,50.6,-79.8,36.9C-88.2,23.2,-93,7.3,-91.3,-8.2C-89.6,-23.7,-81.4,-38.8,-70.6,-50.7C-59.8,-62.6,-46.3,-71.3,-32.1,-78.1C-17.9,-84.9,-3.1,-89.8,11.5,-88.7C26.1,-87.6,40.6,-80.5,44.7,-76.4Z" transform="translate(100 100)" /></svg>
);
const BlobShape2 = ({ className }) => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className={className}><path fill="currentColor" d="M51.8,-70.5C65.5,-61.2,73.8,-43.8,79.5,-25.6C85.2,-7.4,88.3,11.6,81.3,27.1C74.3,42.6,57.2,54.6,39.9,64.3C22.6,74,5.1,81.4,-11.7,78.9C-28.5,76.4,-44.6,64,-58.3,50C-72,36,-83.3,20.4,-86.3,3.4C-89.3,-13.6,-84.1,-32,-72.6,-46.1C-61.1,-60.2,-43.3,-70,-25.7,-74.6C-8.1,-79.2,9.3,-78.6,26.5,-73.9C43.7,-69.2,58.3,-60.3,51.8,-70.5Z" transform="translate(100 100)" /></svg>
);

const FallbackImage = ({ src, alt, fallbackText, className = "w-full h-64 rounded-t-[2rem]" }) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div className={`relative bg-[#f4ead1]/50 overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}>
      {!imgError && src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={() => setImgError(true)} />
      ) : (
        <div className="text-center p-2 opacity-50 text-[#5d821a]">
          <Coffee size={32} className="mx-auto mb-1" />
          <p className="text-[10px] font-medium px-1 leading-tight">{fallbackText || 'Chưa có hình ảnh'}</p>
        </div>
      )}
    </div>
  );
};


// ==========================================
// THÀNH PHẦN GIAO DIỆN ADMIN (QUẢN TRỊ)
// ==========================================
const AdminPanel = ({ menuList, onSave, onDelete, onBack, onReset }) => {
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (item) => setEditingItem({ ...item });
  const handleCreate = () => setEditingItem({ 
    id: Date.now().toString(), name: '', price: 0, image: '', category: 'Matcha', isBest: false, description: '', discount: 0 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
  };

  // Tính năng tải và nén ảnh
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;

        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setEditingItem(prev => ({ ...prev, image: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(editingItem);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 mb-6 text-slate-600 hover:text-[#5d821a] font-medium transition-colors">
          <ArrowLeft size={20} /> Về trang cửa hàng
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#5d821a] p-3 rounded-2xl text-white shadow-lg"><ShieldCheck size={32} /></div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800">Quản lý Thực Đơn</h1>
              <p className="text-slate-500">Cập nhật giá, khuyến mãi, mô tả và hình ảnh món.</p>
            </div>
          </div>
          <button onClick={onReset} className="px-4 py-2 bg-orange-100 text-orange-600 font-bold rounded-xl hover:bg-orange-200 transition-colors flex items-center gap-2 shadow-sm border border-orange-200">
            <RefreshCw size={18}/> Khôi phục Menu gốc
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cột Danh sách món */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="font-bold text-slate-700">Các món hiện tại ({menuList.length})</h2>
                <button onClick={handleCreate} className="px-4 py-2 bg-[#f4ead1] text-[#5d821a] font-bold rounded-full hover:bg-[#e4d6b1] transition-colors flex items-center gap-2">
                  <Plus size={16}/> Thêm món mới
                </button>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {menuList.map(item => (
                  <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover"/> : <Coffee className="w-full h-full p-4 text-slate-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                        {item.isBest && <span className="bg-[#ffd966] text-[#8c6b00] text-[10px] font-black px-2 py-0.5 rounded-full">BEST</span>}
                        {item.discount > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-black px-2 py-0.5 rounded-full">-{item.discount}%</span>}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                      <p className="text-sm font-bold text-[#5d821a]">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                      <button onClick={() => { if(window.confirm('Bạn muốn xóa món này?')) onDelete(item.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cột Form chỉnh sửa */}
          <div>
            {editingItem ? (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
                  {menuList.find(m => m.id === editingItem.id) ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên món</label>
                    <input required name="name" value={editingItem.name} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] focus:ring-[#5d821a] outline-none transition-all bg-slate-50 focus:bg-white" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả hấp dẫn</label>
                    <textarea name="description" value={editingItem.description} onChange={handleChange} rows={2} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" placeholder="VD: Món nước giải khát thanh mát..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Giá gốc (VNĐ)</label>
                      <input type="number" required name="price" value={editingItem.price} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-red-600 mb-1">Khuyến mãi (%)</label>
                      <input type="number" min="0" max="100" name="discount" value={editingItem.discount} onChange={handleChange} className="w-full rounded-xl border-red-200 shadow-sm p-3 border focus:border-red-500 outline-none bg-red-50/50 focus:bg-white text-red-600 font-bold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Danh mục</label>
                      <select name="category" value={editingItem.category} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white">
                        <option value="Matcha">Matcha</option>
                        <option value="Coffee">Coffee</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6 bg-[#fcfaf5] p-3 rounded-xl border border-[#f4ead1]">
                      <input type="checkbox" id="isBest" name="isBest" checked={editingItem.isBest} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-[#5d821a] focus:ring-[#5d821a]" />
                      <label htmlFor="isBest" className="ml-2 block font-semibold text-[#8c6b00] cursor-pointer">Best Seller</label>
                    </div>
                  </div>

                  {/* KHU VỰC UPLOAD ẢNH */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hình ảnh món</label>
                    <div className="mt-1 flex items-center gap-4">
                      {/* Ảnh xem trước */}
                      <div className="w-24 h-24 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                        {editingItem.image ? (
                          <>
                            <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button type="button" onClick={() => setEditingItem(prev => ({...prev, image: ''}))} className="text-white hover:text-red-400">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <Coffee className="text-slate-400" size={28} />
                        )}
                      </div>
                      
                      {/* Nút chức năng */}
                      <div className="flex-1">
                        <label className="cursor-pointer px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-[#f4ead1] hover:text-[#5d821a] hover:border-[#5d821a] transition-colors inline-flex items-center gap-2 shadow-sm">
                          <Upload size={16} /> Tải ảnh lên
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <p className="text-xs text-slate-500 mt-2 mb-1">Hoặc nhập URL / tên file:</p>
                        <input name="image" value={editingItem.image} onChange={handleChange} className="w-full rounded-lg border-slate-300 shadow-sm p-2 text-sm border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" placeholder="VD: HiAn_Matcha.jpg" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button type="button" onClick={() => setEditingItem(null)} className="px-5 py-3 border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors">Hủy</button>
                    <button type="submit" className="px-5 py-3 bg-[#5d821a] text-white font-bold rounded-xl hover:bg-[#4a6815] flex items-center gap-2 shadow-md hover:shadow-lg transition-all"><Save size={18}/> Lưu Món</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-100 rounded-3xl border-2 border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center text-slate-500 h-[400px]">
                <Edit size={48} className="mb-4 text-slate-300" />
                <p>Chọn một món bên danh sách để chỉnh sửa hoặc tạo món mới.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// THÀNH PHẦN APP CHÍNH
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const hasSeededRef = useRef(false);
  
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'admin'
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', note: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Item Selection Modal State
  const [selectedItemForCart, setSelectedItemForCart] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempToppings, setTempToppings] = useState([]);

  const openItemModal = (item) => {
    setSelectedItemForCart(item);
    setTempQuantity(1);
    setTempToppings([]);
  };

  const toggleTempTopping = (toppingName) => {
    setTempToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  const confirmAddToCart = () => {
    if (!selectedItemForCart) return;

    const cartItemId = `${selectedItemForCart.id}-${tempToppings.sort().join('-')}`;
    
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + tempQuantity } : i);
      }
      return [...prev, { 
        ...selectedItemForCart, 
        cartItemId, 
        quantity: tempQuantity, 
        selectedToppings: tempToppings 
      }];
    });
    
    setSelectedItemForCart(null);
    // Không mở giỏ hàng tự động nữa
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const basePrice = item.price * (1 - (item.discount || 0) / 100);
    const toppingsPrice = item.selectedToppings.reduce((tSum, tName) => {
      const topping = toppings.find(t => t.name === tName);
      const priceVal = topping ? parseInt(topping.price.replace(/\D/g, '')) : 0;
      return tSum + priceVal;
    }, 0);
    return sum + (basePrice + toppingsPrice) * item.quantity;
  }, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    // 1. Lưu vào Firestore
    if (db) {
      try {
        const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
        await setDoc(orderRef, {
          items: cart,
          total: cartTotal,
          customer: customerInfo,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
      } catch (err) {
        console.error("Lỗi khi lưu đơn hàng:", err);
      }
    }

    // 2. Tạo ảnh Bill bằng html2canvas
    const receiptElement = document.getElementById('receipt-capture');
    if (receiptElement) {
      try {
        // Hiển thị tạm thời để chụp
        receiptElement.style.display = 'block';
        const canvas = await html2canvas(receiptElement, { scale: 2, backgroundColor: '#ffffff' });
        receiptElement.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        
        // Tải ảnh xuống máy khách
        const link = document.createElement('a');
        link.href = image;
        link.download = `HiAn_Bill_${customerInfo.phone}.jpg`;
        link.click();

        // Copy nội dung text (phòng hờ khách không gửi được ảnh)
        const orderText = `Chào HiAn, mình muốn chốt đơn hàng này:\n\nTên: ${customerInfo.name}\nSĐT: ${customerInfo.phone}\nĐịa chỉ: ${customerInfo.address}\n${customerInfo.note ? `Ghi chú: ${customerInfo.note}\n` : ''}\nTổng cộng: ${formatPrice(cartTotal)}`;
        navigator.clipboard.writeText(orderText).catch(e => console.log("Không thể copy clipboard", e));

      } catch (err) {
        console.error("Lỗi tạo ảnh bill:", err);
      }
    }
    
    setIsCheckingOut(false);
    setCart([]);
    setOrderSuccess(true);
    setIsCartOpen(false);
  };

  // AI State
  const [mood, setMood] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState('');

  // Admin Login State
  const [adminId, setAdminId] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. Khởi tạo & Lắng nghe Auth Firebase
  useEffect(() => {
    if (!auth) {
      // Fallback for local dev without Firebase
      setUser({ uid: 'local-dev' });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Tải & Đồng bộ Dữ liệu Thực đơn
  useEffect(() => {
    if (!db) {
      setMenuList(defaultMenuItems);
      return;
    }
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');

    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      if (snapshot.empty) {
        // Seed default menu if empty
        if (auth?.currentUser) {
          defaultMenuItems.forEach(item => {
            setDoc(doc(menuRef, item.id), item).catch(console.error);
          });
        } else {
          setMenuList(defaultMenuItems);
        }
      } else {
        const items = [];
        snapshot.forEach(d => items.push({ id: d.id, ...d.data() }));
        setMenuList(items.sort((a,b) => Number(a.id) - Number(b.id)));
      }
    }, console.error);
    
    return () => unsubscribe();
  }, [user]);

  // Hành động của Admin
  const handleSaveItem = async (item) => {
    if (!user) return;
    if (!db) {
      setMenuList(prev => {
        const exists = prev.find(i => i.id === item.id);
        if (exists) return prev.map(i => i.id === item.id ? item : i);
        return [...prev, item];
      });
      return;
    }
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
    await setDoc(doc(menuRef, item.id), item);
  };

  const handleDeleteItem = async (id) => {
    if (!user) return;
    if (!db) {
      setMenuList(prev => prev.filter(i => i.id !== id));
      return;
    }
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
    await deleteDoc(doc(menuRef, id));
  };

  const handleResetDefault = async () => {
    if (!user) return;
    if (!db) {
      setMenuList(defaultMenuItems);
      return;
    }
    // Cập nhật lại list menu mặc định
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
    defaultMenuItems.forEach(item => {
      setDoc(doc(menuRef, item.id), item).catch(console.error);
    });
  };

  // Hành động của AI
  const handleAskAI = async () => {
    if (!mood.trim() || menuList.length === 0) return;
    setIsThinking(true);
    setAiError('');
    setAiSuggestion(null);

    try {
      const menuText = menuList.map(item => `${item.id}: ${item.name} (${formatPrice(item.price)}) - ${item.description}`).join(", ");
      const promptText = `Khách đang cảm thấy: "${mood}". \nThực đơn: [${menuText}]. \nHãy chọn 1 ID món phù hợp nhất để xoa dịu/chia vui.`;
      
      const payload = {
        contents: [{ parts: [{ text: promptText }] }],
        systemInstruction: { 
          parts: [{ text: "Bạn là một nhân viên pha chế (barista) thân thiện, thấu cảm tại quán cafe HiAn Matcha & Coco ở Việt Nam. Hãy đọc tâm trạng của khách, chọn 1 món uống phù hợp nhất dựa trên mô tả. Phản hồi bằng tiếng Việt với giọng điệu dễ thương, gen Z, dùng emoji." }] 
        },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              drinkId: { type: "STRING" },
              message: { type: "STRING", description: "Lời nhắn của barista" }
            },
            required: ["drinkId", "message"]
          }
        }
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const result = await fetchWithRetry(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        const parsedData = JSON.parse(responseText);
        const recommendedDrink = menuList.find(item => item.id === parsedData.drinkId);
        if (recommendedDrink) setAiSuggestion({ drink: recommendedDrink, message: parsedData.message });
        else throw new Error("Không tìm thấy món uống phù hợp.");
      } else throw new Error("Không nhận được phản hồi từ AI.");
    } catch (err) {
      console.error(err);
      setAiError("Xin lỗi, quán đang đông khách quá nên mình chưa kịp tư vấn. Bạn chọn menu bên dưới nhé! 😅");
    } finally {
      setIsThinking(false);
    }
  };

  // Switch to Admin View
  if (currentView === 'admin') {
    if (!user) {
      const handleLogin = (e) => {
        e.preventDefault();
        if (adminId === 'HianMatcha2026@' && adminPass === 'HianMatcha2026@123') {
          if (auth) {
            signInAnonymously(auth).catch(console.error);
          } else {
            setUser({ uid: 'local-admin' });
          }
        } else {
          setLoginError('Sai ID hoặc mật khẩu!');
        }
      };

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
            <ShieldCheck size={48} className="mx-auto text-[#5d821a] mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Đăng nhập Quản trị</h2>
            <p className="text-slate-500 mb-6">Vui lòng đăng nhập để quản lý thực đơn.</p>
            
            <form onSubmit={handleLogin} className="space-y-4 mb-6 text-left">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">ID Đăng nhập</label>
                <input 
                  type="text" 
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" 
                  placeholder="Nhập ID..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
                <input 
                  type="password" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" 
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>
              {loginError && <p className="text-red-500 text-sm font-medium">{loginError}</p>}
              <button 
                type="submit"
                className="w-full py-3 bg-[#5d821a] text-white font-bold rounded-xl hover:bg-[#4a6815] transition-colors mt-2 shadow-md"
              >
                Đăng nhập
              </button>
            </form>

            <button 
              onClick={() => setCurrentView('home')}
              className="w-full py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      );
    }
    return <AdminPanel menuList={menuList} onSave={handleSaveItem} onDelete={handleDeleteItem} onBack={() => setCurrentView('home')} onReset={handleResetDefault} />;
  }

  // Lọc sản phẩm hiển thị
  const filteredMenu = activeCategory === 'All' 
    ? menuList 
    : menuList.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-slate-800 font-sans selection:bg-[#c3d9a1] selection:text-[#5d821a]">
      {/* --- NAVBAR --- */}
      <nav className="fixed w-full z-50 bg-[#fcfaf5]/80 backdrop-blur-md border-b border-[#f4ead1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <BrandLogo />
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              <a href="#home" className="text-slate-600 hover:text-[#5d821a] font-medium transition-colors">Trang chủ</a>
              <a href="#menu" className="text-slate-600 hover:text-[#5d821a] font-medium transition-colors">Thực đơn</a>
              <a href="#location" className="px-5 py-2.5 rounded-full bg-[#5d821a] text-white font-medium hover:bg-[#4a6815] transition-colors shadow-sm">
                Ghé Quán
              </a>
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#5d821a] hover:bg-[#f4ead1] rounded-full transition-colors">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
            <div className="md:hidden flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#5d821a] hover:bg-[#f4ead1] rounded-full transition-colors">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#5d821a] hover:text-[#4a6815]">
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#f4ead1] absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#home" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-slate-600 hover:bg-[#f4ead1] hover:text-[#5d821a] font-medium">Trang chủ</a>
              <a href="#menu" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 rounded-xl text-slate-600 hover:bg-[#f4ead1] hover:text-[#5d821a] font-medium">Thực đơn</a>
              <a href="#location" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 mt-4 rounded-xl text-center bg-[#5d821a] text-white font-medium">Ghé Quán</a>
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 text-[#f4ead1] w-96 h-96 opacity-60 z-0"><BlobShape1 className="w-full h-full" /></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-20 text-[#c3d9a1] w-[500px] h-[500px] opacity-30 z-0"><BlobShape2 className="w-full h-full" /></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-[#f4ead1] text-[#5d821a] px-4 py-2 rounded-full font-medium text-sm mb-6">
                <Leaf size={16} /><span>Matcha & Coco</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-[#5d821a] leading-tight mb-6">
                A sip of joy<br/><span className="text-[#c3d9a1]">for day.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Tận hưởng sự kết hợp hoàn hảo giữa hương vị thanh mát của Matcha và sự ngọt ngào béo ngậy của Dừa tại không gian nhỏ xinh của HiAn.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <a href="#menu" className="px-8 py-4 rounded-full bg-[#5d821a] text-white font-semibold text-lg hover:bg-[#4a6815] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-center">
                  Xem Menu
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-full group">
              <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl bg-[#f4ead1] aspect-[4/5] flex items-center justify-center">
                <img src="/Matcha_Cold_whish.png" alt="HiAn Matcha Cold Whisk" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="bg-[#f4ead1] p-3 rounded-full text-[#5d821a]"><Star fill="currentColor" size={24} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Best Seller</p>
                  <p className="font-bold text-[#5d821a]">Matcha Cold Whisk</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- AI BARISTA SECTION --- */}
      <section className="py-16 bg-[#c3d9a1]/20 relative overflow-hidden border-t border-b border-[#c3d9a1]/30">
        <div className="absolute top-0 right-0 text-[#c3d9a1] w-64 h-64 opacity-20 -mr-20 -mt-20"><BlobShape1 className="w-full h-full" /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-[#f4ead1]">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full">
                <div className="inline-flex items-center gap-2 bg-[#f4ead1] text-[#5d821a] px-4 py-2 rounded-full font-bold text-sm mb-4">
                  <Sparkles size={16} /><span>Gợi ý đồ uống theo tâm trạng</span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Hôm nay bạn thấy thế nào?</h2>
                <p className="text-slate-500 mb-6">Hãy kể cho HiAn nghe, Barista AI của chúng mình sẽ pha cho bạn một thức uống "chuẩn gu"!</p>
                <div className="relative flex items-center mb-4">
                  <input type="text" value={mood} onChange={(e) => setMood(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAskAI()} placeholder="VD: Mình đang chạy deadline sấp mặt..." className="w-full pl-6 pr-16 py-4 rounded-full bg-[#fcfaf5] border-2 border-[#f4ead1] focus:outline-none focus:border-[#5d821a] text-slate-700 transition-colors" disabled={isThinking} />
                  <button onClick={handleAskAI} disabled={isThinking || !mood.trim()} className="absolute right-2 p-3 bg-[#5d821a] text-white rounded-full hover:bg-[#4a6815] transition-colors disabled:opacity-50 flex items-center justify-center">
                    {isThinking ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </div>
                {aiError && <p className="text-red-500 text-sm pl-4">{aiError}</p>}
              </div>

              {aiSuggestion && (
                <div className="w-full md:w-80 flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-[#fcfaf5] rounded-[2rem] p-4 shadow-md border-2 border-[#c3d9a1] relative">
                    <div className="absolute -top-4 -right-4 bg-[#5d821a] text-white p-2 rounded-full shadow-lg"><Sparkles size={20} /></div>
                    <div className="flex gap-4 items-center mb-4 border-b border-[#f4ead1] pb-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#f4ead1] flex-shrink-0">
                        {aiSuggestion.drink.image ? <img src={aiSuggestion.drink.image} alt={aiSuggestion.drink.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[#5d821a]/50"><Coffee size={24}/></div>}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Dành cho bạn</p>
                        <p className="font-bold text-[#5d821a] line-clamp-2">{aiSuggestion.drink.name}</p>
                        <p className="text-sm font-black text-slate-500 line-through mr-1 inline-block">{aiSuggestion.drink.discount > 0 && formatPrice(aiSuggestion.drink.price)}</p>
                        <p className="text-sm font-black inline-block text-[#5d821a]">{formatPrice(aiSuggestion.drink.price * (1 - (aiSuggestion.drink.discount || 0)/100))}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 italic">"{aiSuggestion.message}"</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- MENU SECTION --- */}
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#5d821a] mb-4">Thực Đơn Của HiAn</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Từ những lá trà xanh mướt đến hạt cà phê đậm đà, mỗi thức uống đều được chuẩn bị với sự tận tâm.</p>
          </div>

          <div className="flex justify-center space-x-2 sm:space-x-4 mb-12">
            {['All', 'Matcha', 'Coffee'].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === cat ? 'bg-[#5d821a] text-white' : 'bg-[#f4ead1] text-[#5d821a] hover:bg-[#e4d6b1]'}`}>
                {cat === 'All' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredMenu.map((item) => {
              const finalPrice = item.price * (1 - (item.discount || 0) / 100);
              return (
                <div key={item.id} className="bg-[#fcfaf5] rounded-2xl sm:rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all border border-[#f4ead1] group relative flex flex-row sm:flex-col items-center sm:items-stretch gap-4 sm:gap-0">
                  
                  {item.isBest && (
                    <div className="absolute top-0 left-0 sm:top-6 sm:-left-2 z-20">
                      <div className="bg-[#ffd966] text-[#8c6b00] text-[10px] sm:text-xs font-black px-2 py-1 sm:px-3 sm:py-1 rounded-tl-2xl rounded-br-lg sm:rounded-none sm:rounded-r-lg shadow-sm flex items-center gap-1"><Star size={10} fill="currentColor" className="sm:w-3 sm:h-3" /> BEST</div>
                    </div>
                  )}

                  {item.discount > 0 && (
                    <div className="absolute top-0 right-0 sm:top-6 sm:right-0 z-20">
                      <div className="bg-red-500 text-white text-[10px] sm:text-xs font-black px-2 py-1 sm:px-3 sm:py-1 rounded-tr-2xl rounded-bl-lg sm:rounded-none sm:rounded-l-lg shadow-md border border-red-400">-{item.discount}%</div>
                    </div>
                  )}

                  <FallbackImage src={item.image} alt={item.name} fallbackText={item.name} className="w-24 h-24 sm:w-full sm:h-64 rounded-xl sm:rounded-t-[2rem] sm:rounded-b-none" />
                  
                  <div className="flex-1 flex flex-col py-1 sm:p-5 sm:pt-6">
                    <div className="flex-1 mb-1 sm:mb-2">
                      <h3 className="font-bold text-base sm:text-lg text-slate-800 group-hover:text-[#5d821a] transition-colors line-clamp-2 leading-tight">{item.name}</h3>
                      {item.description && <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2 line-clamp-2 leading-relaxed">{item.description}</p>}
                    </div>
                    
                    <div className="flex justify-between items-end mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-[#f4ead1]/50">
                      <div>
                        {item.discount > 0 && <span className="text-slate-400 line-through text-[10px] sm:text-sm mr-2 block -mb-1">{formatPrice(item.price)}</span>}
                        <span className="text-[#5d821a] font-extrabold text-lg sm:text-2xl">{formatPrice(finalPrice)}</span>
                      </div>
                      <button onClick={() => openItemModal(item)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#f4ead1] text-[#5d821a] flex items-center justify-center hover:bg-[#5d821a] hover:text-white transition-colors">
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toppings Section */}
          <div className="mt-16 bg-[#f4ead1] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 text-white/40 w-64 h-64 z-0"><BlobShape1 className="w-full h-full" /></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[#5d821a] mb-6 flex items-center gap-2"><Coffee size={24} /> Thêm Topping</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {toppings.map((top, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                      <span className="font-medium text-slate-700">{top.name}</span><span className="font-bold text-[#5d821a]">{top.price}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER / LOCATION & MAP --- */}
      <footer id="location" className="bg-[#5d821a] text-white pt-20 pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 text-[#4a6815] w-96 h-96 opacity-50 z-0"><BlobShape2 className="w-full h-full" /></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            
            {/* Brand Info */}
            <div className="order-2 md:order-1">
              <div className="mb-6 inline-block"><BrandLogo isFooter={true} /></div>
              <p className="text-[#c3d9a1] text-lg mb-8 max-w-md">Matcha & Coco. <br/>A sip of joy for day.</p>
              
              <div className="space-y-4">
                <a href="https://maps.app.goo.gl/ztCXhM6rM2PVVbPQA" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-[#c3d9a1] transition-colors group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors"><MapPin size={24} /></div>
                  <div className="pt-1">
                    <p className="text-sm text-[#c3d9a1]">Địa chỉ của chúng mình</p>
                    <p className="font-medium text-lg">25 Hưng Hoá 1, Hải Châu, Đà Nẵng</p>
                  </div>
                </a>

                <a href="tel:0339229168" className="flex items-start gap-3 hover:text-[#c3d9a1] transition-colors group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors"><Phone size={24} /></div>
                  <div className="pt-1">
                    <p className="text-sm text-[#c3d9a1]">Hotline đặt hàng</p>
                    <p className="font-medium text-lg">0339.229.168</p>
                  </div>
                </a>
              </div>

              <div className="flex space-x-4 mt-8">
                <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white hover:text-[#5d821a] transition-all"><Instagram size={20} /></a>
                <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white hover:text-[#5d821a] transition-all font-bold text-lg flex items-center justify-center w-[44px] h-[44px]">f</a>
              </div>
            </div>

            {/* Google Map Embed */}
            <div className="order-1 md:order-2">
              <div className="h-64 md:h-80 w-full rounded-3xl overflow-hidden border-4 border-[#c3d9a1]/20 shadow-xl relative transform rotate-1 md:-rotate-1 hover:rotate-0 transition-transform duration-500">
                <iframe
                  src="https://maps.google.com/maps?q=25%20Hưng%20Hoá%201,%20Hải%20Châu,%20Đà%20Nẵng&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map của HiAn"
                ></iframe>
                
                {/* Sticker badge */}
                <a href="https://maps.app.goo.gl/ztCXhM6rM2PVVbPQA" target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-white text-[#5d821a] px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:bg-[#f4ead1] transition-colors cursor-pointer animate-pulse">
                  <MapPin size={18} /> Xem trên Google Maps
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#4a6815] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#c3d9a1]">
            <p>© {new Date().getFullYear()} HiAn Matcha & Coco. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <a href="#" className="hover:text-white">Điều khoản</a>
              <a href="#" className="hover:text-white">Bảo mật</a>
              <span className="text-[#4a6815]">|</span>
              <a href="#admin" onClick={(e) => { e.preventDefault(); setCurrentView('admin'); }} className="hover:text-white flex items-center gap-1 font-semibold">
                <Settings size={14} /> Quản trị (Admin)
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- ITEM SELECTION MODAL --- */}
      {selectedItemForCart && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="relative h-48 sm:h-64 bg-slate-100 flex-shrink-0">
              <button onClick={() => setSelectedItemForCart(null)} className="absolute top-4 right-4 z-10 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 backdrop-blur-md transition-colors">
                <X size={20} />
              </button>
              {selectedItemForCart.image ? (
                <img src={selectedItemForCart.image} alt={selectedItemForCart.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={48} /></div>
              )}
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{selectedItemForCart.name}</h3>
              <p className="text-[#5d821a] font-extrabold text-xl mb-6">
                {formatPrice(selectedItemForCart.price * (1 - (selectedItemForCart.discount || 0)/100))}
              </p>

              <div className="mb-6">
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><Coffee size={18} /> Thêm Topping</h4>
                <div className="space-y-2">
                  {toppings.map(topping => (
                    <label key={topping.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${tempToppings.includes(topping.name) ? 'bg-[#5d821a] border-[#5d821a]' : 'border-slate-300'}`}>
                          {tempToppings.includes(topping.name) && <ShieldCheck size={14} className="text-white" />}
                        </div>
                        <span className="font-medium text-slate-700">{topping.name}</span>
                      </div>
                      <span className="text-slate-500 text-sm">+{topping.price}</span>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={tempToppings.includes(topping.name)}
                        onChange={() => toggleTempTopping(topping.name)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-3">Số lượng</h4>
                <div className="flex items-center justify-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <button onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"><Minus size={20}/></button>
                  <span className="text-2xl font-bold text-slate-800 w-8 text-center">{tempQuantity}</span>
                  <button onClick={() => setTempQuantity(tempQuantity + 1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-[#5d821a] transition-colors"><Plus size={20}/></button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex-shrink-0">
              <button onClick={confirmAddToCart} className="w-full py-4 bg-[#5d821a] text-white font-bold rounded-2xl hover:bg-[#4a6815] transition-colors flex justify-center items-center gap-2">
                <ShoppingCart size={20} /> Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CART SIDEBAR --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fcfaf5]">
              <h2 className="text-2xl font-bold text-[#5d821a] flex items-center gap-2"><ShoppingCart /> Giỏ hàng của bạn</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <ShoppingCart size={64} className="opacity-20" />
                  <p>Giỏ hàng đang trống</p>
                  <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-[#f4ead1] text-[#5d821a] rounded-full font-bold">Tiếp tục chọn món</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Danh sách món */}
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.cartItemId} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                          {item.selectedToppings.length > 0 && (
                            <p className="text-xs text-slate-500 line-clamp-1">
                              + {item.selectedToppings.join(', ')}
                            </p>
                          )}
                          <p className="text-[#5d821a] font-bold">
                            {formatPrice(
                              (item.price * (1 - (item.discount || 0)/100)) + 
                              item.selectedToppings.reduce((sum, tName) => {
                                const t = toppings.find(top => top.name === tName);
                                return sum + (t ? parseInt(t.price.replace(/\D/g, '')) : 0);
                              }, 0)
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} className="text-slate-400 hover:text-red-500"><Minus size={16}/></button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} className="text-slate-400 hover:text-[#5d821a]"><Plus size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Form thông tin */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <h3 className="font-bold text-slate-800 text-lg">Thông tin giao hàng</h3>
                    <input type="text" placeholder="Tên của bạn" required value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none" />
                    <input type="tel" placeholder="Số điện thoại" required value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none" />
                    <input type="text" placeholder="Địa chỉ nhận hàng" required value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none" />
                    <textarea placeholder="Ghi chú (ít đá, nhiều ngọt...)" value={customerInfo.note} onChange={e => setCustomerInfo({...customerInfo, note: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none" rows="2"></textarea>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-slate-500 font-medium">Tổng cộng:</span>
                  <span className="text-2xl font-extrabold text-[#5d821a]">{formatPrice(cartTotal)}</span>
                </div>
                <button onClick={handleCheckout} disabled={!customerInfo.name || !customerInfo.phone || !customerInfo.address || isCheckingOut} className="w-full py-4 bg-[#5d821a] text-white font-bold rounded-2xl hover:bg-[#4a6815] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                  {isCheckingOut ? <><Loader2 size={18} className="animate-spin" /> Đang xử lý...</> : <>Đặt hàng ngay <Send size={18}/></>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thông báo đặt hàng thành công */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Hóa đơn đã sẵn sàng!</h3>
            <p className="text-slate-600 mb-6">
              Ảnh hóa đơn đã được tải xuống máy của bạn.<br/><br/>
              Để hoàn tất, vui lòng bấm nút bên dưới để mở Messenger và <strong>gửi ảnh hóa đơn</strong> cho HiAn nhé!
            </p>
            <div className="space-y-3">
              <a 
                href="https://m.me/hianmatcha.dn" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setOrderSuccess(false);
                  setCustomerInfo({ name: '', phone: '', address: '', note: '' });
                }}
                className="w-full py-3 bg-[#0084ff] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0073e6] transition-colors"
              >
                <Send size={20} /> Gửi qua Messenger
              </a>
              <button 
                onClick={() => {
                  setOrderSuccess(false);
                  setCustomerInfo({ name: '', phone: '', address: '', note: '' });
                }} 
                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt for html2canvas */}
      <div id="receipt-capture" style={{ display: 'none' }} className="absolute top-[-9999px] left-[-9999px] w-[400px] bg-white p-8 text-slate-800 font-sans">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#5d821a] mb-1">HiAn Matcha & Coco</h2>
          <p className="text-sm text-slate-500">25 Hưng Hoá 1, Hải Châu, Đà Nẵng</p>
          <p className="text-sm text-slate-500">Hotline: 0339.229.168</p>
        </div>
        <div className="border-t border-b border-dashed border-slate-300 py-4 mb-4 space-y-2 text-sm">
          <p><strong>Khách hàng:</strong> {customerInfo.name}</p>
          <p><strong>SĐT:</strong> {customerInfo.phone}</p>
          <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
          {customerInfo.note && <p><strong>Ghi chú:</strong> {customerInfo.note}</p>}
        </div>
        <div className="space-y-3 mb-4 text-sm">
          {cart.map(item => {
            const basePrice = item.price * (1 - (item.discount || 0) / 100);
            const toppingsPrice = item.selectedToppings.reduce((tSum, tName) => {
              const topping = toppings.find(t => t.name === tName);
              const priceVal = topping ? parseInt(topping.price.replace(/\D/g, '')) : 0;
              return tSum + priceVal;
            }, 0);
            const itemTotal = (basePrice + toppingsPrice) * item.quantity;
            
            return (
              <div key={item.cartItemId} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-bold">{item.name}</p>
                  {item.selectedToppings.length > 0 && (
                    <p className="text-xs text-slate-500">+ {item.selectedToppings.join(', ')}</p>
                  )}
                  <p className="text-slate-500">{item.quantity} x {formatPrice(basePrice + toppingsPrice)}</p>
                </div>
                <p className="font-bold">{formatPrice(itemTotal)}</p>
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
          <span className="font-bold text-lg">TỔNG CỘNG:</span>
          <span className="font-extrabold text-xl text-[#5d821a]">{formatPrice(cartTotal)}</span>
        </div>
        <div className="text-center mt-8 text-sm text-slate-500 italic">
          Cảm ơn bạn đã chọn HiAn! ❤️
        </div>
      </div>
    </div>
  );
}
