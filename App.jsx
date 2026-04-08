import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Calendar, MapPin, Search, ChevronLeft, ClipboardList, HardHat, 
  Image as ImageIcon, Save, X, Edit3, Trash2, Check, 
  ChevronRight, Settings, AlertCircle, 
  Type, Cloud, Loader2, Camera, Upload, Folder,
  Tags, ListFilter, Archive,
  Zap, Plug, Cable, Power, Lightbulb, Wrench, Hammer, 
  CheckCircle, Info, Building, Truck, Grid,
  Shield, Flame, Droplets, Wind, Thermometer, Scissors, Battery,
  FileText, PenTool, Ruler, Compass, Home, Activity, Radio, Wifi,
  Phone, Car, Clock, Lock, Unlock, Sun, Moon, ChevronDown,
  // --- 多職種・取り合い用 新規追加アイコン ---
  Snowflake, Paintbrush, Link, Milestone, Layers
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

// --- アイコンと色のマッピング定義 ---
const IconMap = {
  Zap, Plug, Cable, Power, Lightbulb, Wrench, Hammer, HardHat, AlertCircle, CheckCircle, Info, Tags, Folder, MapPin, Building, Truck, Grid, ListFilter,
  Shield, Flame, Droplets, Wind, Thermometer, Scissors, Battery, FileText, PenTool, Ruler, Compass, Home, Activity, Radio, Wifi, Phone, Car, Clock, Lock, Unlock, Sun, Moon,
  Snowflake, Paintbrush, Link, Milestone, Layers
};

const IconNames = {
  Zap: '強電・雷', Plug: 'コンセント', Cable: '配線', Power: '動力・電源', Lightbulb: '照明', Wrench: 'レンチ', Hammer: 'ハンマー', HardHat: 'ヘルメット', AlertCircle: '注意・警告', CheckCircle: '確認・完了', Info: '情報', Tags: 'タグ', Folder: 'フォルダ', MapPin: '現場・場所', Building: 'ビル・施設', Truck: 'トラック・搬入', Grid: '盤・ラック', ListFilter: 'フィルター',
  Shield: '保安・防御', Flame: '火気・熱', Droplets: '水回り・配管', Wind: '換気・ダクト', Thermometer: '温度・測定', Scissors: '切断・加工', Battery: 'バッテリー', FileText: '図面・書類', PenTool: 'ペン・記録', Ruler: '寸法・測定', Compass: '方位', Home: '住宅・戸建', Activity: '波形・測定器', Radio: 'アンテナ・無線', Wifi: '通信・Wi-Fi', Phone: '電話・連絡', Car: '車両・移動', Clock: '時間・期限', Lock: '施錠・セキュリティ', Unlock: '解錠', Sun: '太陽光・昼', Moon: '夜間作業',
  Snowflake: '空調・エアコン', Paintbrush: '塗装・補修', Link: '他職取り合い・連携', Milestone: '工程・段取り', Layers: '内装・ボード・軽天'
};

const ColorMap = {
  red: { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50', border: 'border-blue-200' },
  green: { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50', border: 'border-orange-200' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50', border: 'border-purple-200' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-50', border: 'border-pink-200' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-700', light: 'bg-teal-50', border: 'border-teal-200' },
  gray: { bg: 'bg-slate-500', text: 'text-slate-700', light: 'bg-slate-100', border: 'border-slate-300' },
};

const ColorNames = {
  red: '赤色', blue: '青色', green: '緑色', yellow: '黄色', orange: 'オレンジ色', purple: '紫色', pink: 'ピンク色', teal: '青緑色', gray: 'グレー色'
};

// --- Firebase 設定 ---
const firebaseConfig = {
  apiKey: "AIzaSyDMOwQv6Np1N38y8ecJSXCRDZ4G89wccnM",
  authDomain: "electricity-gokui.firebaseapp.com",
  projectId: "electricity-gokui",
  storageBucket: "electricity-gokui.firebasestorage.app",
  messagingSenderId: "910125375437",
  appId: "1:910125375437:web:a40c27cd1f932c2e726e84"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;

// 他職取り合いを意識した初期設定
const defaultSettings = {
  quickPhrases: [
    "通電確認OK", "絶縁抵抗計 測定済", "相色確認OK", "隠蔽部写真撮影済",
    "軽天屋さんと打ち合わせ済", "ボード開口指示", "先行配管完了", "スリーブ位置確認"
  ],
  genres: {
    '幹線工事': { colorId: 'red', icon: 'Zap' },
    '盤結線': { colorId: 'blue', icon: 'Grid' },
    '弱電・通信': { colorId: 'green', icon: 'Cable' },
    '空調・エアコン': { colorId: 'teal', icon: 'Snowflake' },
    '内装・ボード': { colorId: 'orange', icon: 'Layers' },
    '他職取り合い': { colorId: 'purple', icon: 'Link' }
  },
  tags: {
    'VVFケーブル': { colorId: 'gray', icon: 'Cable' },
    'ブレーカー': { colorId: 'yellow', icon: 'Plug' },
    '照明器具': { colorId: 'yellow', icon: 'Lightbulb' },
    '室外機': { colorId: 'teal', icon: 'Snowflake' },
    '先行配線': { colorId: 'green', icon: 'Cable' },
    '点検口': { colorId: 'purple', icon: 'Unlock' },
    'スリーブ': { colorId: 'orange', icon: 'Target' } // LucideにTargetはないがフォールバックされる
  }
};

const DynamicIcon = ({ name, size = 16, className = "" }) => {
  const Icon = IconMap[name] || IconMap.Info;
  return <Icon size={size} className={className} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); 
  const [listMode, setListMode] = useState('all'); 
  
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [editingMemo, setEditingMemo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const [memos, setMemos] = useState([]);
  const [userSettings, setUserSettings] = useState(defaultSettings);

  // --- 認証とデータ同期 ---
  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) { setError("認証エラー。"); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);
    
    const memosCol = collection(db, 'artifacts', currentAppId, 'public', 'data', 'memos');
    const unsubscribeMemos = onSnapshot(memosCol, 
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMemos(data.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
        setIsSyncing(false);
      },
      (err) => { setError("データ取得エラー。"); setIsSyncing(false); }
    );
    
    const settingsDoc = doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user');
    const unsubscribeSettings = onSnapshot(settingsDoc, (d) => {
      if (d.exists()) {
        const data = d.data();
        let tagsData = data.tags || defaultSettings.tags;
        if (data.materials && Array.isArray(data.materials)) {
          tagsData = { ...tagsData };
          data.materials.forEach(m => { if(!tagsData[m]) tagsData[m] = { colorId: 'orange', icon: 'Tags' }; });
        }
        setUserSettings({
          quickPhrases: data.quickPhrases || defaultSettings.quickPhrases,
          genres: data.genres || defaultSettings.genres,
          tags: tagsData
        });
      }
    });

    return () => { unsubscribeMemos(); unsubscribeSettings(); };
  }, [user]);

  // --- データの保存・削除 ---
  const initialForm = { title: '', site: '', genre: '盤結線', materials: [], content: '', date: new Date().toISOString().split('T')[0], images: [] };
  const [formData, setFormData] = useState(initialForm);

  const handleSave = async () => {
    if (!formData.title || !user) return;
    setIsSyncing(true);
    try {
      const id = view === 'edit' ? editingMemo.id : `memo_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id), { ...formData, id }, { merge: true });
      setView('list');
      setFormData(initialForm);
    } catch (e) { alert("保存エラー。画像サイズが大きすぎる可能性があります。"); } 
    finally { setIsSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!user || !window.confirm("この極意を完全に削除しますか？")) return;
    setIsSyncing(true);
    try { await deleteDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id)); setView('list'); } 
    catch (e) { alert("削除エラー"); } finally { setIsSyncing(false); }
  };

  const saveSettings = async (newSettings) => {
    setUserSettings(newSettings);
    await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user'), newSettings);
  };

  // --- 検索とグループ化 ---
  const filteredMemos = memos.filter(m => 
    (m.title || "").includes(searchTerm) || (m.site || "").includes(searchTerm) || (m.materials || []).some(mat => mat.includes(searchTerm))
  );

  const groupedMemos = filteredMemos.reduce((acc, memo) => {
    if (listMode === 'all') return acc;
    if (listMode === 'site') {
      const key = memo.site || '現場名なし';
      if (!acc[key]) acc[key] = [];
      acc[key].push(memo);
    } else if (listMode === 'genre') {
      const key = memo.genre || '未分類';
      if (!acc[key]) acc[key] = [];
      acc[key].push(memo);
    } else if (listMode === 'material') {
      if (!memo.materials || memo.materials.length === 0) {
        const key = '材料・タグなし';
        if (!acc[key]) acc[key] = [];
        acc[key].push(memo);
      } else {
        memo.materials.forEach(mat => {
          if (!acc[mat]) acc[mat] = [];
          acc[mat].push(memo);
        });
      }
    }
    return acc;
  }, {});

  // --- 複数画像対応の赤入れモーダル ---
  const [markupModal, setMarkupModal] = useState({ isOpen: false, imgIndex: null, dataUrl: null });
  
  const MarkupModalCanvas = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    useEffect(() => {
      if (!markupModal.dataUrl || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => { ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0); };
      img.src = markupModal.dataUrl;
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    }, [markupModal.dataUrl]);

    const getPos = (e) => {
      const r = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const scaleX = canvasRef.current.width / r.width;
      const scaleY = canvasRef.current.height / r.height;
      return { x: (clientX - r.left) * scaleX, y: (clientY - r.top) * scaleY };
    };

    const startDrawing = (e) => { setIsDrawing(true); const p=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const draw = (e) => { if(!isDrawing) return; e.preventDefault(); const p=getPos(e); const ctx=canvasRef.current.getContext('2d'); ctx.lineTo(p.x, p.y); ctx.stroke(); };
    const stopDrawing = () => { setIsDrawing(false); };

    const handleSaveImage = () => {
      const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
      const newImages = [...formData.images];
      newImages[markupModal.imgIndex] = newDataUrl;
      setFormData({...formData, images: newImages});
      setMarkupModal({ isOpen: false, imgIndex: null, dataUrl: null });
    };

    return (
      <div className="fixed inset-0 bg-slate-900/95 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white rounded-[2rem] p-4 flex flex-col gap-4 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-slate-800 flex items-center gap-2"><Edit3 size={18} className="text-red-500"/> 赤入れ編集</h3>
            <button onClick={() => setMarkupModal({ isOpen: false })} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
          </div>
          <div className="bg-slate-200 rounded-2xl overflow-hidden aspect-video relative touch-none border shadow-inner">
            <canvas ref={canvasRef} width={600} height={337} className="w-full h-full cursor-crosshair bg-white"
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
            />
          </div>
          <button onClick={handleSaveImage} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">保存して戻る</button>
        </div>
      </div>
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData({...formData, images: [...formData.images, dataUrl]});
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = null; 
  };


  // --- Master設定用 カスタムUIコンポーネント ---
  const ColorSelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
      <div className="relative flex-[0.8]" ref={dropdownRef}>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-50 transition-colors">
          <span className="flex items-center gap-2"><span className={`w-3.5 h-3.5 rounded-full ${ColorMap[value].bg} shadow-sm`}></span>{ColorNames[value]}</span>
          <ChevronDown size={14} className="text-slate-400"/>
        </button>
        {isOpen && (
          <div className="absolute z-50 bottom-full left-0 mb-1 w-full bg-white border border-slate-200 rounded-xl shadow-2xl py-1 max-h-48 overflow-y-auto">
            {Object.keys(ColorMap).map(c => (
              <button key={c} type="button" onClick={() => { onChange(c); setIsOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-left transition-colors hover:bg-slate-50 ${value === c ? 'bg-slate-100 text-blue-700' : 'text-slate-700'}`}>
                <span className={`w-3.5 h-3.5 rounded-full ${ColorMap[c].bg} shadow-sm`}></span>{ColorNames[c]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const IconSelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
      const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
      <div className="relative flex-1" ref={dropdownRef}>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-white border border-slate-300 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-50 transition-colors">
          <span className="flex items-center gap-2"><DynamicIcon name={value} size={16} className="text-slate-700"/> <span className="truncate">{IconNames[value] || value}</span></span>
          <ChevronDown size={14} className="text-slate-400"/>
        </button>
        {isOpen && (
          <div className="absolute z-50 bottom-full right-0 mb-1 w-[260px] bg-white border border-slate-200 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto grid grid-cols-2 gap-1">
            {Object.keys(IconMap).map(iconName => (
              <button key={iconName} type="button" onClick={() => { onChange(iconName); setIsOpen(false); }} className={`flex items-center gap-2 p-2.5 rounded-lg text-[10px] font-bold text-left transition-colors ${value === iconName ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-700'}`}>
                <DynamicIcon name={iconName} size={14} className={value === iconName ? 'text-blue-600' : 'text-slate-500'} /> 
                <span className="truncate">{IconNames[iconName]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const EditorSection = ({ title, icon: Icon, items, onAdd, onDelete, placeholder }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [iconName, setIconName] = useState('Info');

    return (
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-700 border-b pb-2 flex items-center gap-2"><Icon size={16}/> {title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(items).map(([key, config]) => {
            const colors = ColorMap[config.colorId] || ColorMap.gray;
            return (
              <span key={key} className={`${colors.light} ${colors.text} ${colors.border} border text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-sm`}>
                <DynamicIcon name={config.icon} size={14} /> {key}
                <button onClick={() => { if(window.confirm(`「${key}」を削除しますか？`)) onDelete(key); }} className="opacity-40 hover:opacity-100 hover:text-red-600 transition-colors"><X size={14}/></button>
              </span>
            );
          })}
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <input type="text" placeholder={placeholder} value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white border border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" />
          <div className="flex gap-2 relative">
            <ColorSelector value={color} onChange={setColor} />
            <IconSelector value={iconName} onChange={setIconName} />
          </div>
          <button onClick={() => { if(name.trim()){ onAdd(name.trim(), color, iconName); setName(''); } }} className="w-full mt-2 bg-slate-800 text-white px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md active:scale-[0.98] transition-transform">この設定で追加</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-900 font-sans antialiased selection:bg-blue-100">
      {markupModal.isOpen && <MarkupModalCanvas />}
      
      {/* --- ヘッダー --- */}
      <header className="bg-blue-700 text-white p-7 rounded-b-[3.5rem] shadow-xl sticky top-0 z-20">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2.5 rounded-2xl rotate-3 shadow-lg"><HardHat className="text-blue-900" size={24}/></div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter leading-none">VoltVault</h1>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-blue-200 mt-1 uppercase tracking-widest">
                {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <Cloud size={10} />}
                {user ? `Multi-Craft Mode` : "Connecting..."}
              </div>
            </div>
          </div>
          <button onClick={() => { setFormData(initialForm); setView('add'); }} className="bg-white text-blue-700 p-4 rounded-2xl shadow-xl active:scale-90 hover:scale-105 transition-all">
            <Plus size={28} strokeWidth={4} />
          </button>
        </div>

        {/* トップ画面用 アーカイブタブ＆検索 */}
        {view === 'list' && (
          <div className="space-y-4 animate-in slide-in-from-top-4">
            <div className="flex bg-blue-900/40 p-1.5 rounded-2xl backdrop-blur-sm">
              <button onClick={() => setListMode('all')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${listMode === 'all' ? 'bg-white shadow-sm text-blue-700' : 'text-blue-200'}`}>全て</button>
              <button onClick={() => setListMode('site')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${listMode === 'site' ? 'bg-white shadow-sm text-blue-700' : 'text-blue-200'}`}>現場別</button>
              <button onClick={() => setListMode('genre')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${listMode === 'genre' ? 'bg-white shadow-sm text-blue-700' : 'text-blue-200'}`}>ジャンル</button>
              <button onClick={() => setListMode('material')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${listMode === 'material' ? 'bg-white shadow-sm text-blue-700' : 'text-blue-200'}`}>材料別</button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-blue-300" size={20} />
              <input type="text" placeholder="極意・現場・材料を検索..." className="w-full bg-white/10 rounded-2xl py-3.5 pl-12 text-white placeholder-blue-300 outline-none text-sm font-bold focus:bg-white focus:text-slate-800 transition-colors" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        )}
      </header>

      <main className="p-6 max-w-xl mx-auto">
        
        {/* --- ビュー: リスト ＆ アーカイブ統合 --- */}
        {view === 'list' && (
          <div className="space-y-6">
            {listMode === 'all' ? (
              // 全件表示モード
              <div className="space-y-4">
                {filteredMemos.length === 0 && !isSyncing && (
                  <div className="text-center py-24 opacity-30">
                    <ClipboardList size={64} className="mx-auto mb-3"/>
                    <p className="text-sm font-black uppercase italic tracking-widest text-slate-500">No Secrets Found</p>
                  </div>
                )}
                {filteredMemos.map(memo => {
                  const genreConfig = userSettings.genres[memo.genre] || { colorId: 'gray', icon: 'Info' };
                  const colors = ColorMap[genreConfig.colorId];
                  return (
                    <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="bg-white p-5 rounded-[2rem] border border-slate-100 relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all shadow-sm">
                      <div className={`absolute top-0 left-0 w-2.5 h-full ${colors.bg}`}></div>
                      <div className="flex justify-between items-start mb-2 font-black italic text-slate-300 text-[10px] uppercase">
                        <span>{memo.date}</span>
                        <div className="flex gap-2">
                          {memo.materials && memo.materials.length > 0 && <Tags size={12} className="text-orange-400" />}
                          {memo.images && memo.images.length > 0 && <span className="flex items-center gap-0.5 text-blue-500"><Camera size={12}/>{memo.images.length}</span>}
                        </div>
                      </div>
                      <h3 className="font-black text-slate-800 text-lg leading-tight mb-3 tracking-tight">{memo.title}</h3>
                      <div className="flex items-center justify-between text-[9px] font-black text-slate-400 pt-3 border-t border-slate-50">
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md"><MapPin size={10} className="text-blue-500"/> {memo.site}</span>
                        <span className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${colors.light} ${colors.text} border ${colors.border} uppercase`}><DynamicIcon name={genreConfig.icon} size={10}/> {memo.genre}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // グループ化表示モード
              Object.keys(groupedMemos).length === 0 ? (
                <p className="text-center text-xs font-bold text-slate-400 py-10">データがありません</p>
              ) : (
                Object.entries(groupedMemos).sort(([a], [b]) => a.localeCompare(b)).map(([groupKey, groupMemos]) => (
                  <div key={groupKey} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden mb-4">
                    <div className="bg-slate-800 p-4 text-white flex justify-between items-center">
                      <h3 className="font-black flex items-center gap-2">
                        {listMode === 'site' && <Building size={16} className="text-blue-400"/>}
                        {listMode === 'genre' && <ListFilter size={16} className="text-green-400"/>}
                        {listMode === 'material' && <Tags size={16} className="text-orange-400"/>}
                        {groupKey}
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-700 px-2 py-1 rounded-full">{groupMemos.length} 件</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {groupMemos.map(memo => (
                        <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="p-3 bg-slate-50 rounded-xl cursor-pointer active:bg-slate-100 flex justify-between items-center border border-transparent hover:border-slate-200">
                          <div>
                            <p className="text-sm font-black text-slate-700">{memo.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 flex gap-2">
                              {listMode !== 'site' && <span>📍{memo.site}</span>}
                              {listMode !== 'genre' && <span>🏷️{memo.genre}</span>}
                              <span>{memo.date}</span>
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300"/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}

        {/* --- ビュー: 設定 (Master) --- */}
        {view === 'settings' && (
          <div className="space-y-6 pb-10 animate-in slide-in-from-right">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-4"><Settings className="text-blue-600"/> Master設定</h2>
            
            <EditorSection 
              title="ジャンル編集" icon={ListFilter} items={userSettings.genres} placeholder="新ジャンル名..."
              onAdd={(name, colorId, icon) => saveSettings({...userSettings, genres: {...userSettings.genres, [name]: {colorId, icon}}})}
              onDelete={(name) => { const obj = {...userSettings.genres}; delete obj[name]; saveSettings({...userSettings, genres: obj}); }}
            />

            <EditorSection 
              title="材料・タグ編集" icon={Tags} items={userSettings.tags} placeholder="新しい材料・タグ..."
              onAdd={(name, colorId, icon) => saveSettings({...userSettings, tags: {...userSettings.tags, [name]: {colorId, icon}}})}
              onDelete={(name) => { const obj = {...userSettings.tags}; delete obj[name]; saveSettings({...userSettings, tags: obj}); }}
            />

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-700 border-b pb-2 flex items-center gap-2"><Type size={16}/> クイックフレーズ編集</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {userSettings.quickPhrases.map((phrase, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border">
                    {phrase}
                    <button onClick={() => saveSettings({...userSettings, quickPhrases: userSettings.quickPhrases.filter((_, i) => i !== idx)})} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                  </span>
                ))}
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col gap-2">
                <input id="newPhraseInput" type="text" placeholder="新しいフレーズ..." className="w-full bg-white border border-slate-300 p-3 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                <button onClick={() => {
                  const input = document.getElementById('newPhraseInput');
                  if (input.value.trim()) {
                    saveSettings({ ...userSettings, quickPhrases: [...userSettings.quickPhrases, input.value.trim()] });
                    input.value = '';
                  }
                }} className="w-full bg-slate-800 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">追加</button>
              </div>
            </div>
            
            <div className="text-center py-4">
              <HardHat size={32} className="mx-auto text-yellow-500 drop-shadow-md mb-2"/>
              <p className="text-xs font-black text-slate-500">VoltVault System v4.0.0 (Master Mode)</p>
            </div>
          </div>
        )}

        {/* --- ビュー: 詳細 --- */}
        {view === 'detail' && selectedMemo && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-32 animate-in slide-in-from-right duration-300">
            <header className={`${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray'].bg} text-white p-6 flex justify-between items-center sticky top-0 rounded-b-[2.5rem] shadow-lg`}>
              <button onClick={() => setView('list')}><ChevronLeft size={28}/></button>
              <h2 className="font-black italic text-[10px] tracking-widest uppercase">Secret Knowledge</h2>
              <button onClick={() => { 
                setEditingMemo(selectedMemo); 
                const safeMemo = {...selectedMemo};
                if (!safeMemo.images) safeMemo.images = [];
                if (safeMemo.markupImage && safeMemo.images.length === 0) safeMemo.images.push(safeMemo.markupImage);
                setFormData(safeMemo); 
                setView('edit'); 
              }}><Edit3 size={24}/></button>
            </header>
            
            <div className="p-8 space-y-8 max-w-xl mx-auto">
              <div className="space-y-4">
                <div className="flex gap-2 items-center mb-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray'].light} ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray'].text} border`}>
                    <DynamicIcon name={userSettings.genres[selectedMemo.genre]?.icon} size={14}/> {selectedMemo.genre}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter">{selectedMemo.title}</h2>
                <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase bg-slate-50 p-3 rounded-xl border">
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500"/> {selectedMemo.site}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500"/> {selectedMemo.date}</span>
                </div>
                
                {selectedMemo.materials && selectedMemo.materials.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedMemo.materials.map((mat, i) => {
                      const tagConf = userSettings.tags[mat] || { colorId: 'gray', icon: 'Tag' };
                      const tColor = ColorMap[tagConf.colorId];
                      return (
                        <span key={i} className={`${tColor.light} ${tColor.text} ${tColor.border} border px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm`}>
                          <DynamicIcon name={tagConf.icon} size={12}/> {mat}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* 複数画像表示 */}
              {(selectedMemo.images && selectedMemo.images.length > 0) || selectedMemo.markupImage ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 flex items-center gap-1"><Camera size={14}/> 現場写真</h3>
                  <div className="flex flex-col gap-4">
                    {selectedMemo.markupImage && (!selectedMemo.images || selectedMemo.images.length===0) && (
                      <div className="bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 shadow-inner"><img src={selectedMemo.markupImage} className="w-full" /></div>
                    )}
                    {selectedMemo.images && selectedMemo.images.map((img, i) => (
                      <div key={i} className="bg-slate-100 rounded-[2.5rem] overflow-hidden border-2 shadow-inner relative">
                        <img src={img} className="w-full h-auto object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="bg-blue-50/50 p-8 rounded-[3rem] text-slate-700 font-bold border-2 border-blue-100 leading-relaxed relative shadow-sm whitespace-pre-wrap">
                <span className="absolute -top-3 left-10 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] not-italic shadow-md tracking-widest font-black uppercase">Memo</span>
                {selectedMemo.content}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- ビュー: フォーム (追加/編集) --- */}
      {(view === 'add' || view === 'edit') && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto pb-32 animate-in slide-in-from-bottom-10">
          <header className="bg-white border-b p-5 flex justify-between items-center sticky top-0 shadow-sm z-10">
            <button onClick={() => setView('list')}><X size={24}/></button>
            <h2 className="font-black text-slate-800 tracking-tighter italic">Vault Archiving...</h2>
            <button onClick={handleSave} className="bg-blue-600 text-white px-7 py-2 rounded-full font-black text-xs uppercase shadow-lg disabled:opacity-50 active:scale-95 transition-all">Secure Save</button>
          </header>
          
          <div className="p-6 space-y-7 max-w-xl mx-auto">
            <div className="space-y-4">
              <input className="w-full text-2xl font-black bg-transparent border-b-2 border-slate-200 py-2 focus:border-blue-600 outline-none transition-colors placeholder:text-slate-300" placeholder="作業の要点・タイトル" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-3 bg-white border border-slate-200 rounded-2xl font-bold outline-none text-sm text-slate-700" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <select className="p-3 bg-white border border-slate-200 rounded-2xl font-bold outline-none text-sm text-slate-700" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  {Object.keys(userSettings.genres).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 text-slate-400" size={16}/>
                <input className="w-full p-3 pl-10 bg-white border border-slate-200 rounded-2xl font-bold outline-none text-sm text-slate-700 focus:border-blue-500" placeholder="現場名・案件名" value={formData.site} onChange={e => setFormData({...formData, site: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 flex items-center gap-1"><Tags size={12}/> 使用材料・タグ (複数選択可)</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(userSettings.tags).map(mat => {
                  const isSelected = (formData.materials || []).includes(mat);
                  const conf = userSettings.tags[mat];
                  const colors = ColorMap[conf.colorId];
                  return (
                    <button key={mat} type="button" onClick={() => {
                        const mats = formData.materials || [];
                        if (isSelected) setFormData({...formData, materials: mats.filter(m => m !== mat)});
                        else setFormData({...formData, materials: [...mats, mat]});
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                        isSelected ? `${colors.bg} text-white border-transparent` : `bg-white ${colors.text} border-slate-200 hover:bg-slate-50`
                      }`}
                    >
                      <DynamicIcon name={conf.icon} size={12} /> {mat}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-3 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center text-[10px] font-black text-slate-400 mb-2">
                <span className="flex items-center gap-1"><Camera size={14}/> 現場写真 (タップで赤入れ)</span>
                <label className="text-blue-500 bg-blue-50 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer active:scale-95">
                  <Upload size={14}/> 追加
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {!formData.images || formData.images.length === 0 ? (
                  <div className="w-full flex-shrink-0 h-32 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center text-slate-400 font-bold text-xs">
                    <ImageIcon size={24} className="mb-2 opacity-50"/> 写真はありません
                  </div>
                ) : (
                  formData.images.map((img, i) => (
                    <div key={i} className="relative w-48 flex-shrink-0 snap-center group">
                      <img src={img} className="w-full h-32 object-cover rounded-[1.5rem] border shadow-sm cursor-pointer" onClick={() => setMarkupModal({ isOpen: true, imgIndex: i, dataUrl: img })} />
                      <button type="button" onClick={() => {
                        const newImgs = [...formData.images]; newImgs.splice(i, 1);
                        setFormData({...formData, images: newImgs});
                      }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md"><X size={14}/></button>
                      <div className="absolute bottom-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-full pointer-events-none"><Edit3 size={12}/></div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="space-y-3 bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-50">
                {userSettings.quickPhrases.map(p => <button key={p} type="button" onClick={() => setFormData({...formData, content: formData.content + (formData.content?'\n':'') + p})} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] border font-black transition-colors">+ {p}</button>)}
              </div>
              <textarea className="w-full h-40 pt-2 bg-transparent outline-none text-sm font-medium leading-relaxed resize-none text-slate-700 placeholder:text-slate-300" placeholder="具体的な注意点、配線の色、次回への引き継ぎ事項などを記録..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            
            {view === 'edit' && <button type="button" onClick={() => handleDelete(selectedMemo.id)} className="w-full py-5 text-red-500 font-black text-xs border-2 border-red-100 border-dashed rounded-[2.5rem] uppercase tracking-widest hover:bg-red-50 transition-all mt-8">Erase From Vault</button>}
          </div>
        </div>
      )}

      {/* --- ボトムナビゲーション --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-2xl border border-slate-700 rounded-full p-2 flex items-center shadow-2xl z-40 w-max gap-2">
        <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          <ClipboardList size={20} strokeWidth={view === 'list' ? 2.5 : 2} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'list' ? 'block' : 'hidden'}`}>Vaults</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
          <Settings size={20} strokeWidth={view === 'settings' ? 2.5 : 2} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'settings' ? 'block' : 'hidden'}`}>Master</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
