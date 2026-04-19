import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calculator, Settings, PackagePlus, BarChart3, Save, Upload, Trash2, 
  Plus, MapPin, Truck, TrendingUp, TrendingDown, AlertCircle, Receipt, 
  UserRound, Printer, XCircle, CheckCircle2, HardDrive, FileText, 
  Database, Users, ShoppingCart, WalletCards, ArrowRightLeft, 
  AlertTriangle, CreditCard, History, Wallet, LineChart, Activity, 
  CalendarDays, BrainCircuit, Loader2, LogOut, Lock, Menu, X
} from 'lucide-react';

// ==========================================
// 1. KONFIGURASI FIREBASE CLOUD
// ==========================================
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEsqMRTfhUcgqJ8OO3IQJ8zibdQfQ7Izk",
  authDomain: "aplikasi-rongsok-dbf85.firebaseapp.com",
  projectId: "aplikasi-rongsok-dbf85",
  storageBucket: "aplikasi-rongsok-dbf85.firebasestorage.app",
  messagingSenderId: "997599828962",
  appId: "1:997599828962:web:536bcc98dd4e01110c77bb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// ==========================================
// 2. DATA KONSTANTA & DEFAULT STATE
// ==========================================
const DEFAULT_API_KEY = 'AIzaSyASsvekrfU1kJCfHX_J39f30n3f_-B2MFM'; // API Key Gemini Anda
const DEFAULT_COMMODITIES = ['Tembaga', 'Kuningan', 'Alumunium', 'Besi', 'Plastik', 'Kardus', 'Lainnya'];

const VEHICLES = [
  { id: 'sendiri', name: 'Mobil/Motor Sendiri', basePrice: 0, baseKm: 0, pricePerKm: 0, capacity: 'Fleksibel' },
  { id: 'motor', name: 'Lalamove - Sepeda Motor', basePrice: 10000, baseKm: 4, pricePerKm: 2500, capacity: 'Maks 20kg' },
  { id: 'sedan', name: 'Lalamove - Sedan', basePrice: 24000, baseKm: 5, pricePerKm: 4000, capacity: 'Maks 100kg' },
  { id: 'mpv', name: 'Lalamove - MPV/Avanza', basePrice: 35000, baseKm: 5, pricePerKm: 4500, capacity: 'Maks 200kg' },
  { id: 'pickup_bak', name: 'Lalamove - Pickup Bak', basePrice: 65000, baseKm: 5, pricePerKm: 5000, capacity: 'Maks 800kg' },
  { id: 'engkel_bak', name: 'Lalamove - Engkel Bak', basePrice: 180000, baseKm: 10, pricePerKm: 6000, capacity: 'Maks 2 Ton' }
];

const DEFAULT_DB_STATE = {
   companyProfile: { nama: 'JURAGAN RONGSOK', alamat: 'Jl. Pengepul No. 1', telepon: '081234567890' },
   fixedCosts: [], variableCosts: [], inventory: [], sellers: [], transactions: [], sales: [], debtors: [], 
   wallet: { balance: 0, history: [] }, masterCommodities: DEFAULT_COMMODITIES,
   globalPrices: DEFAULT_COMMODITIES.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
   settings: { geminiApiKey: DEFAULT_API_KEY } 
};

const formatRp = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

// ==========================================
// 3. ROOT APP (AUTH WRAPPER)
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingAuth) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold animate-pulse">Memuat Sistem Cloud...</div>;
  return user ? <MainDashboard user={user} /> : <LoginScreen />;
}

// ==========================================
// 4. HALAMAN LOGIN / REGISTER
// ==========================================
function LoginScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setIsLoading(true);
    try {
      if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { setErrorMsg("Gagal: " + err.message); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
       <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-t-amber-500">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><Truck className="w-10 h-10"/></div>
             <h1 className="text-2xl font-black text-slate-800">JURAGAN RONGSOK</h1>
             <p className="text-sm text-slate-500 font-medium">Sistem Kasir & ERP Cloud</p>
          </div>
          {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold mb-4 text-center">{errorMsg}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
             <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1">Email / Akun Bisnis</label><div className="relative"><UserRound className="absolute left-3 top-3 text-slate-400 w-5 h-5"/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="email@bisnis.com" required/></div></div>
             <div><label className="block text-xs font-bold text-slate-600 uppercase mb-1">Kata Sandi</label><div className="relative"><Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="••••••••" required minLength="6"/></div></div>
             <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4 flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginMode ? 'Masuk ke Sistem' : 'Daftar Bisnis Baru')}
             </button>
          </form>
          <div className="text-center mt-6 text-sm text-slate-500">
             {isLoginMode ? 'Belum punya akun? ' : 'Sudah punya akun? '}
             <button onClick={() => setIsLoginMode(!isLoginMode)} className="font-bold text-amber-600 hover:underline">{isLoginMode ? 'Daftar Disini' : 'Login Disini'}</button>
          </div>
       </div>
    </div>
  );
}

// ==========================================
// 5. MAIN DASHBOARD APP (Firebase Synced)
// ==========================================
function MainDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('analisis');
  const [printNotaData, setPrintNotaData] = useState(null);
  const [db, setDb] = useState(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  
  // State Responsif Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCloudData = async () => {
      try {
        const docRef = doc(firestore, 'users', user.uid, 'data', 'mainApp');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if(!cloudData.sales) cloudData.sales = [];
          if(!cloudData.debtors) cloudData.debtors = [];
          if(!cloudData.wallet) cloudData.wallet = { balance: 0, history: [] }; 
          if(!cloudData.settings) cloudData.settings = { geminiApiKey: DEFAULT_API_KEY }; 
          if(!cloudData.masterCommodities) cloudData.masterCommodities = DEFAULT_COMMODITIES;
          setDb(cloudData);
        } else {
          setDb(DEFAULT_DB_STATE);
          await setDoc(docRef, DEFAULT_DB_STATE);
        }
      } catch (err) {
        console.error("Gagal menarik data cloud", err);
      } finally { setIsDbLoaded(true); }
    };
    fetchCloudData();
  }, [user.uid]);

  useEffect(() => {
    if (!isDbLoaded || !db) return;
    const saveToCloud = setTimeout(async () => {
      try {
        const docRef = doc(firestore, 'users', user.uid, 'data', 'mainApp');
        await setDoc(docRef, db);
      } catch (err) { console.error("Gagal auto-save ke cloud", err); }
    }, 1500); 
    return () => clearTimeout(saveToCloud);
  }, [db, isDbLoaded, user.uid]);

  const handleLogout = () => {
     if(window.confirm("Yakin ingin keluar dari sistem?")) signOut(auth);
  };

  const handleTabChange = (tab) => {
     setActiveTab(tab);
     setIsMobileMenuOpen(false); // Tutup menu HP setelah klik navigasi
  };

  if (!isDbLoaded || !db) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 font-bold"><Loader2 className="w-8 h-8 animate-spin text-amber-500 mr-2"/> Menyiapkan Ruang Kerja Cloud...</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-800 relative">
      
      {/* HEADER MOBILE (Hanya Tampil di HP) */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-30 sticky top-0 shadow-md hide-on-print">
        <h1 className="text-lg font-bold text-amber-500 flex items-center gap-2">
          <Truck className="w-5 h-5" /> Juragan Rongsok
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* AREA PRINT KHUSUS (ABSOLUTE METHOD) */}
      {printNotaData && (
        <div id="receipt-print-area" className="print-only">
          <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
            <strong style={{ fontSize: '14px' }}>{printNotaData.companyProfile?.nama}</strong><br/>
            {printNotaData.companyProfile?.alamat}<br/>Telp: {printNotaData.companyProfile?.telepon}
          </div>
          <div style={{ borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '5px' }}>
            Tgl : {printNotaData.tanggal}<br/>Nota: {printNotaData.id}<br/>Bpk/Ibu: <strong>{printNotaData.sellerName}</strong>
          </div>
          <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>--- Barang Masuk ---</div>
          <table style={{ width: '100%', marginBottom: '5px' }}>
            <tbody>
              {printNotaData.items.map((it, idx) => (
                <React.Fragment key={idx}>
                  <tr><td colSpan="3" style={{ paddingBottom: '2px', paddingTop: '2px', fontWeight: 'bold' }}>{it.komoditas}</td></tr>
                  <tr>
                    <td style={{ width: '30%' }}>{it.berat}kg</td>
                    <td style={{ width: '30%' }}>x {it.hargaBeli}</td>
                    <td style={{ textAlign: 'right', width: '40%' }}>{formatRp(it.berat * it.hargaBeli).replace('Rp', '')}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px dashed #000', paddingTop: '5px', borderBottom: '1px dashed #000', paddingBottom: '5px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '10px' }}><span>Total Barang:</span><span>{formatRp(printNotaData.totalBarang)}</span></div>
            {printNotaData.potongHutang > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#555', fontSize: '10px' }}><span>Potong Kasbon:</span><span>-{formatRp(printNotaData.potongHutang)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '3px', fontSize: '12px' }}><span>TOTAL DIBAYAR:</span><span>{formatRp(printNotaData.finalTotal)}</span></div>
            <div style={{ textAlign: 'center', marginTop: '5px', border: '1px solid #000', padding: '2px' }}><strong>LUNAS</strong></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>Penerima<br/><br/><br/>(...........)</div>
            <div style={{ textAlign: 'center', width: '45%' }}>Penjual<br/><br/><br/>({printNotaData.sellerName})</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '9px' }}>Terima Kasih Atas Kerjasamanya</div>
        </div>
      )}

      {/* POPUP MODAL SUKSES */}
      {printNotaData && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 hide-on-print backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-12 h-12" /></div>
            <h3 className="text-2xl font-black mb-2 text-slate-800">Transaksi Sukses!</h3>
            <button onClick={() => window.print()} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mb-3 mt-6 shadow-lg text-lg"><Printer className="w-5 h-5"/> Cetak Nota</button>
            <button onClick={() => setPrintNotaData(null)} className="w-full text-slate-400 hover:text-slate-600 py-3 font-bold transition">Selesai & Tutup</button>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`${isMobileMenuOpen ? 'flex absolute inset-0 z-40' : 'hidden'} md:relative md:flex w-full md:w-64 bg-slate-900 text-white flex-col shadow-2xl hide-on-print md:h-screen md:sticky md:top-0 overflow-y-auto`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-xl font-bold text-amber-500 flex items-center gap-2"><Truck className="w-6 h-6" /> Juragan Rongsok</h1>
          <p className="text-slate-400 text-xs mt-1">Sistem ERP Bisnis Daur Ulang</p>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 pb-4 mt-4 md:mt-0">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2 px-2">Transaksi</div>
          <NavBtn active={activeTab === 'dompet'} onClick={() => handleTabChange('dompet')} icon={<Wallet />} text="Dompetku (Kas)" />
          <NavBtn active={activeTab === 'pembelian'} onClick={() => handleTabChange('pembelian')} icon={<PackagePlus />} text="Pembelian (Masuk)" />
          <NavBtn active={activeTab === 'penjualan'} onClick={() => handleTabChange('penjualan')} icon={<ShoppingCart />} text="Penjualan (Keluar)" />
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Manajemen</div>
          <NavBtn active={activeTab === 'gudang'} onClick={() => handleTabChange('gudang')} icon={<Database />} text="Gudang & Mitra" />
          <NavBtn active={activeTab === 'hutang'} onClick={() => handleTabChange('hutang')} icon={<CreditCard />} text="Buku Kasbon (Hutang)" />
          <NavBtn active={activeTab === 'operasional'} onClick={() => handleTabChange('operasional')} icon={<Settings />} text="Biaya Tetap" />
          <NavBtn active={activeTab === 'operasional_var'} onClick={() => handleTabChange('operasional_var')} icon={<Receipt />} text="Biaya Variabel" />
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Analisis & Alat</div>
          <NavBtn active={activeTab === 'analisis'} onClick={() => handleTabChange('analisis')} icon={<LineChart />} text="Analisis Bisnis (AI)" />
          <NavBtn active={activeTab === 'laporan'} onClick={() => handleTabChange('laporan')} icon={<BarChart3 />} text="Laporan Keuangan" />
          <NavBtn active={activeTab === 'kalkulator'} onClick={() => handleTabChange('kalkulator')} icon={<Calculator />} text="Kalkulator Harga" />
          <NavBtn active={activeTab === 'profil'} onClick={() => handleTabChange('profil')} icon={<UserRound />} text="Profil Toko" />
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-slate-800/80 p-2 rounded-md border border-slate-700/50 mb-3"><CheckCircle2 className="w-3.5 h-3.5"/><span>Tersambung ke Cloud</span></div>
          <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
             <div className="text-[10px] text-slate-400 uppercase tracking-wide font-bold mb-1">Logged In As:</div>
             <div className="text-xs text-white truncate font-medium mb-3">{user.email}</div>
             <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-2 rounded text-xs transition font-bold border border-red-900/50 hover:border-red-600"><LogOut className="w-3.5 h-3.5" /> Logout Sistem</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 overflow-x-hidden relative min-h-screen ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
        <div className="h-full overflow-y-auto p-4 md:p-8 hide-on-print">
          {activeTab === 'dompet' && <PageDompetku db={db} setDb={setDb} />}
          {activeTab === 'kalkulator' && <PageKalkulator />}
          {activeTab === 'pembelian' && <PagePembelian db={db} setDb={setDb} setPrintNotaData={setPrintNotaData} />}
          {activeTab === 'penjualan' && <PagePenjualan db={db} setDb={setDb} />}
          {activeTab === 'gudang' && <PageGudang db={db} setDb={setDb} />}
          {activeTab === 'hutang' && <PageHutang db={db} setDb={setDb} />}
          {activeTab === 'operasional' && <PageOperasionalTetap db={db} setDb={setDb} />}
          {activeTab === 'operasional_var' && <PageOperasionalVariabel db={db} setDb={setDb} />}
          {activeTab === 'analisis' && <PageAnalisis db={db} />}
          {activeTab === 'laporan' && <PageLaporan db={db} setDb={setDb} />}
          {activeTab === 'profil' && <PageProfil db={db} setDb={setDb} user={user} />}
        </div>
      </main>

      {/* CSS KHUSUS UNTUK PRINT */}
      <style>
        {`
          .print-only { display: none; }
          @media print {
            @page { size: 58mm auto; margin: 0; }
            body, html, #root { background-color: white !important; color: black !important; margin: 0 !important; padding: 0 !important; width: 100% !important; display: block !important; height: auto !important; }
            * { overflow: visible !important; float: none !important; }
            .min-h-screen, .h-screen, .h-full, .flex, .flex-col, .md\\:flex-row { height: auto !important; min-height: 0 !important; display: block !important; }
            .hide-on-print { display: none !important; }
            .print-only { display: block !important; position: absolute !important; left: 0 !important; top: 0 !important; width: 58mm !important; padding: 2mm !important; margin: 0 !important; font-family: 'Courier New', Courier, monospace !important; font-size: 11px !important; color: #000 !important; line-height: 1.2 !important; background-color: white !important; }
          }
        `}
      </style>
    </div>
  );
}

function NavBtn({ active, onClick, icon, text }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition duration-200 ${active ? 'bg-amber-500 text-slate-900 font-bold shadow-md shadow-amber-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
      {React.cloneElement(icon, { className: 'w-4 h-4' })}
      <span className="text-sm">{text}</span>
    </button>
  );
}

// ==========================================
// PAGE ANALISIS BISNIS DENGAN INTEGRASI AI
// ==========================================
function PageAnalisis({ db }) {
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const apiKey = db.settings?.geminiApiKey || DEFAULT_API_KEY;

  const monthlyData = useMemo(() => {
    const data = {};
    const initMonth = (m) => {
       if(!data[m]) data[m] = { month: m, income: 0, hpp: 0, opsVar: 0, opsTetap: 0 };
    };
    (db.sales || []).forEach(s => {
       const m = s.tanggal.substring(0, 7); initMonth(m);
       data[m].income += s.pendapatan; data[m].hpp += s.hpp;
    });
    (db.variableCosts || []).forEach(v => {
       const m = v.tanggal.substring(0, 7); initMonth(m); data[m].opsVar += v.harga;
    });
    (db.wallet?.history || []).forEach(w => {
       if(w.type === 'OUT' && w.desc.startsWith('Bayar Biaya Tetap:')) {
          const m = w.date.substring(0, 7); initMonth(m); data[m].opsTetap += w.amount;
       }
    });
    return Object.values(data).map(d => {
       const totalExpense = d.hpp + d.opsVar + d.opsTetap;
       const netProfit = d.income - totalExpense;
       return { ...d, totalExpense, netProfit };
    }).sort((a, b) => a.month.localeCompare(b.month));
  }, [db]);

  const insights = useMemo(() => {
     if (monthlyData.length < 2) return [{ type: 'info', text: 'Data belum cukup untuk membandingkan performa antar bulan. Catat terus transaksi Anda.' }];
     const current = monthlyData[monthlyData.length - 1];
     const prev = monthlyData[monthlyData.length - 2];
     const alerts = [];
     if (current.income < prev.income * 0.8) {
        const drop = (((prev.income - current.income) / prev.income) * 100).toFixed(0);
        alerts.push({ type: 'danger', text: `Pendapatan bulan ${current.month} turun ${drop}% dibanding bulan sebelumnya. Cek kembali rutinitas penjualan pabrik Anda!` });
     } else if (current.income > prev.income * 1.2) {
        const up = (((current.income - prev.income) / prev.income) * 100).toFixed(0);
        alerts.push({ type: 'success', text: `Luar Biasa! Pendapatan bulan ${current.month} naik ${up}%! Pertahankan momentum ini.` });
     }
     if (current.opsVar > prev.opsVar * 1.5 && current.opsVar > 100000) {
        alerts.push({ type: 'warning', text: `Hati-hati! Biaya operasional harian membengkak ekstrim pada bulan ${current.month}. Lakukan efisiensi bensin/kuli.` });
     }
     if (current.netProfit < 0) {
        alerts.push({ type: 'danger', text: `Bulan ${current.month} mengalami KERUGIAN BERSIH sebesar ${formatRp(Math.abs(current.netProfit))}. Hal ini bisa disebabkan harga jual (pabrik) turun sementara harga beli Anda tetap tinggi.` });
     }
     return alerts.length > 0 ? alerts : [{ type: 'success', text: 'Performa bisnis stabil dan sehat. Tidak ada anomali negatif yang terdeteksi.' }];
  }, [monthlyData]);

  const maxChartValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.totalExpense, 1)));

  const handleRequestAI = async () => {
     if (!apiKey) return alert("API Key Gemini belum diisi!\n\nSilakan buka menu 'Profil Toko' lalu masukkan API Key Anda.");
     setIsLoadingAi(true); setAiResponse('');
     const totalKasbon = (db.debtors || []).reduce((sum, d) => {
        const pinjam = d.history.filter(h => h.type === 'PINJAM').reduce((s, h) => s + h.amount, 0);
        const lunas = d.history.filter(h => h.type === 'LUNAS').reduce((s, h) => s + h.amount, 0);
        return sum + (pinjam - lunas);
     }, 0);
     const promptData = `
        Saya memiliki usaha jual beli rongsokan/barang bekas logam.
        Berikut data rekap keuangan bulanan saya: ${JSON.stringify(monthlyData, null, 2)}
        Total Uang Kasbon di tangan pengepul saat ini: Rp ${totalKasbon}. Saldo Kas Saat ini: Rp ${db.wallet?.balance || 0}.
        Tolong bertindak sebagai Konsultan Bisnis. 
        Analisis data tersebut dan berikan saya: 1. Analisis singkat performa. 2. Temukan kelemahan. 3. Berikan 3 rekomendasi strategi konkrit agar bisnis rongsok saya bisa lebih untung.
        Jawab dengan bahasa Indonesia yang ramah.
     `;
     try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
           method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: promptData }] }] })
        });
        const result = await response.json();
        if (result.error) throw new Error(result.error.message);
        setAiResponse(result.candidates[0].content.parts[0].text);
     } catch (err) { setAiResponse(`Gagal menghubungi AI.\nError: ${err.message}`); } 
     finally { setIsLoadingAi(false); }
  };

  return (
     <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><LineChart className="text-amber-500 w-6 h-6 md:w-8 md:h-8" /> Analisis & Performa Bisnis</h2>
              <p className="text-slate-400 text-sm mt-1">Pantau grafik pertumbuhan dan minta saran strategi dari Konsultan AI.</p>
           </div>
           {!apiKey ? (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-xs font-bold text-center w-full md:w-auto">API Key Gemini Belum Diatur.<br/><span className="font-normal opacity-80">Atur di menu Profil Toko.</span></div>
           ) : (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg text-xs font-bold text-center w-full md:w-auto">AI Terhubung <CheckCircle2 className="w-3 h-3 inline"/></div>
           )}
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-t-4 border-t-purple-500">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div><h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><BrainCircuit className="w-6 h-6 text-purple-500"/> Konsultan Bisnis AI</h3><p className="text-sm text-slate-500 mt-1">Sistem akan menganalisis data keuangan Anda dan memberikan saran strategi usaha.</p></div>
              <button onClick={handleRequestAI} disabled={isLoadingAi || monthlyData.length === 0} className={`w-full md:w-auto px-6 py-3 rounded-xl font-bold shadow-md transition flex items-center justify-center gap-2 ${isLoadingAi || monthlyData.length === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500 text-white'}`}>
                 {isLoadingAi ? <><Loader2 className="w-5 h-5 animate-spin"/> Menganalisis...</> : <><BrainCircuit className="w-5 h-5"/> Minta Analisis AI</>}
              </button>
           </div>
           {aiResponse && <div className="bg-purple-50 border border-purple-100 p-6 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{aiResponse}</div>}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> Grafik Pendapatan vs Pengeluaran</h3>
              {monthlyData.length === 0 ? (
                 <div className="h-64 flex items-center justify-center text-slate-400 border-2 border-dashed rounded-xl">Belum ada data.</div>
              ) : (
                 <div className="h-64 flex items-end gap-4 overflow-x-auto pb-4 pt-10 px-2 border-b border-slate-200 custom-scrollbar">
                    {monthlyData.map((d, i) => {
                       const incomeHeight = (d.income / maxChartValue) * 100;
                       const expenseHeight = (d.totalExpense / maxChartValue) * 100;
                       return (
                          <div key={i} className="flex flex-col items-center gap-2 group flex-shrink-0 min-w-[80px]">
                             <div className="flex items-end gap-1 h-48 w-full relative">
                                <div className="w-1/2 bg-blue-500 rounded-t-sm relative" style={{ height: `${incomeHeight}%` }}></div>
                                <div className="w-1/2 bg-red-400 rounded-t-sm relative" style={{ height: `${expenseHeight}%` }}></div>
                             </div>
                             <div className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{d.month}</div>
                             <div className={`text-[10px] font-black ${d.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{d.netProfit >= 0 ? '+' : ''}{formatRp(d.netProfit)}</div>
                          </div>
                       )
                    })}
                 </div>
              )}
              <div className="flex flex-wrap gap-4 mt-4 justify-center text-xs font-bold text-slate-500">
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Pemasukan Kotor</div>
                 <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-sm"></div> Pengeluaran (HPP+Ops)</div>
              </div>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-amber-500"/> Peringatan Sistem Dasar</h3>
              <div className="space-y-4">
                 {insights.map((insight, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border ${insight.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : insight.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : insight.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                       <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-slate-500"/> Rincian Keuangan per Bulan</h3>
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                 <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-3">Bulan</th><th className="p-3 text-right">Pendapatan Kotor</th><th className="p-3 text-right">HPP (Modal)</th><th className="p-3 text-right">Ops Variabel</th><th className="p-3 text-right">Ops Tetap</th><th className="p-3 text-right">Laba Bersih</th></tr></thead>
                 <tbody className="divide-y divide-slate-100">
                    {monthlyData.slice().reverse().map((d, i) => (
                       <tr key={i} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-700">{d.month}</td><td className="p-3 text-right text-blue-600 font-medium">{formatRp(d.income)}</td><td className="p-3 text-right text-red-400">-{formatRp(d.hpp)}</td><td className="p-3 text-right text-red-400">-{formatRp(d.opsVar)}</td><td className="p-3 text-right text-red-400">-{formatRp(d.opsTetap)}</td><td className={`p-3 text-right font-black ${d.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatRp(d.netProfit)}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
     </div>
  );
}

// ==========================================
// PAGE DOMPETKU (KAS PERUSAHAAN)
// ==========================================
function PageDompetku({ db, setDb }) {
  const [nominalInput, setNominalInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const currentBalance = db.wallet?.balance || 0;
  const history = db.wallet?.history || [];

  const handleAddSaldo = (e) => {
    e.preventDefault();
    if (!nominalInput) return;
    const amountToAdd = Number(nominalInput);
    setDb(prev => {
      const prevBalance = prev.wallet?.balance || 0;
      const newHistoryItem = { id: Date.now(), date: new Date().toISOString().split('T')[0], type: 'IN', amount: amountToAdd, desc: descInput || 'Top-up Saldo Manual' };
      return { ...prev, wallet: { balance: prevBalance + amountToAdd, history: [newHistoryItem, ...(prev.wallet?.history || [])] } };
    });
    alert('Saldo kas berhasil ditambahkan!');
    setNominalInput(''); setDescInput('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 md:p-10 rounded-3xl shadow-xl text-white relative overflow-hidden flex flex-col items-center justify-center">
         <div className="absolute right-0 top-0 opacity-20"><Wallet className="w-64 h-64 -mr-10 -mt-10" /></div>
         <div className="relative z-10 text-center">
            <h2 className="text-emerald-200 font-bold uppercase tracking-widest text-sm mb-2 flex items-center justify-center gap-2"><WalletCards className="w-5 h-5"/> SALDO KAS AKTIF</h2>
            <div className="text-4xl md:text-7xl font-black drop-shadow-md mb-2 break-all">{formatRp(currentBalance)}</div>
            <p className="text-emerald-100 text-sm mt-4 max-w-lg mx-auto">Saldo akan otomatis berkurang saat Pembelian/Operasional, dan bertambah saat Penjualan.</p>
         </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><Plus className="text-emerald-500"/> Tambah Saldo Manual</h3>
            <form onSubmit={handleAddSaldo} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Jumlah Saldo (Rp)</label><input type="number" value={nominalInput} onChange={e=>setNominalInput(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800 outline-none focus:border-emerald-500 transition" placeholder="0" required/></div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Keterangan (Opsional)</label><input type="text" value={descInput} onChange={e=>setDescInput(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-emerald-500 transition" placeholder="Contoh: Tambahan modal..."/></div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow-md transition mt-2">SIMPAN SALDO</button>
            </form>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><History className="text-blue-500"/> Riwayat Arus Kas (Mutasi)</h3>
            <div className="overflow-x-auto max-h-[500px]">
               <table className="w-full text-left text-sm border-collapse relative min-w-[500px]">
                  <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                     <tr><th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">Tanggal</th><th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider">Keterangan</th><th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">Debit (Masuk)</th><th className="p-4 text-slate-500 font-bold uppercase text-[10px] tracking-wider text-right">Kredit (Keluar)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {history.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Belum ada riwayat transaksi keuangan.</td></tr>}
                     {history.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                           <td className="p-4 text-slate-500 font-medium whitespace-nowrap">{item.date}</td>
                           <td className="p-4 font-semibold text-slate-700">{item.desc}</td>
                           <td className="p-4 text-right font-black text-emerald-600">{item.type === 'IN' ? `+ ${formatRp(item.amount)}` : '-'}</td>
                           <td className="p-4 text-right font-black text-red-500">{item.type === 'OUT' ? `- ${formatRp(item.amount)}` : '-'}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE PEMBELIAN
// ==========================================
function PagePembelian({ db, setDb, setPrintNotaData }) {
  const commoditiesList = db.masterCommodities || DEFAULT_COMMODITIES;
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [items, setItems] = useState([{ id: Date.now(), komoditas: commoditiesList[0], berat: '', hargaBeli: '' }]);
  const [potongHutangInput, setPotongHutangInput] = useState('');

  const activeDebtor = (db.debtors || []).find(d => d.nama.toLowerCase() === sellerName.toLowerCase());
  const sisaHutangSeller = activeDebtor ? activeDebtor.history.reduce((sum, h) => sum + (h.type === 'PINJAM' ? h.amount : -h.amount), 0) : 0;

  const addItemRow = () => setItems([...items, { id: Date.now(), komoditas: commoditiesList[0], berat: '', hargaBeli: '' }]);
  const removeItemRow = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));
  const updateItem = (id, field, value) => setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  const handleSellerSelect = (seller) => { setSellerName(seller.nama); setSellerPhone(seller.telepon); };
  
  const totalBarang = items.reduce((sum, item) => sum + (Number(item.berat) * Number(item.hargaBeli)), 0);
  let potongHutangVal = Number(potongHutangInput);
  if (potongHutangVal > totalBarang) potongHutangVal = totalBarang;
  if (potongHutangVal > sisaHutangSeller) potongHutangVal = sisaHutangSeller;

  const finalTotalBayar = totalBarang - potongHutangVal;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sellerName) return alert("Nama Penjual wajib diisi!");
    const validItems = items.filter(i => Number(i.berat) > 0 && Number(i.hargaBeli) > 0);
    if (validItems.length === 0) return alert("Minimal 1 barang harus terisi lengkap!");

    const currentBalance = db.wallet?.balance || 0;
    if (finalTotalBayar > currentBalance) return alert(`GAGAL: Saldo Kas Anda tidak mencukupi untuk membayar transaksi ini!\nSisa Saldo Anda: ${formatRp(currentBalance)}\nTagihan: ${formatRp(finalTotalBayar)}`);

    let updatedSellers = [...db.sellers];
    const existingSellerIndex = updatedSellers.findIndex(s => s.nama.toLowerCase() === sellerName.toLowerCase());
    if (existingSellerIndex >= 0) updatedSellers[existingSellerIndex].telepon = sellerPhone || updatedSellers[existingSellerIndex].telepon;
    else updatedSellers.push({ id: Date.now(), nama: sellerName, telepon: sellerPhone });

    const newTransaction = { id: `TRX-${Date.now()}`, tanggal, sellerName, sellerPhone, items: validItems.map(i => ({ komoditas: i.komoditas, berat: Number(i.berat), hargaBeli: Number(i.hargaBeli) })), totalBarang: totalBarang, potongHutang: potongHutangVal, finalTotal: finalTotalBayar };
    const newInventoryItems = validItems.map(i => ({ id: Date.now() + Math.random(), transactionId: newTransaction.id, tanggal, seller: sellerName, komoditas: i.komoditas, berat: Number(i.berat), hargaBeli: Number(i.hargaBeli), terjual: 0 }));

    let updatedDebtors = [...(db.debtors || [])];
    if (potongHutangVal > 0 && activeDebtor) {
       const debtorIndex = updatedDebtors.findIndex(d => d.id === activeDebtor.id);
       if (debtorIndex >= 0) updatedDebtors[debtorIndex].history.push({ id: Date.now(), tanggal: tanggal, type: 'LUNAS', amount: potongHutangVal, note: `Potong otomatis dari TRX Barang` });
    }

    setDb(prev => {
       const prevBalance = prev.wallet?.balance || 0;
       const walletHistoryItem = { id: Date.now(), date: tanggal, type: 'OUT', amount: finalTotalBayar, desc: `Beli rongsok dari ${sellerName}` };
       return { 
          ...prev, sellers: updatedSellers, debtors: updatedDebtors, transactions: [newTransaction, ...prev.transactions], inventory: [...prev.inventory, ...newInventoryItems],
          wallet: { balance: prevBalance - finalTotalBayar, history: [walletHistoryItem, ...(prev.wallet?.history || [])] }
       }
    });
    
    setPrintNotaData({ ...newTransaction, companyProfile: db.companyProfile });
    setSellerName(''); setSellerPhone(''); setPotongHutangInput(''); setItems([{ id: Date.now(), komoditas: commoditiesList[0], berat: '', hargaBeli: '' }]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
             <h2 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><UserRound className="w-5 h-5"/></div> Data Pengepul</h2>
             {db.sellers.length > 0 && (
               <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">Klik nama untuk isi cepat:</span>
                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                   {db.sellers.slice(0, 10).map(s => <button key={s.id} onClick={() => handleSellerSelect(s)} type="button" className="whitespace-nowrap bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition">{s.nama}</button>)}
                 </div>
               </div>
             )}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Nama Pengepul</label><input type="text" value={sellerName} onChange={e=>setSellerName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required/></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">No WhatsApp</label><input type="text" value={sellerPhone} onChange={e=>setSellerPhone(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" /></div>
             </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800"><div className="bg-amber-100 p-2 rounded-lg text-amber-600"><PackagePlus className="w-5 h-5" /></div> Daftar Barang</h2>
                <input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="w-full md:w-auto border border-slate-200 rounded-md px-3 py-1.5 bg-slate-50 outline-none text-sm font-bold text-slate-600" />
             </div>
             <div className="space-y-4">
               {items.map((item, index) => (
                 <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-end bg-slate-50 p-4 rounded-xl border border-slate-200 relative group pt-8 md:pt-4">
                   <div className="absolute left-2 top-2 bg-slate-800 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-black shadow-md">{index + 1}</div>
                   <div className="w-full md:w-1/3"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Komoditas</label><select value={item.komoditas} onChange={e=>updateItem(item.id, 'komoditas', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-amber-500 outline-none">{commoditiesList.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                   <div className="w-full md:w-1/4"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Berat (Kg)</label><input type="number" value={item.berat} onChange={e=>updateItem(item.id, 'berat', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg font-bold text-blue-700 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" required/></div>
                   <div className="w-full md:w-1/4"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Harga (/Kg)</label><input type="number" value={item.hargaBeli} onChange={e=>updateItem(item.id, 'hargaBeli', e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg font-bold text-emerald-700 focus:ring-2 focus:ring-amber-500 outline-none" placeholder="0" required/></div>
                   <button type="button" onClick={() => removeItemRow(item.id)} className={`pb-2 transition flex-shrink-0 ${items.length > 1 ? 'text-red-400 hover:text-red-600' : 'text-slate-200 cursor-not-allowed'}`} disabled={items.length <= 1}><XCircle className="w-8 h-8" /></button>
                 </div>
               ))}
             </div>
             <button type="button" onClick={addItemRow} className="mt-6 flex items-center gap-2 text-sm font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-6 py-3 rounded-xl border-2 border-amber-200 border-dashed w-full justify-center transition shadow-sm"><Plus className="w-5 h-5" /> TAMBAH BARIS BARANG</button>
             
             {sisaHutangSeller > 0 && (
                <div className="mt-8 bg-red-50 border border-red-200 p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                   <div className="flex-1"><h4 className="font-bold text-red-800 flex items-center gap-2 mb-1"><AlertTriangle className="w-5 h-5" /> Opsi Potong Kasbon</h4><p className="text-sm text-red-600 font-medium">Sisa Kasbon: <strong>{formatRp(sisaHutangSeller)}</strong>.</p></div>
                   <div className="w-full md:w-1/3"><label className="block text-xs font-bold text-red-700 mb-1 uppercase tracking-wide">Nominal Potongan</label><input type="number" value={potongHutangInput} onChange={e=>setPotongHutangInput(e.target.value)} className="w-full p-3 border border-red-300 rounded-lg font-black text-red-700 focus:ring-2 focus:ring-red-500 outline-none" placeholder="0"/></div>
                </div>
             )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl md:sticky md:top-6">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700 pb-4">Tagihan Pembayaran</h3>
            <div className="space-y-3 mb-6 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {items.map(item => (item.berat > 0 && item.hargaBeli > 0) ? <div key={`sum-${item.id}`} className="flex justify-between text-sm bg-slate-800/50 p-3 rounded-lg"><span className="text-slate-300 font-medium">{item.komoditas}</span> <span className="font-bold text-emerald-400">{formatRp(item.berat * item.hargaBeli)}</span></div> : null)}
            </div>
            <div className="border-t border-slate-700 pt-4 mb-8">
               <div className="flex justify-between text-sm text-slate-400 mb-2"><span>Total Barang:</span> <span>{formatRp(totalBarang)}</span></div>
               {potongHutangVal > 0 && <div className="flex justify-between text-sm text-red-400 font-medium mb-3"><span>Potong Kasbon:</span> <span>- {formatRp(potongHutangVal)}</span></div>}
               <div className="text-xs text-slate-400 font-bold tracking-widest mt-4 mb-1">TOTAL DIBAYARKAN (KAS KELUAR):</div>
               <div className="text-3xl md:text-4xl font-black text-amber-400 break-words">{formatRp(finalTotalBayar)}</div>
            </div>
            <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-lg shadow-lg shadow-blue-500/20 transition"><Save className="w-6 h-6" /> SIMPAN & CETAK NOTA</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE TRANSAKSI PENJUALAN
// ==========================================
function PagePenjualan({ db, setDb }) {
  const commoditiesList = db.masterCommodities || DEFAULT_COMMODITIES;
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [komoditas, setKomoditas] = useState(commoditiesList[0]);
  const [beratJual, setBeratJual] = useState('');
  const [hargaJual, setHargaJual] = useState('');

  const ketersediaanStok = db.inventory.filter(i => i.komoditas === komoditas).reduce((sum, item) => sum + (item.berat - (item.terjual || 0)), 0);

  const handleJual = (e) => {
    e.preventDefault();
    const bJual = Number(beratJual); const hJual = Number(hargaJual);
    if (bJual <= 0 || hJual <= 0) return alert("Berat dan harga harus lebih dari 0!");
    if (bJual > ketersediaanStok) return alert(`Gagal! Stok tidak cukup. Sisa stok: ${ketersediaanStok} Kg.`);

    let remainingToSell = bJual; let totalModalHPP = 0; 
    let newInventory = db.inventory.map(item => ({...item})); 

    const availableItems = newInventory.filter(i => i.komoditas === komoditas && (i.berat - (i.terjual || 0)) > 0).sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

    for (let item of availableItems) {
      if (remainingToSell <= 0) break;
      let available = item.berat - (item.terjual || 0);
      let dipotong = Math.min(available, remainingToSell);
      item.terjual = (item.terjual || 0) + dipotong; 
      totalModalHPP += (dipotong * item.hargaBeli);  
      remainingToSell -= dipotong;
    }

    const totalPendapatan = bJual * hJual;
    const profitTransaksiIni = totalPendapatan - totalModalHPP;
    const newSale = { id: `OUT-${Date.now()}`, tanggal, komoditas, berat: bJual, hargaJual: hJual, pendapatan: totalPendapatan, hpp: totalModalHPP, profit: profitTransaksiIni };

    setDb(prev => {
       const prevBalance = prev.wallet?.balance || 0;
       const walletHistoryItem = { id: Date.now(), date: tanggal, type: 'IN', amount: totalPendapatan, desc: `Penjualan ${komoditas} ${bJual}kg (Cair)` };
       return { ...prev, inventory: newInventory, sales: [...(prev.sales || []), newSale], wallet: { balance: prevBalance + totalPendapatan, history: [walletHistoryItem, ...(prev.wallet?.history || [])] } }
    });

    alert(`✅ BERHASIL!\nTotal Masuk Kas: ${formatRp(totalPendapatan)}\nStok otomatis terpotong.`);
    setBeratJual(''); setHargaJual('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6 flex items-center gap-3"><div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ShoppingCart className="w-6 h-6" /></div> Transaksi Penjualan (Cairkan)</h2>
        <form onSubmit={handleJual} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Pilih Komoditas</label><select value={komoditas} onChange={e=>setKomoditas(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none">{commoditiesList.map(c => <option key={c} value={c}>{c}</option>)}</select><div className="mt-2 text-sm font-bold text-emerald-600">Sisa Stok: {ketersediaanStok} Kg</div></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Jual</label><input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="w-full p-3 border rounded-lg outline-none" required/></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Total Berat (Kg)</label><input type="number" value={beratJual} onChange={e=>setBeratJual(e.target.value)} className="w-full p-4 border rounded-xl text-xl font-bold text-blue-700 outline-none" required/></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-2">Harga Jual / Kg</label><input type="number" value={hargaJual} onChange={e=>setHargaJual(e.target.value)} className="w-full p-4 border rounded-xl text-xl font-bold text-emerald-700 outline-none" required/></div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row justify-between items-center mt-6 shadow-xl"><div className="text-center md:text-left mb-4 md:mb-0"><div className="text-sm text-slate-400 font-medium">TOTAL MASUK KAS:</div><div className="text-3xl font-black text-amber-400 break-words">{formatRp(Number(beratJual) * Number(hargaJual))}</div></div><button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-10 py-4 rounded-xl font-bold shadow-lg transition"><ArrowRightLeft className="inline w-5 h-5 mr-2" /> Proses Penjualan</button></div>
        </form>
      </div>
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Receipt className="w-5 h-5 text-slate-400" /> Riwayat Penjualan</h3>
         <div className="overflow-x-auto"><table className="w-full text-left text-sm border-collapse min-w-[500px]"><thead className="bg-slate-50 border-y"><tr className="text-slate-600"><th className="p-4">Tgl</th><th className="p-4">Barang</th><th className="p-4">Hrg Jual</th><th className="p-4 text-right">Pendapatan</th><th className="p-4 text-right">Profit Kotor</th></tr></thead><tbody className="divide-y">{(db.sales || []).slice().reverse().map(sale => (<tr key={sale.id} className="hover:bg-slate-50"><td className="p-4">{sale.tanggal}</td><td className="p-4 font-bold">{sale.komoditas}</td><td className="p-4">{formatRp(sale.hargaJual)}</td><td className="p-4 text-right font-bold text-blue-600">{formatRp(sale.pendapatan)}</td><td className="p-4 text-right font-black text-emerald-500 bg-emerald-50/50">+{formatRp(sale.profit)}</td></tr>))}</tbody></table></div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE HUTANG KASBON
// ==========================================
function PageHutang({ db, setDb }) {
  const [tab, setTab] = useState('list');
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [tgl, setTgl] = useState(new Date().toISOString().split('T')[0]);
  const [namaInput, setNamaInput] = useState('');
  const [nominal, setNominal] = useState('');
  const [selectDebtorId, setSelectDebtorId] = useState('');

  const debtorsData = useMemo(() => {
    return (db.debtors || []).map(d => {
      const totalPinjam = d.history.filter(h => h.type === 'PINJAM').reduce((s, h) => s + h.amount, 0);
      const totalLunas = d.history.filter(h => h.type === 'LUNAS').reduce((s, h) => s + h.amount, 0);
      return { ...d, totalPinjam, totalLunas, sisa: totalPinjam - totalLunas };
    }).sort((a,b) => b.sisa - a.sisa);
  }, [db.debtors]);

  const debtorsWithHutang = debtorsData.filter(d => d.sisa > 0);
  const globalTotalPiutang = debtorsData.reduce((s, d) => s + d.sisa, 0);

  const handleAddPinjaman = (e) => {
    e.preventDefault();
    if(!namaInput || !nominal) return;
    const currentBalance = db.wallet?.balance || 0;
    if (Number(nominal) > currentBalance) return alert(`GAGAL: Saldo Kas Anda tidak mencukupi!\nSisa Saldo Kas: ${formatRp(currentBalance)}`);
    
    let updatedDebtors = [...(db.debtors || [])];
    let dIndex = updatedDebtors.findIndex(d => d.nama.toLowerCase() === namaInput.toLowerCase());
    const record = { id: Date.now(), tanggal: tgl, type: 'PINJAM', amount: Number(nominal), note: 'Pinjaman Modal Baru' };

    if (dIndex >= 0) updatedDebtors[dIndex].history.push(record);
    else updatedDebtors.push({ id: Date.now(), nama: namaInput, telepon: '', history: [record] });

    setDb(prev => {
       const prevBalance = prev.wallet?.balance || 0;
       const walletHistoryItem = { id: Date.now(), date: tgl, type: 'OUT', amount: Number(nominal), desc: `Kasbon / Pinjaman ke ${namaInput}` };
       return { ...prev, debtors: updatedDebtors, wallet: { balance: prevBalance - Number(nominal), history: [walletHistoryItem, ...(prev.wallet?.history || [])] } };
    });
    alert("Berhasil mencatat pinjaman! Saldo Kas telah dipotong.");
    setNamaInput(''); setNominal(''); setTab('list');
  };

  const handlePelunasan = (e) => {
    e.preventDefault();
    if(!selectDebtorId || !nominal) return;
    let updatedDebtors = [...(db.debtors || [])];
    let dIndex = updatedDebtors.findIndex(d => d.id === Number(selectDebtorId));
    if (dIndex >= 0) {
       const debtorName = updatedDebtors[dIndex].nama;
       updatedDebtors[dIndex].history.push({ id: Date.now(), tanggal: tgl, type: 'LUNAS', amount: Number(nominal), note: 'Pelunasan Cicilan Manual' });
       setDb(prev => {
          const prevBalance = prev.wallet?.balance || 0;
          const walletHistoryItem = { id: Date.now(), date: tgl, type: 'IN', amount: Number(nominal), desc: `Terima Pelunasan dari ${debtorName}` };
          return { ...prev, debtors: updatedDebtors, wallet: { balance: prevBalance + Number(nominal), history: [walletHistoryItem, ...(prev.wallet?.history || [])] } };
       });
       alert("Pelunasan berhasil dicatat! Saldo Kas bertambah.");
       setSelectDebtorId(''); setNominal(''); setTab('list');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 p-6 md:p-8 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute right-0 top-0 opacity-10"><CreditCard className="w-64 h-64 -mr-10 -mt-10" /></div>
         <div className="relative z-10"><h2 className="text-2xl font-bold flex items-center gap-3"><CreditCard className="text-amber-500 w-8 h-8" /> Buku Kasbon & Piutang</h2></div>
         <div className="relative z-10 bg-slate-800 p-4 rounded-xl border border-slate-700 text-center w-full md:w-auto"><div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">TOTAL UANG DI LUAR</div><div className="text-3xl font-black text-red-400">{formatRp(globalTotalPiutang)}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setTab('list')} className={`px-4 md:px-6 py-2.5 rounded-lg font-bold text-xs md:text-sm ${tab==='list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>Daftar Pengutang</button>
        <button onClick={() => setTab('pinjam')} className={`px-4 md:px-6 py-2.5 rounded-lg font-bold text-xs md:text-sm ${tab==='pinjam' ? 'bg-amber-500 text-slate-900' : 'bg-white text-slate-600'}`}>+ Beri Pinjaman</button>
        <button onClick={() => setTab('lunas')} className={`px-4 md:px-6 py-2.5 rounded-lg font-bold text-xs md:text-sm ${tab==='lunas' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-600'}`}>✓ Terima Cicilan</button>
      </div>

      {tab === 'list' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           {selectedDebtor ? (
             <div className="p-6">
                <button onClick={()=>setSelectedDebtor(null)} className="text-sm font-bold text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">← Kembali ke Daftar</button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b pb-4 mb-6 gap-4"><div><h3 className="text-2xl font-black text-slate-800">{selectedDebtor.nama}</h3></div><div className="text-left md:text-right"><div className="text-xs font-bold text-slate-500 uppercase">Sisa Hutang</div><div className="text-2xl font-black text-red-600">{formatRp(selectedDebtor.sisa)}</div></div></div>
                <div className="overflow-y-auto max-h-[400px]">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="bg-slate-50"><tr className="text-slate-600"><th className="p-3">Tanggal</th><th className="p-3">Keterangan</th><th className="p-3 text-right">Debit (Pinjam)</th><th className="p-3 text-right">Kredit (Lunas)</th></tr></thead>
                    <tbody className="divide-y">
                      {selectedDebtor.history.map(h => (
                        <tr key={h.id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-500">{h.tanggal}</td>
                          <td className="p-3 text-slate-700">{h.note}</td>
                          <td className="p-3 text-right font-bold text-red-500">{h.type === 'PINJAM' ? formatRp(h.amount) : '-'}</td>
                          <td className="p-3 text-right font-bold text-emerald-500">{h.type === 'LUNAS' ? formatRp(h.amount) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
           ) : (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                   <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4">Nama Pengutang</th><th className="p-4 text-right">Total Pinjam</th><th className="p-4 text-right">Telah Dibayar</th><th className="p-4 text-right">Sisa Hutang</th><th className="p-4 text-center">Detail</th></tr></thead>
                   <tbody className="divide-y divide-slate-100">
                      {debtorsData.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic">Belum ada data kasbon.</td></tr>}
                      {debtorsData.map(d => (
                         <tr key={d.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-bold text-slate-800 text-base">{d.nama}</td><td className="p-4 text-right font-medium text-slate-600">{formatRp(d.totalPinjam)}</td><td className="p-4 text-right font-medium text-emerald-600">{formatRp(d.totalLunas)}</td>
                            <td className={`p-4 text-right font-black ${d.sisa > 0 ? 'text-red-600' : 'text-slate-300'}`}>{d.sisa > 0 ? formatRp(d.sisa) : 'LUNAS'}</td>
                            <td className="p-4 text-center"><button onClick={()=>setSelectedDebtor(d)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold px-3 py-1.5 rounded text-xs transition"><History className="w-4 h-4 inline mr-1"/> Histori</button></td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      )}

      {tab === 'pinjam' && (
        <div className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus className="text-amber-500"/> Berikan Pinjaman Modal</h3>
          <form className="space-y-5" onSubmit={handleAddPinjaman}>
             <div><label className="block text-sm font-bold text-slate-700 mb-2">Tanggal</label><input type="date" value={tgl} onChange={e=>setTgl(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500" required/></div>
             <div><label className="block text-sm font-bold text-slate-700 mb-2">Nama Pengepul</label><input type="text" value={namaInput} onChange={e=>setNamaInput(e.target.value)} className="w-full p-3 border rounded-lg outline-none" required/></div>
             <div><label className="block text-sm font-bold text-slate-700 mb-2">Nominal Pinjaman (Rp)</label><input type="number" value={nominal} onChange={e=>setNominal(e.target.value)} className="w-full p-3 border rounded-lg outline-none font-bold text-lg" required/></div>
             <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-4 rounded-xl shadow-lg transition">SIMPAN PINJAMAN BARU</button>
          </form>
        </div>
      )}

      {tab === 'lunas' && (
        <div className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-500"/> Terima Cicilan Manual</h3>
          {debtorsWithHutang.length === 0 ? <div className="p-6 bg-emerald-50 text-emerald-700 border rounded-lg text-center font-bold">Tidak ada pengepul berhutang.</div> : (
            <form className="space-y-5" onSubmit={handlePelunasan}>
               <div><label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Bayar</label><input type="date" value={tgl} onChange={e=>setTgl(e.target.value)} className="w-full p-3 border rounded-lg outline-none" required/></div>
               <div><label className="block text-sm font-bold text-slate-700 mb-2">Pilih Pengepul</label><select value={selectDebtorId} onChange={e=>setSelectDebtorId(e.target.value)} className="w-full p-3 border rounded-lg outline-none bg-white" required><option value="" disabled>-- Pilih Orang --</option>{debtorsWithHutang.map(d => <option key={d.id} value={d.id}>{d.nama} ({formatRp(d.sisa)})</option>)}</select></div>
               <div><label className="block text-sm font-bold text-slate-700 mb-2">Nominal Dibayar (Rp)</label><input type="number" value={nominal} onChange={e=>setNominal(e.target.value)} className="w-full p-3 border rounded-lg font-bold text-lg" required/></div>
               <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-xl shadow-lg transition">SIMPAN PELUNASAN</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}


// ==========================================
// PAGE DATA GUDANG (DENGAN MASTER KOMODITAS BARU)
// ==========================================
function PageGudang({ db, setDb }) {
  const commoditiesList = db.masterCommodities || DEFAULT_COMMODITIES;
  const [newCommodity, setNewCommodity] = useState('');

  const handleDeleteInventory = (id) => {
    if(window.confirm("Hapus data jika salah input kasir.\nLanjutkan hapus?")) setDb(prev => ({ ...prev, inventory: prev.inventory.filter(item => item.id !== id) }));
  };

  const handleAddCommodity = (e) => {
     e.preventDefault();
     if (!newCommodity) return;
     if (commoditiesList.map(c=>c.toLowerCase()).includes(newCommodity.toLowerCase())) {
        alert("Barang ini sudah ada di daftar!");
        return;
     }
     
     setDb(prev => ({
        ...prev,
        masterCommodities: [...(prev.masterCommodities || DEFAULT_COMMODITIES), newCommodity]
     }));
     setNewCommodity('');
  };

  const handleDeleteCommodity = (comName) => {
     if (window.confirm(`Yakin ingin menghapus ${comName} dari daftar barang?`)) {
        setDb(prev => ({
           ...prev,
           masterCommodities: (prev.masterCommodities || DEFAULT_COMMODITIES).filter(c => c !== comName)
        }));
     }
  };

  const ringkasanStok = commoditiesList.map(c => {
    const sisa = db.inventory.filter(i => i.komoditas === c).reduce((sum, i) => sum + (i.berat - (i.terjual || 0)), 0);
    return { komoditas: c, berat: sisa };
  }).filter(s => s.berat > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-2xl shadow-xl text-white relative">
         <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Database className="text-amber-500" /> Stok Mengendap Real-Time</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 relative z-10">
            {ringkasanStok.length === 0 && <div className="col-span-full text-slate-400 text-sm">Gudang kosong.</div>}
            {ringkasanStok.map(stok => (
               <div key={stok.komoditas} className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50 text-center shadow-inner">
                  <div className="text-slate-400 text-xs font-bold uppercase mb-2">{stok.komoditas}</div>
                  <div className="text-3xl font-black text-amber-400">{stok.berat} <span className="text-sm font-medium">kg</span></div>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-4">Rincian Barang Masuk (Batch)</h2>
            <div className="overflow-x-auto max-h-[500px]">
               <table className="w-full text-left text-sm relative border-collapse min-w-[500px]">
                  <thead className="bg-slate-50 text-slate-600 sticky top-0 shadow-sm border-b">
                     <tr><th className="p-3">Tgl & Penjual</th><th className="p-3">Komoditas</th><th className="p-3 text-right">Status Berat</th><th className="p-3 text-right">Hrg Beli</th><th className="p-3 text-center">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {db.inventory.slice().reverse().map(item => {
                        const sisaBerat = item.berat - (item.terjual || 0);
                        return (
                          <tr key={item.id} className={`hover:bg-blue-50/50 transition ${sisaBerat === 0 ? 'bg-slate-50 opacity-60' : ''}`}>
                             <td className="p-3 font-medium text-slate-800">{item.tanggal} <br/><span className="text-[11px] text-slate-500 uppercase">{item.seller}</span></td>
                             <td className="p-3 font-bold text-slate-700">{item.komoditas}</td>
                             <td className="p-3 text-right"><div className={`font-bold text-base ${sisaBerat > 0 ? 'text-blue-600' : 'text-slate-400'}`}>{sisaBerat}kg Sisa</div>{item.terjual > 0 && <div className="text-[11px] font-medium text-emerald-600">Terjual: {item.terjual}kg</div>}</td>
                             <td className="p-3 text-right font-medium text-slate-700">{formatRp(item.hargaBeli)}</td>
                             <td className="p-3 text-center">{item.terjual > 0 ? <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-1 rounded-full font-bold">Kunci</span> : <button onClick={() => handleDeleteInventory(item.id)} className="text-red-500 p-2 hover:bg-red-100 rounded-lg transition"><Trash2 className="w-4 h-4 mx-auto"/></button>}</td>
                          </tr>
                        )
                     })}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h2 className="text-xl font-bold text-slate-800 border-b pb-4 mb-4 flex items-center gap-2">
                 <PackagePlus className="text-blue-500 w-5 h-5" /> Master Komoditas
               </h2>
               <p className="text-xs text-slate-500 mb-4">Tambahkan nama barang baru jika tidak ada di daftar dropdown Kasir.</p>
               
               <form onSubmit={handleAddCommodity} className="flex gap-2 mb-4">
                 <input type="text" value={newCommodity} onChange={e=>setNewCommodity(e.target.value)} placeholder="Misal: Botol Kaca" className="flex-1 p-2 text-sm border border-slate-300 rounded outline-none focus:border-blue-500" required/>
                 <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-bold">+</button>
               </form>

               <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2">
                 {commoditiesList.map(c => (
                    <div key={c} className="bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                       {c}
                       {c !== 'Lainnya' && <button onClick={()=>handleDeleteCommodity(c)} className="text-slate-400 hover:text-red-500 font-black">×</button>}
                    </div>
                 ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}


// ==========================================
// PAGE OPERASIONAL TETAP (DENGAN INDIKATOR LUNAS BULAN INI)
// ==========================================
function PageOperasionalTetap({ db, setDb }) {
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [selectedTagihanId, setSelectedTagihanId] = useState('');
  const [tglBayar, setTglBayar] = useState(new Date().toISOString().split('T')[0]);

  const currentMonth = new Date().toISOString().substring(0, 7);

  const checkIsPaidThisMonth = (tagihanNama) => {
     return (db.wallet?.history || []).some(h => 
        h.type === 'OUT' && 
        h.desc === `Bayar Biaya Tetap: ${tagihanNama}` &&
        h.date.startsWith(currentMonth)
     );
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nama || !harga) return;
    setDb(prev => ({ ...prev, fixedCosts: [...prev.fixedCosts, { id: Date.now(), nama, harga: Number(harga) }] }));
    setNama(''); setHarga('');
  };

  const handleBayarTagihan = (e) => {
    e.preventDefault();
    if (!selectedTagihanId) return;

    const tagihan = db.fixedCosts.find(t => t.id === Number(selectedTagihanId));
    if (!tagihan) return;

    const currentBalance = db.wallet?.balance || 0;
    if (tagihan.harga > currentBalance) {
      alert(`GAGAL: Saldo Kas Anda tidak cukup!\nSisa Saldo Kas: ${formatRp(currentBalance)}\nTagihan ${tagihan.nama}: ${formatRp(tagihan.harga)}`);
      return;
    }

    setDb(prev => {
       const prevBalance = prev.wallet?.balance || 0;
       const walletHistoryItem = {
          id: Date.now(), date: tglBayar, type: 'OUT', amount: tagihan.harga, desc: `Bayar Biaya Tetap: ${tagihan.nama}`
       };
       return { ...prev, wallet: { balance: prevBalance - tagihan.harga, history: [walletHistoryItem, ...(prev.wallet?.history || [])] } };
    });

    alert(`BERHASIL: Tagihan ${tagihan.nama} telah dibayar! Saldo kas otomatis dipotong.`);
    setSelectedTagihanId('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500">
         <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-3 text-blue-600"><WalletCards className="w-6 h-6"/> Bayar Tagihan Bulan Ini</h2>
         <p className="text-slate-500 text-sm mb-6">Pilih tagihan dari daftar Master Biaya Tetap untuk dibayarkan. Sistem akan memotong saldo Dompetku dan menguncinya agar tidak dobel bayar.</p>
         
         {db.fixedCosts.length === 0 ? (
            <div className="text-center py-4 bg-slate-50 text-slate-400 font-medium rounded-lg">Silakan buat daftar tagihan di bawah terlebih dahulu.</div>
         ) : (
            <form onSubmit={handleBayarTagihan} className="flex flex-col md:flex-row gap-4 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tanggal Bayar</label><input type="date" value={tglBayar} onChange={e=>setTglBayar(e.target.value)} className="w-full p-3 border rounded-lg outline-none" required/></div>
              <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Pilih Tagihan</label>
                 <select value={selectedTagihanId} onChange={e=>setSelectedTagihanId(e.target.value)} className="w-full p-3 border rounded-lg outline-none bg-white" required>
                    <option value="" disabled>-- Pilih Tagihan --</option>
                    {db.fixedCosts.map(t => {
                       const isPaid = checkIsPaidThisMonth(t.nama);
                       return (
                         <option key={t.id} value={t.id} disabled={isPaid}>
                            {t.nama} - {formatRp(t.harga)} {isPaid ? ' (SUDAH LUNAS)' : ''}
                         </option>
                       )
                    })}
                 </select>
              </div>
              <div className="flex items-end"><button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-lg shadow transition">Bayar Tagihan</button></div>
            </form>
         )}
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
         <h2 className="text-xl font-bold mb-2 flex items-center gap-3"><Settings className="text-slate-500"/> Master Daftar Biaya Tetap</h2>
         <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div className="flex-1"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nama Tagihan Baru</label><input type="text" value={nama} onChange={e=>setNama(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="Sewa Lahan" required/></div>
            <div className="w-full md:w-1/3"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Harga Bulanan</label><input type="number" value={harga} onChange={e=>setHarga(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg outline-none" placeholder="0" required/></div>
            <div className="flex items-end"><button type="submit" className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 rounded-lg shadow transition">Tambah</button></div>
         </form>

         <div className="space-y-3">
            {db.fixedCosts.map(item => {
               const isPaid = checkIsPaidThisMonth(item.nama);
               return (
                 <div key={item.id} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition gap-2">
                   <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-700">{item.nama}</span>
                      {isPaid && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> LUNAS BULAN INI</span>}
                   </div>
                   <div className="font-black text-slate-800 text-lg flex items-center justify-between w-full md:w-auto">
                      {formatRp(item.harga)}
                      <button onClick={() => setDb(prev => ({ ...prev, fixedCosts: prev.fixedCosts.filter(i => i.id !== item.id) }))} className="text-slate-400 hover:text-red-500 ml-6 bg-slate-50 p-2 rounded-lg transition"><Trash2 className="w-4 h-4 inline"/></button>
                   </div>
                 </div>
               )
            })}
         </div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE OPERASIONAL VARIABEL
// ==========================================
function PageOperasionalVariabel({ db, setDb }) {
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nama || !harga) return;
    
    const currentBalance = db.wallet?.balance || 0;
    if (Number(harga) > currentBalance) return alert(`GAGAL: Saldo Kas tidak cukup!\nSisa Saldo: ${formatRp(currentBalance)}`);

    setDb(prev => {
       const prevBalance = prev.wallet?.balance || 0;
       const walletHistoryItem = { id: Date.now(), date: tanggal, type: 'OUT', amount: Number(harga), desc: `Biaya Variabel: ${nama}` };
       return { 
         ...prev, variableCosts: [...(prev.variableCosts||[]), { id: Date.now(), tanggal, nama, harga: Number(harga) }],
         wallet: { balance: prevBalance - Number(harga), history: [walletHistoryItem, ...(prev.wallet?.history || [])] }
       };
    });

    alert("Biaya pengeluaran harian dicatat. Saldo Dompetku berhasil dipotong.");
    setNama(''); setHarga('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
       <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-3"><Receipt className="text-blue-500"/> Operasional Variabel (Harian)</h2>
       <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-blue-50/50 p-6 rounded-xl border border-blue-100 mt-6">
          <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Tanggal</label><input type="date" value={tanggal} onChange={e=>setTanggal(e.target.value)} className="w-full p-3 border rounded-lg outline-none" required/></div>
          <div className="col-span-1 md:col-span-2"><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Deskripsi Pengeluaran</label><input type="text" value={nama} onChange={e=>setNama(e.target.value)} placeholder="Bensin Pickup" className="w-full p-3 border rounded-lg outline-none" required/></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Nominal (Rp)</label><input type="number" value={harga} onChange={e=>setHarga(e.target.value)} placeholder="0" className="w-full p-3 border rounded-lg outline-none" required/></div>
          <div className="col-span-1 md:col-span-4 flex justify-end mt-2"><button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-3 rounded-lg shadow-md transition">Catat Pengeluaran</button></div>
       </form>
       <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-[400px]">
          <table className="w-full text-left text-sm border-collapse min-w-[400px]">
             <thead className="bg-slate-50 border-b border-slate-200 sticky top-0"><tr className="text-slate-600 font-bold"><th className="p-4">Tanggal</th><th className="p-4">Keterangan</th><th className="p-4 text-right">Biaya Keluar</th></tr></thead>
             <tbody className="divide-y divide-slate-100">
                {(db.variableCosts||[]).length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-400 font-medium italic">Tidak ada pengeluaran harian.</td></tr>}
                {(db.variableCosts||[]).slice().reverse().map(item => <tr key={item.id} className="hover:bg-blue-50/30 transition"><td className="p-4 text-slate-500">{item.tanggal}</td><td className="p-4 font-bold text-slate-800">{item.nama}</td><td className="p-4 text-right font-black text-red-600">{formatRp(item.harga)}</td></tr>)}
             </tbody>
          </table>
       </div>
    </div>
  );
}


// ==========================================
// PAGE KALKULATOR KELAYAKAN
// ==========================================
function PageKalkulator() {
  const [barang, setBarang] = useState('');
  const [berat, setBerat] = useState('');
  const [hargaBeli, setHargaBeli] = useState('');
  const [hargaJual, setHargaJual] = useState('');
  const [jarak, setJarak] = useState('');
  const [kendaraanId, setKendaraanId] = useState('pickup_bak');
  const [opsTambahan, setOpsTambahan] = useState([]);
  const [newOpsName, setNewOpsName] = useState('');
  const [newOpsPrice, setNewOpsPrice] = useState('');

  const hitungOngkir = () => {
    const v = VEHICLES.find(x => x.id === kendaraanId);
    if (!v || v.id === 'sendiri') return 0;
    return v.basePrice + (Number(jarak) > v.baseKm ? (Number(jarak) - v.baseKm) * v.pricePerKm : 0);
  };
  
  const totalOngkir = hitungOngkir(); 
  const totalOpsTambahan = opsTambahan.reduce((sum, item) => sum + item.harga, 0); 
  const totalModalBarang = Number(berat) * Number(hargaBeli); 
  const estimasiPendapatan = Number(berat) * Number(hargaJual); 
  const totalPengeluaran = totalModalBarang + totalOngkir + totalOpsTambahan; 
  const keuntunganBersih = estimasiPendapatan - totalPengeluaran; 
  const isLayak = keuntunganBersih > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-b border-slate-200 pb-4 mb-6">Kalkulator Kelayakan Ambil Barang</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-blue-600"><PackagePlus className="w-5 h-5"/> A. Rencana Barang</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Nama Barang</label><input type="text" value={barang} onChange={e => setBarang(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="Tembaga Super" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Estimasi Berat (Kg)</label><input type="number" value={berat} onChange={e => setBerat(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="0" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Harga Beli (/Kg)</label><input type="number" value={hargaBeli} onChange={e => setHargaBeli(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="0" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Estimasi Harga Jual Pabrik (/Kg)</label><input type="number" value={hargaJual} onChange={e => setHargaJual(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" placeholder="0" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-red-500"><MapPin className="w-5 h-5"/> B. Biaya Ongkir</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Jarak Tempuh PP (Km)</label><input type="number" value={jarak} onChange={e => setJarak(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-slate-50" placeholder="12" /></div>
            <div><label className="block text-sm font-bold text-slate-600 mb-1.5">Pilih Kendaraan Lalamove</label>
              <select value={kendaraanId} onChange={e => setKendaraanId(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-slate-50">
                {VEHICLES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="mt-6 bg-red-50 p-4 rounded-xl border border-red-100 font-bold flex flex-col md:flex-row justify-between items-start md:items-center gap-2"><span className="text-red-800">Total Ongkir:</span><span className="text-xl text-red-600">{formatRp(totalOngkir)}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 md:col-span-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-amber-500"><Plus className="w-5 h-5"/> C. Operasional Tambahan Lapangan</h3>
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <input type="text" value={newOpsName} onChange={e => setNewOpsName(e.target.value)} placeholder="Contoh: Tol, Uang Kopi Kuli" className="flex-1 p-3 border rounded-lg outline-none bg-slate-50" />
            <input type="number" value={newOpsPrice} onChange={e => setNewOpsPrice(e.target.value)} placeholder="Biaya (Rp)" className="w-full md:w-48 p-3 border rounded-lg outline-none bg-slate-50" />
            <button onClick={() => { if(newOpsName && newOpsPrice) { setOpsTambahan([...opsTambahan, { id: Date.now(), nama: newOpsName, harga: Number(newOpsPrice) }]); setNewOpsName(''); setNewOpsPrice(''); } }} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition shadow">Tambah Biaya</button>
          </div>
          {opsTambahan.length > 0 && (
            <div className="space-y-3">
              {opsTambahan.map(ops => (
                <div key={ops.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="font-medium text-slate-700">{ops.nama}</span>
                  <div className="flex gap-6 items-center"><span className="font-bold text-slate-800">{formatRp(ops.harga)}</span><button onClick={() => setOpsTambahan(opsTambahan.filter(o => o.id !== ops.id))} className="text-slate-400 hover:text-red-500 transition bg-white p-2 rounded-lg shadow-sm"><Trash2 className="w-4 h-4"/></button></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`md:col-span-2 p-6 md:p-8 rounded-2xl border-2 text-center shadow-md relative overflow-hidden ${isLayak ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-400'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-10 -mt-10 pointer-events-none" style={{ background: isLayak ? '#10b981' : '#ef4444' }}></div>
          <h3 className="font-black text-xl md:text-2xl mb-8 tracking-wide text-slate-800">D. KESIMPULAN KELAYAKAN</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">Modal Barang</div><div className="font-black text-slate-800 text-sm md:text-lg break-words">{formatRp(totalModalBarang)}</div></div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">Total Ongkir+Ops</div><div className="font-black text-red-500 text-sm md:text-lg break-words">{formatRp(totalOngkir + totalOpsTambahan)}</div></div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100"><div className="text-[10px] md:text-xs font-bold text-slate-500 mb-1">Estimasi Jual</div><div className="font-black text-blue-500 text-sm md:text-lg break-words">{formatRp(estimasiPendapatan)}</div></div>
             <div className="bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-800 text-white"><div className="text-[10px] md:text-xs font-bold text-slate-400 mb-1">Estimasi Net Profit</div><div className={`font-black text-sm md:text-lg break-words ${isLayak ? 'text-emerald-400' : 'text-red-400'}`}>{formatRp(keuntunganBersih)}</div></div>
          </div>
          
          <div className={`text-3xl md:text-5xl font-black uppercase tracking-wider ${isLayak ? 'text-emerald-600' : 'text-red-600'}`}>
            {isLayak ? 'LAYAK DIAMBIL !' : 'JANGAN DIAMBIL'}
          </div>
        </div>

      </div>
    </div>
  );
}


// ==========================================
// PAGE LAPORAN KEUNTUNGAN BERSIH
// ==========================================
function PageLaporan({ db, setDb }) {
  const commoditiesList = db.masterCommodities || DEFAULT_COMMODITIES;
  const [growPercent, setGrowPercent] = useState(70);

  const handlePriceChange = (komoditas, value) => {
    setDb(prev => ({ ...prev, globalPrices: { ...prev.globalPrices, [komoditas]: Number(value) } }));
  };

  // 1. MENGENDAP
  const inventoryMengendap = useMemo(() => {
    return db.inventory.filter(i => (i.berat - (i.terjual || 0)) > 0).map(item => {
      const sisaBerat = item.berat - (item.terjual || 0);
      const currentPrice = db.globalPrices[item.komoditas] || 0;
      const modalMengendap = sisaBerat * item.hargaBeli;
      const nilaiSekarang = sisaBerat * currentPrice;
      const profitLoss = nilaiSekarang - modalMengendap;
      return { ...item, sisaBerat, currentPrice, modalMengendap, nilaiSekarang, profitLoss, isProfit: profitLoss >= 0 };
    });
  }, [db.inventory, db.globalPrices]);

  const totalModalMengendap = inventoryMengendap.reduce((sum, item) => sum + item.modalMengendap, 0);
  const totalNilaiMengendap = inventoryMengendap.reduce((sum, item) => sum + item.nilaiSekarang, 0);
  const potensiUntungMengendap = inventoryMengendap.reduce((sum, item) => sum + item.profitLoss, 0);

  // 2. UANG CAIR
  const totalPendapatanCair = (db.sales || []).reduce((sum, s) => sum + s.pendapatan, 0);
  const totalModalHppCair = (db.sales || []).reduce((sum, s) => sum + s.hpp, 0);
  const grossProfitCair = totalPendapatanCair - totalModalHppCair; 

  const totalBiayaTetap = db.fixedCosts.reduce((sum, item) => sum + item.harga, 0);
  const totalBiayaVariabel = (db.variableCosts || []).reduce((sum, item) => sum + item.harga, 0);
  const totalBebanOperasional = totalBiayaTetap + totalBiayaVariabel;

  const netProfitCair = grossProfitCair - totalBebanOperasional; 
  const isNetCairProfit = netProfitCair > 0;

  const totalPiutang = (db.debtors || []).reduce((sum, d) => {
     const pinjam = d.history.filter(h => h.type === 'PINJAM').reduce((s, h) => s + h.amount, 0);
     const lunas = d.history.filter(h => h.type === 'LUNAS').reduce((s, h) => s + h.amount, 0);
     return sum + (pinjam - lunas);
  }, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="w-full md:w-auto text-center md:text-left">
            <h3 className="text-red-800 font-bold text-lg flex items-center justify-center md:justify-start gap-2"><CreditCard className="w-5 h-5"/> Piutang Lapangan (Modal Dipinjam)</h3>
            <p className="text-sm text-red-600 mt-1">Uang modal tertahan di tangan mitra dalam bentuk kasbon.</p>
         </div>
         <div className="text-3xl font-black text-red-600 bg-white px-6 py-3 rounded-xl shadow-inner border border-red-100 w-full md:w-auto text-center">{formatRp(totalPiutang)}</div>
      </div>

      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl shadow-xl">
         <h2 className="text-xl md:text-2xl font-bold mb-2 text-amber-500">Pusat Kendali Harga Aset Gudang</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-4">
            {commoditiesList.map(c => (
               <div key={c} className="bg-slate-800 p-3 rounded-xl border border-slate-700 shadow-inner">
                  <label className="block text-[10px] md:text-xs text-slate-300 font-bold mb-2 uppercase tracking-wide truncate">{c}</label>
                  <input type="number" value={db.globalPrices[c] || ''} onChange={(e) => handlePriceChange(c, e.target.value)} className="w-full bg-slate-900 text-amber-400 text-sm md:text-lg font-black p-2.5 rounded-lg border border-slate-600 outline-none focus:border-amber-500 transition text-center" placeholder="Rp..."/>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-emerald-500 relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 md:text-xs md:px-4 md:py-1.5 rounded-bl-xl shadow-sm">KAS NYATA</div>
            <h3 className="font-bold text-xl md:text-2xl mb-8 flex items-center gap-3 text-slate-800"><WalletCards className="w-6 h-6 text-emerald-500"/> Laporan Uang Cair</h3>
            <div className="space-y-4 mb-8 text-sm md:text-base">
               <div className="flex justify-between items-center text-slate-600"><span>Uang Masuk (Penjualan)</span><span className="font-black text-blue-600">{formatRp(totalPendapatanCair)}</span></div>
               <div className="flex justify-between items-center text-slate-600"><span>Modal Terjual (HPP)</span><span className="font-bold text-slate-700">- {formatRp(totalModalHppCair)}</span></div>
               <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Gross Profit</span>
                  <span className={`font-black text-lg ${grossProfitCair >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatRp(grossProfitCair)}</span>
               </div>
               <div className="flex justify-between items-center text-red-500 pt-2 bg-red-50 p-3 rounded-lg border border-red-100">
                  <span className="font-semibold">Beban Operasional</span><span className="font-bold">- {formatRp(totalBebanOperasional)}</span>
               </div>
            </div>
            <div className={`p-6 rounded-xl border-2 text-center shadow-inner ${isNetCairProfit ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
               <div className="text-xs md:text-sm font-bold text-slate-700 tracking-widest mb-2">KEUNTUNGAN BERSIH CAIR</div>
               <div className={`text-3xl md:text-5xl font-black ${isNetCairProfit ? 'text-emerald-600' : 'text-red-600'} break-all`}>{formatRp(netProfitCair)}</div>
            </div>
         </div>

         <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-amber-400 relative flex flex-col">
            <div className="absolute top-0 right-0 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 md:text-xs md:px-4 md:py-1.5 rounded-bl-xl shadow-sm">ASET BARANG</div>
            <h3 className="font-bold text-xl md:text-2xl mb-8 flex items-center gap-3 text-slate-800"><PackagePlus className="w-6 h-6 text-amber-500"/> Laporan Aset Gudang</h3>
            <div className="space-y-4 mb-8 text-sm md:text-base">
               <div className="flex justify-between items-center text-slate-600"><span>Modal Tertahan di Gudang</span><span className="font-bold text-slate-800">{formatRp(totalModalMengendap)}</span></div>
               <div className="flex justify-between items-center text-slate-600"><span>Estimasi Jual Sekarang</span><span className="font-black text-blue-600">{formatRp(totalNilaiMengendap)}</span></div>
            </div>
            <div className={`p-6 rounded-xl border text-center shadow-inner ${potensiUntungMengendap >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
               <div className="text-xs md:text-sm font-bold text-slate-700 tracking-widest mb-2">POTENSI UNTUNG MENGENDAP</div>
               <div className={`text-3xl md:text-4xl font-black ${potensiUntungMengendap >= 0 ? 'text-blue-600' : 'text-red-600'} break-all`}>{potensiUntungMengendap >= 0 ? '+' : ''}{formatRp(potensiUntungMengendap)}</div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ==========================================
// PAGE PROFIL PERUSAHAAN & PENGATURAN API
// ==========================================
function PageProfil({ db, setDb, user }) { // <-- Tambahkan 'user' di sini
  const [profile, setProfile] = useState(db.companyProfile || { nama: '', alamat: '', telepon: '' });
  const [apiKey, setApiKey] = useState(db.settings?.geminiApiKey || DEFAULT_API_KEY);
  
  const handleSave = (e) => { 
    e.preventDefault(); 
    setDb(prev => ({ 
       ...prev, 
       companyProfile: profile,
       settings: { ...prev.settings, geminiApiKey: apiKey }
    })); 
    alert("Profil dan Pengaturan Sistem Berhasil Disimpan!"); 
  };
  
  // FUNGSI RESET DATA YANG SUDAH DIPERBAIKI (FIREBASE CLOUD)
  const handleResetData = async () => {
    if (window.confirm("⚠️ PERINGATAN KERAS ⚠️\n\nApakah Anda yakin ingin MENGHAPUS SELURUH DATA?\n\nData yang dihapus TIDAK BISA DIKEMBALIKAN!")) {
      if (window.confirm("Klik 'OK' sekali lagi jika Anda benar-benar yakin ingin kembali ke pengaturan awal (Data Kosong).")) {
        try {
          // 1. Timpa data di Firebase Cloud dengan State Kosong bawaan
          const docRef = doc(firestore, 'users', user.uid, 'data', 'mainApp');
          await setDoc(docRef, DEFAULT_DB_STATE);

          // 2. Kosongkan tampilan di layar (State Lokal)
          setDb(DEFAULT_DB_STATE);

          alert("Seluruh data Cloud telah berhasil dibersihkan! Aplikasi akan dimuat ulang.");
          window.location.reload();
        } catch (error) {
          alert("Gagal membersihkan data Cloud: " + error.message);
        }
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 mt-4 pb-12">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3 mb-2 text-slate-800"><UserRound className="w-8 h-8 text-blue-500"/> Profil & Pengaturan</h2>
        <p className="text-slate-500 mb-8 font-medium text-sm md:text-base">Data ini digunakan untuk identitas Struk/Nota Kasir dan menghubungkan aplikasi dengan kecerdasan buatan.</p>
        
        <form onSubmit={handleSave} className="space-y-6 mt-8">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Nama Perusahaan / Lapak Besar</label><input type="text" value={profile.nama} onChange={e=>setProfile({...profile, nama: e.target.value.toUpperCase()})} className="w-full p-4 border-2 border-slate-200 rounded-xl font-black uppercase text-xl focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white shadow-inner" required /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap Lapak</label><textarea value={profile.alamat} onChange={e=>setProfile({...profile, alamat: e.target.value})} rows="3" className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white shadow-inner" required /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Nomor Telepon / WA</label><input type="text" value={profile.telepon} onChange={e=>setProfile({...profile, telepon: e.target.value})} className="w-full p-4 border-2 border-slate-200 rounded-xl font-bold focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white shadow-inner" required /></div>
          
          <div className="pt-6 border-t border-slate-200 mt-6">
             <label className="block text-sm font-bold text-purple-700 mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4"/> Google Gemini API Key (Untuk Fitur AI)</label>
             <p className="text-xs text-slate-500 mb-3">Dapatkan Key gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>. Kosongkan jika tidak ingin menggunakan fitur AI.</p>
             <input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-xl font-mono focus:border-purple-500 outline-none transition bg-purple-50 focus:bg-white shadow-inner" placeholder="AIzaSyA..." />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg py-4 rounded-xl mt-4 transition shadow-lg shadow-blue-500/30">SIMPAN PENGATURAN</button>
        </form>
      </div>

      <div className="bg-red-50 p-6 md:p-8 rounded-2xl border-2 border-red-200 shadow-sm mt-12">
        <h3 className="text-lg md:text-xl font-black text-red-700 flex items-center gap-2 mb-2"><AlertTriangle className="w-6 h-6 flex-shrink-0" /> ZONA BERBAHAYA (Reset Data)</h3>
        <p className="text-sm text-red-600 font-medium mb-6">Tombol ini akan menghapus <strong>seluruh data Gudang, Transaksi Pembelian, Penjualan, Operasional, Dompetku, dan Riwayat Pengepul</strong>. Aplikasi akan kembali kosong.</p>
        <button onClick={handleResetData} type="button" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md flex items-center justify-center gap-2 w-full md:w-auto"><Trash2 className="w-5 h-5 flex-shrink-0" /> Bersihkan Seluruh Data</button>
      </div>
    </div>
  );
}
