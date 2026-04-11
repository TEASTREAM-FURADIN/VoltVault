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
  Snowflake, Paintbrush, Link, Milestone, Layers,
  Gamepad2, Sword, Crown, Trophy, Target, Dumbbell, Book, Star, Sparkles, Medal, Award,
  Move, ZoomIn, ZoomOut, RotateCcw,
  User, Bell, ChevronUp, CheckSquare, ArrowUp, ArrowDown,
  Coffee
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

// ★ 社長のメイン装備「クリッパー（ワイヤーカッター）」の特製アイコン
const ClipperIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* 右持ち手 */}
    <path d="M14.5 9.5L21 18.5a2 2 0 0 1-2.8 2.8L9.5 14.5" />
    {/* 左持ち手 */}
    <path d="M9.5 9.5L3 18.5a2 2 0 0 0 2.8 2.8L14.5 14.5" />
    {/* 支点 */}
    <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
    {/* 刃先（ツノダ風の丸いくぼみ） */}
    <path d="M9.5 9.5C8 8 7 6 7 6C7 6 9 5 11 7L12 8" />
    <path d="M14.5 9.5C16 8 17 6 17 6C17 6 15 5 13 7L12 8" />
    {/* スパークエフェクト */}
    <path d="M12 2L11 4H13L12 6" stroke="#06b6d4" strokeWidth="1.5"/>
  </svg>
);

// ★ 追加：取っ手のないお茶（湯呑み・グラス）の特製アイコン
const TeaCupIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* コップ本体 */}
    <path d="M6 8v5a6 6 0 0 0 12 0V8" />
    {/* フチ */}
    <line x1="5" y1="8" x2="19" y2="8" />
    {/* 湯気 */}
    <path d="M10 3s1 1.5 1 2.5-1 1.5-1 2.5" />
    <path d="M14 3s-1 1.5-1 2.5 1 1.5 1 2.5" />
  </svg>
);

const IconMap = {
  Zap, Plug, Cable, Power, Lightbulb, Wrench, Hammer, HardHat, AlertCircle, CheckCircle, Info, Tags, Folder, MapPin, Building, Truck, Grid, ListFilter,
  Shield, Flame, Droplets, Wind, Thermometer, Scissors, Battery, FileText, PenTool, Ruler, Compass, Home, Activity, Radio, Wifi, Phone, Car, Clock, Lock, Unlock, Sun, Moon,
  Snowflake, Paintbrush, Link, Milestone, Layers,
  Gamepad2, Sword, Crown, Trophy, Target, Dumbbell, Book, Star, Sparkles, Medal, Award
};

const IconNames = {
  Zap: '強電・雷', Plug: 'コンセント', Cable: '配線', Power: '動力・電源', Lightbulb: '照明', Wrench: 'レンチ', Hammer: 'ハンマー', HardHat: 'ヘルメット', AlertCircle: '注意・警告', CheckCircle: '確認・完了', Info: '情報', Tags: 'タグ', Folder: 'フォルダ', MapPin: '現場・場所', Building: 'ビル・施設', Truck: 'トラック・搬入', Grid: '盤・ラック', ListFilter: 'フィルター',
  Shield: '保安・防御', Flame: '火気・熱', Droplets: '水回り・配管', Wind: '換気・ダクト', Thermometer: '温度・測定', Scissors: '切断・加工', Battery: 'バッテリー', FileText: '図面・書類', PenTool: 'ペン・記録', Ruler: '寸法・測定', Compass: '方位', Home: '住宅・戸建', Activity: '波形・測定器', Radio: 'アンテナ・無線', Wifi: '通信・Wi-Fi', Phone: '電話・連絡', Car: '車両・移動', Clock: '時間・期限', Lock: '施錠・セキュリティ', Unlock: '解錠', Sun: '太陽光・昼', Moon: '夜間作業',
  Snowflake: '空調・エアコン', Paintbrush: '塗装・補修', Link: '他職連携', Milestone: '工程・段取り', Layers: '内装・軽天',
  Gamepad2: 'ゲーム', Sword: '剣（攻撃）', Crown: '王冠（最高）', Trophy: 'トロフィー', Target: 'ダーツ・目標', Dumbbell: '筋トレ', Book: '読書・学習', Star: '星（重要）', Sparkles: 'キラキラ', Medal: 'メダル', Award: 'アワード'
};

const IconCategories = [
  { name: '電気・設備', icons: ['Zap', 'Plug', 'Cable', 'Power', 'Lightbulb', 'Grid'] },
  { name: '他職・建築', icons: ['Shield', 'Flame', 'Droplets', 'Wind', 'Building', 'Home', 'Snowflake', 'Paintbrush', 'Layers'] },
  { name: '工具・測定', icons: ['Wrench', 'Hammer', 'HardHat', 'Thermometer', 'Scissors', 'Ruler', 'Compass', 'Activity'] },
  { name: '工程・打合せ', icons: ['FileText', 'PenTool', 'Phone', 'Clock', 'Link', 'Milestone', 'Tags', 'Folder', 'ListFilter'] },
  { name: '状態・情報', icons: ['AlertCircle', 'CheckCircle', 'Info', 'MapPin', 'Truck', 'Battery', 'Radio', 'Wifi', 'Car', 'Lock', 'Unlock', 'Sun', 'Moon'] },
  { name: '趣味・ゲーム', icons: ['Gamepad2', 'Sword', 'Crown', 'Trophy', 'Target', 'Dumbbell', 'Book', 'Star', 'Sparkles', 'Medal', 'Award'] }
];

// ★ ダーク/ネオンテーマ用のカラーマップ
const ColorMap = {
  red: { bg: 'bg-red-500', text: 'text-red-400', light: 'bg-red-950/50', border: 'border-red-500/50' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-400', light: 'bg-blue-950/50', border: 'border-blue-500/50' },
  green: { bg: 'bg-green-500', text: 'text-green-400', light: 'bg-green-950/50', border: 'border-green-500/50' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-400', light: 'bg-yellow-950/50', border: 'border-yellow-500/50' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-400', light: 'bg-orange-950/50', border: 'border-orange-500/50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-400', light: 'bg-purple-950/50', border: 'border-purple-500/50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-400', light: 'bg-pink-950/50', border: 'border-pink-500/50' },
  teal: { bg: 'bg-cyan-500', text: 'text-cyan-400', light: 'bg-cyan-950/50', border: 'border-cyan-500/50' },
  gray: { bg: 'bg-slate-500', text: 'text-slate-300', light: 'bg-slate-800/50', border: 'border-slate-500/50' },
};

const ColorNames = {
  red: 'レッド', blue: 'ブルー', green: 'グリーン', yellow: 'イエロー', orange: 'オレンジ', purple: 'パープル', pink: 'ピンク', teal: 'シアン', gray: 'スチール'
};

const MainCategories = [
  '電気', '弱電', '設備', '内装', '建築', '事務', '工程', '知識技術', '趣味', 'その他'
];

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
    "通電確認OK", "絶縁抵抗計 測定済", "相色確認OK", "隠蔽部写真撮影済", "先行配管完了"
  ],
  genres: {
    '幹線工事': { colorId: 'red', icon: 'Zap', group: '電気', order: 0 },
    '盤結線': { colorId: 'blue', icon: 'Grid', group: '電気', order: 1 },
    '弱電配線': { colorId: 'green', icon: 'Cable', group: '弱電', order: 2 },
    '空調関係': { colorId: 'teal', icon: 'Snowflake', group: '設備', order: 3 },
    '安全書類': { colorId: 'gray', icon: 'FileText', group: '事務', order: 4 },
    '他職取り合い': { colorId: 'purple', icon: 'Link', group: '建築', order: 5 },
    '筋トレ記録': { colorId: 'orange', icon: 'Dumbbell', group: '趣味', order: 6 }
  },
  tags: {
    'VVFケーブル': { colorId: 'gray', icon: 'Cable', group: '電気', order: 0 },
    '照明器具': { colorId: 'yellow', icon: 'Lightbulb', group: '電気', order: 1 },
    '分電盤': { colorId: 'blue', icon: 'Grid', group: '電気', order: 2 },
    '重要目標': { colorId: 'red', icon: 'Target', group: 'その他', order: 3 }
  },
  stats: {
    exp: 0, level: 1, totalMemos: 0
  }
};

const getTitle = (level) => {
  if (level >= 99) return "伝説の電設王 (Legend)";
  if (level >= 50) return "無双の親方 (Master)";
  if (level >= 20) return "熟練の職人 (Expert)";
  if (level >= 10) return "一人前の職人 (Journeyman)";
  if (level >= 5) return "若手エース (Ace)";
  return "新米職人 (Novice)";
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
  
  const [sortOrder, setSortOrder] = useState('newest'); 
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterPending, setFilterPending] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  const [memos, setMemos] = useState([]);
  const [userSettings, setUserSettings] = useState(defaultSettings);
  const [levelUpData, setLevelUpData] = useState(null);

  const uniqueSites = [...new Set(memos.map(m => String(m.site || "")).filter(Boolean))];
  const uniqueTitles = [...new Set(memos.map(m => {
    const title = String(m.title || "");
    return title.replace(/\s+\d+$/, ""); 
  }).filter(Boolean))];

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) { setError("SYSTEM ERROR."); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);
    setError(null); 
    
    const memosCol = collection(db, 'artifacts', currentAppId, 'public', 'data', 'memos');
    const unsubscribeMemos = onSnapshot(memosCol, 
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMemos(data.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
        setIsSyncing(false);
      },
      (err) => { setError("SYNC FAILED. 通信環境を確認してください。"); setIsSyncing(false); }
    );
    
    const settingsDoc = doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user');
    const unsubscribeSettings = onSnapshot(settingsDoc, (d) => {
      if (d.exists()) {
        const data = d.data();
        let genresData = data.genres || defaultSettings.genres;
        let tagsData = data.tags || defaultSettings.tags;
        
        Object.keys(genresData).forEach((k, i) => {
          if (!genresData[k].group || !MainCategories.includes(genresData[k].group)) genresData[k].group = 'その他';
          if (typeof genresData[k].order !== 'number') genresData[k].order = i;
        });
        Object.keys(tagsData).forEach((k, i) => {
          if (!tagsData[k].group || !MainCategories.includes(tagsData[k].group)) tagsData[k].group = 'その他';
          if (typeof tagsData[k].order !== 'number') tagsData[k].order = i;
        });

        setUserSettings({
          quickPhrases: data.quickPhrases || defaultSettings.quickPhrases,
          genres: genresData,
          tags: tagsData,
          stats: data.stats || defaultSettings.stats
        });
      }
    });

    return () => { unsubscribeMemos(); unsubscribeSettings(); };
  }, [user]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const initialForm = { 
    title: '', site: '', genre: '', materials: [], content: '', date: new Date().toISOString().split('T')[0], images: [],
    teacher: '', needsReview: false, reviewDate: '', isReviewed: false
  };
  const [formData, setFormData] = useState(initialForm);

  const [showNewGenre, setShowNewGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreGroup, setNewGenreGroup] = useState(MainCategories[0]);
  
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagGroup, setNewTagGroup] = useState(MainCategories[0]);

  useEffect(() => {
    if (view === 'add' && !formData.genre && Object.keys(userSettings.genres).length > 0) {
      setFormData(prev => ({ ...prev, genre: Object.keys(userSettings.genres)[0] }));
    }
  }, [view, userSettings]);

  const escapeRegExp = (string) => String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const handleSave = async () => {
    if (!formData.title || !user) return;
    setIsSyncing(true);
    try {
      const isNew = view !== 'edit';
      const id = isNew ? `memo_${Date.now()}` : editingMemo.id;
      
      let finalTitle = String(formData.title).trim();
      if (isNew) {
        const siteMemos = memos.filter(m => String(m.site || "") === String(formData.site || ""));
        const baseTitle = finalTitle;
        const regex = new RegExp(`^${escapeRegExp(baseTitle)}(?:\\s+(\\d+))?$`);
        let maxNum = 0;
        let hasBase = false;

        siteMemos.forEach(m => {
          const match = String(m.title || "").match(regex);
          if (match) {
            hasBase = true;
            if (match[1]) {
              const num = parseInt(match[1], 10);
              if (num > maxNum) maxNum = num;
            } else {
              if (maxNum < 1) maxNum = 1;
            }
          }
        });

        if (hasBase) {
          finalTitle = `${baseTitle} ${maxNum + 1}`;
        }
      }

      const dataToSave = { ...formData, title: finalTitle, id };
      await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id), dataToSave, { merge: true });
      
      if (isNew) {
        const currentStats = userSettings.stats || defaultSettings.stats;
        const newExp = currentStats.exp + 25;
        const newLevel = Math.floor(newExp / 100) + 1;
        
        if (newLevel > currentStats.level) {
          setLevelUpData({ level: newLevel, title: getTitle(newLevel) });
          setTimeout(() => setLevelUpData(null), 4000); 
        }

        const newSettings = {
          ...userSettings,
          stats: { exp: newExp, level: newLevel, totalMemos: currentStats.totalMemos + 1 }
        };
        await saveSettings(newSettings);
      }

      setView('list');
      setFormData(initialForm);
      setShowAdvanced(false); 
      setShowNewGenre(false);
      setShowNewTag(false);
    } catch (e) { alert("OVERLOAD: 画像サイズが大きすぎる可能性があります。"); } 
    finally { setIsSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!user || !window.confirm("WARNING: この極意データを完全に消去しますか？")) return;
    setIsSyncing(true);
    try { await deleteDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id)); setView('list'); } 
    catch (e) { alert("DELETE FAILED."); } finally { setIsSyncing(false); }
  };

  const saveSettings = async (newSettings) => {
    setUserSettings(newSettings);
    await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user'), newSettings);
  };

  const filteredMemos = memos.filter(m => {
    const matchSearch = String(m.title || "").includes(searchTerm) || String(m.site || "").includes(searchTerm) || (m.materials || []).some(mat => String(mat).includes(searchTerm)) || String(m.teacher || "").includes(searchTerm);
    const matchStart = dateRange.start ? (m.date || "") >= dateRange.start : true;
    const matchEnd = dateRange.end ? (m.date || "") <= dateRange.end : true;
    const matchPending = filterPending ? (m.needsReview && !m.isReviewed) : true;
    return matchSearch && matchStart && matchEnd && matchPending;
  }).sort((a, b) => {
    const aTime = parseInt(String(a.id).split('_')[1]) || 0;
    const bTime = parseInt(String(b.id).split('_')[1]) || 0;
    
    if (sortOrder === 'newest') {
      return b.date !== a.date ? String(b.date || "").localeCompare(String(a.date || "")) : bTime - aTime;
    } else {
      return a.date !== b.date ? String(a.date || "").localeCompare(String(b.date || "")) : aTime - bTime;
    }
  });

  const groupedMemos = filteredMemos.reduce((acc, memo) => {
    if (listMode === 'all') return acc;
    if (listMode === 'site') {
      const key = String(memo.site || 'NO SITE DATA');
      if (!acc[key]) acc[key] = [];
      acc[key].push(memo);
    } else if (listMode === 'genre') {
      const key = String(memo.genre || 'UNCLASSIFIED');
      if (!acc[key]) acc[key] = [];
      acc[key].push(memo);
    } else if (listMode === 'material') {
      if (!memo.materials || memo.materials.length === 0) {
        const key = 'NO TAGS';
        if (!acc[key]) acc[key] = [];
        acc[key].push(memo);
      } else {
        memo.materials.forEach(mat => {
          const key = String(mat);
          if (!acc[key]) acc[key] = [];
          acc[key].push(memo);
        });
      }
    }
    return acc;
  }, {});

  const LevelUpModal = () => {
    if (!levelUpData) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-slate-900 px-10 py-12 rounded-[2.4rem] text-center flex flex-col items-center border-2 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 to-transparent opacity-50"></div>
          <Zap size={64} className="text-yellow-400 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] relative z-10" fill="currentColor" />
          <h2 className="text-3xl font-black text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] tracking-widest relative z-10">SYSTEM UPGRADE</h2>
          <p className="text-5xl font-black text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] relative z-10">Lv.{levelUpData.level}</p>
          <p className="text-sm font-bold text-slate-400 relative z-10">新規ライセンスをアンロック</p>
          <p className="text-xl font-black text-slate-900 mt-3 bg-yellow-400 px-5 py-2.5 rounded-xl border border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.6)] relative z-10">
            {levelUpData.title}
          </p>
        </div>
      </div>
    );
  };

  const [markupModal, setMarkupModal] = useState({ isOpen: false, imgIndex: null, dataUrl: null });
  
  const MarkupModalCanvas = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState('draw'); 
    const [zoom, setZoom] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    const [penColor, setPenColor] = useState('#ef4444'); 
    const PEN_COLORS = [
      { id: 'red', value: '#ef4444', tw: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' },
      { id: 'cyan', value: '#22d3ee', tw: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' },
      { id: 'yellow', value: '#facc15', tw: 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' },
      { id: 'green', value: '#4ade80', tw: 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]' }
    ];

    useEffect(() => {
      if (!markupModal.dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const screenW = Math.min(window.innerWidth - 48, 800); 
        const scale = screenW / img.width;
        setDimensions({ width: screenW, height: img.height * scale });
      };
      img.src = markupModal.dataUrl;
    }, [markupModal.dataUrl]);

    const drawInitialImage = () => {
      if (!dimensions.width || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = penColor; 
        ctx.lineWidth = 4 / zoom; 
        ctx.lineJoin = 'round'; 
        ctx.lineCap = 'round';
      };
      img.src = markupModal.dataUrl;
    };

    useEffect(() => { drawInitialImage(); }, [dimensions]);

    useEffect(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = 4 / zoom;
        ctx.strokeStyle = penColor;
      }
    }, [zoom, penColor]);

    const getPos = (e) => {
      const r = canvasRef.current.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const scaleX = canvasRef.current.width / r.width;
      const scaleY = canvasRef.current.height / r.height;
      return { x: (clientX - r.left) * scaleX, y: (clientY - r.top) * scaleY };
    };

    const startDrawing = (e) => { 
      if (mode !== 'draw') return;
      setIsDrawing(true); 
      const p = getPos(e); 
      const ctx = canvasRef.current.getContext('2d'); 
      ctx.beginPath(); 
      ctx.moveTo(p.x, p.y); 
    };
    const draw = (e) => { 
      if (!isDrawing || mode !== 'draw') return; 
      e.preventDefault(); 
      const p = getPos(e); 
      const ctx = canvasRef.current.getContext('2d'); 
      ctx.lineTo(p.x, p.y); 
      ctx.stroke(); 
    };
    const stopDrawing = () => { setIsDrawing(false); };

    const handleSaveImage = () => {
      const newDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
      const newImages = [...formData.images];
      newImages[markupModal.imgIndex] = newDataUrl;
      setFormData({...formData, images: newImages});
      setMarkupModal({ isOpen: false, imgIndex: null, dataUrl: null });
    };

    return (
      <div className="fixed inset-0 bg-slate-950/95 z-[60] flex flex-col items-center justify-center p-2 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-lg bg-slate-900 rounded-[2rem] p-3 flex flex-col gap-3 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-900/50 h-[90vh]">
          <div className="flex justify-between items-center px-2 pt-1">
            <h3 className="font-black text-cyan-400 flex items-center gap-2 tracking-widest"><Edit3 size={18}/> MARKUP TERMINAL</h3>
            <button onClick={() => setMarkupModal({ isOpen: false })} className="text-slate-500 hover:text-cyan-400"><X size={28}/></button>
          </div>

          <div className="flex flex-col gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg shadow-inner border border-slate-700">
                <button onClick={() => setMode('draw')} className={`p-1.5 rounded-md transition-colors ${mode === 'draw' ? 'bg-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'text-slate-500 hover:text-cyan-400'}`}>
                  <PenTool size={16}/>
                </button>
                <div className="w-px h-5 bg-slate-700 mx-0.5"></div>
                {PEN_COLORS.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { setPenColor(c.value); setMode('draw'); }} 
                    className={`w-5 h-5 rounded-full ${c.tw} transition-all border-2 ${penColor === c.value ? 'border-white scale-110' : 'border-transparent scale-90 opacity-50 hover:opacity-100'}`}
                  />
                ))}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setMode('move')} className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${mode === 'move' ? 'bg-slate-900 shadow-inner text-cyan-400 border border-cyan-900' : 'text-slate-400 hover:bg-slate-700'}`}>
                  <Move size={14}/> 移動
                </button>
                <button onClick={drawInitialImage} className="p-1.5 text-slate-400 bg-slate-900 rounded-lg shadow-inner active:scale-95 hover:text-red-400 border border-slate-700"><RotateCcw size={16}/></button>
              </div>
            </div>
            
            <div className="flex gap-2 items-center justify-center bg-slate-900 py-1 rounded-lg border border-slate-700 mx-2 shadow-inner">
              <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-1 text-slate-400 active:scale-95 hover:text-cyan-400"><ZoomOut size={16}/></button>
              <span className="text-[10px] font-black w-10 text-center text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="p-1 text-slate-400 active:scale-95 hover:text-cyan-400"><ZoomIn size={16}/></button>
            </div>
          </div>

          <div ref={containerRef} className={`flex-1 overflow-auto rounded-xl border-2 border-slate-700 bg-slate-950 shadow-inner relative touch-pan-x touch-pan-y ${mode === 'draw' ? 'touch-none' : ''}`}>
            {dimensions.width > 0 && (
              <div style={{ width: dimensions.width * zoom, height: dimensions.height * zoom, position: 'relative' }}>
                <canvas
                  ref={canvasRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    touchAction: mode === 'draw' ? 'none' : 'auto'
                  }}
                  className={`absolute top-0 left-0 shadow-lg ${mode === 'draw' ? 'cursor-crosshair' : 'cursor-grab'}`}
                  onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                />
              </div>
            )}
            {!dimensions.width && <div className="absolute inset-0 flex items-center justify-center text-cyan-500"><Loader2 size={24} className="animate-spin"/></div>}
          </div>

          <button onClick={handleSaveImage} className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-[0.98] transition-all">
            編集を確定する
          </button>
        </div>
      </div>
    );
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const processFile = (file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            // ★変更：1MBの制限対策として、最大幅を 1000 から 600 に縮小
            const MAX_WIDTH = 600; 
            const scale = Math.min(MAX_WIDTH / img.width, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // ★変更：品質を 0.6 から 0.4 に変更
            resolve(canvas.toDataURL('image/jpeg', 0.4));
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    };

    const newImageUrls = await Promise.all(files.map(processFile));
    setFormData(prev => ({...prev, images: [...prev.images, ...newImageUrls]}));
    e.target.value = null; 
  };

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
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-800 transition-colors text-slate-200">
          <span className="flex items-center gap-2"><span className={`w-3.5 h-3.5 rounded-full ${ColorMap[value].bg} shadow-[0_0_5px_currentColor]`}></span>{ColorNames[value]}</span>
          <ChevronDown size={14} className="text-slate-500"/>
        </button>
        {isOpen && (
          <div className="absolute z-50 bottom-full left-0 mb-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] py-1 max-h-48 overflow-y-auto">
            {Object.keys(ColorMap).map(c => (
              <button key={c} type="button" onClick={() => { onChange(c); setIsOpen(false); }} className={`w-full flex items-center gap-2 px-3 py-2.5 text-[10px] font-bold text-left transition-colors hover:bg-slate-700 ${value === c ? 'bg-slate-900 text-cyan-400' : 'text-slate-300'}`}>
                <span className={`w-3.5 h-3.5 rounded-full ${ColorMap[c].bg} shadow-[0_0_5px_currentColor]`}></span>{ColorNames[c]}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const IconSelector = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(IconCategories[0].name);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const activeIcons = IconCategories.find(c => c.name === activeCategory)?.icons || [];

    return (
      <div className="relative flex-1" ref={dropdownRef}>
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-800 transition-colors text-slate-200">
          <span className="flex items-center gap-2"><DynamicIcon name={value} size={16} className="text-cyan-400"/> <span className="truncate">{IconNames[value] || value}</span></span>
          <ChevronDown size={14} className="text-slate-500"/>
        </button>
        {isOpen && (
          <div className="absolute z-50 bottom-full right-0 mb-1 w-[300px] sm:w-[320px] bg-slate-800 border border-slate-700 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-2 flex flex-col gap-2">
            <div className="flex overflow-x-auto gap-1 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
              {IconCategories.map(cat => (
                <button 
                  key={cat.name} 
                  type="button" 
                  onClick={() => setActiveCategory(cat.name)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors snap-start ${activeCategory === cat.name ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-1 pr-1">
              {activeIcons.map(iconName => (
                <button key={iconName} type="button" onClick={() => { onChange(iconName); setIsOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold text-left transition-colors ${value === iconName ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-700 text-slate-300 border border-transparent'}`}>
                  <DynamicIcon name={iconName} size={14} className={value === iconName ? 'text-cyan-400' : 'text-slate-500'} /> 
                  <span className="truncate">{IconNames[iconName]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const EditorSection = ({ title, icon: Icon, items, onAdd, onDelete, onMoveUp, onMoveDown, placeholder }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [iconName, setIconName] = useState('Info');
    const [group, setGroup] = useState(MainCategories[0]); 

    const sortedItems = Object.entries(items)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => a.order - b.order);

    return (
      <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="text-sm font-black text-cyan-400 border-b border-slate-700 pb-2 flex items-center gap-2 tracking-widest"><Icon size={16}/> {title}</h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
          {sortedItems.map((item, idx) => {
            const colors = ColorMap[item.colorId] || ColorMap.gray;
            return (
              <div key={item.key} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-2xl border border-slate-700 shadow-inner">
                <div className="flex flex-col gap-1 items-start">
                  <span className="text-[8px] font-black text-cyan-600 uppercase tracking-wider bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900">{item.group}</span>
                  <span className={`${colors.light} ${colors.text} ${colors.border} border text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-max shadow-[0_0_8px_rgba(0,0,0,0.5)]`}>
                    <DynamicIcon name={item.icon} size={14} /> {item.key}
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  <button onClick={() => onMoveUp(item.key)} disabled={idx === 0} className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 active:scale-90"><ArrowUp size={16}/></button>
                  <button onClick={() => onMoveDown(item.key)} disabled={idx === sortedItems.length - 1} className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 active:scale-90"><ArrowDown size={16}/></button>
                  <div className="w-px h-6 bg-slate-700 mx-1"></div>
                  <button onClick={() => { if(window.confirm(`WARNING: 「${item.key}」を削除しますか？`)) onDelete(item.key); }} className="p-2 text-slate-500 hover:text-red-500 active:scale-90"><Trash2 size={16}/></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 space-y-3 shadow-inner">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <select value={group} onChange={e=>setGroup(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none">
                {MainCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none"/>
            </div>
            <input type="text" placeholder={placeholder} value={name} onChange={e=>setName(e.target.value)} className="flex-[2] bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-sm font-bold text-cyan-50 outline-none placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
          </div>
          <div className="flex gap-2 relative">
            <ColorSelector value={color} onChange={setColor} />
            <IconSelector value={iconName} onChange={setIconName} />
          </div>
          <button onClick={() => { if(name.trim()){ onAdd(name.trim(), color, iconName, group); setName(''); } }} className="w-full mt-2 bg-slate-800 border border-cyan-500/50 text-cyan-400 px-4 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)] active:scale-[0.98] hover:bg-slate-700 transition-all flex justify-center items-center gap-2">
            <ClipperIcon size={14}/> 装備に追加
          </button>
        </div>
      </div>
    );
  };

  const handleMoveItem = (type, key, direction) => {
    const items = userSettings[type]; 
    const arr = Object.entries(items)
      .map(([k, v]) => ({ key: k, ...v }))
      .sort((a, b) => a.order - b.order);
      
    const index = arr.findIndex(item => item.key === key);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const temp = arr[index].order;
      arr[index].order = arr[index - 1].order;
      arr[index - 1].order = temp;
    } else if (direction === 'down' && index < arr.length - 1) {
      const temp = arr[index].order;
      arr[index].order = arr[index + 1].order;
      arr[index + 1].order = temp;
    } else {
      return; 
    }
    
    const newItems = {};
    arr.forEach(item => {
      const { key, ...rest } = item;
      newItems[key] = rest;
    });
    
    saveSettings({ ...userSettings, [type]: newItems });
  };

  const handleAddItem = (type, name, colorId, icon, group) => {
    const items = userSettings[type] || {};
    const maxOrder = Math.max(...Object.values(items).map(i => i.order || 0), -1);
    const newItem = { colorId, icon, group, order: maxOrder + 1 };
    saveSettings({ ...userSettings, [type]: { ...items, [name]: newItem } });
  };

  const TagAccordion = ({ groupName, tags, formData, setFormData }) => {
    const hasSelected = tags.some(t => (formData.materials || []).includes(t.key));
    const [isOpen, setIsOpen] = useState(hasSelected || true); 

    return (
      <div className="border border-slate-700 rounded-2xl overflow-hidden mb-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-3 flex justify-between items-center text-xs font-black text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors">
          <span className="flex items-center gap-1.5"><Folder size={14} className="text-cyan-500"/> {groupName} <span className="text-[9px] text-cyan-600 font-bold ml-1 bg-cyan-950/50 px-1.5 rounded-full border border-cyan-900">全 {tags.length} 種</span></span>
          {isOpen ? <ChevronUp size={16} className="text-cyan-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
        </button>
        {isOpen && (
          <div className="p-3 flex flex-wrap gap-2 bg-slate-900 border-t border-slate-700">
            {tags.map(t => {
              const isSelected = (formData.materials || []).includes(t.key);
              const colors = ColorMap[t.colorId];
              return (
                <button key={t.key} type="button" onClick={() => {
                    const mats = formData.materials || [];
                    if (isSelected) setFormData({...formData, materials: mats.filter(m => m !== t.key)});
                    else setFormData({...formData, materials: [...mats, t.key]});
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
                    isSelected ? `${colors.bg} text-slate-900 border-transparent shadow-[0_0_10px_${colors.bg}]` : `bg-slate-800 ${colors.text} border-slate-600 hover:bg-slate-700 hover:border-slate-500`
                  }`}
                >
                  <DynamicIcon name={t.icon} size={12} /> {t.key}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  };

  const currentExp = userSettings.stats?.exp || 0;
  const currentLevel = userSettings.stats?.level || 1;
  const expPercentage = currentExp % 100;
  const pendingReviews = memos.filter(m => m.needsReview && !m.isReviewed);

  const sortedGenres = Object.entries(userSettings.genres)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => a.order - b.order);

  const groupedGenresForm = MainCategories.map(cat => ({
    category: cat,
    genres: sortedGenres.filter(g => g.group === cat)
  })).filter(g => g.genres.length > 0);

  const sortedTags = Object.entries(userSettings.tags)
    .map(([k, v]) => ({ key: k, ...v }))
    .sort((a, b) => a.order - b.order);

  const groupedTagsForm = MainCategories.map(cat => ({
    category: cat,
    tags: sortedTags.filter(t => t.group === cat)
  })).filter(t => t.tags.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-200 font-sans antialiased selection:bg-cyan-500/30 relative">
      
      {/* ★ 背景のサイバー・グリッドエフェクト */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{
        backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/80 to-slate-950"></div>

      <div className="relative z-10">
        <LevelUpModal />
        {markupModal.isOpen && <MarkupModalCanvas />}
        
        <header className="bg-slate-900 border-b border-cyan-500/30 text-white px-5 py-4 rounded-b-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] sticky top-0 z-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none"><Zap size={150} className="-mt-10 -mr-10 rotate-12 text-cyan-400" /></div>

          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center gap-2">
              {/* ★ ここで `rotate-3` の傾きを削除し、取っ手のない TeaCupIcon を使用しています */}
              <div className="bg-slate-950 px-2.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center gap-1 border border-cyan-500/50">
                <TeaCupIcon className="text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.8)]" size={16} strokeWidth={2.5}/>
                <FileText className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.8)]" size={16} strokeWidth={2.5}/>
                <Zap className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" size={18} fill="currentColor"/>
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)]">苦菩茶の極意</h1>
                <div className="flex items-center gap-1 text-[8px] font-black text-cyan-600 mt-1 uppercase tracking-widest">
                  {isSyncing ? <Loader2 size={8} className="animate-spin" /> : <Cloud size={8} />}
                  {user ? `SYSTEM ONLINE` : "CONNECTING..."}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setView('list'); setFilterPending(!filterPending); }} className={`p-2.5 rounded-xl shadow-lg transition-all relative ${filterPending ? 'bg-red-500 text-slate-900 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-cyan-400 hover:text-white border border-cyan-900'}`}>
                <Bell size={22} />
                {pendingReviews.length > 0 && !filterPending && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-slate-900">
                    {pendingReviews.length}
                  </span>
                )}
              </button>
              <button onClick={() => { setFormData(initialForm); setShowAdvanced(false); setShowNewGenre(false); setShowNewTag(false); setView('add'); }} className="bg-slate-800 text-yellow-400 p-2.5 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-yellow-500/50 active:scale-90 hover:scale-105 transition-all">
                {/* ★ クリッパーのアイコンで「記録を切断（追加）」する演出 */}
                <ClipperIcon size={22} />
              </button>
            </div>
          </div>

          <div className="bg-slate-950/50 rounded-xl p-2 mb-3 backdrop-blur-md border border-cyan-900/50 shadow-inner relative z-10">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-[0_0_5px_rgba(234,179,8,0.3)]"><Trophy size={10}/> Lv.{currentLevel}</span>
                <span className="text-[10px] font-bold text-cyan-50 tracking-wide truncate max-w-[120px]">{getTitle(currentLevel)}</span>
              </div>
              <span className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest">DATA: {userSettings.stats?.totalMemos || 0}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${expPercentage}%` }}>
                <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {view === 'list' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 relative z-10">
              <div className="flex bg-slate-950/50 p-1 rounded-xl backdrop-blur-sm border border-slate-800">
                <button onClick={() => setListMode('all')} className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${listMode === 'all' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>全て</button>
                <button onClick={() => setListMode('site')} className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${listMode === 'site' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>現場別</button>
                <button onClick={() => setListMode('genre')} className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${listMode === 'genre' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>ジャンル</button>
                <button onClick={() => setListMode('material')} className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${listMode === 'material' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>材料別</button>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2 text-cyan-600" size={16} />
                  <input type="text" placeholder="SEARCH DATABANKS..." className="w-full bg-slate-900 rounded-xl py-2 pl-9 text-cyan-50 placeholder-slate-600 outline-none text-xs font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 border border-slate-700 transition-all shadow-inner uppercase tracking-wider" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} className="bg-slate-800 border border-slate-700 px-3 rounded-xl text-[10px] font-black text-cyan-400 hover:bg-slate-700 whitespace-nowrap flex items-center gap-1">
                  {sortOrder === 'newest' ? '▼ 新しい順' : '▲ 古い順'}
                </button>
              </div>

              <div className="flex gap-2 items-center bg-slate-950/50 p-1.5 rounded-xl backdrop-blur-sm border border-slate-800">
                <Calendar size={14} className="text-cyan-600 ml-1 shrink-0" />
                <input type="date" className="bg-transparent text-cyan-100 text-[10px] outline-none font-bold flex-1 w-full" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                <span className="text-cyan-600 text-[10px] font-black shrink-0">〜</span>
                <input type="date" className="bg-transparent text-cyan-100 text-[10px] outline-none font-bold flex-1 w-full" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mt-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <AlertCircle size={12}/> {error}
                </div>
              )}
            </div>
          )}
        </header>

        <main className="p-4 max-w-xl mx-auto">
          
          {view === 'list' && (
            <div className="space-y-4">
              {listMode === 'all' ? (
                <div className="space-y-3">
                  {filteredMemos.length === 0 && !isSyncing && !error && (
                    <div className="text-center py-24 opacity-30">
                      <ClipperIcon size={64} className="mx-auto mb-3 text-cyan-500"/>
                      <p className="text-sm font-black uppercase italic tracking-widest text-cyan-600">NO DATA LOGGED</p>
                    </div>
                  )}
                  {filteredMemos.map(memo => {
                    const genreConfig = userSettings.genres[memo.genre] || { colorId: 'gray', icon: 'Info' };
                    const colors = ColorMap[genreConfig.colorId];
                    return (
                      <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl border border-slate-700 relative overflow-hidden cursor-pointer active:scale-[0.98] hover:border-cyan-500/50 transition-all shadow-lg">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.bg} shadow-[0_0_10px_currentColor]`}></div>
                        <div className="flex justify-between items-start mb-1.5 font-black italic text-slate-500 text-[9px] uppercase pl-1 tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <span className="text-cyan-700">{memo.date}</span>
                            {memo.needsReview && !memo.isReviewed && <span className="bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded text-[8px] border border-red-500/50 flex items-center not-italic gap-0.5 shadow-[0_0_5px_rgba(239,68,68,0.5)]"><Bell size={8}/>要確認</span>}
                            {memo.needsReview && memo.isReviewed && <span className="bg-green-950/80 text-green-400 px-1.5 py-0.5 rounded text-[8px] border border-green-500/50 flex items-center not-italic gap-0.5 shadow-[0_0_5px_rgba(74,222,128,0.5)]"><CheckSquare size={8}/>確認済</span>}
                          </div>
                          <div className="flex gap-2 text-cyan-600">
                            {memo.teacher && <span className="flex items-center gap-0.5 not-italic"><User size={10}/>{memo.teacher}</span>}
                            {memo.materials && memo.materials.length > 0 && <Tags size={10} className="text-orange-400" />}
                            {memo.images && memo.images.length > 0 && <span className="flex items-center gap-0.5 text-cyan-400"><Camera size={10}/>{memo.images.length}</span>}
                          </div>
                        </div>
                        <h3 className="font-black text-slate-100 text-base leading-tight mb-2 tracking-tight pl-2 drop-shadow-sm">{memo.title}</h3>
                        <div className="flex items-center justify-between text-[9px] font-black pt-2 border-t border-slate-800 pl-1">
                          <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md text-slate-400 border border-slate-800"><MapPin size={10} className="text-cyan-500"/> {memo.site}</span>
                          <span className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${colors.light} ${colors.text} border ${colors.border} uppercase shadow-inner`}><DynamicIcon name={genreConfig.icon} size={10}/> {memo.genre}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                Object.keys(groupedMemos).length === 0 ? (
                  <p className="text-center text-xs font-bold text-cyan-600 py-10 uppercase tracking-widest">No Data</p>
                ) : (
                  Object.entries(groupedMemos).sort(([a], [b]) => a.localeCompare(b)).map(([groupKey, groupMemos]) => (
                    <div key={groupKey} className="bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700 shadow-lg overflow-hidden mb-3">
                      <div className="bg-slate-950 p-3 text-slate-200 flex justify-between items-center border-b border-slate-800">
                        <h3 className="font-black text-sm flex items-center gap-2">
                          {listMode === 'site' && <Building size={14} className="text-cyan-500"/>}
                          {listMode === 'genre' && <ListFilter size={14} className="text-cyan-500"/>}
                          {listMode === 'material' && <Tags size={14} className="text-cyan-500"/>}
                          {groupKey}
                        </h3>
                        <span className="text-[9px] font-bold bg-slate-800 border border-slate-600 text-cyan-400 px-2 py-1 rounded-full shadow-inner">{groupMemos.length} FILES</span>
                      </div>
                      <div className="p-3 space-y-2">
                        {groupMemos.map(memo => (
                          <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="p-2.5 bg-slate-800/50 rounded-xl cursor-pointer active:bg-slate-800 flex justify-between items-center border border-transparent hover:border-cyan-500/30 transition-colors">
                            <div>
                              <p className="text-xs font-black text-slate-200 flex items-center gap-1">
                                {memo.needsReview && !memo.isReviewed && <Bell size={10} className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.8)]"/>}
                                {memo.title}
                              </p>
                              <p className="text-[8px] font-bold text-slate-500 mt-1 flex gap-2">
                                {listMode !== 'site' && <span>📍{memo.site}</span>}
                                {listMode !== 'genre' && <span>🏷️{memo.genre}</span>}
                                <span className="text-cyan-800">{memo.date}</span>
                              </p>
                            </div>
                            <ChevronRight size={14} className="text-slate-600"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {view === 'settings' && (
            <div className="space-y-6 pb-10 animate-in slide-in-from-right">
              <h2 className="text-xl font-black text-cyan-400 flex items-center gap-2 mb-4 tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><Settings className="text-cyan-500"/> MASTER SETTINGS</h2>
              
              <EditorSection 
                title="ジャンル編集" icon={ListFilter} items={userSettings.genres} placeholder="新ジャンル名..."
                onAdd={(name, colorId, icon, group) => handleAddItem('genres', name, colorId, icon, group)}
                onDelete={(name) => { const obj = {...userSettings.genres}; delete obj[name]; saveSettings({...userSettings, genres: obj}); }}
                onMoveUp={(name) => handleMoveItem('genres', name, 'up')}
                onMoveDown={(name) => handleMoveItem('genres', name, 'down')}
              />

              <EditorSection 
                title="材料・タグ編集" icon={Tags} items={userSettings.tags} placeholder="新しい材料・タグ..."
                onAdd={(name, colorId, icon, group) => handleAddItem('tags', name, colorId, icon, group)}
                onDelete={(name) => { const obj = {...userSettings.tags}; delete obj[name]; saveSettings({...userSettings, tags: obj}); }}
                onMoveUp={(name) => handleMoveItem('tags', name, 'up')}
                onMoveDown={(name) => handleMoveItem('tags', name, 'down')}
              />

              <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] space-y-4">
                <h3 className="text-sm font-black text-cyan-400 border-b border-slate-700 pb-2 flex items-center gap-2 tracking-widest"><Type size={16}/> クイックフレーズ編集</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {userSettings.quickPhrases.map((phrase, idx) => (
                    <span key={idx} className="bg-slate-900 text-cyan-100 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-600 shadow-inner">
                      {phrase}
                      <button onClick={() => saveSettings({...userSettings, quickPhrases: userSettings.quickPhrases.filter((_, i) => i !== idx)})} className="text-slate-500 hover:text-red-500 transition-colors"><X size={12}/></button>
                    </span>
                  ))}
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2 shadow-inner">
                  <input id="newPhraseInput" type="text" placeholder="新しいフレーズ..." className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-bold text-cyan-50 outline-none placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                  <button onClick={() => {
                    const input = document.getElementById('newPhraseInput');
                    if (input.value.trim()) {
                      saveSettings({ ...userSettings, quickPhrases: [...userSettings.quickPhrases, input.value.trim()] });
                      input.value = '';
                    }
                  }} className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-400 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)] active:scale-[0.98] hover:bg-slate-700 transition-all flex justify-center items-center gap-2"><Sword size={14}/>装備に追加</button>
                </div>
              </div>
              
              <div className="text-center py-4 opacity-30">
                <Gamepad2 size={32} className="mx-auto text-cyan-600 mb-2"/>
                <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">ELECTRIC CLIPPER MASTER v1.0</p>
              </div>
            </div>
          )}

          {view === 'detail' && selectedMemo && (
            <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pb-32 animate-in slide-in-from-right duration-300">
              <header className={`${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.bg || 'bg-slate-800'} text-slate-900 p-6 flex justify-between items-center sticky top-0 rounded-b-[2.5rem] shadow-[0_0_20px_rgba(0,0,0,0.8)] border-b border-white/20 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                <button onClick={() => setView('list')} className="relative z-10"><ChevronLeft size={28}/></button>
                <h2 className="font-black italic text-[10px] tracking-widest uppercase relative z-10 opacity-70">DECRYPTED DATA</h2>
                <button onClick={() => { 
                  setEditingMemo(selectedMemo); 
                  const safeMemo = {...selectedMemo};
                  if (!safeMemo.images) safeMemo.images = [];
                  if (safeMemo.markupImage && safeMemo.images.length === 0) safeMemo.images.push(safeMemo.markupImage);
                  setFormData(safeMemo); 
                  setView('edit'); 
                }} className="relative z-10"><Edit3 size={24}/></button>
              </header>
              
              <div className="p-8 space-y-8 max-w-xl mx-auto">
                <div className="space-y-4 relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-cyan-900/30 rounded-full"></div>
                  <div className="flex gap-2 items-center mb-2">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.light} ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.text} border shadow-inner`}>
                      <DynamicIcon name={userSettings.genres[selectedMemo.genre]?.icon} size={14}/> {selectedMemo.genre}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-slate-100 leading-tight tracking-tighter drop-shadow-md">{selectedMemo.title}</h2>
                  <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-inner">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-cyan-500"/> {selectedMemo.site}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-cyan-500"/> {selectedMemo.date}</span>
                  </div>

                  {(selectedMemo.teacher || selectedMemo.needsReview) && (
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-2">
                      {selectedMemo.teacher && (
                        <span className="bg-slate-800 text-cyan-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-600 shadow-sm">
                          <User size={12} className="text-cyan-500"/> 伝授: {selectedMemo.teacher}
                        </span>
                      )}
                      {selectedMemo.needsReview && !selectedMemo.isReviewed && (
                        <span className="bg-red-950 text-red-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
                          <Bell size={12}/> 要確認 ({selectedMemo.reviewDate || '期限なし'})
                        </span>
                      )}
                      {selectedMemo.needsReview && selectedMemo.isReviewed && (
                        <span className="bg-green-950 text-green-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-green-500/50 shadow-sm">
                          <CheckSquare size={12}/> 確認完了
                        </span>
                      )}
                    </div>
                  )}
                  
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
                
                {(selectedMemo.images && selectedMemo.images.length > 0) || selectedMemo.markupImage ? (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-cyan-600 flex items-center gap-1 tracking-widest"><Camera size={14}/> VISUAL DATA</h3>
                    <div className="flex flex-col gap-4">
                      {selectedMemo.markupImage && (!selectedMemo.images || selectedMemo.images.length===0) && (
                        <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)]"><img src={selectedMemo.markupImage} className="w-full opacity-90" /></div>
                      )}
                      {selectedMemo.images && selectedMemo.images.map((img, i) => (
                        <div key={i} className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] relative">
                          <img src={img} className="w-full h-auto object-cover opacity-90" />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="bg-slate-900 p-8 rounded-[3rem] text-cyan-50 font-medium border border-cyan-900/50 leading-relaxed relative shadow-[0_0_20px_rgba(6,182,212,0.1)] whitespace-pre-wrap">
                  <span className="absolute -top-3 left-10 bg-cyan-600 text-slate-900 px-4 py-1 rounded-full text-[10px] not-italic shadow-[0_0_8px_rgba(6,182,212,0.8)] tracking-widest font-black uppercase">Quest Log</span>
                  {selectedMemo.content}
                </div>
              </div>
            </div>
          )}

        </main>

        {/* --- ビュー: フォーム (追加/編集) --- */}
        {(view === 'add' || view === 'edit') && (
          <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto pb-32 animate-in slide-in-from-bottom-10 relative">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{
              backgroundImage: `linear-gradient(to right, #facc15 1px, transparent 1px), linear-gradient(to bottom, #facc15 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>

            <header className="bg-slate-900/90 backdrop-blur-md border-b border-yellow-500/30 p-5 flex justify-between items-center sticky top-0 shadow-[0_0_20px_rgba(234,179,8,0.15)] z-20">
              <button onClick={() => setView('list')} className="text-slate-400 hover:text-yellow-400"><X size={24}/></button>
              <h2 className="font-black text-yellow-400 tracking-tighter italic flex items-center gap-2 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]">
                <ClipperIcon size={18} strokeWidth={2.5}/> RECORD NEW DATA...
              </h2>
              {/* ★ クリッパーの記録ボタン */}
              <button onClick={handleSave} className="relative group overflow-hidden bg-slate-800 text-cyan-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-500/50 disabled:opacity-50 active:scale-95 transition-all">
                <span className="relative z-10 flex items-center gap-1.5"><ClipperIcon size={14}/> ログを刻印</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </header>
            
            <div className="p-6 space-y-7 max-w-xl mx-auto relative z-10">
              <div className="space-y-4">
                <input 
                  list="title-history"
                  className="w-full text-2xl font-black bg-transparent border-b-2 border-slate-700 py-2 text-slate-100 focus:border-cyan-400 outline-none transition-colors placeholder:text-slate-600" 
                  placeholder="クエスト名（作業・タイトル）" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                <datalist id="title-history">
                  {uniqueTitles.map(t => <option key={t} value={t} />)}
                </datalist>

                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="p-3 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 shadow-inner focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  
                  <div className="relative flex items-center">
                    <select className="p-3 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 shadow-inner w-full focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                      {groupedGenresForm.map(({ category, genres }) => (
                        <optgroup key={category} label={`【${category}】`}>
                          {genres.map(g => <option key={g.key} value={g.key}>{g.key}</option>)}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 text-slate-500 pointer-events-none"/>
                    <button type="button" onClick={() => setShowNewGenre(!showNewGenre)} className="absolute -top-2 -right-2 bg-slate-800 text-cyan-400 rounded-full p-1.5 shadow-[0_0_8px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:bg-slate-700 active:scale-95 transition-all"><Plus size={14}/></button>
                  </div>
                </div>

                {showNewGenre && (
                  <div className="bg-cyan-950/30 p-3 rounded-2xl border border-cyan-900 flex gap-2 items-center animate-in fade-in slide-in-from-top-2 shadow-inner">
                    <select value={newGenreGroup} onChange={e=>setNewGenreGroup(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 shrink-0">
                      {MainCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="新ジャンル名" value={newGenreName} onChange={e=>setNewGenreName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-bold text-cyan-50 outline-none focus:border-cyan-500 min-w-0" />
                    <button type="button" onClick={() => {
                      if(newGenreName.trim()) {
                        handleAddItem('genres', newGenreName.trim(), 'blue', 'Info', newGenreGroup);
                        setFormData({...formData, genre: newGenreName.trim()});
                        setNewGenreName('');
                        setShowNewGenre(false);
                      }
                    }} className="bg-cyan-600 text-slate-900 px-3 py-2 rounded-xl text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.5)] active:scale-95 shrink-0">追加</button>
                  </div>
                )}

                <div className="relative shadow-inner rounded-2xl">
                  <Building className="absolute left-3 top-3.5 text-cyan-700" size={16}/>
                  <input 
                    list="site-history"
                    className="w-full p-3 pl-10 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" 
                    placeholder="ダンジョン名（現場・案件）" 
                    value={formData.site} 
                    onChange={e => setFormData({...formData, site: e.target.value})} 
                  />
                  <datalist id="site-history">
                    {uniqueSites.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-700 shadow-lg">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex justify-between items-center text-xs font-black text-cyan-600 py-1">
                  <span className="flex items-center gap-1.5 tracking-widest"><Info size={14}/> ADVANCED SETTINGS</span>
                  {showAdvanced ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
                
                {showAdvanced && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="relative shadow-inner rounded-2xl">
                      <User className="absolute left-3 top-3.5 text-cyan-700" size={16}/>
                      <input 
                        className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-2xl font-bold outline-none text-sm text-cyan-50 focus:border-cyan-500 transition-colors" 
                        placeholder="教えてくれた人（師匠・先輩など）" 
                        value={formData.teacher || ''} 
                        onChange={e => setFormData({...formData, teacher: e.target.value})} 
                      />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${formData.needsReview ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 border-slate-600 group-hover:border-cyan-500'}`}>
                           {formData.needsReview && <Check size={14} className="text-slate-900" strokeWidth={4}/>}
                        </div>
                        <input type="checkbox" checked={formData.needsReview || false} onChange={e => setFormData({...formData, needsReview: e.target.checked})} className="hidden" />
                        <span className="text-xs font-black text-slate-300 group-hover:text-cyan-100 transition-colors">後で確認・復習が必要</span>
                      </label>
                      
                      {formData.needsReview && (
                        <div className="pl-8 space-y-4 animate-in fade-in">
                          <div className="flex items-center gap-2">
                            <Bell size={14} className="text-orange-500 shrink-0 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/>
                            <input type="date" className="p-2 bg-slate-900 border border-slate-700 rounded-xl font-bold outline-none text-xs text-cyan-50 shadow-inner w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500" value={formData.reviewDate || ''} onChange={e => setFormData({...formData, reviewDate: e.target.value})} />
                            <span className="text-[10px] text-slate-500 font-bold shrink-0">にお知らせ</span>
                          </div>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${formData.isReviewed ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-800 border-slate-600 group-hover:border-green-500'}`}>
                               {formData.isReviewed && <Check size={14} className="text-slate-900" strokeWidth={4}/>}
                            </div>
                            <input type="checkbox" checked={formData.isReviewed || false} onChange={e => setFormData({...formData, isReviewed: e.target.checked})} className="hidden" />
                            <span className="text-xs font-black text-slate-300 group-hover:text-green-100 transition-colors">確認完了（クリア！）</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-cyan-600 flex items-center gap-1 tracking-widest"><Tags size={12}/> COMPONENTS & TAGS</p>
                  <button type="button" onClick={() => setShowNewTag(!showNewTag)} className="text-[10px] font-bold text-cyan-400 bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-cyan-900 shadow-[0_0_8px_rgba(6,182,212,0.2)] active:scale-95 transition-all"><Plus size={12}/>新規タグ作成</button>
                </div>

                {showNewTag && (
                  <div className="bg-cyan-950/30 p-3 rounded-2xl border border-cyan-900 flex gap-2 items-center animate-in fade-in slide-in-from-top-2 shadow-inner">
                    <select value={newTagGroup} onChange={e=>setNewTagGroup(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 shrink-0">
                      {MainCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="text" placeholder="新タグ名" value={newTagName} onChange={e=>setNewTagName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-bold text-cyan-50 outline-none focus:border-cyan-500 min-w-0" />
                    <button type="button" onClick={() => {
                      if(newTagName.trim()) {
                        handleAddItem('tags', newTagName.trim(), 'gray', 'Tags', newTagGroup);
                        const mats = formData.materials || [];
                        if (!mats.includes(newTagName.trim())) {
                          setFormData({...formData, materials: [...mats, newTagName.trim()]});
                        }
                        setNewTagName('');
                        setShowNewTag(false);
                      }
                    }} className="bg-cyan-600 text-slate-900 px-3 py-2 rounded-xl text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.5)] active:scale-95 shrink-0">追加</button>
                  </div>
                )}
                
                <div className="flex flex-col gap-2">
                  {groupedTagsForm.map(({ category, tags }) => (
                    <TagAccordion key={category} groupName={`【${category}】`} tags={tags} formData={formData} setFormData={setFormData} />
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-5 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-black text-cyan-600 mb-2 tracking-widest">
                  <span className="flex items-center gap-1"><Camera size={14}/> VISUAL EVIDENCE</span>
                  <label className="text-slate-900 bg-cyan-600 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-500">
                    <Upload size={14}/> 撮影 / 一括追加
                    <input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {!formData.images || formData.images.length === 0 ? (
                    <div className="w-full flex-shrink-0 h-32 border-2 border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 font-bold text-xs bg-slate-950/50 shadow-inner">
                      <ImageIcon size={24} className="mb-2 opacity-50"/> 現場の様子を記録しましょう
                    </div>
                  ) : (
                    formData.images.map((img, i) => (
                      <div key={i} className="relative w-48 flex-shrink-0 snap-center group">
                        <img src={img} className="w-full h-32 object-cover rounded-[1.5rem] border border-slate-700 shadow-lg cursor-pointer opacity-90 hover:opacity-100 transition-opacity" onClick={() => setMarkupModal({ isOpen: true, imgIndex: i, dataUrl: img })} />
                        <button type="button" onClick={() => {
                          const newImgs = [...formData.images]; newImgs.splice(i, 1);
                          setFormData({...formData, images: newImgs});
                        }} className="absolute -top-2 -right-2 bg-red-500 text-slate-900 p-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"><X size={14}/></button>
                        <div className="absolute bottom-2 right-2 bg-cyan-900/80 text-cyan-100 p-1.5 rounded-full pointer-events-none border border-cyan-500"><Edit3 size={12}/></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-5 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                  {userSettings.quickPhrases.map(p => <button key={p} type="button" onClick={() => setFormData({...formData, content: formData.content + (formData.content?'\n':'') + p})} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-100 rounded-xl text-[10px] border border-slate-600 font-black transition-colors shadow-inner">+ {p}</button>)}
                </div>
                <textarea className="w-full h-40 pt-2 bg-transparent outline-none text-sm font-medium leading-relaxed resize-none text-cyan-50 placeholder:text-slate-600" placeholder="攻略のヒント、配線の色、次回への引き継ぎ事項などを記録..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              
              {view === 'edit' && <button type="button" onClick={() => handleDelete(selectedMemo.id)} className="w-full py-5 text-red-500 font-black text-xs border-2 border-red-900/50 border-dashed rounded-[2.5rem] uppercase tracking-widest hover:bg-red-950 transition-all mt-8 shadow-inner">クエストを破棄する</button>}
            </div>
          </div>
        )}
      </div>

      {/* --- ボトムナビゲーション --- */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full p-2 flex items-center shadow-[0_0_20px_rgba(0,0,0,0.8)] z-40 w-max gap-2">
        <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
          <ClipboardList size={20} strokeWidth={view === 'list' ? 2.5 : 2} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'list' ? 'block' : 'hidden'}`}>Quest Log</span>
        </button>
        <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'settings' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
          <Settings size={20} strokeWidth={view === 'settings' ? 2.5 : 2} />
          <span className={`text-[10px] font-black uppercase tracking-widest ${view === 'settings' ? 'block' : 'hidden'}`}>Equipment</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
