import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Instagram, Menu, X, Leaf, Coffee, Star, Sparkles, Loader2, Send, Settings, Save, Trash2, Plus, ArrowLeft, ShieldCheck, Edit, Upload, RefreshCw, ShoppingCart, Minus, Globe } from 'lucide-react';
import html2canvas from 'html2canvas';
import { GoogleGenAI, Type } from '@google/genai';

// --- FIREBASE SETUP ---
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
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

// --- DICTIONARY DIỄN DỊCH SONG NGỮ ---
const t = {
  vi: {
    home: 'Trang chủ',
    menu: 'Thực đơn',
    location: 'Ghé Quán',
    aiTitle: 'Gợi ý đồ uống theo tâm trạng',
    aiSubtitle: 'Hôm nay bạn thấy thế nào?',
    aiDesc: 'Hãy kể cho HiAn nghe, Barista AI của chúng mình sẽ pha cho bạn một thức uống "chuẩn gu"!',
    aiPlaceholder: 'VD: Mình đang chạy deadline sấp mặt...',
    bestSeller: 'Bán chạy',
    toppingTitle: 'Thêm Topping',
    footerSlogan: 'Matcha & Coco. \nA sip of joy for day.',
    addressTitle: 'Địa chỉ của chúng mình',
    hotlineTitle: 'Hotline đặt hàng',
    rights: 'All rights reserved.',
    adminLink: 'Quản trị (Admin)',
    sweetnessTitle: 'Độ ngọt',
    milkTitle: 'Chọn Bột Matcha',
    extraTitle: 'Tùy chọn thêm',
    extraCoffee: 'Đậm cà phê',
    extraMatcha: 'Thêm Matcha',
    addToCart: 'Thêm vào giỏ',
    addedToCart: 'Đã thêm vào giỏ! 🛒',
    cartTitle: 'Giỏ hàng của bạn',
    emptyCart: 'Giỏ hàng đang trống',
    continueShopping: 'Tiếp tục chọn món',
    deliveryTitle: 'Thông tin giao hàng',
    deliverySub: 'Nhập địa chỉ để HiAn giao đến tận nơi.',
    deliveryTime: 'Giờ nhận hàng',
    deliveryTimePlaceholder: 'VD: 15:30 hôm nay',
    paymentTitle: 'Hình thức thanh toán',
    paymentTransfer: 'Chuyển khoản',
    paymentCod: 'Tiền mặt (COD)',
    shippingDiscountMsg: 'Mua thêm {n} cốc nước để được giảm 10k phí ship!',
    shippingDiscountActive: '🎉 Bạn đã được giảm 10k phí ship!',
    subtotal: 'Tạm tính',
    shippingFee: 'Phí ship',
    shippingDiscount: 'Giảm phí ship',
    total: 'Tổng cộng',
    orderNow: 'Đặt hàng ngay',
    processing: 'Đang xử lý...',
    successTitle: 'Đơn hàng đã sẵn sàng!',
    successDesc: 'Chi tiết đơn hàng đã được sao chép vào bộ nhớ tạm. Hãy nhắn tin cho HiAn qua Zalo hoặc Messenger để hoàn tất đơn hàng nhé!',
    sendMessenger: 'Gửi đơn qua Messenger',
    sendZalo: 'Nhắn Zalo với HiAn nha!',
    close: 'Đóng',
    newsTitle: 'Tin mới nhất',
    openingTitle: 'Giờ mở cửa',
    openingDesc: '8:00 - 22:00, Thứ 2 - Chủ nhật',
    normalSweet: 'Đường thường',
    lessSweet: 'Ít đường',
    noSweet: 'Không đường',
    extraSweet: 'Thêm đường',
    freshMilk: 'Sữa tươi',
    oatMilk: 'Sữa hạt',
    halfMilk: 'Sữa Half-half',
    newsPost1: 'Chào hè rực rỡ cùng bộ đôi Matcha Dừa mới toanh!',
    newsPost2: 'HiAn chuyển sang địa điểm mới: 25 Hưng Hoá 1, Hải Châu, Đà Nẵng.',
    newsPost3: 'Hạt Arabica Cầu Đất nguyên chất ủ lạnh 16 tiếng chuẩn vị.',
    cancel: 'Huỷ',
    orderClipboardWarning: 'Đơn của bạn đã được copy, vui lòng paste sang box chat với HiAn để chúng mình lên đơn nha!'
  },
  en: {
    home: 'Home',
    menu: 'Menu',
    location: 'Visit Us',
    aiTitle: 'Mood-based Drink Suggester',
    aiSubtitle: 'How are you feeling today?',
    aiDesc: 'Tell HiAn, and our Barista AI will craft a drink that matches your vibe!',
    aiPlaceholder: 'E.g., I am rushing through deadlines...',
    bestSeller: 'Best Seller',
    toppingTitle: 'Add Topping',
    footerSlogan: 'Matcha & Coco. \nA sip of joy for day.',
    addressTitle: 'Our Location',
    hotlineTitle: 'Hotline for ordering',
    rights: 'All rights reserved.',
    adminLink: 'Admin Panel',
    sweetnessTitle: 'Sweetness',
    milkTitle: 'Choose Matcha Powder',
    extraTitle: 'Extra Options',
    extraCoffee: 'Extra Coffee Shot',
    extraMatcha: 'Extra Matcha Shot',
    addToCart: 'Add to Cart',
    addedToCart: 'Added! 🛒',
    cartTitle: 'Your Cart',
    emptyCart: 'Cart is empty',
    continueShopping: 'Continue Shopping',
    deliveryTitle: 'Delivery Information',
    deliverySub: 'Enter address for HiAn to deliver.',
    deliveryTime: 'Delivery Time',
    deliveryTimePlaceholder: 'E.g., 3:30 PM today',
    paymentTitle: 'Payment Method',
    paymentTransfer: 'Bank Transfer',
    paymentCod: 'Cash on Delivery (COD)',
    shippingDiscountMsg: 'Buy {n} more drink(s) to get 10k off shipping!',
    shippingDiscountActive: '🎉 You got 10k off shipping!',
    subtotal: 'Subtotal',
    shippingFee: 'Shipping',
    shippingDiscount: 'Ship Discount',
    total: 'Total',
    orderNow: 'Order Now',
    processing: 'Processing...',
    successTitle: 'Order is ready!',
    successDesc: 'Order details have been copied to clipboard. Please message HiAn via Zalo or Messenger to complete your order!',
    sendMessenger: 'Send via Messenger',
    sendZalo: 'Chat Zalo with HiAn!',
    close: 'Close',
    newsTitle: 'Latest News',
    openingTitle: 'Opening Hours',
    openingDesc: '8:00 AM - 10:00 PM, Mon - Sun',
    normalSweet: 'Normal Sweet',
    lessSweet: 'Less Sweet',
    noSweet: 'No Sugar',
    extraSweet: 'Extra Sweet',
    freshMilk: 'Fresh Milk',
    oatMilk: 'Oat Milk',
    halfMilk: 'Half-half Milk',
    newsPost1: 'Brighten up your summer with our brand new Matcha & Coco duo!',
    newsPost2: 'HiAn has moved to a new home: 25 Hung Hoa 1, Hai Chau, Da Nang.',
    newsPost3: 'Premium Cau Dat Arabica beans handcrafted cold-brewed for 16 hours.',
    cancel: 'Cancel',
    orderClipboardWarning: 'Your order details have been copied, please paste them in your chat window with HiAn to finalize!'
  }
};

// --- DỮ LIỆU MẶC ĐỊNH ---
const defaultMenuItems = [
  // Matcha & Coco
  { id: "1", name: 'Matcha Latte', nameEn: 'Matcha Latte', price: 30000, image: '/HiAn_MatchaLatte.png', category: 'Matcha & Coco', isBest: false, description: 'Matcha nguyên chất kết hợp cùng sữa tươi thanh trùng mềm mịn.', descriptionEn: 'Pure matcha combined with smooth pasteurized fresh milk.', discount: 0 },
  { id: "2", name: 'Matcha Cold Whisk', nameEn: 'Matcha Cold Whisk', price: 35000, image: '/Matcha_Cold_whish.png', category: 'Matcha & Coco', isBest: true, description: 'Trà xanh nguyên bản đậm vị, đánh bọt thủ công chuẩn phong cách Nhật Bản.', descriptionEn: 'Authentic bold matcha, hand-whisked in traditional Japanese style.', discount: 0 },
  { id: "3", name: 'Matcha Kem Muối', nameEn: 'Matcha Salted Cream', price: 35000, image: '/Matcha_Kem_Muối.png', category: 'Matcha & Coco', isBest: false, description: 'Matcha nguyên chất đậm đà phủ một lớp kem muối mặn ngọt bồng bềnh.', descriptionEn: 'Rich pure matcha topped with a fluffy layer of sweet & salty cream.', discount: 0 },
  { id: "4", name: 'Coco Matcha Cream', nameEn: 'Coco Matcha Cream', price: 35000, image: '/Coco_Matcha_Cream.png', category: 'Matcha & Coco', isBest: true, description: 'Sự kết hợp hoàn hảo giữa matcha thanh mát và lớp kem dừa béo ngậy.', descriptionEn: 'The perfect combination of refreshing matcha and creamy coconut.', discount: 0 },
  { id: "5", name: 'Sữa Dừa Matcha Cream', nameEn: 'Coconut Milk Matcha Cream', price: 35000, image: '/Sua_Dua_Matcha_Cream.png', category: 'Matcha & Coco', isBest: true, description: 'Sữa dừa thơm lừng hòa quyện cùng lớp kem matcha đặc biệt.', descriptionEn: 'Fragrant coconut milk blended with a special matcha cream topping.', discount: 0 },
  { id: "6", name: 'Sữa Dừa Sương Sáo', nameEn: 'Coconut Milk with Grass Jelly', price: 25000, image: '/Sua_Dua_Suong_Sao.png', category: 'Matcha & Coco', isBest: true, description: 'Sữa dừa béo ngậy kết hợp sương sáo thanh mát dai giòn.', descriptionEn: 'Creamy coconut milk combined with refreshing chewy grass jelly.', discount: 0 },
  
  // Coffee
  { id: "7", name: 'Nâu Lắc', nameEn: 'Nau Lac (Shaken Iced Coffee)', price: 20000, image: '/Ca_Nau.png', category: 'Coffee', isBest: false, description: 'Cà phê nâu lắc đá mát lạnh, đậm đà hương vị truyền thống.', descriptionEn: 'Shaken Vietnamese iced milk coffee, bold and traditional flavor.', discount: 0 },
  { id: "8", name: 'Xỉu Muối', nameEn: 'Salted Bac Xiu', price: 29000, image: '/Bac_xiu_muoi.png', category: 'Coffee', isBest: false, description: 'Bạc xỉu truyền thống phá cách với chút kem muối béo mặn.', descriptionEn: 'Traditional Bac Xiu with a modern twist of savory salted cream.', discount: 0 },
  { id: "9", name: 'Cà Muối', nameEn: 'Salted Coffee', price: 25000, image: '/Ca_Muoi.png', category: 'Coffee', isBest: false, description: 'Cà phê đen nguyên bản mạnh mẽ phủ lớp kem muối đặc trưng.', descriptionEn: 'Strong traditional black coffee topped with signature salted cream.', discount: 0 },
  { id: "10", name: 'Cà Đậu Phộng', nameEn: 'Peanut Coffee', price: 25000, image: '/Ca_Dau_Phong.jpg', category: 'Coffee', isBest: false, description: 'Cà phê rang xay đậm vị kết hợp vị bùi béo đặc trưng của bơ đậu phộng.', descriptionEn: 'Rich ground coffee combined with the buttery taste of peanut butter.', discount: 0 },

  // MilkTea & more
  { id: "11", name: 'Trà Ô Long Nhài Chanh Vàng', nameEn: 'Jasmine Oolong Lemon Tea', price: 30000, image: '/Tra_O_Long_Nhail.png', category: 'MilkTea & more', isBest: false, description: 'Trà ô long nhài thơm, chanh vàng tươi mát.', descriptionEn: 'Fragrant jasmine oolong tea with fresh lemon slices.', discount: 0 },
  { id: "12", name: 'Matcha Sữa Yến Mạch', nameEn: 'Oat Milk Matcha', price: 35000, image: '/Matcha_Sua_Yen_Mach.png', category: 'MilkTea & more', isBest: false, description: 'Matcha sữa yến mạch béo bùi thanh nhẹ.', descriptionEn: 'Creamy and nutty oat milk matcha latte.', discount: 0 },
  { id: "13", name: 'Croffle Quế Mật Ong', nameEn: 'Honey Cinnamon Croffle', price: 25000, image: '/Croffle_Que_Mat_Ong.png', category: 'MilkTea & more', isBest: false, description: 'Bánh croffle nướng giòn rưới mật ong thơm quế.', descriptionEn: 'Freshly baked crispy croffle drizzled with honey and cinnamon sugar.', discount: 0 },
  { id: "14", name: 'Croffle Chà Bông Trứng Muối', nameEn: 'Salted Egg Pork Floss Croffle', price: 29000, image: '/Croffle_Cha_Bong.png', category: 'MilkTea & more', isBest: false, description: 'Bánh croffle nướng phủ chà bông trứng muối đậm đà.', descriptionEn: 'Savory croffle topped with shredded pork floss and rich salted egg sauce.', discount: 0 },
  { id: "15", name: 'Croissant Hạnh Nhân', nameEn: 'Almond Croissant', price: 28000, image: '/Croissant_Hanh_Nhan.png', category: 'MilkTea & more', isBest: false, description: 'Bánh croissant ngập hạnh nhân thơm bùi giòn rụm.', descriptionEn: 'Crispy flaky croissant filled and topped with sweet almond cream.', discount: 0 },
];

const toppings = [
  { name: 'Sương sáo', nameEn: 'Grass Jelly', price: 3000 },
  { name: 'Trân châu trắng', nameEn: 'White Pearls', price: 5000 },
  { name: 'Kem muối', nameEn: 'Salted Cream', price: 10000 },
];

const formatPrice = (price) => `${(price / 1000)}k`;

// --- COMPONENT LOGO THÔNG MINH ---
const BrandLogo = ({ isFooter = false }) => {
  const [imgError, setImgError] = useState(false);
  if (isFooter) {
    return (
      <div className="overflow-hidden flex items-center justify-center w-20 h-20 rounded-xl bg-white shadow-md p-1">
        <img src="/logo.png" alt="HiAn Logo" className="w-full h-full object-contain" onError={() => setImgError(true)} />
      </div>
    );
  }
  
  // Stretched raw header logo style without borders or white container
  return (
    <div className="flex items-center gap-3">
      {!imgError ? (
        <img 
          src="/logo.png" 
          alt="HiAn Logo" 
          className="h-10 sm:h-12 w-auto object-contain" 
          onError={() => setImgError(true)}
        />
      ) : null}
      <span className="font-extrabold tracking-tighter text-3xl sm:text-4xl text-[#5d821a]" style={{ fontFamily: 'Pacifico, cursive' }}>
        HiAn
      </span>
      <span className="hidden lg:inline text-xs font-black text-[#8c6b00]/60 tracking-widest uppercase mt-3 font-['Patrick_Hand']">
        Matcha & Coco
      </span>
    </div>
  );
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
        <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgError(true)} />
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
    id: Date.now().toString(), name: '', nameEn: '', price: 0, image: '', category: 'Matcha & Coco', isBest: false, description: '', descriptionEn: '', discount: 0 
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value) }));
  };

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
      img.src = event.target.result as string;
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
                        <h3 className="font-bold text-slate-800">{item.name} / {item.nameEn || item.name}</h3>
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

          <div>
            {editingItem ? (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sticky top-8">
                <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-4">
                  {menuList.find(m => m.id === editingItem.id) ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </h2>
                <form onSubmit={submit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên món (Tiếng Việt)</label>
                    <input required name="name" value={editingItem.name} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] focus:ring-[#5d821a] outline-none transition-all bg-slate-50 focus:bg-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên món (Tiếng Anh)</label>
                    <input required name="nameEn" value={editingItem.nameEn} onChange={handleChange} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] focus:ring-[#5d821a] outline-none transition-all bg-slate-50 focus:bg-white" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả hấp dẫn (Tiếng Việt)</label>
                    <textarea name="description" value={editingItem.description} onChange={handleChange} rows={2} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" placeholder="VD: Món nước giải khát thanh mát..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả hấp dẫn (Tiếng Anh)</label>
                    <textarea name="descriptionEn" value={editingItem.descriptionEn} onChange={handleChange} rows={2} className="w-full rounded-xl border-slate-300 shadow-sm p-3 border focus:border-[#5d821a] outline-none bg-slate-50 focus:bg-white" placeholder="E.g., Refreshing summer drink..." />
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
                        <option value="Matcha & Coco">Matcha & Coco</option>
                        <option value="Coffee">Coffee</option>
                        <option value="MilkTea & more">MilkTea & more</option>
                      </select>
                    </div>
                    <div className="flex items-center mt-6 bg-[#fcfaf5] p-3 rounded-xl border border-[#f4ead1]">
                      <input type="checkbox" id="isBest" name="isBest" checked={editingItem.isBest} onChange={handleChange} className="h-5 w-5 rounded border-gray-300 text-[#5d821a] focus:ring-[#5d821a]" />
                      <label htmlFor="isBest" className="ml-2 block font-semibold text-[#8c6b00] cursor-pointer">Best Seller</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hình ảnh món</label>
                    <div className="mt-1 flex items-center gap-4">
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
  const [currentView, setCurrentView] = useState('home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Matcha & Coco');
  
  // Multilingual State
  const [lang, setLang] = useState('vi');

  // Cart State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '', note: '' });
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modal Control States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isClipboardAlertOpen, setIsClipboardAlertOpen] = useState(false);
  const [finalOrderText, setFinalOrderText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll animation state
  const [fillPercent, setFillPercent] = useState(0);
  const animationSectionRef = useRef<HTMLDivElement>(null);

  // Item Selection Modal State
  const [selectedItemForCart, setSelectedItemForCart] = useState(null);
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSweetness, setTempSweetness] = useState('normal'); 
  const [tempMilk, setTempMilk] = useState('fresh'); 
  const [tempExtras, setTempExtras] = useState([]); 
  const [tempToppings, setTempToppings] = useState([]); 

  const openItemModal = (item) => {
    setSelectedItemForCart(item);
    setTempQuantity(1);
    setTempSweetness('normal');
    setTempMilk('fresh');
    setTempExtras([]);
    setTempToppings([]);
  };

  const toggleTempExtra = (extraName) => {
    setTempExtras(prev => 
      prev.includes(extraName) 
        ? prev.filter(e => e !== extraName)
        : [...prev, extraName]
    );
  };

  const toggleTempTopping = (toppingName) => {
    setTempToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  const getSweetnessLabel = (sweetKey) => {
    if (sweetKey === 'none') return t[lang].noSweet;
    if (sweetKey === 'less') return t[lang].lessSweet;
    if (sweetKey === 'normal') return t[lang].normalSweet;
    if (sweetKey === 'extra') return t[lang].extraSweet;
    return sweetKey;
  };

  const getMilkLabel = (milkKey) => {
    if (milkKey === 'fresh' || milkKey === 'standard') return 'Satoen Premium';
    if (milkKey === 'premium' || milkKey === 'kobashi') return 'Kobashi Premium';
    return milkKey;
  };

  const calculateItemPrice = (item, milk, extras, selectedToppingsList) => {
    const basePrice = item.price * (1 - (item.discount || 0) / 100);
    const milkPrice = (milk === 'premium' || milk === 'kobashi') ? 12000 : 0;
    
    const extrasPrice = extras.reduce((sum, e) => {
      if (e === 'bold') {
        const isKobashi = milk === 'premium' || milk === 'kobashi';
        return sum + (isKobashi ? 10000 : 6000);
      }
      if (e === 'coffee') return sum + 8000;
      return sum;
    }, 0);

    const toppingsPrice = selectedToppingsList.reduce((sum, tName) => {
      const top = toppings.find(t => t.name === tName);
      return sum + (top ? top.price : 0);
    }, 0);
    return basePrice + milkPrice + extrasPrice + toppingsPrice;
  };

  const confirmAddToCart = () => {
    if (!selectedItemForCart) return;

    // Create unique key based on options (except size)
    const cartItemId = `${selectedItemForCart.id}-${tempSweetness}-${tempMilk}-${tempExtras.sort().join('-')}-${tempToppings.sort().join('-')}`;
    const singlePrice = calculateItemPrice(selectedItemForCart, tempMilk, tempExtras, tempToppings);

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + tempQuantity } : i);
      }
      return [...prev, { 
        ...selectedItemForCart, 
        cartItemId, 
        quantity: tempQuantity, 
        selectedSweetness: tempSweetness,
        selectedMilk: tempMilk,
        selectedExtras: tempExtras,
        selectedToppings: tempToppings,
        calculatedPrice: singlePrice
      }];
    });
    
    // Popup toast alert
    const itemName = lang === 'en' ? (selectedItemForCart.nameEn || selectedItemForCart.name) : selectedItemForCart.name;
    setToastMessage(lang === 'vi' ? `Đã thêm ${itemName} vào giỏ hàng! 🛒` : `Added ${itemName} to cart! 🛒`);
    
    setSelectedItemForCart(null);
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

  // Cart counting & totals
  const cartCupCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.calculatedPrice * item.quantity), 0);

  const baseShippingFee = 15000;
  const shippingDiscount = cartCupCount >= 3 ? 10000 : 0;
  const finalShippingFee = Math.max(0, baseShippingFee - shippingDiscount);
  const cartTotal = cartSubtotal + finalShippingFee;

  // Generate order text structure matching user requirements
  const generateOrderText = (includeCustomerDetails = false) => {
    const orderDetailsText = cart.map((item, index) => {
      const options = [];
      options.push(`Đường: ${getSweetnessLabel(item.selectedSweetness)}`);
      
      if (item.selectedMilk !== 'fresh' && item.selectedMilk !== 'standard') {
        options.push(`Bột: ${getMilkLabel(item.selectedMilk)}`);
      }
      
      item.selectedExtras.forEach(e => {
        if (e === 'bold') options.push(lang === 'en' ? 'Extra Bold' : 'Gu đậm');
        else if (e === 'coffee') options.push(t[lang].extraCoffee);
      });
      
      if (item.selectedToppings.length > 0) {
        const topLabels = item.selectedToppings.map(tName => {
          const top = toppings.find(t => t.name === tName);
          return lang === 'en' && top ? top.nameEn : tName;
        });
        options.push(`Topping: ${topLabels.join(', ')}`);
      }

      const itemName = lang === 'en' ? (item.nameEn || item.name) : item.name;
      return `${index + 1}. ${itemName} x${item.quantity} — ${options.join(', ')} = ${formatPrice(item.calculatedPrice * item.quantity)}`;
    }).join('\n');

    if (!includeCustomerDetails) {
      return `HiAn ơi cho mình order:\n${orderDetailsText}\n\nTổng đơn: ${formatPrice(cartTotal)}`;
    }

    const paymentLabel = paymentMethod === 'transfer' ? t[lang].paymentTransfer : t[lang].paymentCod;

    return `HiAn ơi cho mình order:\n` +
      `${orderDetailsText}\n\n` +
      `Tổng đơn: ${formatPrice(cartTotal)}\n\n` +
      `Mình tên: ${customerInfo.name}\n` +
      `Nhận đơn tại: ${customerInfo.address}\n` +
      `SĐT: ${customerInfo.phone}\n` +
      `Giờ nhận: ${deliveryTime}\n` +
      `Thanh toán: ${paymentLabel}\n` +
      `Lưu ý giúp mình: ${customerInfo.note || 'Không có'}`;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    
    // 1. Save to Firestore
    if (db) {
      try {
        const orderRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'));
        await setDoc(orderRef, {
          items: cart,
          subtotal: cartSubtotal,
          shippingFee: finalShippingFee,
          total: cartTotal,
          customer: customerInfo,
          deliveryTime,
          paymentMethod,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
      } catch (err) {
        console.error("Lỗi khi lưu đơn hàng:", err);
      }
    }

    const finalOrderTxt = generateOrderText(true);
    setFinalOrderText(finalOrderTxt);
    await navigator.clipboard.writeText(finalOrderTxt).catch(e => console.log("Không thể copy clipboard", e));
    
    setIsCheckingOut(false);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setOrderSuccess(true);
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

  // 1. Firebase Auth listener
  useEffect(() => {
    if (!auth) {
      setUser({ uid: 'local-dev' });
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Scroll listener for Matcha filling animation
  useEffect(() => {
    const handleScroll = () => {
      if (!animationSectionRef.current) return;
      const rect = animationSectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      const startScroll = viewportHeight; // enters from bottom
      const endScroll = viewportHeight / 2 - rect.height / 2; // centered
      
      let progress = 0;
      if (rect.top <= startScroll) {
        progress = (startScroll - rect.top) / (startScroll - endScroll);
      }
      progress = Math.max(0, Math.min(1, progress));
      
      setFillPercent(Math.round(progress * 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Load & Sync Menu
  useEffect(() => {
    if (!db) {
      setMenuList(defaultMenuItems);
      return;
    }
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');

    const unsubscribe = onSnapshot(menuRef, (snapshot) => {
      if (snapshot.empty) {
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

  // Admin Panel Action handlers
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
    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
    defaultMenuItems.forEach(item => {
      setDoc(doc(menuRef, item.id), item).catch(console.error);
    });
  };

  // AI Recommendation Trigger
  const handleAskAI = async () => {
    if (!mood.trim() || menuList.length === 0) return;
    setIsThinking(true);
    setAiError('');
    setAiSuggestion(null);

    try {
      const menuText = menuList.map(item => `${item.id}: ${item.name} (${formatPrice(item.price)}) - ${item.description}`).join(", ");
      const promptText = `Khách đang cảm thấy: "${mood}". \nThực đơn: [${menuText}]. \nHãy chọn 1 ID món phù hợp nhất để giới thiệu.`;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "Bạn là một nhân viên pha chế (barista) thân thiện, thấu cảm tại quán cafe HiAn Matcha & Coco ở Đà Nẵng, Việt Nam. Hãy đọc tâm trạng của khách, chọn 1 món uống phù hợp nhất dựa trên mô tả. Phản hồi bằng ngôn ngữ của khách nhập (Tiếng Việt hoặc Tiếng Anh) với giọng điệu dễ thương, gen Z, dùng emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              drinkId: { type: Type.STRING },
              message: { type: Type.STRING, description: "Lời nhắn của barista" }
            },
            required: ["drinkId", "message"]
          }
        }
      });

      const responseText = response.text;
      
      if (responseText) {
        const parsedData = JSON.parse(responseText);
        const recommendedDrink = menuList.find(item => item.id === parsedData.drinkId);
        if (recommendedDrink) setAiSuggestion({ drink: recommendedDrink, message: parsedData.message });
        else throw new Error("Không tìm thấy món uống phù hợp.");
      } else throw new Error("Không nhận được phản hồi từ AI.");
    } catch (err) {
      console.error(err);
      setAiError(lang === 'vi' ? "Xin lỗi bạn nha, AI đang pha trà nên chưa trả lời ngay được. Bạn chọn menu bên dưới nhé! 🍵" : "Sorry, our AI barista is busy making matcha right now. Please choose from the menu! 🍵");
    } finally {
      setIsThinking(false);
    }
  };

  // Click handler for category navigation links
  const handleNavClick = (category) => {
    if (category === 'HiAn là...') {
      const element = document.getElementById('about');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setActiveCategory(category);
      const element = document.getElementById('menu');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
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

  // Filter products by category tab
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
            
            {/* Desktop Navigation Category Links */}
            <div className="hidden md:flex space-x-6 items-center">
              {['Matcha & Coco', 'Coffee', 'MilkTea & more', 'HiAn là...'].map(navItem => (
                <button 
                  key={navItem} 
                  onClick={() => handleNavClick(navItem)}
                  className={`font-semibold transition-colors duration-200 text-sm ${
                    activeCategory === navItem && navItem !== 'HiAn là...'
                      ? 'text-[#5d821a] scale-105' 
                      : 'text-slate-600 hover:text-[#5d821a]'
                  }`}
                >
                  {navItem}
                </button>
              ))}
              
              {/* Language Switcher */}
              <button 
                onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c3d9a1] hover:bg-[#f4ead1] transition-all text-[#5d821a] font-bold text-sm ml-4"
              >
                <Globe size={16} />
                <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
              </button>

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-[#5d821a] hover:bg-[#f4ead1] rounded-full transition-colors ml-2">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Navigation Header toggles */}
            <div className="md:hidden flex items-center gap-4">
              <button 
                onClick={() => setLang(l => l === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#c3d9a1] text-[#5d821a] font-bold text-xs"
              >
                <Globe size={14} />
                <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
              </button>

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

        {/* Mobile Category Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#f4ead1] absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {['Matcha & Coco', 'Coffee', 'MilkTea & more', 'HiAn là...'].map(navItem => (
                <button 
                  key={navItem}
                  onClick={() => handleNavClick(navItem)}
                  className="block w-full text-left px-3 py-3 rounded-xl text-slate-600 hover:bg-[#f4ead1] hover:text-[#5d821a] font-semibold"
                >
                  {navItem}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-[#fcfaf5]">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 text-[#f4ead1] w-96 h-96 opacity-60 z-0"><BlobShape1 className="w-full h-full" /></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-20 text-[#c3d9a1] w-[500px] h-[500px] opacity-30 z-0"><BlobShape2 className="w-full h-full" /></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header Banner */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ffd966] rounded-lg transform -rotate-1 skew-x-3 scale-y-110 border-2 border-[#8c6b00] shadow-sm"></div>
              <span className="relative z-10 text-xs sm:text-sm font-black uppercase text-[#8c6b00] px-4 py-1.5 flex items-center gap-1.5 font-['Patrick_Hand'] tracking-widest">
                ✨ HIAN SIGNATURE ✨
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-[#5d821a] uppercase font-['Patrick_Hand'] tracking-wider leading-tight mb-2">
              HOMEMADE MATCHA & COCO
            </h1>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#8c6b00] font-['Patrick_Hand'] mb-6">
              Đặc chế tại nhà
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-semibold">
              {lang === 'vi' 
                ? 'Matcha nguyên chất chuẩn Nhật kết hợp cùng cốt dừa tươi ngọt béo 100% - không hoá chất, không chất bảo quản. Chuẩn vị nhà làm, tươi mát mỗi ngày'
                : 'Pure Japanese Matcha combined with 100% fresh creamy coconut milk - no chemicals, no preservatives. Authentic homemade taste, fresh every day'}
            </p>
          </div>

          {/* Polaroid Cards Section - Clean Responsive Flow to Prevent Overlaps */}
          <div className="flex flex-col lg:flex-row justify-center items-center gap-y-12 lg:gap-x-4 mt-24 max-w-6xl mx-auto px-4">
            {/* Card 1 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 z-20 bg-[#ffd966] text-[#8c6b00] border-2 border-[#8c6b00] w-9 h-9 rounded-full flex items-center justify-center font-bold font-['Patrick_Hand'] text-base shadow-sm transform -rotate-12">
                  1
                </div>
                <div className="bg-white border-2 border-[#5d821a] p-4 pb-6 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 w-48 sm:w-56 flex-shrink-0">
                  <div className="aspect-square bg-[#fcfaf5] rounded-xl overflow-hidden border border-[#f4ead1] flex items-center justify-center">
                    <img src="/HiAn_MatchaLatte.png" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center font-['Patrick_Hand'] text-[#5d821a] font-black text-lg sm:text-xl mt-4">{lang === 'vi' ? 'Không hoá chất' : 'No chemicals'}</p>
                </div>
              </div>
            </div>

            {/* Description 1 & Curved Arrow */}
            <div className="hidden lg:flex flex-col items-center justify-center w-36 text-center font-['Patrick_Hand'] text-[#8c6b00] text-sm leading-tight relative px-2">
              <p>
                {lang === 'vi' 
                  ? 'Không hương liệu, không chất bảo quản - nguyên liệu dừa tươi & matcha nguyên chất' 
                  : 'No artificial flavors or preservatives - pure fresh coconut & matcha ingredients'}
              </p>
              <svg className="w-16 h-10 text-[#c3d9a1] mt-2" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10,10 Q 50,45, 90,20" strokeDasharray="4 4" />
                <path d="M80,12 L90,20 L82,28" />
              </svg>
            </div>
            <p className="block lg:hidden text-center px-4 font-['Patrick_Hand'] text-slate-500 text-sm max-w-sm">
              {lang === 'vi' 
                ? 'Không hương liệu, không chất bảo quản - nguyên liệu dừa tươi & matcha nguyên chất' 
                : 'No artificial flavors or preservatives - pure fresh coconut & matcha ingredients'}
            </p>

            {/* Card 2 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 z-20 bg-[#5d821a] text-white border-2 border-white w-9 h-9 rounded-full flex items-center justify-center font-bold font-['Patrick_Hand'] text-base shadow-sm transform rotate-12">
                  2
                </div>
                <div className="bg-white border-2 border-[#5d821a] p-4 pb-6 shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300 w-48 sm:w-56 flex-shrink-0">
                  <div className="aspect-square bg-[#fcfaf5] rounded-xl overflow-hidden border border-[#f4ead1] flex items-center justify-center">
                    <img src="/Sua_Dua_Suong_Sao.png" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center font-['Patrick_Hand'] text-[#5d821a] font-black text-lg sm:text-xl mt-4">{lang === 'vi' ? '100% Cốt dừa tươi' : '100% Fresh Coconut'}</p>
                </div>
              </div>
            </div>

            {/* Description 2 & Curved Arrow */}
            <div className="hidden lg:flex flex-col items-center justify-center w-36 text-center font-['Patrick_Hand'] text-[#8c6b00] text-sm leading-tight relative px-2">
              <p>
                {lang === 'vi'
                  ? 'Dừa tươi xiêm thanh ngọt tự nhiên, cam kết không dùng sữa tạo mùi nhân tạo'
                  : 'Naturally sweet fresh Siamese coconut, strictly no artificial flavor milk'}
              </p>
              <svg className="w-16 h-10 text-[#c3d9a1] mt-2" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10,30 Q 50,0, 90,20" strokeDasharray="4 4" />
                <path d="M80,28 L90,20 L82,12" />
              </svg>
            </div>
            <p className="block lg:hidden text-center px-4 font-['Patrick_Hand'] text-slate-500 text-sm max-w-sm">
              {lang === 'vi'
                ? 'Dừa tươi xiêm thanh ngọt tự nhiên, cam kết không dùng sữa tạo mùi nhân tạo'
                : 'Naturally sweet fresh Siamese coconut, strictly no artificial flavor milk'}
            </p>

            {/* Card 3 */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute -top-4 -left-4 z-20 bg-[#ffd966] text-[#8c6b00] border-2 border-[#8c6b00] w-9 h-9 rounded-full flex items-center justify-center font-bold font-['Patrick_Hand'] text-base shadow-sm transform -rotate-6">
                  3
                </div>
                <div className="bg-white border-2 border-[#5d821a] p-4 pb-6 shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300 w-48 sm:w-56 flex-shrink-0">
                  <div className="aspect-square bg-[#fcfaf5] rounded-xl overflow-hidden border border-[#f4ead1] flex items-center justify-center">
                    <img src="/Matcha_Cold_whish.png" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center font-['Patrick_Hand'] text-[#5d821a] font-black text-lg sm:text-xl mt-4">{lang === 'vi' ? 'Chuẩn nhà làm' : 'Homemade'}</p>
                </div>
              </div>
            </div>

            {/* Description 3 & Curved Arrow */}
            <div className="hidden lg:flex flex-col items-center justify-center w-36 text-center font-['Patrick_Hand'] text-[#8c6b00] text-sm leading-tight relative px-2">
              <p>
                {lang === 'vi'
                  ? 'Đánh bột matcha thủ công tỉ mỉ bằng chasen, lưu giữ trọn vị truyền thống'
                  : 'Carefully hand-whisked matcha using chasen, preserving authentic traditional taste'}
              </p>
              <svg className="w-16 h-10 text-[#c3d9a1] mt-2" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M10,15 Q 50,40, 90,25" strokeDasharray="4 4" />
                <path d="M80,17 L90,25 L82,33" />
              </svg>
            </div>
            <p className="block lg:hidden text-center px-4 font-['Patrick_Hand'] text-slate-500 text-sm max-w-sm">
              {lang === 'vi'
                ? 'Đánh bột matcha thủ công tỉ mỉ bằng chasen, lưu giữ trọn vị truyền thống'
                : 'Carefully hand-whisked matcha using chasen, preserving authentic traditional taste'}
            </p>
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (#about) --- */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-[#f4ead1] text-[#5d821a] px-4 py-2 rounded-full font-bold text-sm mb-6">
            <Leaf size={16} /> <span>HiAn là...</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 mb-6">Chào mừng bạn đến với HiAn Matcha & Coco</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            {lang === 'vi'
              ? 'Chúng mình là một tiệm nhỏ ấm cúng chuyên về các thức uống được làm từ 100% bột Matcha Nhật Bản nguyên chất phối hợp cùng cốt dừa tươi ngọt lành. Không dùng hóa chất, siro tạo vị nhân tạo - Cam kết chuẩn vị nhà làm tự nhiên tốt sức khỏe.'
              : 'We are a cozy little shop specialized in drinks crafted from 100% pure Japanese Matcha powder blended with fresh coconut milk. No artificial colors, preservatives or flavoring syrups - We guarantee healthy natural homemade drinks.'}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-[#fcfaf5] p-4 rounded-2xl border border-[#f4ead1]">
              <h4 className="font-black text-[#5d821a] text-xl">Satoen</h4>
              <p className="text-xs text-slate-500 mt-1">{lang === 'vi' ? 'Matcha Nhật' : 'Premium Matcha'}</p>
            </div>
            <div className="bg-[#fcfaf5] p-4 rounded-2xl border border-[#f4ead1]">
              <h4 className="font-black text-[#5d821a] text-xl">100%</h4>
              <p className="text-xs text-slate-500 mt-1">{lang === 'vi' ? 'Cốt dừa tươi' : 'Fresh Coconut'}</p>
            </div>
            <div className="bg-[#fcfaf5] p-4 rounded-2xl border border-[#f4ead1]">
              <h4 className="font-black text-[#5d821a] text-xl">0%</h4>
              <p className="text-xs text-slate-500 mt-1">{lang === 'vi' ? 'Siro tạo vị' : 'Flavor syrups'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SCROLL-DRIVEN MATCHA CUP FILLING ANIMATION (REPLACING AI BARISTA) --- */}
      <section ref={animationSectionRef} id="about-matcha" className="py-24 bg-[#fcfaf5] border-t border-b border-[#f4ead1] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[#c3d9a1] w-64 h-64 opacity-20 -mr-20 -mt-20"><BlobShape1 className="w-full h-full" /></div>
        <div className="absolute bottom-0 left-0 text-[#ffd966] w-48 h-48 opacity-20 -ml-20 -mb-20"><BlobShape2 className="w-full h-full" /></div>
        
        <div className="max-w-4xl mx-auto text-center px-4 mb-12 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black text-[#5d821a] font-['Patrick_Hand'] tracking-wider mb-3">
            {lang === 'vi' ? 'Ly Matcha Đong Đầy Tình Yêu' : 'Matcha Filled With Love'}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 max-w-3xl w-full px-6 relative z-10">
          {/* Percentage Counter */}
          <div className="text-center font-['Patrick_Hand'] flex flex-col items-center md:w-48">
            <span className="text-7xl sm:text-9xl font-black text-[#5d821a] tracking-tighter select-none transition-all duration-100">
              {fillPercent}%
            </span>
            <span className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">{lang === 'vi' ? 'Hoàn thành ly nước' : 'Matcha completed'}</span>
          </div>

          {/* SVG Cup Animation */}
          <div className="relative w-64 h-80 flex items-center justify-center bg-white border border-[#f4ead1] rounded-[2.5rem] p-6 shadow-md transform rotate-1">
            <svg className="w-full h-full" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Cup background */}
              <path d="M30 10 L 70 10 L 63 110 L 37 110 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
              
              {/* Ice Cubes inside the cup */}
              <rect x="36" y="70" width="12" height="12" rx="2" transform="rotate(15 36 70)" fill="#e2e8f0" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="50" y="50" width="14" height="14" rx="2" transform="rotate(-10 50 50)" fill="#e2e8f0" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="38" y="35" width="10" height="10" rx="2" transform="rotate(45 38 35)" fill="#e2e8f0" opacity="0.6" stroke="#cbd5e1" strokeWidth="1" />

              {/* Matcha Liquid Fill with ClipPath */}
              <g clipPath="url(#cup-clip-path)">
                <rect 
                  x="15" 
                  y={110 - (fillPercent / 100) * 95} 
                  width="70" 
                  height="100" 
                  fill="#5d821a" 
                  opacity="0.85"
                />
                {/* Surface Foam */}
                {fillPercent > 0 && (
                  <path 
                    d={`M20 ${110 - (fillPercent / 100) * 95} Q 35 ${107 - (fillPercent / 100) * 95}, 50 ${110 - (fillPercent / 100) * 95} T 80 ${110 - (fillPercent / 100) * 95}`} 
                    stroke="#c3d9a1" 
                    strokeWidth="3.5" 
                    fill="none" 
                  />
                )}
              </g>

              {/* Cup Outline */}
              <path d="M28 8 L 72 8 L 65 112 L 35 112 Z" stroke="#5d821a" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
              {/* Rim */}
              <ellipse cx="50" cy="8" rx="22" ry="3.5" stroke="#5d821a" strokeWidth="3.5" fill="none" />
              
              {/* Straw */}
              <line x1="45" y1="3" x2="35" y2="-20" stroke="#c3d9a1" strokeWidth="4.5" strokeLinecap="round" />
              <line x1="45" y1="3" x2="35" y2="-20" stroke="#5d821a" strokeWidth="1.5" strokeLinecap="round" />

              {/* Clip path definitions */}
              <defs>
                <clipPath id="cup-clip-path">
                  <path d="M29 9 L 71 9 L 64.5 111 L 35.5 111 Z" />
                </clipPath>
              </defs>
            </svg>
          </div>

          {/* Narrative steps next to cup */}
          <div className="flex-1 font-['Patrick_Hand'] text-[#8c6b00] space-y-5">
            <div className={`transition-all duration-300 ${fillPercent >= 10 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
              <p className="font-black text-xl">🌱 {lang === 'vi' ? '0% - Bột Matcha Nhật' : '0% - Japanese Matcha'}</p>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'vi' ? 'Lớp bột Matcha Nhật Bản nguyên chất hảo hạng.' : 'Pure Japanese Matcha powder of premium quality.'}
              </p>
            </div>
            <div className={`transition-all duration-300 ${fillPercent >= 50 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
              <p className="font-black text-xl">🥣 50% - Đánh Bọt Chasen</p>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'vi' ? 'Được đánh bọt chasen thủ công tỉ mỉ bằng chổi tre truyền thống.' : 'Carefully whisked by hand using a traditional bamboo chasen.'}
              </p>
            </div>
            <div className={`transition-all duration-300 ${fillPercent >= 95 ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
              <p className="font-black text-xl">✨ 100% - Satoen Premium</p>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'vi' ? 'Sử dụng dòng bột trà xanh cao cấp Satoen Nhật Bản trứ danh.' : 'Using the famous premium Satoen Japanese green tea powder.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MENU SECTION --- */}
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Alternating MeNu Header with Cartoon */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <h2 className="text-6xl sm:text-8xl font-black font-['Patrick_Hand'] tracking-wider select-none flex">
              <span className="text-slate-800">M</span>
              <span className="text-[#5d821a]">e</span>
              <span className="text-slate-700">N</span>
              <span className="text-[#8c6b00]">u</span>
            </h2>
            <div className="text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
              <div>
                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{lang === 'vi' ? '100% Matcha Nhật Bản & cafe Cầu Đất thủ công' : '100% hand-whisked matcha & arabica'}</p>
                <p className="text-sm text-slate-400 mt-1 italic">{lang === 'vi' ? 'Một chút tình yêu trong từng cốc trà bánh giản đơn.' : 'A little love in every simple cup.'}</p>
              </div>
              
              {/* Cute Matcha Cartoon SVG */}
              <div className="flex-shrink-0">
                <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="25" y="35" width="50" height="50" rx="15" fill="#fcfaf5" stroke="#5d821a" strokeWidth="3" />
                  <rect x="26.5" y="36.5" width="47" height="10" rx="5" fill="#5d821a" />
                  <rect x="60" y="15" width="8" height="25" rx="3" fill="#c3d9a1" stroke="#5d821a" strokeWidth="2" transform="rotate(15 60 15)" />
                  <circle cx="40" cy="55" r="3" fill="#5d821a" />
                  <circle cx="60" cy="55" r="3" fill="#5d821a" />
                  <circle cx="35" cy="60" r="4" fill="#f28d8d" opacity="0.6" />
                  <circle cx="65" cy="60" r="4" fill="#f28d8d" opacity="0.6" />
                  <path d="M47 62 Q 50 65, 53 62" stroke="#5d821a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <circle cx="35" cy="23" r="11" fill="#8c6b00" stroke="#5d821a" strokeWidth="2" />
                  <circle cx="35" cy="23" r="7" fill="#ffffff" />
                  <circle cx="35" cy="23" r="5" fill="#c3d9a1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Shipping Promotion Banner styled like MadBrew */}
          <div className="bg-[#fcfaf5] border-2 border-[#f4ead1] rounded-[2rem] p-6 sm:p-8 max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 shadow-sm relative overflow-hidden mb-16">
            <div className="text-center sm:text-left z-10">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block mb-2">{lang === 'vi' ? 'CHƯƠNG TRÌNH KHUYẾN MẠI' : 'PROMOTION PROGRAM'}</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight mb-2 font-['Patrick_Hand']">{lang === 'vi' ? 'Mua từ 3 cốc trở lên' : 'Buy 3 cups or more'}</h3>
              <p className="text-slate-600 text-sm sm:text-base font-bold">
                {lang === 'vi' ? 'Giảm ngay ' : 'Get immediately '}
                <span className="text-orange-500 font-black text-xl font-['Patrick_Hand']">10.000 vnd</span>
                {lang === 'vi' ? ' Phí Ship' : ' off Shipping'}
              </p>
            </div>
            
            {/* Scooter delivery boy cartoon */}
            <div className="flex-shrink-0 z-10">
              <svg className="w-24 h-24 sm:w-28 sm:h-28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 75 H 70" stroke="#5d821a" strokeWidth="4" strokeLinecap="round" />
                <circle cx="32" cy="75" r="10" fill="#475569" stroke="#5d821a" strokeWidth="3" />
                <circle cx="32" cy="75" r="4" fill="#ffffff" />
                <circle cx="68" cy="75" r="10" fill="#475569" stroke="#5d821a" strokeWidth="3" />
                <circle cx="68" cy="75" r="4" fill="#ffffff" />
                <path d="M32 75 L 45 60 H 65 L 68 75" stroke="#5d821a" strokeWidth="3" fill="none" />
                <rect x="42" y="52" width="22" height="12" rx="4" fill="#c3d9a1" stroke="#5d821a" strokeWidth="2" />
                <path d="M62 60 L 65 48 H 58" stroke="#5d821a" strokeWidth="3" fill="none" strokeLinecap="round" />
                <circle cx="50" cy="35" r="12" fill="#ffd966" stroke="#5d821a" strokeWidth="2.5" />
                <path d="M38 35 C 38 20, 62 20, 62 35" fill="#5d821a" stroke="#5d821a" strokeWidth="2" />
                <circle cx="46" cy="36" r="1.5" fill="#5d821a" />
                <circle cx="54" cy="36" r="1.5" fill="#5d821a" />
                <path d="M49 41 Q 50 43, 51 41" stroke="#5d821a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                <rect x="15" y="45" width="20" height="20" rx="3" fill="#fcfaf5" stroke="#8c6b00" strokeWidth="2" />
                <text x="25" y="55" textAnchor="middle" fill="#8c6b00" fontSize="7" fontWeight="bold" fontFamily="system-ui">SHIP</text>
                <text x="25" y="61" textAnchor="middle" fill="#8c6b00" fontSize="7" fontWeight="bold" fontFamily="system-ui">SHIP</text>
              </svg>
            </div>
          </div>

          {/* Categories Tab Selector */}
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-12">
            {['Matcha & Coco', 'Coffee', 'MilkTea & more'].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-bold transition-colors ${activeCategory === cat ? 'bg-[#5d821a] text-white' : 'bg-[#f4ead1] text-[#5d821a] hover:bg-[#e4d6b1]'}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid (UPGRADED: Card is clickable, only shows Image, Name, Price) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredMenu.map((item) => {
              const finalPrice = item.price * (1 - (item.discount || 0) / 100);
              const itemName = lang === 'en' ? (item.nameEn || item.name) : item.name;
              
              return (
                <div 
                  key={item.id} 
                  onClick={() => openItemModal(item)}
                  className="bg-[#fcfaf5] rounded-3xl p-3 shadow-sm hover:shadow-xl hover:scale-[1.02] border-2 border-transparent hover:border-[#5d821a]/30 transition-all group relative cursor-pointer flex flex-col justify-between"
                >
                  {item.isBest && (
                    <div className="absolute top-4 left-0 z-20">
                      <div className="bg-[#ffd966] text-[#8c6b00] text-[10px] font-black px-2 py-1 rounded-r-lg shadow-sm flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {lang === 'vi' ? 'BÁN CHẠY' : 'BEST'}
                      </div>
                    </div>
                  )}

                  {item.discount > 0 && (
                    <div className="absolute top-4 right-4 z-20">
                      <div className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md border border-red-400">-{item.discount}%</div>
                    </div>
                  )}

                  <FallbackImage src={item.image} alt={itemName} fallbackText={itemName} className="w-full h-40 sm:h-56 rounded-2xl object-cover" />
                  
                  <div className="flex flex-col pt-3 pb-1 px-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-[#5d821a] transition-colors line-clamp-2 leading-tight mb-2">{itemName}</h3>
                    <div className="flex items-center gap-2">
                      {item.discount > 0 && <span className="text-slate-400 line-through text-xs">{formatPrice(item.price)}</span>}
                      <span className="text-[#5d821a] font-extrabold text-base sm:text-lg">{formatPrice(finalPrice)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toppings Listing */}
          <div className="mt-16 bg-[#f4ead1] rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
             <div className="absolute -right-10 -bottom-10 text-white/40 w-64 h-64 z-0"><BlobShape1 className="w-full h-full" /></div>
             <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[#5d821a] mb-6 flex items-center gap-2">
                  <Coffee size={24} /> {t[lang].toppingTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {toppings.map((top, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                      <span className="font-medium text-slate-700">{lang === 'en' ? top.nameEn : top.name}</span>
                      <span className="font-bold text-[#5d821a]">{formatPrice(top.price)}</span>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOD DELIVERY APPS SECTION (REPLACING LATEST NEWS) --- */}
      <section className="py-16 bg-[#fcfaf5] border-t border-[#f4ead1]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-[#5d821a] font-['Patrick_Hand'] tracking-wider mb-2">
            {lang === 'vi' ? 'HiAn đã có mặt trên các FoodApp' : 'HiAn is available on FoodApps'}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
            {lang === 'vi' 
              ? 'Đặt giao hàng tận nơi nhanh chóng qua các ứng dụng giao đồ ăn yêu thích của bạn!'
              : 'Order fast delivery directly through your favorite food delivery apps!'}
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <a href="https://shopeefood.vn/now-food/shop/1261980?shareChannel=zalo_message&stm_medium=referral&stm_source=https%3A%2F%2Fchat.zalo.me%2F-rw&uls_trackid=5620qgqj01oo" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#EE4D2D] hover:bg-[#dd3d1d] hover:-translate-y-1 font-bold text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
              🛍️ ShopeeFood
            </a>
            <a href="https://r.grab.com/g/6-20260703_213510_83351B6D3CD84A7A9112C86917877A1B_MEXMPS-5-C74DNJJEGBBEDA" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00B14F] hover:bg-[#009c44] hover:-translate-y-1 font-bold text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
              🏍️ GrabFood
            </a>
            <a href="https://xanhsmngon.onelink.me/14WJ/quvsnt1e" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#00A3A1] hover:bg-[#008f8d] hover:-translate-y-1 font-bold text-white shadow-lg hover:shadow-xl transition-all text-sm sm:text-base">
              🛵 Xanh SM Ngon
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER / LOCATION & DELIVERY PARTNER LINKS --- */}
      <footer id="location" className="bg-[#5d821a] text-white pt-20 pb-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 text-[#4a6815] w-96 h-96 opacity-50 z-0"><BlobShape2 className="w-full h-full" /></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            
            {/* Store details */}
            <div className="order-2 md:order-1 space-y-8">
              <div>
                <div className="mb-6 inline-block"><BrandLogo isFooter={true} /></div>
                <p className="text-[#c3d9a1] text-lg max-w-md">{t[lang].footerSlogan}</p>
              </div>
              
              <div className="space-y-6">
                <a href="https://maps.app.goo.gl/ztCXhM6rM2PVVbPQA" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-[#c3d9a1] transition-colors group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors"><MapPin size={24} /></div>
                  <div className="pt-1">
                    <p className="text-sm text-[#c3d9a1]">{t[lang].addressTitle}</p>
                    <p className="font-medium text-lg">25 Hưng Hoá 1, Hải Châu, Đà Nẵng</p>
                  </div>
                </a>

                <a href="tel:0339229168" className="flex items-start gap-3 hover:text-[#c3d9a1] transition-colors group">
                  <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-colors"><Phone size={24} /></div>
                  <div className="pt-1">
                    <p className="text-sm text-[#c3d9a1]">{t[lang].hotlineTitle}</p>
                    <p className="font-medium text-lg">0339.229.168</p>
                  </div>
                </a>

                <div className="flex items-start gap-3">
                  <div className="bg-white/10 p-3 rounded-xl"><Coffee size={24} /></div>
                  <div className="pt-1">
                    <p className="text-sm text-[#c3d9a1]">{t[lang].openingTitle}</p>
                    <p className="font-medium text-lg">{t[lang].openingDesc}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white hover:text-[#5d821a] transition-all"><Instagram size={20} /></a>
                <a href="#" className="bg-white/10 text-white p-3 rounded-full hover:bg-white hover:text-[#5d821a] transition-all font-bold text-lg flex items-center justify-center w-[44px] h-[44px]">f</a>
              </div>
            </div>

            {/* Google Map */}
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
                
                <a href="https://maps.app.goo.gl/ztCXhM6rM2PVVbPQA" target="_blank" rel="noreferrer" className="absolute top-4 right-4 bg-white text-[#5d821a] px-3 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold hover:bg-[#f4ead1] transition-colors cursor-pointer animate-pulse text-xs">
                  <MapPin size={18} /> {lang === 'vi' ? 'Xem trên Google Maps' : 'View on Google Maps'}
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-[#4a6815] pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-[#c3d9a1]">
            <p>© {new Date().getFullYear()} HiAn Matcha & Coco. {t[lang].rights}</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <a href="#" className="hover:text-white">{lang === 'vi' ? 'Điều khoản' : 'Terms'}</a>
              <a href="#" className="hover:text-white">{lang === 'vi' ? 'Bảo mật' : 'Privacy'}</a>
              <span className="text-[#4a6815]">|</span>
              <a href="#admin" onClick={(e) => { e.preventDefault(); setCurrentView('admin'); }} className="hover:text-white flex items-center gap-1 font-semibold">
                <Settings size={14} /> {t[lang].adminLink}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- FLOATING CART BAR --- */}
      {cart.length > 0 && !isCartOpen && !isCheckoutModalOpen && !selectedItemForCart && (
        <div 
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-[#245446] hover:bg-[#1a3d33] text-white rounded-full px-6 py-4 shadow-[0_10px_35px_rgba(0,0,0,0.2)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 cursor-pointer z-[90] flex justify-between items-center font-bold text-sm sm:text-base border border-emerald-800/20"
        >
          <span>
            {lang === 'vi' ? `Giỏ hàng • ${cart.reduce((sum, item) => sum + item.quantity, 0)} món` : `Cart • ${cart.reduce((sum, item) => sum + item.quantity, 0)} ${cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'}`}
          </span>
          <span className="font-black tracking-wide bg-white/10 px-3 py-1 rounded-full text-white">
            {formatPrice(cartSubtotal)}
          </span>
        </div>
      )}

      {/* --- ITEM CUSTOMIZATION MODAL (UPGRADED: NO SIZE SELECTION) --- */}
      {selectedItemForCart && (() => {
        const isMatchaDrink = selectedItemForCart.category === 'Matcha & Coco' || selectedItemForCart.name.toLowerCase().includes('matcha');
        
        return (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in duration-300 flex flex-col max-h-[92vh]">
              <div className="relative h-48 sm:h-56 bg-slate-100 flex-shrink-0">
                <button onClick={() => setSelectedItemForCart(null)} className="absolute top-4 right-4 z-10 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 backdrop-blur-md transition-colors">
                  <X size={20} />
                </button>
                {selectedItemForCart.image ? (
                  <img src={selectedItemForCart.image} alt={lang === 'en' ? (selectedItemForCart.nameEn || selectedItemForCart.name) : selectedItemForCart.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Coffee size={48} /></div>
                )}
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">{lang === 'en' ? (selectedItemForCart.nameEn || selectedItemForCart.name) : selectedItemForCart.name}</h3>
                  <p className="text-[#5d821a] font-extrabold text-2xl">
                    {formatPrice(calculateItemPrice(selectedItemForCart, tempMilk, tempExtras, tempToppings) * tempQuantity)}
                  </p>
                </div>

                {/* 1. Chọn Độ Ngọt */}
                <div>
                  <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Sparkles size={16} className="text-[#5d821a]" />{t[lang].sweetnessTitle}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['none', 'less', 'normal', 'extra'].map(sweet => (
                      <button 
                        key={sweet}
                        onClick={() => setTempSweetness(sweet)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${tempSweetness === sweet ? 'border-[#5d821a] bg-[#f4ead1] text-[#5d821a] shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {getSweetnessLabel(sweet)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Chọn Bột Matcha */}
                {isMatchaDrink && (
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Leaf size={16} className="text-[#5d821a]" />{t[lang].milkTitle}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {['fresh', 'premium'].map(powder => (
                        <button 
                          key={powder}
                          onClick={() => setTempMilk(powder)}
                          className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${tempMilk === powder ? 'border-[#5d821a] bg-[#f4ead1] text-[#5d821a] shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          {getMilkLabel(powder)} {powder === 'premium' && '(+12K)'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Thêm vị / Độ đậm */}
                {isMatchaDrink && (
                  <div>
                    <h4 className="font-bold text-slate-700 mb-2">{t[lang].extraTitle}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        type="button"
                        onClick={() => toggleTempExtra('bold')}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all ${tempExtras.includes('bold') ? 'border-[#5d821a] bg-[#f4ead1] text-[#5d821a] shadow-sm' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {lang === 'en' ? 'Extra Bold' : 'Gu đậm'} ({tempMilk === 'premium' ? '+10K' : '+6K'})
                      </button>
                    </div>
                  </div>
                )}

              {/* 4. Toppings */}
              <div>
                <h4 className="font-bold text-slate-700 mb-3 flex items-center gap-1.5"><ShoppingCart size={16} className="text-[#5d821a]" />{t[lang].toppingTitle}</h4>
                <div className="space-y-2">
                  {toppings.map(topping => {
                    const topLabel = lang === 'en' ? topping.nameEn : topping.name;
                    return (
                      <label key={topping.name} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${tempToppings.includes(topping.name) ? 'bg-[#5d821a] border-[#5d821a]' : 'border-slate-300'}`}>
                            {tempToppings.includes(topping.name) && <ShieldCheck size={14} className="text-white" />}
                          </div>
                          <span className="font-medium text-slate-700">{topLabel}</span>
                        </div>
                        <span className="text-slate-500 text-sm">+{formatPrice(topping.price)}</span>
                        <input 
                          type="checkbox" 
                          className="hidden" 
                          checked={tempToppings.includes(topping.name)}
                          onChange={() => toggleTempTopping(topping.name)}
                        />
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 5. Số lượng */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2">Số lượng / Quantity</h4>
                <div className="flex items-center justify-center gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <button onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"><Minus size={20}/></button>
                  <span className="text-2xl font-bold text-slate-800 w-8 text-center">{tempQuantity}</span>
                  <button onClick={() => setTempQuantity(tempQuantity + 1)} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-[#5d821a] transition-colors"><Plus size={20}/></button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex-shrink-0">
              <button onClick={confirmAddToCart} className="w-full py-4 bg-[#5d821a] text-white font-bold rounded-2xl hover:bg-[#4a6815] transition-colors flex justify-center items-center gap-2">
                <ShoppingCart size={20} /> {t[lang].addToCart}
              </button>
            </div>
          </div>
        </div>
      );
      })()}

      {/* --- CART SIDEBAR (UPGRADED: NO FORM FIELDS) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fcfaf5]">
              <h2 className="text-2xl font-bold text-[#5d821a] flex items-center gap-2"><ShoppingCart /> {t[lang].cartTitle}</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <ShoppingCart size={64} className="opacity-20" />
                  <p>{t[lang].emptyCart}</p>
                  <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-[#f4ead1] text-[#5d821a] rounded-full font-bold">{t[lang].continueShopping}</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Free Ship Notification */}
                  <div className="bg-[#f4ead1]/50 p-4 rounded-2xl border border-[#c3d9a1] text-xs font-bold text-[#5d821a]">
                    {cartCupCount >= 3 ? (
                      <p>{t[lang].shippingDiscountActive}</p>
                    ) : (
                      <p>{t[lang].shippingDiscountMsg.replace('{n}', (3 - cartCupCount).toString())}</p>
                    )}
                    <div className="w-full bg-white h-2.5 rounded-full mt-2 overflow-hidden border border-[#c3d9a1]">
                      <div 
                        className="bg-[#5d821a] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (cartCupCount / 3) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Cart Items list */}
                  <div className="space-y-4">
                    {cart.map(item => {
                      const itemName = lang === 'en' ? (item.nameEn || item.name) : item.name;
                      const optionsSummary = [];
                      optionsSummary.push(getSweetnessLabel(item.selectedSweetness));
                      if (item.selectedMilk !== 'fresh') optionsSummary.push(getMilkLabel(item.selectedMilk));
                      item.selectedExtras.forEach(e => optionsSummary.push(e === 'coffee' ? t[lang].extraCoffee : t[lang].extraMatcha));
                      item.selectedToppings.forEach(topName => {
                        const top = toppings.find(t => t.name === topName);
                        optionsSummary.push(lang === 'en' && top ? top.nameEn : topName);
                      });

                      return (
                        <div key={item.cartItemId} className="flex gap-4 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <img src={item.image} alt={itemName} className="w-16 h-16 object-cover rounded-xl" />
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{itemName}</h4>
                            <p className="text-[10px] text-slate-500 leading-tight mb-1">
                              {optionsSummary.join(', ')}
                            </p>
                            <p className="text-[#5d821a] font-bold text-sm">
                              {formatPrice(item.calculatedPrice * item.quantity)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <button onClick={() => updateQuantity(item.cartItemId, -1)} className="text-slate-400 hover:text-red-500"><Minus size={16}/></button>
                            <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, 1)} className="text-slate-400 hover:text-[#5d821a]"><Plus size={16}/></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Pricing & Action -> Open Checkout Modal */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] text-sm space-y-3">
                <div className="flex justify-between items-center text-slate-500">
                  <span>{t[lang].subtotal}:</span>
                  <span className="font-bold">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>{t[lang].shippingFee}:</span>
                  <span className="font-bold">{formatPrice(baseShippingFee)}</span>
                </div>
                {shippingDiscount > 0 && (
                  <div className="flex justify-between items-center text-red-500">
                    <span>{t[lang].shippingDiscount}:</span>
                    <span className="font-bold">-{formatPrice(shippingDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-slate-700 font-extrabold text-base">{t[lang].total}:</span>
                  <span className="text-2xl font-extrabold text-[#5d821a]">{formatPrice(cartTotal)}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                    setIsClipboardAlertOpen(true);
                    
                    // Auto copy order text to clipboard on first click
                    const partialOrderText = generateOrderText(false);
                    navigator.clipboard.writeText(partialOrderText).catch(e => console.log(e));
                  }} 
                  className="w-full py-4 bg-[#5d821a] text-white font-bold rounded-2xl hover:bg-[#4a6815] transition-colors flex justify-center items-center gap-2 mt-2"
                >
                  {t[lang].orderNow} <Send size={18}/>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- MODAL POPUP: THÔNG TIN GIAO HÀNG (UPGRADED: MATCHES SCREENSHOT EXACTLY) --- */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 flex flex-col my-8">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t[lang].deliveryTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">{t[lang].deliverySub}</p>
              </div>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Alert Warning Box */}
              {isClipboardAlertOpen && (
                <div className="bg-[#f4ead1] p-3 rounded-xl border border-[#c3d9a1] text-[11px] font-semibold text-slate-700 flex justify-between items-start gap-2 animate-in fade-in">
                  <span>{t[lang].orderClipboardWarning}</span>
                  <button type="button" onClick={() => setIsClipboardAlertOpen(false)} className="text-slate-400 hover:text-slate-600 mt-0.5">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên của bạn *</label>
                <input 
                  type="text" 
                  placeholder="VD: Linh" 
                  required 
                  value={customerInfo.name} 
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] focus:ring-1 focus:ring-[#5d821a] outline-none text-sm bg-slate-50/50" 
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ *</label>
                <textarea 
                  placeholder="Số nhà, tên đường, quận..." 
                  required 
                  rows={2}
                  value={customerInfo.address} 
                  onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] focus:ring-1 focus:ring-[#5d821a] outline-none text-sm bg-slate-50/50"
                ></textarea>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại *</label>
                <input 
                  type="text" 
                  placeholder="VD: 09xxxxxxxx" 
                  required 
                  value={customerInfo.phone} 
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/\D/g, '');
                    setCustomerInfo({...customerInfo, phone: cleanVal});
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] focus:ring-1 focus:ring-[#5d821a] outline-none text-sm bg-slate-50/50" 
                />
              </div>

              {/* Delivery hour */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t[lang].deliveryTime}</label>
                <input 
                  type="text" 
                  placeholder={t[lang].deliveryTimePlaceholder} 
                  value={deliveryTime} 
                  onChange={e => setDeliveryTime(e.target.value)} 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] focus:ring-1 focus:ring-[#5d821a] outline-none text-sm bg-slate-50/50" 
                />
              </div>

              {/* Payment selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">{t[lang].paymentTitle}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border font-bold text-center text-xs transition-all ${
                      paymentMethod === 'cod' 
                        ? 'border-[#5d821a] bg-[#5d821a] text-white shadow-md' 
                        : 'border-slate-200 text-slate-600 bg-[#fcfaf5]'
                    }`}
                  >
                    {t[lang].paymentCod}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-xl border font-bold text-center text-xs transition-all ${
                      paymentMethod === 'transfer' 
                        ? 'border-[#5d821a] bg-[#5d821a] text-white shadow-md' 
                        : 'border-slate-200 text-slate-600 bg-[#fcfaf5]'
                    }`}
                  >
                    {t[lang].paymentTransfer}
                  </button>
                </div>
              </div>

              {/* Custom Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú (tuỳ chọn)</label>
                <textarea 
                  placeholder="Ít đá, ít ngọt..." 
                  rows={2}
                  value={customerInfo.note} 
                  onChange={e => setCustomerInfo({...customerInfo, note: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-[#5d821a] focus:ring-1 focus:ring-[#5d821a] outline-none text-sm bg-slate-50/50"
                ></textarea>
                
                {/* Note suggestions chips */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Đá riêng', 'Đá chung', 'Ít ngọt'].map(sug => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        const currentNote = customerInfo.note ? customerInfo.note.trim() : '';
                        if (currentNote.includes(sug)) return;
                        const separator = currentNote ? ', ' : '';
                        setCustomerInfo({...customerInfo, note: currentNote + separator + sug});
                      }}
                      className="px-3 py-1 bg-[#f4ead1] hover:bg-[#e4d6b1] text-[#5d821a] font-bold text-xs rounded-full border border-[#c3d9a1] transition-all"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons (Huỷ and Gửi đơn Messenger) */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsCheckoutModalOpen(false)} 
                  className="px-5 py-3.5 bg-[#f4ead1] hover:bg-[#e4d6b1] text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  {t[lang].cancel}
                </button>
                <button 
                  type="submit" 
                  disabled={isCheckingOut}
                  className="px-6 py-3.5 bg-[#5d821a] hover:bg-[#4a6815] text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  {isCheckingOut ? <><Loader2 size={16} className="animate-spin" /> {t[lang].processing}</> : <>{t[lang].sendMessenger}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FINAL ORDER SUCCESS MODAL --- */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t[lang].successTitle}</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {t[lang].successDesc}
            </p>
            
            <div className="space-y-3">
              <a 
                href={`https://m.me/hianmatcha.dn?text=${encodeURIComponent(finalOrderText)}`} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setOrderSuccess(false);
                  setCustomerInfo({ name: '', phone: '', address: '', note: '' });
                  setDeliveryTime('');
                }}
                className="w-full py-3.5 bg-[#0084ff] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0073e6] transition-colors text-sm"
              >
                <Send size={18} /> {t[lang].sendMessenger}
              </a>
              <a 
                href="https://zalo.me/0339229168" 
                target="_blank" 
                rel="noreferrer"
                onClick={() => {
                  setOrderSuccess(false);
                  setCustomerInfo({ name: '', phone: '', address: '', note: '' });
                  setDeliveryTime('');
                }}
                className="w-full py-3.5 bg-[#0099ff] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#0088ee] transition-colors text-sm"
              >
                <Phone size={18} /> {t[lang].sendZalo}
              </a>
              <button 
                onClick={() => {
                  setOrderSuccess(false);
                  setCustomerInfo({ name: '', phone: '', address: '', note: '' });
                  setDeliveryTime('');
                }} 
                className="w-full py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
              >
                {t[lang].close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Receipt Capture Element */}
      <div id="receipt-capture" style={{ display: 'none', backgroundColor: '#ffffff', color: '#1e293b' }} className="absolute top-[-9999px] left-[-9999px] w-[400px] p-8 font-sans">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-1" style={{ color: '#5d821a' }}>HiAn Matcha & Coco</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>25 Hưng Hoá 1, Hải Châu, Đà Nẵng</p>
          <p className="text-sm" style={{ color: '#64748b' }}>Hotline: 0339.229.168</p>
        </div>
        <div className="py-4 mb-4 space-y-2 text-sm" style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
          <p><strong>Khách hàng:</strong> {customerInfo.name}</p>
          <p><strong>SĐT:</strong> {customerInfo.phone}</p>
          <p><strong>Địa chỉ:</strong> {customerInfo.address}</p>
          <p><strong>Giờ giao:</strong> {deliveryTime || 'Sớm nhất'}</p>
          <p><strong>Thanh toán:</strong> {paymentMethod === 'transfer' ? t[lang].paymentTransfer : t[lang].paymentCod}</p>
          {customerInfo.note && <p><strong>Ghi chú:</strong> {customerInfo.note}</p>}
        </div>
        <div className="space-y-3 mb-4 text-sm">
          {cart.map(item => {
            const itemName = lang === 'en' ? (item.nameEn || item.name) : item.name;
            const optionsSummary = [];
            optionsSummary.push(getSweetnessLabel(item.selectedSweetness));
            if (item.selectedMilk !== 'fresh') optionsSummary.push(getMilkLabel(item.selectedMilk));
            item.selectedExtras.forEach(e => optionsSummary.push(e === 'coffee' ? t[lang].extraCoffee : t[lang].extraMatcha));
            item.selectedToppings.forEach(topName => {
              const top = toppings.find(t => t.name === topName);
              optionsSummary.push(lang === 'en' && top ? top.nameEn : topName);
            });
            
            return (
              <div key={item.cartItemId} className="flex justify-between">
                <div className="flex-1">
                  <p className="font-bold">{itemName}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>{optionsSummary.join(', ')}</p>
                  <p style={{ color: '#64748b' }}>{item.quantity} x {formatPrice(item.calculatedPrice)}</p>
                </div>
                <p className="font-bold">{formatPrice(item.calculatedPrice * item.quantity)}</p>
              </div>
            );
          })}
        </div>
        <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid #1e293b' }}>
          <span className="font-bold text-lg">TỔNG CỘNG:</span>
          <span className="font-extrabold text-xl" style={{ color: '#5d821a' }}>{formatPrice(cartTotal)}</span>
        </div>
        <div className="text-center mt-8 text-sm italic" style={{ color: '#64748b' }}>
          Cảm ơn bạn đã chọn HiAn! ❤️
        </div>
      </div>
      
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[250] bg-slate-900/95 text-white py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-[#5d821a] p-1.5 rounded-full text-white">
            <ShoppingCart size={16} />
          </div>
          <span className="font-semibold text-sm">{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)} 
            className="text-slate-400 hover:text-white transition-colors ml-2"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
