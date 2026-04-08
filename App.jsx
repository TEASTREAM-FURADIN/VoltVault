import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Calendar, MapPin, Search, ChevronLeft, ClipboardList, HardHat, 
  Image as ImageIcon, Save, X, Edit3, Trash2, Check, 
  ChevronRight, Settings, AlertCircle, 
  Type, Cloud, Loader2, Camera, Upload, Folder,
  Tags, ListFilter, Archive, BookMarked, ScrollText, // 追加
  Zap, Plug, Cable, Power, Lightbulb, Wrench, Hammer, 
  CheckCircle, Info, Building, Truck, Grid,
  Shield, Flame, Droplets, Wind, Thermometer, Scissors, Battery,
  FileText, PenTool, Ruler, Compass, Home, Activity, Radio, Wifi,
  Phone, Car, Clock, Lock, Unlock, Sun, Moon, ChevronDown,
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
    'スリーブ': { colorId: 'orange', icon: 'Target' }
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

  // --- iPhoneホーム画面用 アプリアイコン自動生成魔法 ---
  useEffect(() => {
    const setAppIcon = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // 背景色 (極秘ファイル感のある濃紺)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 256);
      
      // 内側の枠線 (金色)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, 224, 224);

      // 上部にイナズママーク
      ctx.fillStyle = '#eab308';
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 128, 90);
      
      // 中央から下部に「極」の文字
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 90px "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif';
      ctx.fillText('極', 128, 170);

      const dataUrl = canvas.toDataURL();
      
      // スマホ（Apple系）のホーム画面用アイコンに設定
      let appleLink = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = dataUrl;

      // ブラウザのタブ用ファビコンにも設定
      let iconLink = document.querySelector("link[rel~='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = dataUrl;
    };
    setAppIcon();
  }, []);

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
            {/* アプリ内ロゴを極意書風に変更 */}
            <div className="bg-slate-800 p-2.5 rounded-2xl -rotate-3 shadow-lg border-2 border-yellow-500 relative">
              <BookMarked className="text-yellow-400" size={24}/>
              <Zap className="text-white absolute -top-1.5 -right-2 fill-white" size={14}/>
            </div>
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
