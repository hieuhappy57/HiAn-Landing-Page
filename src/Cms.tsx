import React, { useState, useEffect } from 'react';
import { 
  MapPin, Phone, Instagram, Facebook, Menu as MenuIcon, X, Leaf, Coffee, Star, 
  Sparkles, Loader2, Send, Settings, Save, Trash2, Plus, ArrowLeft, ShieldCheck, 
  Edit, Upload, RefreshCw, ShoppingCart, Minus, Globe, Clipboard, LogOut, CheckCircle, 
  Clock, Check, Package, XCircle, DollarSign, BarChart3, ChevronRight, TrendingUp, AlertCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (e) {
  console.error("Firebase init error in CMS:", e);
}

const appId = 'default-app-id';

// Default menu items for Reset function
const defaultMenuItems = [
  { id: "1", name: 'Matcha Latte', nameEn: 'Matcha Latte', price: 30000, image: '/HiAn_MatchaLatte.png', category: 'Matcha & Coco', isBest: false, description: 'Matcha nguyên chất kết hợp cùng sữa tươi thanh trùng mềm mịn.', descriptionEn: 'Pure matcha combined with smooth pasteurized fresh milk.', discount: 0 },
  { id: "2", name: 'Matcha Cold Whisk', nameEn: 'Matcha Cold Whisk', price: 39000, image: '/Matcha_Cold_whish.png', category: 'Matcha & Coco', isBest: true, description: 'Trà xanh nguyên bản đậm vị, đánh bọt thủ công chuẩn phong cách Nhật Bản.', descriptionEn: 'Authentic bold matcha, hand-whisked in traditional Japanese style.', discount: 0 },
  { id: "3", name: 'Matcha Kem Muối', nameEn: 'Matcha Salted Cream', price: 35000, image: '/Matcha_Kem_Muối.png', category: 'Matcha & Coco', isBest: false, description: 'Matcha nguyên chất đậm đà phủ một lớp kem muối mặn ngọt bồng bềnh.', descriptionEn: 'Rich pure matcha topped with a fluffy layer of sweet & salty cream.', discount: 0 },
  { id: "4", name: 'Coco Matcha Cream', nameEn: 'Coco Matcha Cream', price: 35000, image: '/Coco_Matcha_Cream.png', category: 'Matcha & Coco', isBest: true, description: 'Sự kết hợp hoàn hảo giữa matcha thanh mát và lớp kem dừa béo ngậy.', descriptionEn: 'The perfect combination of refreshing matcha and creamy coconut.', discount: 0 },
  { id: "5", name: 'Sữa Dừa Matcha Cream', nameEn: 'Coconut Milk Matcha Cream', price: 35000, image: '/Sua_Dua_Matcha_Cream.png', category: 'Matcha & Coco', isBest: true, description: 'Sữa dừa thơm lừng hòa quyện cùng lớp kem matcha đặc biệt.', descriptionEn: 'Fragrant coconut milk blended with a special matcha cream topping.', discount: 0 },
  { id: "16", name: 'Matcha Kem Phô Mai', nameEn: 'Matcha Cheese Foam', price: 39000, image: '/Matcha_Kem_Pho_Mai.png', category: 'Matcha & Coco', isBest: false, description: 'Sự hòa quyện tuyệt vời giữa vị thanh mát của Matcha và lớp kem phô mai béo ngậy.', descriptionEn: 'A wonderful blend of refreshing matcha and rich cheese foam topping.', discount: 0 },
  { id: "17", name: 'Double Matcha', nameEn: 'Double Matcha', price: 39000, image: '/Double_Matcha.png', category: 'Matcha & Coco', isBest: false, description: 'Gấp đôi lượng matcha nguyên chất cho gu đậm đà nguyên bản mạnh mẽ.', descriptionEn: 'Double shot of pure matcha for an extra rich and bold flavor experience.', discount: 0 },
  { id: "7", name: 'Nâu Lắc', nameEn: 'Nau Lac (Shaken Iced Coffee)', price: 20000, image: '/Ca_Nau.png', category: 'Coffee', isBest: false, description: 'Cà phê nâu lắc đá mát lạnh, đậm đà hương vị truyền thống.', descriptionEn: 'Shaken Vietnamese iced milk coffee, bold and traditional flavor.', discount: 0 },
  { id: "8", name: 'Xỉu Muối', nameEn: 'Salted Bac Xiu', price: 29000, image: '/Bac_xiu_muoi.png', category: 'Coffee', isBest: false, description: 'Bạc xỉu truyền thống phá cách với chút kem muối béo mặn.', descriptionEn: 'Traditional Bac Xiu with a modern twist of savory salted cream.', discount: 0 },
  { id: "9", name: 'Cà Muối', nameEn: 'Salted Coffee', price: 25000, image: '/Ca_Muoi.png', category: 'Coffee', isBest: false, description: 'Cà phê đen nguyên bản mạnh mẽ phủ lớp kem muối đặc trưng.', descriptionEn: 'Strong traditional black coffee topped with signature salted cream.', discount: 0 },
  { id: "10", name: 'Cà Đậu Phộng', nameEn: 'Peanut Coffee', price: 29000, image: '/Ca_Dau_Phong.jpg', category: 'Coffee', isBest: true, description: 'Cà phê rang xay đậm vị kết hợp vị bùi béo đặc trưng của bơ đậu phộng.', descriptionEn: 'Rich ground coffee combined with the buttery taste of peanut butter.', discount: 0 },
  { id: "18", name: 'Lục Trà Sữa Trân Châu', nameEn: 'Jasmine Milk Tea with Pearls', price: 25000, image: '/Luc_Tra_Sua_Tran_Chau.png', category: 'MilkTea & more', isBest: false, description: 'Lục trà lài thơm mát kết hợp sữa thơm béo và trân châu trắng dai giòn.', descriptionEn: 'Fragrant jasmine milk tea combined with chewy white pearls.', discount: 0 },
  { id: "19", name: 'Lục Trà Sữa Xoài Trân Châu', nameEn: 'Mango Jasmine Milk Tea with Pearls', price: 30000, image: '/Luc_Tra_Sua_Xoai_Tran_Chau.png', category: 'MilkTea & more', isBest: false, description: 'Lục trà lài hòa quyện mứt xoài chín ngọt ngào và trân châu trắng.', descriptionEn: 'Jasmine milk tea infused with sweet mango jam and white pearls.', discount: 0 },
  { id: "20", name: 'Lục Trà Sữa Kem Phô Mai', nameEn: 'Jasmine Milk Tea with Cheese Foam', price: 35000, image: '/Luc_Tra_Sua_Kem_Pho_Mai.png', category: 'MilkTea & more', isBest: false, description: 'Lục trà sữa lài đậm vị phủ lớp kem phô mai bồng bềnh béo ngậy.', descriptionEn: 'Rich jasmine milk tea topped with a fluffy layer of creamy cheese foam.', discount: 0 },
  { id: "21", name: 'Sữa Dâu Sấy Kem Mặn', nameEn: 'Strawberry Milk with Salted Cream', price: 30000, image: '/Sua_Dau_Say_Kem_Man.png', category: 'MilkTea & more', isBest: false, description: 'Sữa tươi dâu ngọt ngào hòa quyện cùng dâu sấy và lớp kem muối béo mặn.', descriptionEn: 'Sweet strawberry milk combined with dried strawberries and savory salted cream.', discount: 0 },
  { id: "22", name: 'Lài Si Mơ', nameEn: 'Jasmine Apricot Tea', price: 25000, image: '/Lai_Si_Mo.png', category: 'MilkTea & more', isBest: false, description: 'Trà lài thanh nhẹ kết hợp mứt mơ chua ngọt thanh mát giải nhiệt mùa hè.', descriptionEn: 'Light jasmine tea blended with sweet & sour apricot jam for a refreshing summer drink.', discount: 0 },
  { id: "23", name: 'Trà Dâu Tằm', nameEn: 'Mulberry Tea', price: 27000, image: '/Tra_Dau_Tam.png', category: 'MilkTea & more', isBest: false, description: 'Trà dâu tằm chua ngọt thơm mát thanh nhiệt.', descriptionEn: 'Sweet and sour mulberry tea, refreshing for summer days.', discount: 0 }
];

const formatPrice = (price: number) => `${(price / 1000)}k`;
const formatFullPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export default function Cms() {
  const [user, setUser] = useState<any>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'settings'>('dashboard');
  const [menuList, setMenuList] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // Menu Item Editor Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [itemForm, setItemForm] = useState({
    id: '',
    name: '',
    nameEn: '',
    price: 30000,
    discount: 0,
    category: 'Matcha & Coco',
    isBest: false,
    description: '',
    descriptionEn: '',
    image: '/HiAn_MatchaLatte.png'
  });

  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled'>('all');
  const [menuFilter, setMenuFilter] = useState<'all' | 'Matcha & Coco' | 'Coffee' | 'MilkTea & more'>('all');

  // Listen to Auth State
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Menu and Orders List
  useEffect(() => {
    if (!db || !user) return;

    const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
    const unsubscribeMenu = onSnapshot(menuRef, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ ...doc.data() });
      });
      // Sort by ID naturally
      items.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      setMenuList(items.length > 0 ? items : defaultMenuItems);
    });

    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ orderId: doc.id, ...doc.data() });
      });
      // Sort orders by createdAt desc
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Play ka-ching sound if a new order arrives!
      if (ordersList.length > 0 && items.length > ordersList.length) {
        const newOrder = items[0];
        if (newOrder.status === 'pending') {
          try {
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/911/911-200.wav");
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play blocked by browser", e));
          } catch (e) {
            console.error("Audio error", e);
          }
        }
      }
      setOrdersList(items);
    });

    return () => {
      unsubscribeMenu();
      unsubscribeOrders();
    };
  }, [user, ordersList.length]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
      setLoginError("Không thể kết nối đến Firebase auth client.");
      return;
    }
    setIsLoading(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, emailInput, passwordInput);
    } catch (err: any) {
      console.error(err);
      setLoginError("Email hoặc mật khẩu không chính xác!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (auth) signOut(auth);
    setUser(null);
  };

  // Order status updating
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!db) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId);
      await updateDoc(docRef, { status: newStatus });
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!db) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'orders', orderId));
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to delete order:", err);
    }
  };

  // Menu crud operations
  const handleOpenMenuModal = (item: any | null = null) => {
    if (item) {
      setEditingItem(item);
      setItemForm({ ...item });
    } else {
      setEditingItem(null);
      // Auto increment next ID
      const nextId = menuList.length > 0 ? (Math.max(...menuList.map(i => parseInt(i.id) || 0)) + 1).toString() : "1";
      setItemForm({
        id: nextId,
        name: '',
        nameEn: '',
        price: 30000,
        discount: 0,
        category: 'Matcha & Coco',
        isBest: false,
        description: '',
        descriptionEn: '',
        image: '/HiAn_MatchaLatte.png'
      });
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    try {
      const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
      await setDoc(doc(menuRef, itemForm.id), {
        ...itemForm,
        price: Number(itemForm.price),
        discount: Number(itemForm.discount)
      });
      setIsMenuModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save menu item:", err);
      alert("Lưu món thất bại. Kiểm tra kết nối Firestore hoặc quyền bảo mật.");
    }
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!db) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa món nước này khỏi thực đơn không?")) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'menu', id));
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleResetMenu = async () => {
    if (!db) return;
    if (!window.confirm("Xác nhận đặt lại toàn bộ thực đơn về mặc định ban đầu? Các món tự thêm sẽ bị xóa.")) return;
    try {
      const menuRef = collection(db, 'artifacts', appId, 'public', 'data', 'menu');
      // Delete current items first
      for (const item of menuList) {
        await deleteDoc(doc(menuRef, item.id));
      }
      // Set defaults
      for (const item of defaultMenuItems) {
        await setDoc(doc(menuRef, item.id), item);
      }
      alert("Đã đặt lại thực đơn mặc định thành công!");
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  // Helper values for Dashboard tab
  const totalRevenue = ordersList
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  
  const pendingOrdersCount = ordersList.filter(o => o.status === 'pending').length;
  const completedOrdersCount = ordersList.filter(o => o.status === 'completed').length;
  
  // Calculate top selling drinks
  const drinkSales: { [key: string]: { name: string, qty: number, rev: number } } = {};
  ordersList.filter(o => o.status === 'completed').forEach(order => {
    if (Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        if (!drinkSales[item.name]) {
          drinkSales[item.name] = { name: item.name, qty: 0, rev: 0 };
        }
        drinkSales[item.name].qty += item.quantity || 1;
        drinkSales[item.name].rev += (item.totalPrice * item.quantity) || 0;
      });
    }
  });
  const topSellingDrinks = Object.values(drinkSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Status style helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-600 rounded-full border border-amber-200/50 flex items-center gap-1.5 w-fit"><Clock size={12} /> Chờ xử lý</span>;
      case 'confirmed':
        return <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-full border border-indigo-200/50 flex items-center gap-1.5 w-fit"><Check size={12} /> Đã nhận</span>;
      case 'shipping':
        return <span className="px-3 py-1 text-xs font-bold bg-sky-50 text-sky-600 rounded-full border border-sky-200/50 flex items-center gap-1.5 w-fit"><Package size={12} /> Đang giao</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200/50 flex items-center gap-1.5 w-fit"><CheckCircle size={12} /> Hoàn thành</span>;
      case 'cancelled':
        return <span className="px-3 py-1 text-xs font-bold bg-rose-50 text-rose-600 rounded-full border border-rose-200/50 flex items-center gap-1.5 w-fit"><XCircle size={12} /> Đã hủy</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold bg-slate-100 text-slate-600 rounded-full w-fit">Chưa rõ</span>;
    }
  };

  // Render Login Card
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Soft floating decorative blur circles */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#5d821a]/5 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#8c6b00]/5 blur-3xl"></div>
        
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-2xl bg-[#f4ead1] text-[#5d821a] mb-4">
              <ShieldCheck size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#245446] tracking-tight">HiAn CMS</h2>
            <p className="text-slate-500 text-sm mt-1">Trang quản trị thực đơn và đơn hàng chính thức</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Tài khoản Email</label>
              <input 
                type="email" 
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@hian.vn"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#5d821a] focus:ring-2 focus:ring-[#5d821a]/10 outline-none transition-all text-slate-800 text-sm font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Mật khẩu</label>
              <input 
                type="password" 
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-[#5d821a] focus:ring-2 focus:ring-[#5d821a]/10 outline-none transition-all text-slate-800 text-sm font-semibold"
              />
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#5d821a] hover:bg-[#4a6915] text-white py-3.5 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập hệ thống</span>
              )}
            </button>
          </form>
          
          <div className="text-center mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            HiAn Matcha & Coco · Da Nang
          </div>
        </div>
      </div>
    );
  }

  // Filtered Orders
  const filteredOrders = ordersList.filter(order => {
    if (orderFilter === 'all') return true;
    return order.status === orderFilter;
  });

  // Filtered Menu Items
  const filteredMenu = menuList.filter(item => {
    if (menuFilter === 'all') return true;
    return item.category === menuFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-700">
      
      {/* --- SIDEBAR / LEFT PANEL --- */}
      <aside className="w-64 bg-[#245446] text-white flex flex-col justify-between flex-shrink-0 hidden md:flex">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-emerald-950 flex items-center gap-3">
            <div className="bg-[#f4ead1] p-1.5 rounded-lg text-[#5d821a]">
              <Leaf size={20} />
            </div>
            <div>
              <h1 className="font-bold text-md tracking-tight leading-none">HiAn CMS</h1>
              <span className="text-[10px] text-emerald-200/60 font-semibold tracking-widest uppercase">Quản trị cửa hàng</span>
            </div>
          </div>
          
          {/* Navigation list */}
          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${activeTab === 'dashboard' ? 'bg-[#5d821a] text-white shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'}`}
            >
              <BarChart3 size={18} />
              <span>Tổng quan</span>
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${activeTab === 'orders' ? 'bg-[#5d821a] text-white shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={18} />
                <span>Đơn hàng</span>
              </div>
              {pendingOrdersCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{pendingOrdersCount}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${activeTab === 'menu' ? 'bg-[#5d821a] text-white shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'}`}
            >
              <Coffee size={18} />
              <span>Thực đơn</span>
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${activeTab === 'settings' ? 'bg-[#5d821a] text-white shadow-md' : 'text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white'}`}
            >
              <Settings size={18} />
              <span>Cài đặt hệ thống</span>
            </button>
          </nav>
        </div>

        {/* Footer Admin info */}
        <div className="p-4 border-t border-emerald-950">
          <div className="bg-emerald-950/40 p-3 rounded-xl flex items-center justify-between mb-2">
            <div className="overflow-hidden pr-2">
              <p className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">Đang đăng nhập</p>
              <p className="text-xs text-white truncate font-bold">{user?.email}</p>
            </div>
            <button 
              onClick={handleLogout}
              title="Đăng xuất"
              className="p-2 text-emerald-300 hover:text-rose-400 hover:bg-emerald-900/50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-[10px] text-emerald-400/50 text-center font-semibold">
            HiAn Matcha & Coco v1.1
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT WINDOW --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header toolbar for Mobile */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-[#f4ead1] p-1.5 rounded-lg text-[#5d821a]">
              <Leaf size={16} />
            </div>
            <span className="font-bold text-[#245446] text-lg">HiAn CMS</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Navigation Tab strip for mobile screen */}
        <nav className="bg-white border-b border-slate-200 flex p-1 md:hidden overflow-x-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 min-w-[70px] text-center py-2 px-1 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'text-[#5d821a] bg-[#f4ead1]/50' : 'text-slate-500'}`}
          >
            Tổng quan
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[70px] text-center py-2 px-1 text-xs font-bold rounded-lg relative transition-all ${activeTab === 'orders' ? 'text-[#5d821a] bg-[#f4ead1]/50' : 'text-slate-500'}`}
          >
            Đơn {pendingOrdersCount > 0 && <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 min-w-[70px] text-center py-2 px-1 text-xs font-bold rounded-lg transition-all ${activeTab === 'menu' ? 'text-[#5d821a] bg-[#f4ead1]/50' : 'text-slate-500'}`}
          >
            Thực đơn
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 min-w-[70px] text-center py-2 px-1 text-xs font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'text-[#5d821a] bg-[#f4ead1]/50' : 'text-slate-500'}`}
          >
            Cài đặt
          </button>
        </nav>

        {/* Main tabs wrapper */}
        <main className="p-6 md:p-8 flex-1">

          {/* =========================================
              TAB 1: DASHBOARD OVERVIEW
              ========================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Header metrics intro */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Kênh tổng quan kinh doanh</h2>
                <p className="text-slate-500 text-sm">Chào mừng quay lại, dữ liệu cập nhật theo thời gian thực.</p>
              </div>

              {/* Top stats KPIs grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Revenue Card */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu hoàn thành</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{formatFullPrice(totalRevenue)}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <DollarSign size={24} />
                  </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số đơn hàng</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{ordersList.length} đơn</h3>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <ShoppingCart size={24} />
                  </div>
                </div>

                {/* Pending Orders Card */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn chờ xử lý</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{pendingOrdersCount} đơn</h3>
                  </div>
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <Clock size={24} className={pendingOrdersCount > 0 ? 'animate-pulse' : ''} />
                  </div>
                </div>

                {/* Total Drinks in Menu Card */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số món thực đơn</p>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">{menuList.length} món</h3>
                  </div>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                    <Coffee size={24} />
                  </div>
                </div>
              </div>

              {/* Lower dashboard columns grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart Panel */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-bold text-slate-800">Biểu đồ Đơn hàng tuần này</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Số lượng đơn theo các ngày gần đây</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><TrendingUp size={12} /> Tăng trưởng</span>
                  </div>

                  {/* Draw simple simulated Bar Chart using pure CSS and Tailwind heights */}
                  <div className="h-64 flex items-end justify-between px-2 pt-6 border-b border-slate-100">
                    {[
                      { day: 'Thứ 2', count: 4, height: 'h-[30%]', color: 'bg-slate-300' },
                      { day: 'Thứ 3', count: 8, height: 'h-[50%]', color: 'bg-slate-300' },
                      { day: 'Thứ 4', count: 12, height: 'h-[75%]', color: 'bg-[#5d821a]/70' },
                      { day: 'Thứ 5', count: 7, height: 'h-[45%]', color: 'bg-slate-300' },
                      { day: 'Thứ 6', count: 15, height: 'h-[90%]', color: 'bg-[#5d821a]/70' },
                      { day: 'Thứ 7', count: 18, height: 'h-[100%]', color: 'bg-[#245446]' },
                      { day: 'Chủ Nhật', count: 14, height: 'h-[80%]', color: 'bg-[#5d821a]' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 w-10 sm:w-12 group">
                        <span className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-1.5 py-0.5 rounded mb-1">{item.count} đơn</span>
                        <div className={`w-6 sm:w-8 ${item.height} ${item.color} rounded-t-lg transition-all duration-500 hover:opacity-85 shadow-sm`}></div>
                        <span className="text-xs text-slate-500 font-bold mt-2 pb-2 truncate w-full text-center">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Selling Drinks panel */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                  <h4 className="font-bold text-slate-800 mb-4">Các món bán chạy nhất</h4>
                  <div className="space-y-4">
                    {topSellingDrinks.length > 0 ? (
                      topSellingDrinks.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-500">{idx + 1}</span>
                            <span className="font-bold text-sm text-slate-700 truncate max-w-[150px]">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-[#5d821a] bg-[#f4ead1]/50 px-2 py-0.5 rounded-full">{item.qty} đã bán</span>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">{formatFullPrice(item.rev)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-sm italic">
                        Chưa có dữ liệu bán chạy
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Lower activity checklist */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800">Đơn hàng mới nhận cần xử lý</h4>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#5d821a] flex items-center gap-1 hover:underline"
                  >
                    Xem tất cả <ChevronRight size={14} />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {ordersList.filter(o => o.status === 'pending').slice(0, 3).map((order) => (
                    <div key={order.orderId} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-bold text-slate-700">{order.customer?.name} — <span className="font-medium text-slate-500">{order.customer?.phone}</span></p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{order.customer?.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#5d821a]">{formatPrice(order.total)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  {ordersList.filter(o => o.status === 'pending').length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-sm italic">
                      Tuyệt vời! Không có đơn hàng nào đang chờ xử lý. 🎉
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 2: ORDERS REAL-TIME MANAGER
              ========================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Header options */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý Đơn hàng thời gian thực</h2>
                  <p className="text-slate-500 text-sm">Theo dõi và cập nhật trạng thái đơn hàng của khách.</p>
                </div>
              </div>

              {/* Status filtering toolbar */}
              <div className="bg-white p-2 rounded-2xl border border-slate-100 flex flex-wrap gap-1">
                {[
                  { key: 'all', label: 'Tất cả đơn' },
                  { key: 'pending', label: 'Chờ xử lý' },
                  { key: 'confirmed', label: 'Đã nhận' },
                  { key: 'shipping', label: 'Đang giao' },
                  { key: 'completed', label: 'Hoàn thành' },
                  { key: 'cancelled', label: 'Đã hủy' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setOrderFilter(item.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${orderFilter === item.key ? 'bg-[#5d821a] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Orders List Table Container */}
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 font-bold border-bottom border-slate-100">
                        <th className="p-4 pl-6 text-xs uppercase tracking-wider">Khách hàng</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Thời gian nhận</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Giá trị</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Hình thức thanh toán</th>
                        <th className="p-4 text-xs uppercase tracking-wider">Trạng thái</th>
                        <th className="p-4 pr-6 text-xs uppercase tracking-wider text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 pl-6">
                            <p className="font-bold text-slate-800 text-sm">{order.customer?.name}</p>
                            <div className="flex flex-col gap-0.5 text-xs text-slate-400 font-medium mt-1">
                              <span className="flex items-center gap-1"><Phone size={12} /> {order.customer?.phone}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} className="flex-shrink-0" /> {order.customer?.address}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{order.deliveryTime}</span>
                            <p className="text-[10px] text-slate-400 font-bold mt-1.5">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-extrabold text-[#5d821a]">{formatPrice(order.total)}</p>
                            <span className="text-[10px] text-slate-400 font-bold">({order.items?.length || 0} món)</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wide">
                              {order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                            </span>
                          </td>
                          <td className="p-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="inline-flex gap-2">
                              <button 
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition-all"
                              >
                                Chi tiết
                              </button>
                              <button 
                                onClick={() => handleDeleteOrder(order.orderId)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-lg transition-all"
                                title="Xóa đơn"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-20 text-slate-400 text-sm italic">
                            Không tìm thấy đơn hàng nào phù hợp.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 3: MENU CRUD DATABASE EDITOR
              ========================================= */}
          {activeTab === 'menu' && (
            <div className="space-y-6">
              
              {/* Header options */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cơ sở dữ liệu thực đơn</h2>
                  <p className="text-slate-500 text-sm">Chỉnh sửa thực đơn nước của HiAn trực tiếp lên website.</p>
                </div>
                <div className="inline-flex gap-3">
                  <button 
                    onClick={handleResetMenu}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold text-xs shadow-sm hover:shadow-md transition-all"
                  >
                    <RefreshCw size={14} /> Đặt lại mặc định
                  </button>
                  <button 
                    onClick={() => handleOpenMenuModal()}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5d821a] hover:bg-[#4a6915] text-white font-bold text-xs shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus size={14} /> Thêm món mới
                  </button>
                </div>
              </div>

              {/* Category selector strip */}
              <div className="bg-white p-2 rounded-2xl border border-slate-100 flex flex-wrap gap-1">
                {[
                  { key: 'all', label: 'Tất cả món' },
                  { key: 'Matcha & Coco', label: 'Matcha & Coco' },
                  { key: 'Coffee', label: 'Cà phê' },
                  { key: 'MilkTea & more', label: 'Trà sữa & bánh' }
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setMenuFilter(item.key as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${menuFilter === item.key ? 'bg-[#5d821a] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Menu grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMenu.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Product image block with labels */}
                      <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center p-4">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="max-h-full max-w-full object-contain hover:scale-105 transition-all duration-300"
                        />
                        <span className="absolute top-3 left-3 bg-[#245446] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">ID {item.id}</span>
                        {item.isBest && <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow"><Star size={10} fill="white" /> Bán chạy</span>}
                        {item.discount > 0 && <span className="absolute bottom-3 left-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">-{item.discount}%</span>}
                      </div>

                      {/* Info details block */}
                      <div className="p-5">
                        <span className="text-[10px] text-[#5d821a] font-bold uppercase tracking-wider">{item.category}</span>
                        <h4 className="font-extrabold text-slate-800 text-md truncate mt-0.5" title={item.name}>{item.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold italic truncate">{item.nameEn}</p>
                        
                        <div className="mt-2.5">
                          <span className="text-[#5d821a] font-black text-lg">{formatPrice(item.price)}</span>
                        </div>

                        <p className="text-xs text-slate-400 mt-3 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="px-5 pb-5 pt-3 border-t border-slate-50 flex gap-2">
                      <button 
                        onClick={() => handleOpenMenuModal(item)}
                        className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Edit size={12} /> Sửa
                      </button>
                      <button 
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 rounded-xl transition-all"
                        title="Xóa món"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================
              TAB 4: CONFIGURATION SETTINGS
              ========================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Cấu đặt hệ thống</h2>
                <p className="text-slate-500 text-sm">Xem trạng thái dịch vụ và liên kết cấu hình Firebase.</p>
              </div>

              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3">Thông tin kết nối Firestore</h4>
                  <div className="space-y-2.5 text-sm text-slate-500 font-semibold">
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span>Dự án ID:</span>
                      <span className="text-slate-800 select-all font-mono">{firebaseConfig.projectId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span>Database ID:</span>
                      <span className="text-slate-800 select-all font-mono">{firebaseConfig.firestoreDatabaseId}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-50">
                      <span>Trạng thái kết nối:</span>
                      {db ? (
                        <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle size={14} /> Hoạt động</span>
                      ) : (
                        <span className="text-rose-500 flex items-center gap-1.5"><XCircle size={14} /> Lỗi kết nối</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-3">Tài khoản quản trị viên</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Quyền truy cập CMS được phân quyền thông qua xác thực Firebase Auth. Để thay đổi mật khẩu hoặc thêm người quản lý, vui lòng thực hiện trên bảng điều khiển điều phối của Firebase Console.
                  </p>
                  <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <ShieldCheck className="text-[#5d821a]" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user?.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Quyền hạn: Admin Cửa hàng</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================
          MODAL 1: ORDER DETAIL RECEIPT INVOICE
          ========================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#245446] text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-md tracking-tight leading-none">Hóa đơn chi tiết</h3>
                <span className="text-[10px] text-emerald-200/60 font-semibold tracking-wide uppercase">ID: {selectedOrder.orderId}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-emerald-800/50 rounded-lg transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt print body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Receipt Visual design */}
              <div className="bg-[#fcfbf9] border border-[#f1efe8] p-5 rounded-2xl relative">
                {/* Visual dotted print tear border at top and bottom */}
                <div className="absolute top-0 left-0 right-0 h-1 flex justify-between overflow-hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-white rounded-full -mt-0.5 flex-shrink-0"></span>
                  ))}
                </div>

                <div className="text-center mb-6 pt-3">
                  <h2 className="font-black text-slate-800 text-lg uppercase tracking-wider">HiAn Matcha & Coco</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Đường 30 tháng 4, Hải Châu, Đà Nẵng</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Hotline: 093.523.23.00</p>
                </div>

                <div className="border-t border-dashed border-slate-200 py-3 space-y-1 text-xs text-slate-600 font-semibold">
                  <p>Khách hàng: <span className="text-slate-800 font-bold">{selectedOrder.customer?.name}</span></p>
                  <p>Số điện thoại: <span className="text-slate-800 font-bold">{selectedOrder.customer?.phone}</span></p>
                  <p>Địa chỉ nhận: <span className="text-slate-800 font-bold">{selectedOrder.customer?.address}</span></p>
                  <p>Thời gian nhận: <span className="text-slate-800 font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{selectedOrder.deliveryTime}</span></p>
                  <p>Lưu ý: <span className="text-rose-600 font-bold">{selectedOrder.customer?.note || 'Không có'}</span></p>
                </div>

                <table className="w-full text-xs text-left border-t border-dashed border-slate-200 mt-4 pt-3">
                  <thead>
                    <tr className="text-slate-400 font-bold">
                      <th className="py-2">Món nước</th>
                      <th className="py-2 text-right">Tổng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {selectedOrder.items?.map((item: any, idx: number) => {
                      const toppingsText = item.selectedToppings && item.selectedToppings.length > 0 
                        ? `+ Toppings: ${item.selectedToppings.join(', ')}` 
                        : '';
                      const extraText = item.selectedExtra && item.selectedExtra.length > 0 
                        ? `+ Tùy chọn: ${item.selectedExtra.join(', ')}` 
                        : '';
                      return (
                        <tr key={idx}>
                          <td className="py-2 text-slate-700">
                            <div>{item.name} <span className="text-slate-400 font-medium">x{item.quantity}</span></div>
                            {toppingsText && <div className="text-[10px] text-slate-400 mt-0.5">{toppingsText}</div>}
                            {extraText && <div className="text-[10px] text-slate-400 mt-0.5">{extraText}</div>}
                          </td>
                          <td className="py-2 text-right text-slate-800 font-bold">{formatPrice(item.totalPrice * item.quantity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-dashed border-slate-200">
                      <td className="py-3 font-bold text-slate-800">TỔNG CỘNG:</td>
                      <td className="py-3 text-right font-black text-[#5d821a] text-sm">{formatPrice(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>

                {/* Print bottom tear border */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-between overflow-hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <span key={i} className="w-1.5 h-1.5 bg-white rounded-full -mb-1 flex-shrink-0"></span>
                  ))}
                </div>
              </div>

              {/* Status Update flow control */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Cập nhật trạng thái đơn</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'pending', label: 'Chờ xử lý', color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200' },
                    { key: 'confirmed', label: 'Xác nhận', color: 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200' },
                    { key: 'shipping', label: 'Đang giao', color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200' },
                    { key: 'completed', label: 'Hoàn thành', color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' },
                    { key: 'cancelled', label: 'Hủy đơn', color: 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200' }
                  ].map((status) => (
                    <button
                      key={status.key}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, status.key)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedOrder.status === status.key ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 ' + status.color}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => handleDeleteOrder(selectedOrder.orderId)}
                className="px-4 py-2 border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all"
              >
                Xóa đơn hàng
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#5d821a] hover:bg-[#4a6915] text-white rounded-xl text-xs font-bold transition-all"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2: MENU DRINK ADD/EDIT FORM
          ========================================= */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#245446] text-white flex items-center justify-between">
              <h3 className="font-bold text-md tracking-tight">{editingItem ? "Sửa món nước" : "Thêm món nước mới"}</h3>
              <button 
                onClick={() => { setIsMenuModalOpen(false); setEditingItem(null); }}
                className="p-1.5 hover:bg-emerald-800/50 rounded-lg transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form scrollable container */}
            <form onSubmit={handleSaveMenuItem} className="flex-1 overflow-y-auto p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Mã món (ID)</label>
                  <input 
                    type="text" 
                    required
                    disabled={editingItem !== null} // Cannot change ID once created
                    value={itemForm.id}
                    onChange={(e) => setItemForm({ ...itemForm, id: e.target.value })}
                    placeholder="Mã số"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none disabled:bg-slate-100 disabled:text-slate-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Danh mục món</label>
                  <select 
                    value={itemForm.category}
                    onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-bold"
                  >
                    <option value="Matcha & Coco">Matcha & Coco</option>
                    <option value="Coffee">Coffee</option>
                    <option value="MilkTea & more">MilkTea & more</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên món nước (Tiếng Việt)</label>
                <input 
                  type="text" 
                  required
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="Tên Tiếng Việt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Tên món nước (Tiếng Anh)</label>
                <input 
                  type="text" 
                  required
                  value={itemForm.nameEn}
                  onChange={(e) => setItemForm({ ...itemForm, nameEn: e.target.value })}
                  placeholder="Tên Tiếng Anh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Giá bán gốc (đ)</label>
                  <input 
                    type="number" 
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseInt(e.target.value) || 0 })}
                    placeholder="Giá bán"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Chiết khấu giảm giá (%)</label>
                  <input 
                    type="number" 
                    required
                    value={itemForm.discount}
                    onChange={(e) => setItemForm({ ...itemForm, discount: parseInt(e.target.value) || 0 })}
                    placeholder="Phần trăm giảm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Đường dẫn hình ảnh (Ảnh public/...)</label>
                <input 
                  type="text" 
                  required
                  value={itemForm.image}
                  onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                  placeholder="Ví dụ: /Luc_Tra_Sua_Tran_Chau.png"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-mono text-xs font-bold"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">Sản phẩm bán chạy nhất (Best Seller)?</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sẽ có nhãn "Best Seller / Phải thử" nổi bật trên web.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={itemForm.isBest}
                  onChange={(e) => setItemForm({ ...itemForm, isBest: e.target.checked })}
                  className="w-5 h-5 accent-[#5d821a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mô tả món nước (Tiếng Việt)</label>
                <textarea 
                  rows={2}
                  required
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  placeholder="Mô tả tóm tắt bằng Tiếng Việt"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-medium leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mô tả món nước (Tiếng Anh)</label>
                <textarea 
                  rows={2}
                  required
                  value={itemForm.descriptionEn}
                  onChange={(e) => setItemForm({ ...itemForm, descriptionEn: e.target.value })}
                  placeholder="Mô tả tóm tắt bằng Tiếng Anh"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#5d821a] outline-none font-medium leading-relaxed"
                />
              </div>

              {/* Form submit buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsMenuModalOpen(false); setEditingItem(null); }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#5d821a] hover:bg-[#4a6915] text-white rounded-xl text-xs font-bold transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
