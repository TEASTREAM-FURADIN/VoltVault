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
  Move, ZoomIn, ZoomOut, RotateCcw, RotateCw,
  User, Bell, ChevronUp, CheckSquare, ArrowUp, ArrowDown,
  Coffee, Eraser, Skull, Lock as LockIcon
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection, onSnapshot, deleteDoc } from 'firebase/firestore';

// --- 定数・アイコン定義 ---
const ClipperIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 9.5L21 18.5a2 2 0 0 1-2.8 2.8L9.5 14.5" />
    <path d="M9.5 9.5L3 18.5a2 2 0 0 0 2.8 2.8L14.5 14.5" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor"/>
    <path d="M9.5 9.5C8 8 7 6 7 6C7 6 9 5 11 7L12 8" />
    <path d="M14.5 9.5C16 8 17 6 17 6C17 6 15 5 13 7L12 8" />
    <path d="M12 2L11 4H13L12 6" stroke="#06b6d4" strokeWidth="1.5"/>
  </svg>
);

const TeaCupIcon = ({ size = 24, className = "", strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 8v5a6 6 0 0 0 12 0V8" />
    <line x1="5" y1="8" x2="19" y2="8" />
    <path d="M10 3s1 1.5 1 2.5-1 1.5-1 2.5" />
    <path d="M14 3s-1 1.5-1 2.5 1 1.5 1 2.5" />
  </svg>
);

const IconMap = { Zap, Plug, Cable, Power, Lightbulb, Wrench, Hammer, HardHat, AlertCircle, CheckCircle, Info, Tags, Folder, MapPin, Building, Truck, Grid, ListFilter, Shield, Flame, Droplets, Wind, Thermometer, Scissors, Battery, FileText, PenTool, Ruler, Compass, Home, Activity, Radio, Wifi, Phone, Car, Clock, Lock: LockIcon, Unlock, Sun, Moon, Snowflake, Paintbrush, Link, Milestone, Layers, Gamepad2, Sword, Crown, Trophy, Target, Dumbbell, Book, Star, Sparkles, Medal, Award };
const IconNames = { Zap: '強電・雷', Plug: 'コンセント', Cable: '配線', Power: '動力・電源', Lightbulb: '照明', Wrench: 'レンチ', Hammer: 'ハンマー', HardHat: 'ヘルメット', AlertCircle: '注意・警告', CheckCircle: '確認・完了', Info: '情報', Tags: 'タグ', Folder: 'フォルダ', MapPin: '現場・場所', Building: 'ビル・施設', Truck: 'トラック・搬入', Grid: '盤・ラック', ListFilter: 'フィルター', Shield: '保安・防御', Flame: '火気・熱', Droplets: '水回り・配管', Wind: '換気・ダクト', Thermometer: '温度・測定', Scissors: '切断・加工', Battery: 'バッテリー', FileText: '図面・書類', PenTool: 'ペン・記録', Ruler: '寸法・測定', Compass: '方位', Home: '住宅・戸建', Activity: '波形・測定器', Radio: 'アンテナ・無線', Wifi: '通信・Wi-Fi', Phone: '電話・連絡', Car: '車両・移動', Clock: '時間・期限', Lock: '施錠・セキュリティ', Unlock: '解錠', Sun: '太陽光・昼', Moon: '夜間作業', Snowflake: '空調・エアコン', Paintbrush: '塗装・補修', Link: '他職連携', Milestone: '工程・段取り', Layers: '内装・軽天', Gamepad2: 'ゲーム', Sword: '剣（攻撃）', Crown: '王冠（最高）', Trophy: 'トロフィー', Target: 'ダーツ・目標', Dumbbell: '筋トレ', Book: '読書・学習', Star: '星（重要）', Sparkles: 'キラキラ', Medal: 'メダル', Award: 'アワード' };
const IconCategories = [
  { name: '電気・設備', icons: ['Zap', 'Plug', 'Cable', 'Power', 'Lightbulb', 'Grid'] },
  { name: '他職・建築', icons: ['Shield', 'Flame', 'Droplets', 'Wind', 'Building', 'Home', 'Snowflake', 'Paintbrush', 'Layers'] },
  { name: '工具・測定', icons: ['Wrench', 'Hammer', 'HardHat', 'Thermometer', 'Scissors', 'Ruler', 'Compass', 'Activity'] },
  { name: '工程・打合せ', icons: ['FileText', 'PenTool', 'Phone', 'Clock', 'Link', 'Milestone', 'Tags', 'Folder', 'ListFilter'] },
  { name: '状態・情報', icons: ['AlertCircle', 'CheckCircle', 'Info', 'MapPin', 'Truck', 'Battery', 'Radio', 'Wifi', 'Car', 'Lock', 'Unlock', 'Sun', 'Moon'] },
  { name: '趣味・ゲーム', icons: ['Gamepad2', 'Sword', 'Crown', 'Trophy', 'Target', 'Dumbbell', 'Book', 'Star', 'Sparkles', 'Medal', 'Award'] }
];

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
const ColorNames = { red: 'レッド', blue: 'ブルー', green: 'グリーン', yellow: 'イエロー', orange: 'オレンジ', purple: 'パープル', pink: 'ピンク', teal: 'シアン', gray: 'スチール' };
const MainCategories = ['電気', '弱電', '設備', '内装', '建築', '事務', '工程', '知識技術', '趣味', 'その他'];

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
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
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : (firebaseConfig.projectId || 'electricity-gokui');

const defaultSettings = {
  quickPhrases: ["通電確認OK", "絶縁抵抗計 測定済", "相色確認OK", "隠蔽部写真撮影済", "先行配管完了"],
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
  stats: { clipperDurability: 100, lastMemoDate: '', streakDays: 0, completedSites: [], bonusExp: 0 }
};

const getTitle = (level) => {
  if (level >= 99) return "伝説の電設王";
  if (level >= 50) return "無双の親方";
  if (level >= 20) return "熟練の職人";
  if (level >= 10) return "一人前の職人";
  if (level >= 5) return "若手エース";
  return "新米職人";
};

const DynamicIcon = ({ name, size = 16, className = "" }) => {
  const Icon = IconMap[name] || IconMap.Info;
  return <Icon size={size} className={className} />;
};

// --- ボトムナビゲーション ---
const NavBtn = ({ view, setView }) => (
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 rounded-full p-2 flex items-center shadow-[0_0_20px_rgba(0,0,0,0.8)] z-40 w-max gap-2">
    <button onClick={() => setView('list')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'list' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
      <ClipboardList size={20} strokeWidth={view === 'list' ? 2.5 : 2} /><span className={`text-[10px] font-black uppercase tracking-widest ${view === 'list' ? 'block' : 'hidden'}`}>Quest Log</span>
    </button>
    <button onClick={() => setView('stats')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'stats' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
      <Activity size={20} strokeWidth={view === 'stats' ? 2.5 : 2} /><span className={`text-[10px] font-black uppercase tracking-widest ${view === 'stats' ? 'block' : 'hidden'}`}>Status</span>
    </button>
    <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-300 ${view === 'settings' ? 'bg-cyan-600 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
      <Settings size={20} strokeWidth={view === 'settings' ? 2.5 : 2} /><span className={`text-[10px] font-black uppercase tracking-widest ${view === 'settings' ? 'block' : 'hidden'}`}>Equipment</span>
    </button>
  </nav>
);

// --- 独立コンポーネント群 ---
const LevelUpModal = ({ levelUpData }) => {
  if (!levelUpData) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 px-10 py-12 rounded-[2.4rem] text-center flex flex-col items-center border-2 border-yellow-400 shadow-[0_0_40px_rgba(234,179,8,0.4)] relative overflow-hidden mx-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/20 to-transparent opacity-50" />
        <Zap size={64} className="text-yellow-400 mb-4 animate-pulse drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] relative z-10" fill="currentColor" />
        <h2 className="text-3xl font-black text-cyan-400 mb-2 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] tracking-widest relative z-10">SYSTEM UPGRADE</h2>
        <p className="text-5xl font-black text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] relative z-10">Lv.{String(levelUpData.level)}</p>
        <p className="text-xl font-black text-slate-900 mt-3 bg-yellow-400 px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.6)] relative z-10">{levelUpData.title}</p>
      </div>
    </div>
  );
};

const getTrophies = (memos, userSettings) => [
  { id: 1, reqText: '1件記録', name: '現場デビュー', icon: HardHat, color: 'blue', isUnlocked: memos.length >= 1 },
  { id: 2, reqText: '5件記録', name: '記録の虫', icon: Book, color: 'green', isUnlocked: memos.length >= 5 },
  { id: 3, reqText: '20件記録', name: '現場の鬼', icon: Flame, color: 'orange', isUnlocked: memos.length >= 20 },
  { id: 4, reqText: '50件記録', name: '無双の親方', icon: Crown, color: 'yellow', isUnlocked: memos.length >= 50 },
  { id: 5, reqText: '100件記録', name: '伝説の電設王', icon: Zap, color: 'cyan', isUnlocked: memos.length >= 100 },
  { id: 6, reqText: '3日連続', name: '継続の力', icon: Clock, color: 'purple', isUnlocked: (userSettings.stats?.streakDays || 0) >= 3 },
  { id: 7, reqText: '趣味5件', name: '文武両道', icon: Dumbbell, color: 'pink', isUnlocked: memos.filter(m => userSettings.genres[m.genre]?.group === '趣味').length >= 5 },
  { id: 8, reqText: '現場討伐', name: 'ボスハンター', icon: Target, color: 'red', isUnlocked: (userSettings.stats?.completedSites?.length || 0) >= 1 }
];

const TrophiesModal = ({ showTrophiesModal, setShowTrophiesModal, memos, userSettings }) => {
  if (!showTrophiesModal) return null;
  const trophies = getTrophies(memos, userSettings);
  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-lg font-black text-cyan-400 tracking-widest flex items-center gap-2"><Trophy size={20}/> LICENSES & TROPHIES</h2>
          <button onClick={() => setShowTrophiesModal(false)} className="text-slate-500 hover:text-cyan-400 active:scale-90 transition-transform"><X size={24}/></button>
        </div>
        <div className="overflow-y-auto pr-2 space-y-3 flex-1" style={{ scrollbarWidth: 'none' }}>
          {trophies.map(t => {
            const IconComp = t.icon; 
            const tColor = ColorMap[t.color] || ColorMap.gray;
            return (
              <div key={t.id} className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${t.isUnlocked ? 'bg-slate-800 border-slate-600 shadow-inner' : 'bg-slate-900 border-slate-800 opacity-60 grayscale'}`}>
                <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center relative ${t.isUnlocked ? `${tColor.light} border ${tColor.border} shadow-[0_0_10px_currentColor] ${tColor.text}` : 'bg-slate-800 border border-slate-600 text-slate-500'}`}>
                  {t.isUnlocked ? <IconComp size={20} /> : <LockIcon size={16} />}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-black truncate ${t.isUnlocked ? 'text-slate-100' : 'text-slate-500'}`}>{t.isUnlocked ? t.name : '??? (未開放)'}</span>
                  <span className={`text-[10px] font-bold ${t.isUnlocked ? 'text-cyan-600' : 'text-slate-600'}`}>条件: {t.reqText}</span>
                </div>
                {t.isUnlocked && <CheckCircle size={16} className="ml-auto text-green-500 shrink-0 drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RadarChart = ({ memos, userSettings }) => {
  const data = MainCategories.map(cat => ({
    name: cat, count: memos.filter(m => (userSettings.genres[m.genre]?.group || 'その他') === cat).length 
  }));
  const maxVal = Math.max(...data.map(d => d.count), 5);
  const centerX = 150, centerY = 150, radius = 90; 

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
  };

  const polygonPoints = data.map((d, i) => getPoint(i, d.count)).join(' ');
  const bgPolygonPoints = data.map((_, i) => getPoint(i, maxVal)).join(' ');
  const midBgPolygonPoints = data.map((_, i) => getPoint(i, maxVal * 0.5)).join(' ');

  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square mb-6">
      <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
        <polygon points={bgPolygonPoints} fill="rgba(15,23,42,0.8)" stroke="#1e293b" strokeWidth="2" />
        <polygon points={midBgPolygonPoints} fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
        {data.map((_, i) => <line key={i} x1={centerX} y1={centerY} x2={getPoint(i, maxVal).split(',')[0]} y2={getPoint(i, maxVal).split(',')[1]} stroke="#1e293b" strokeWidth="1" />)}
        <polygon points={polygonPoints} fill="rgba(34,211,238,0.3)" stroke="#22d3ee" strokeWidth="3" className="animate-pulse" />
        {data.map((d, i) => {
          const [x, y] = getPoint(i, d.count).split(',');
          return <circle key={`dot-${i}`} cx={x} cy={y} r="4" fill="#facc15" className="drop-shadow-[0_0_5px_rgba(250,204,21,1)]" />;
        })}
        {data.map((d, i) => {
          const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
          const tx = centerX + (radius + 25) * Math.cos(angle);
          const ty = centerY + (radius + 25) * Math.sin(angle);
          return <text key={`label-${i}`} x={tx} y={ty} fill="#94a3b8" fontSize="10" fontWeight="900" textAnchor="middle" dominantBaseline="middle" className="drop-shadow-md">{d.name}</text>;
        })}
      </svg>
    </div>
  );
};

const ColorSelector = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative flex-[0.8]" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-800 transition-colors text-slate-200">
        <span className="flex items-center gap-2"><span className={`w-3.5 h-3.5 rounded-full ${ColorMap[value]?.bg || 'bg-blue-500'} shadow-[0_0_5px_currentColor]`}></span>{String(ColorNames[value] || 'ブルー')}</span>
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
    const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-xs font-bold outline-none flex items-center justify-between hover:bg-slate-800 transition-colors text-slate-200">
        <span className="flex items-center gap-2"><DynamicIcon name={value || 'Info'} size={16} className="text-cyan-400"/> <span className="truncate">{String(IconNames[value] || value || '情報')}</span></span>
        <ChevronDown size={14} className="text-slate-500"/>
      </button>
      {isOpen && (
        <div className="absolute z-50 bottom-full right-0 mb-1 w-[300px] sm:w-[320px] bg-slate-800 border border-slate-700 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] p-2 flex flex-col gap-2">
          <div className="flex overflow-x-auto gap-1 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            {IconCategories.map(cat => (
              <button key={cat.name} type="button" onClick={() => setActiveCategory(cat.name)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors snap-start ${activeCategory === cat.name ? 'bg-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}>{String(cat.name)}</button>
            ))}
          </div>
          <div className="max-h-48 overflow-y-auto grid grid-cols-2 gap-1 pr-1">
            {(IconCategories.find(c => c.name === activeCategory)?.icons || []).map(iconName => (
              <button key={iconName} type="button" onClick={() => { onChange(iconName); setIsOpen(false); }} className={`flex items-center gap-2 p-2 rounded-lg text-[10px] font-bold text-left transition-colors ${value === iconName ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-700 text-slate-300 border border-transparent'}`}>
                <DynamicIcon name={iconName} size={14} className={value === iconName ? 'text-cyan-400' : 'text-slate-500'} /> <span className="truncate">{String(IconNames[iconName])}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TagAccordion = ({ groupName, tags, formData, setFormData }) => {
  const mats = Array.isArray(formData?.materials) ? formData.materials : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  const [isOpen, setIsOpen] = useState(safeTags.some(t => mats.includes(t.key)) || true); 
  return (
    <div className="border border-slate-700 rounded-2xl overflow-hidden mb-2 shadow-[0_0_10px_rgba(0,0,0,0.5)]">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-3 flex justify-between items-center text-xs font-black text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors">
        <span className="flex items-center gap-1.5"><Folder size={14} className="text-cyan-500"/> {String(groupName)} <span className="text-[9px] text-cyan-600 font-bold ml-1 bg-cyan-950/50 px-1.5 rounded-full border border-cyan-900">全 {Number(safeTags.length)} 種</span></span>
        {isOpen ? <ChevronUp size={16} className="text-cyan-500"/> : <ChevronDown size={16} className="text-slate-500"/>}
      </button>
      {isOpen && (
        <div className="p-3 flex flex-wrap gap-2 bg-slate-900 border-t border-slate-700">
          {safeTags.map(t => {
            const isSelected = mats.includes(t.key);
            const colors = ColorMap[t.colorId] || ColorMap.gray;
            return (
              <button key={t.key} type="button" onClick={() => {
                  if (isSelected) setFormData({...formData, materials: mats.filter(m => m !== t.key)});
                  else setFormData({...formData, materials: [...mats, t.key]});
                }}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
                  isSelected ? `${colors.bg} text-slate-900 border-transparent shadow-[0_0_10px_${colors.bg}]` : `bg-slate-800 ${colors.text} border-slate-600 hover:bg-slate-700 hover:border-slate-500`
                }`}
              ><DynamicIcon name={t.icon} size={12} /> {String(t.key)}</button>
            )
          })}
        </div>
      )}
    </div>
  )
};

const EditorSection = ({ title, icon: Icon, items, onAdd, onUpdate, onDelete, onMoveUp, onMoveDown, placeholder }) => {
  const [name, setName] = useState(''); const [color, setColor] = useState('blue'); const [iconName, setIconName] = useState('Info');
  const [group, setGroup] = useState(MainCategories[0]); const [editingKey, setEditingKey] = useState(null); 
  const sortedItems = Object.entries(items || {}).map(([k, v]) => ({ key: k, ...v })).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm p-5 rounded-[2rem] border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] space-y-4">
      <h3 className="text-sm font-black text-cyan-400 border-b border-slate-700 pb-2 flex items-center gap-2 tracking-widest"><Icon size={16}/> {String(title)}</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
        {sortedItems.map((item, idx) => {
          const colors = ColorMap[item.colorId] || ColorMap.gray;
          return (
            <div key={item.key} className={`flex justify-between items-center p-2.5 rounded-2xl border shadow-inner transition-colors ${editingKey === item.key ? 'bg-slate-800 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 'bg-slate-900 border-slate-700'}`}>
              <div className="flex flex-col gap-1 items-start">
                <span className="text-[8px] font-black text-cyan-600 uppercase bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900">{String(item.group)}</span>
                <span className={`${colors.light} ${colors.text} ${colors.border} border text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,0,0,0.5)]`}><DynamicIcon name={item.icon} size={14} /> {String(item.key)}</span>
              </div>
              <div className="flex items-center">
                <button onClick={() => { setEditingKey(item.key); setName(item.key); setColor(item.colorId); setIconName(item.icon); setGroup(item.group); }} className={`p-2 transition-colors active:scale-90 ${editingKey === item.key ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`}><Edit3 size={16}/></button>
                <div className="w-px h-6 bg-slate-700 mx-0.5" />
                <button onClick={() => onMoveUp(item.key)} disabled={idx === 0 || editingKey !== null} className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 active:scale-90"><ArrowUp size={16}/></button>
                <button onClick={() => onMoveDown(item.key)} disabled={idx === sortedItems.length - 1 || editingKey !== null} className="p-2 text-slate-500 hover:text-cyan-400 disabled:opacity-30 active:scale-90"><ArrowDown size={16}/></button>
                <div className="w-px h-6 bg-slate-700 mx-0.5" />
                <button onClick={() => { if(window.confirm(`WARNING: 「${item.key}」を削除しますか？`)) onDelete(item.key); }} disabled={editingKey !== null} className="p-2 text-slate-500 hover:text-red-500 disabled:opacity-30 active:scale-90"><Trash2 size={16}/></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`p-4 rounded-2xl border transition-colors ${editingKey ? 'bg-slate-800 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'bg-slate-900 border-slate-700 shadow-inner'} space-y-3`}>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <select value={group} onChange={e=>setGroup(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 appearance-none">
              {MainCategories.map(c => <option key={c} value={c}>{String(c)}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-3.5 text-slate-500 pointer-events-none"/>
          </div>
          <input type="text" placeholder={String(placeholder || '')} value={name} onChange={e=>setName(e.target.value)} className="flex-[2] bg-slate-800 border border-slate-700 p-2.5 rounded-xl text-sm font-bold text-cyan-50 outline-none focus:border-cyan-500" />
        </div>
        <div className="flex gap-2 relative"><ColorSelector value={color} onChange={setColor} /><IconSelector value={iconName} onChange={setIconName} /></div>
        <div className="flex gap-2 mt-2">
          {editingKey ? (
            <>
              <button onClick={() => { if(name.trim()){ onUpdate(editingKey, name.trim(), color, iconName, group); setEditingKey(null); setName(''); } }} className="flex-[3] bg-yellow-500/20 border border-yellow-500 text-yellow-400 py-3.5 rounded-xl font-black text-xs active:scale-[0.98]"><Save size={14}/> 更新</button>
              <button onClick={() => { setEditingKey(null); setName(''); setColor('blue'); setIconName('Info'); setGroup(MainCategories[0]); }} className="flex-1 bg-slate-800 border border-slate-700 text-slate-400 py-3.5 rounded-xl active:scale-[0.98]"><X size={14} className="mx-auto"/></button>
            </>
          ) : (
            <button onClick={() => { if(name.trim()){ onAdd(name.trim(), color, iconName, group); setName(''); } }} className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-400 py-3.5 rounded-xl font-black text-xs flex justify-center items-center gap-2 active:scale-[0.98]"><ClipperIcon size={14}/> 追加</button>
          )}
        </div>
      </div>
    </div>
  );
};

// ★ PC（マウス）からのクリックでも絶対に文字が入力できるテキストエディター
const TextEditor = ({ t, texts, setTexts, setEditingTextId, zoom, dimensions }) => {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return (
    <textarea
      ref={ref}
      value={t.text}
      onChange={(e) => setTexts(texts.map(x => x.id === t.id ? {...x, text: e.target.value} : x))}
      onBlur={() => { if (!t.text.trim()) setTexts(texts.filter(x => x.id !== t.id)); setEditingTextId(null); }}
      onPointerDown={e => e.stopPropagation()}
      style={{
        position: 'absolute', left: `${t.x * 100}%`, top: `${t.y * 100}%`, color: t.color,
        fontSize: `${Math.max(16, dimensions.dispW * 0.04 / zoom)}px`, fontWeight: '900',
        background: 'rgba(0,0,0,0.6)', border: `2px dashed ${t.color}`, borderRadius: '8px',
        outline: 'none', resize: 'both', zIndex: 50, padding: '8px',
        whiteSpace: 'pre-wrap', lineHeight: '1.2', minWidth: '6em', minHeight: '2em'
      }}
      placeholder="文字を入力..."
    />
  );
};

const MarkupModalCanvas = ({ markupModal, setMarkupModal, formData, setFormData }) => {
  const canvasRef = useRef(null); const [mode, setMode] = useState('draw'); const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState(null); const [texts, setTexts] = useState([]); 
  const [editingTextId, setEditingTextId] = useState(null); const dragRef = useRef(null);
  const [strokes, setStrokes] = useState([]); const [redoStack, setRedoStack] = useState([]); 
  const currentStroke = useRef(null); const [penColor, setPenColor] = useState('#ef4444'); 

  const PEN_COLORS = [{id:'red',v:'#ef4444',tw:'bg-red-500'},{id:'cyan',v:'#22d3ee',tw:'bg-cyan-400'},{id:'yellow',v:'#facc15',tw:'bg-yellow-400'},{id:'green',v:'#4ade80',tw:'bg-green-400'}];

  useEffect(() => {
    if (!markupModal.dataUrl || typeof markupModal.dataUrl !== 'string') return;
    const img = new Image();
    img.onload = () => {
      const scale = Math.min((window.innerWidth - 32) / img.width, (window.innerHeight * 0.55) / img.height, 1);
      setDimensions({ dispW: img.width * scale, dispH: img.height * scale, origW: img.width, origH: img.height, img });
    };
    img.src = markupModal.dataUrl;
  }, [markupModal.dataUrl]);

  const redraw = () => {
    if (!dimensions || !canvasRef.current) return;
    const cvs = canvasRef.current; const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    
    strokes.forEach(s => {
      ctx.globalCompositeOperation = s.type === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.type === 'eraser' ? 'rgba(0,0,0,1)' : s.color;
      ctx.lineWidth = s.width * cvs.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (s.points.length > 0) {
        ctx.beginPath();
        if (s.points.length === 1) {
          ctx.fillStyle = s.type === 'eraser' ? 'rgba(0,0,0,1)' : s.color;
          ctx.arc(s.points[0].x * cvs.width, s.points[0].y * cvs.height, (s.width * cvs.width) / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(s.points[0].x * cvs.width, s.points[0].y * cvs.height);
          s.points.forEach((p, i) => { if (i > 0) ctx.lineTo(p.x * cvs.width, p.y * cvs.height); });
          ctx.stroke();
        }
      }
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  useEffect(() => { redraw(); }, [dimensions, strokes]);

  const getPos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    const cx = e.touches && e.touches.length > 0 ? e.touches[0].clientX : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientX : e.clientX);
    const cy = e.touches && e.touches.length > 0 ? e.touches[0].clientY : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0].clientY : e.clientY);
    return { x: (cx - r.left) / r.width, y: (cy - r.top) / r.height };
  };

  const handleStart = (e) => {
    if (!canvasRef.current) return; const p = getPos(e);
    if (editingTextId) { setEditingTextId(null); return; }
    if (mode === 'text') { setTexts([...texts, { id: Date.now(), text: '', x: p.x, y: p.y, color: penColor }]); setEditingTextId(Date.now()); return; }
    if (mode !== 'draw' && mode !== 'eraser') return;
    const cvs = canvasRef.current;
    currentStroke.current = { type: mode, color: penColor, width: (mode === 'eraser' ? 0.05 : 0.01) / zoom, points: [p] };
    const ctx = cvs.getContext('2d'); ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over'; ctx.fillStyle = penColor;
    ctx.beginPath(); ctx.arc(p.x * cvs.width, p.y * cvs.height, (currentStroke.current.width * cvs.width) / 2, 0, Math.PI * 2); ctx.fill();
    if (e.target && e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
  };

  const handleMove = (e) => {
    if (dragRef.current) { 
      e.preventDefault(); 
      const p = getPos(e); 
      dragRef.current.moved = true;
      setTexts(texts.map(t => t.id === dragRef.current.id ? { ...t, x: p.x - dragRef.current.ox, y: p.y - dragRef.current.oy } : t)); 
      return; 
    }
    if (!currentStroke.current || !canvasRef.current) return;
    e.preventDefault(); const p = getPos(e); const pts = currentStroke.current.points; const prev = pts[pts.length - 1]; pts.push(p);
    const cvs = canvasRef.current; const ctx = cvs.getContext('2d');
    ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over'; ctx.strokeStyle = penColor; ctx.lineWidth = currentStroke.current.width * cvs.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(prev.x * cvs.width, prev.y * cvs.height); ctx.lineTo(p.x * cvs.width, p.y * cvs.height); ctx.stroke();
  };

  const handleEnd = (e) => {
    if (dragRef.current) dragRef.current = null;
    if (currentStroke.current) { setStrokes([...strokes, currentStroke.current]); setRedoStack([]); currentStroke.current = null; }
    if (e && e.target && e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const lastStroke = strokes[strokes.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastStroke]); 
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextStroke = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, nextStroke]); 
  };

  const handleClearAll = () => {
    if(window.confirm('書き込みをすべて消去しますか？')) {
      setStrokes([]); setTexts([]); setRedoStack([]); 
    }
  };

  const handleSaveImage = () => {
    try {
      const cvs = document.createElement('canvas');
      const MAX_SAVE_SIZE = 400;
      const scale = Math.min(MAX_SAVE_SIZE / dimensions.origW, MAX_SAVE_SIZE / dimensions.origH, 1);
      cvs.width = dimensions.origW * scale; cvs.height = dimensions.origH * scale;
      const ctx = cvs.getContext('2d'); 
      
      // ★ 透過画像の背景が真っ黒になるのを防ぐため、保存用画用紙を一度真っ白に塗る
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      
      ctx.drawImage(dimensions.img, 0, 0, cvs.width, cvs.height);
      
      strokes.forEach(s => {
        ctx.globalCompositeOperation = s.type === 'eraser' ? 'destination-out' : 'source-over'; ctx.strokeStyle = s.type === 'eraser' ? 'rgba(0,0,0,1)' : s.color;
        const w = s.width * cvs.width; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if(s.points.length > 0){
          ctx.beginPath();
          if (s.points.length === 1) {
            ctx.fillStyle = s.type === 'eraser' ? 'rgba(0,0,0,1)' : s.color;
            ctx.arc(s.points[0].x * cvs.width, s.points[0].y * cvs.height, w / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.moveTo(s.points[0].x * cvs.width, s.points[0].y * cvs.height);
            s.points.forEach((p, i) => { if(i>0) ctx.lineTo(p.x * cvs.width, p.y * cvs.height); });
            ctx.stroke();
          }
        }
      });

      ctx.globalCompositeOperation = 'source-over'; ctx.textBaseline = 'top';
      texts.forEach(t => {
        if (!t.text) return;
        const fSize = cvs.width * 0.04; ctx.font = `900 ${fSize}px sans-serif`; const lines = t.text.split('\n');
        let maxW = 0; lines.forEach(l => { maxW = Math.max(maxW, ctx.measureText(l).width); });
        const pad = fSize * 0.4; const rectW = maxW + pad * 2; const rectH = lines.length * fSize * 1.2 + pad * 2; const tx = t.x * cvs.width; const ty = t.y * cvs.height;
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(tx, ty, rectW, rectH); ctx.strokeStyle = t.color; ctx.lineWidth = Math.max(2, cvs.width * 0.004); ctx.strokeRect(tx, ty, rectW, rectH);
        ctx.fillStyle = t.color; lines.forEach((l, i) => ctx.fillText(l, tx + pad, ty + pad + (i * fSize * 1.2)));
      });
      
      const newDataUrl = cvs.toDataURL('image/jpeg', 0.5); 
      const newImages = Array.isArray(formData.images) ? [...formData.images] : [];
      newImages[markupModal.imgIndex] = newDataUrl;
      setFormData({...formData, images: newImages}); setMarkupModal({ isOpen: false, imgIndex: null, dataUrl: null });
    } catch (err) {
      alert("画像処理エラーが発生しました。もう一度お試しください。\n" + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-[150] flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-[2rem] p-3 flex flex-col gap-3 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-900/50 absolute top-4 bottom-4">
        <div className="flex justify-between items-center px-2 pt-1 shrink-0"><h3 className="font-black text-cyan-400 flex gap-2"><Edit3 size={18}/> MARKUP</h3><button onClick={() => setMarkupModal({ isOpen: false, imgIndex: null, dataUrl: null })} className="text-slate-500 hover:text-cyan-400"><X size={28}/></button></div>
        <div className="flex flex-col gap-2 bg-slate-800 p-2 rounded-xl shrink-0">
          <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded-lg border border-slate-700">
            <div className="flex gap-1"><button onClick={() => setMode('draw')} className={`p-2 rounded-md ${mode === 'draw' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500'}`}><PenTool size={16}/></button><button onClick={() => setMode('eraser')} className={`p-2 rounded-md ${mode === 'eraser' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500'}`}><Eraser size={16}/></button><button onClick={() => setMode('text')} className={`p-2 rounded-md ${mode === 'text' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-500'}`}><Type size={16}/></button></div>
            <div className="flex gap-2">{PEN_COLORS.map(c => <button key={c.id} onClick={() => { setPenColor(c.v); if(mode==='eraser'||mode==='move') setMode('draw'); }} className={`w-6 h-6 rounded-full ${c.tw} border-2 ${penColor === c.v ? 'border-white scale-110' : 'border-transparent opacity-50'} transition-all`} />)}</div>
          </div>
          <div className="flex justify-between items-center bg-slate-900 p-1.5 rounded-lg border border-slate-700">
            <button onClick={() => setMode('move')} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex gap-1 ${mode === 'move' ? 'bg-slate-800 text-cyan-400 border border-cyan-900' : 'text-slate-400'}`}><Move size={14}/> 移動</button>
            <div className="flex gap-2">
              <button onClick={handleUndo} disabled={strokes.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-300 bg-slate-800 disabled:opacity-30 border border-slate-700"><RotateCcw size={14}/>戻る</button>
              <button onClick={handleRedo} disabled={redoStack.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-300 bg-slate-800 disabled:opacity-30 border border-slate-700"><RotateCw size={14}/>進む</button>
              <button onClick={handleClearAll} disabled={strokes.length === 0 && texts.length === 0} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 text-slate-300 bg-slate-800 disabled:opacity-30 border border-slate-700"><Trash2 size={14}/>消去</button>
            </div>
          </div>
        </div>
        <div className="flex-1 relative flex justify-center items-center bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-slate-700" style={{ touchAction: 'none' }}>
          {dimensions ? (
            <div style={{ width: dimensions.dispW, height: dimensions.dispH, position: 'relative', transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
              <img src={markupModal.dataUrl} alt="base" style={{ width: '100%', height: '100%', display: 'block', opacity: 0.8, pointerEvents: 'none' }} />
              <canvas ref={canvasRef} width={dimensions.dispW} height={dimensions.dispH} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}
                className={`${mode === 'draw' ? 'cursor-crosshair' : mode === 'text' ? 'cursor-text' : mode === 'eraser' ? 'cursor-cell' : 'cursor-grab'}`}
                onPointerDown={handleStart} onPointerMove={handleMove} onPointerUp={handleEnd} onPointerLeave={handleEnd} />
              
              {/* ★ PCでもスマホでも確実に入力・ドラッグ移動できるテキスト処理 */}
              {texts.map(t => editingTextId === t.id ? (
                  <TextEditor key={t.id} t={t} texts={texts} setTexts={setTexts} setEditingTextId={setEditingTextId} zoom={zoom} dimensions={dimensions} />
                ) : (
                  <div key={t.id} 
                    onPointerDown={(e) => { 
                      e.stopPropagation(); 
                      dragRef.current = { id: t.id, ox: getPos(e).x - t.x, oy: getPos(e).y - t.y, moved: false }; 
                      if(e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
                    }} 
                    onPointerMove={(e) => {
                      if (dragRef.current && dragRef.current.id === t.id) {
                        e.stopPropagation(); e.preventDefault();
                        dragRef.current.moved = true;
                        const p = getPos(e);
                        setTexts(texts.map(x => x.id === t.id ? { ...x, x: p.x - dragRef.current.ox, y: p.y - dragRef.current.oy } : x));
                      }
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation();
                      if (dragRef.current && dragRef.current.id === t.id) {
                        const wasMoved = dragRef.current.moved;
                        dragRef.current = null;
                        if(e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
                        if (!wasMoved) setEditingTextId(t.id);
                      }
                    }}
                    style={{ position: 'absolute', left: `${t.x * 100}%`, top: `${t.y * 100}%`, color: t.color, fontSize: `${Math.max(16, dimensions.dispW * 0.04 / zoom)}px`, fontWeight: '900', cursor: 'move', zIndex: 40, whiteSpace: 'pre-wrap', lineHeight: '1.2', background: 'rgba(0,0,0,0.6)', border: `2px solid ${t.color}`, borderRadius: '8px', padding: '8px', pointerEvents: 'auto', touchAction: 'none', userSelect: 'none' }}
                  >{String(t.text)}</div>
                )
              )}
            </div>
          ) : <Loader2 size={24} className="animate-spin text-cyan-500"/>}
        </div>
        <div className="flex gap-2 items-center justify-center bg-slate-900 py-1.5 rounded-lg border border-slate-700 shadow-inner shrink-0">
          <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-1 text-slate-400 active:scale-95 hover:text-cyan-400"><ZoomOut size={16}/></button>
          <span className="text-[10px] font-black w-12 text-center text-cyan-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(4, z + 0.5))} className="p-1 text-slate-400 active:scale-95 hover:text-cyan-400"><ZoomIn size={16}/></button>
        </div>
        <button onClick={handleSaveImage} className="w-full shrink-0 bg-cyan-600 hover:bg-cyan-500 text-slate-900 py-4 rounded-2xl font-black uppercase shadow-lg active:scale-[0.98] transition-all mt-3">編集を確定する</button>
      </div>
    </div>
  );
};

const MemoCard = ({ memo, userSettings, onClick }) => {
  const gConf = userSettings.genres[memo.genre] || { colorId: 'gray', icon: 'Info' };
  const c = ColorMap[gConf.colorId] || ColorMap.gray;
  return (
    <div onClick={onClick} className="bg-slate-900/80 backdrop-blur-sm p-4 rounded-3xl border border-slate-700 relative overflow-hidden cursor-pointer active:scale-[0.98] hover:border-cyan-500/50 transition-all shadow-lg">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${c.bg} shadow-[0_0_10px_currentColor]`} />
      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1.5 font-black italic text-slate-500 text-[9px] uppercase pl-1 tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-700">{memo.date}</span>
              {memo.needsReview && !memo.isReviewed && <span className="bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded text-[8px] border border-red-500/50 flex items-center not-italic gap-0.5 shadow-md"><Bell size={8}/>要確認</span>}
              {memo.needsReview && memo.isReviewed && <span className="bg-green-950/80 text-green-400 px-1.5 py-0.5 rounded text-[8px] border border-green-500/50 flex items-center not-italic gap-0.5"><CheckSquare size={8}/>確認済</span>}
            </div>
          </div>
          <h3 className="font-black text-slate-100 text-base leading-tight mb-2 pl-2 truncate">{memo.title}</h3>
          <div className="flex gap-2 text-cyan-600 pl-2 mb-2">
            {memo.teacher && <span className="flex items-center gap-0.5 text-[9px] font-bold"><User size={10}/>{memo.teacher}</span>}
            {memo.materials?.length > 0 && <span className="flex items-center gap-0.5 text-[9px] font-bold"><Tags size={10} className="text-orange-400" />{memo.materials.length}</span>}
          </div>
          <div className="flex items-center justify-between text-[9px] font-black pt-2 border-t border-slate-800 pl-1">
            <span className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md text-slate-400 border border-slate-800 truncate max-w-[120px]"><MapPin size={10} className="text-cyan-500 shrink-0"/> <span className="truncate">{memo.site}</span></span>
            <span className={`px-2.5 py-1 rounded-md flex items-center gap-1 ${c.light} ${c.text} border ${c.border} uppercase shrink-0`}><DynamicIcon name={gConf.icon} size={10}/> {memo.genre}</span>
          </div>
        </div>
        {((memo.images?.length > 0) || memo.markupImage) && (
          <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-md relative">
            <img src={memo.markupImage || memo.images[0]} alt="thumb" className="w-full h-full object-cover opacity-80" />
            {memo.images?.length > 1 && <div className="absolute bottom-1 right-1 bg-slate-900/80 text-cyan-400 text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">+{memo.images.length - (memo.markupImage ? 0 : 1)}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

// --- App 本体 ---
export default function App() {
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

  const [showBossDefeat, setShowBossDefeat] = useState(false);
  const [bossExp, setBossExp] = useState(0);
  const [encounterMemo, setEncounterMemo] = useState(null);
  const [showTrophiesModal, setShowTrophiesModal] = useState(false); 
  const [markupModal, setMarkupModal] = useState({ isOpen: false, imgIndex: null, dataUrl: null });

  const uniqueSites = [...new Set(memos.map(m => String(m.site || "")).filter(Boolean))];
  const uniqueTitles = [...new Set(memos.map(m => String(m.title || "").replace(/\s+\d+$/, "")).filter(Boolean))];

  useEffect(() => {
    const initAuth = async () => { 
      try { 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth); 
        }
      } catch (e) { setError("SYSTEM ERROR."); } 
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsSyncing(true); setError(null); 
    const unsubscribeMemos = onSnapshot(collection(db, 'artifacts', currentAppId, 'public', 'data', 'memos'), 
      (snap) => {
        const sortedData = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        setMemos(sortedData);
        setIsSyncing(false);
        if (sortedData.length > 0 && !sessionStorage.getItem('encounteredToday')) {
          const pending = sortedData.filter(m => m.needsReview && !m.isReviewed);
          if (pending.length > 0 && Math.random() < 0.4) setEncounterMemo(pending[Math.floor(Math.random() * pending.length)]);
          sessionStorage.setItem('encounteredToday', 'true');
        }
      },
      () => { setError("SYNC FAILED."); setIsSyncing(false); }
    );
    const unsubscribeSettings = onSnapshot(doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user'), (d) => {
      if (d.exists()) {
        const data = d.data();
        let genresData = data.genres || defaultSettings.genres;
        let tagsData = data.tags || defaultSettings.tags;
        [genresData, tagsData].forEach(obj => Object.keys(obj).forEach((k, i) => {
          if (!obj[k].group || !MainCategories.includes(obj[k].group)) obj[k].group = 'その他';
          if (typeof obj[k].order !== 'number') obj[k].order = i;
        }));
        setUserSettings({ quickPhrases: data.quickPhrases || defaultSettings.quickPhrases, genres: genresData, tags: tagsData, stats: { ...defaultSettings.stats, ...(data.stats || {}) } });
      }
    });
    return () => { unsubscribeMemos(); unsubscribeSettings(); };
  }, [user]);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const initialForm = { title: '', site: '', genre: '', materials: [], content: '', date: new Date().toISOString().split('T')[0], images: [], teacher: '', needsReview: false, reviewDate: '', isReviewed: false };
  const [formData, setFormData] = useState(initialForm);

  const [showNewGenre, setShowNewGenre] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreGroup, setNewGenreGroup] = useState(MainCategories[0]);
  const [newGenreColor, setNewGenreColor] = useState('blue');
  const [newGenreIcon, setNewGenreIcon] = useState('Info');
  
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagGroup, setNewTagGroup] = useState(MainCategories[0]);
  const [newTagColor, setNewTagColor] = useState('gray');
  const [newTagIcon, setNewTagIcon] = useState('Tags');

  const loadDraft = () => {
    const draft = localStorage.getItem('voltVaultDraft');
    if (draft) {
      try {
        const p = JSON.parse(draft);
        if (p && typeof p === 'object') {
          const safeString = (val) => typeof val === 'string' ? val : '';
          const safeArray = (val) => Array.isArray(val) ? val.map(safeString).filter(Boolean) : [];
          setFormData({ 
            title: safeString(p.title), site: safeString(p.site), genre: safeString(p.genre), 
            materials: safeArray(p.materials), content: safeString(p.content), 
            date: safeString(p.date) || initialForm.date, images: safeArray(p.images),
            teacher: safeString(p.teacher), needsReview: Boolean(p.needsReview), reviewDate: safeString(p.reviewDate), isReviewed: Boolean(p.isReviewed)
          });
        } else { setFormData(initialForm); }
      } catch(e) { setFormData(initialForm); }
    } else { setFormData(initialForm); }
  };

  const sortedGenres = Object.entries(userSettings.genres || {}).map(([k, v]) => ({ key: k, ...v })).sort((a, b) => (a.order || 0) - (b.order || 0));
  const groupedGenresForm = MainCategories.map(cat => ({ category: cat, genres: sortedGenres.filter(g => g.group === cat) })).filter(g => g.genres.length > 0);
  const sortedTags = Object.entries(userSettings.tags || {}).map(([k, v]) => ({ key: k, ...v })).sort((a, b) => (a.order || 0) - (b.order || 0));
  const groupedTagsForm = MainCategories.map(cat => ({ category: cat, tags: sortedTags.filter(t => t.group === cat) })).filter(t => t.tags && t.tags.length > 0);

  useEffect(() => {
    if (view === 'add') {
      const timeoutId = setTimeout(() => localStorage.setItem('voltVaultDraft', JSON.stringify(formData)), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData, view]);

  useEffect(() => {
    if (view === 'add' && !formData.genre && Object.keys(userSettings.genres || {}).length > 0) setFormData(prev => ({ ...prev, genre: Object.keys(userSettings.genres)[0] }));
  }, [view, userSettings]);

  const escapeRegExp = (string) => String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const handleSave = async () => {
    if (!formData.title || formData.title.trim() === '') {
      alert("クエスト名（タイトル）を入力してください！");
      return;
    }
    if (!user) {
      alert("データベースの鍵（認証）を確認中です。数秒待ってからもう一度お試しください。");
      return;
    }

    const payloadSize = JSON.stringify(formData).length;
    if (payloadSize > 900000) { 
      alert(`データサイズ制限エラー（約${Math.round(payloadSize/1000)}KB）\n\nスマホの高画質カメラの影響で、1回の保存容量の限界を超えています。\n画像を減らすか、一度アプリを再読み込みしてください。`);
      return;
    }

    setIsSyncing(true);
    try {
      const isNew = view !== 'edit';
      const id = isNew ? `memo_${Date.now()}` : editingMemo.id;
      let finalTitle = String(formData.title).trim();
      if (isNew) {
        const regex = new RegExp(`^${String(finalTitle).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s+(\\d+))?$`);
        let maxNum = 0, hasBase = false;
        memos.filter(m => String(m.site || "") === String(formData.site || "")).forEach(m => {
          const match = String(m.title || "").match(regex);
          if (match) { hasBase = true; if (match[1]) { maxNum = Math.max(maxNum, parseInt(match[1], 10)); } else { maxNum = Math.max(maxNum, 1); } }
        });
        if (hasBase) finalTitle = `${finalTitle} ${maxNum + 1}`;
      }

      const memoToSave = {
        title: finalTitle, id: id, site: String(formData.site || ''), genre: String(formData.genre || ''), content: String(formData.content || ''),
        date: String(formData.date || ''), materials: Array.isArray(formData.materials) ? formData.materials.map(String) : [],
        images: Array.isArray(formData.images) ? formData.images.map(String) : [], teacher: String(formData.teacher || ''),
        needsReview: Boolean(formData.needsReview), reviewDate: String(formData.reviewDate || ''), isReviewed: Boolean(formData.isReviewed)
      };

      await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id), memoToSave, { merge: true });
      
      if (isNew) {
        const stats = userSettings.stats || defaultSettings.stats;
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = stats.streakDays || 0;
        if (stats.lastMemoDate !== todayStr) {
          newStreak = stats.lastMemoDate === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? newStreak + 1 : 1;
        }

        const newTotalMemos = memos.length + 1;
        const newExp = (newTotalMemos * 25) + (newStreak * 10) + (stats.bonusExp || 0);
        const newLevel = Math.floor(newExp / 100) + 1;
        
        if (newLevel > (stats.level || 1)) { setLevelUpData({ level: newLevel, title: getTitle(newLevel) }); setTimeout(() => setLevelUpData(null), 4000); }

        await saveSettings({ ...userSettings, stats: { ...stats, exp: newExp, level: newLevel, totalMemos: newTotalMemos, clipperDurability: Math.max(0, (stats.clipperDurability ?? 100) - 5), lastMemoDate: todayStr, streakDays: newStreak } });
        localStorage.removeItem('voltVaultDraft');
      }

      setView('list'); setFormData(initialForm); setShowAdvanced(false); setShowNewGenre(false); setShowNewTag(false);
    } catch (e) { 
      console.error(e);
      alert(`保存に失敗しました。\n通信環境を確認するか、画像サイズを減らしてください。\n詳細: ${e.message}`); 
      setTimeout(()=>setError(null), 5000); 
    } finally { setIsSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    setIsSyncing(true);
    try { await deleteDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id)); setView('list'); } 
    catch (e) { setError("DELETE FAILED."); setTimeout(()=>setError(null), 5000); } finally { setIsSyncing(false); }
  };

  const saveSettings = async (newSettings) => { setUserSettings(newSettings); await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'user'), newSettings); };

  const handleBossDefeat = async (siteName, memoCount) => {
    if (!window.confirm(`「${siteName}」の討伐（現場完了）を報告しますか？`)) return;
    const stats = userSettings.stats || defaultSettings.stats;
    const comps = stats.completedSites || [];
    if (comps.includes(siteName)) return;

    const bonus = memoCount * 50; 
    setBossExp(bonus); setShowBossDefeat(true);
    
    const newBonusExp = (stats.bonusExp || 0) + bonus;
    const newExp = (memos.length * 25) + ((stats.streakDays || 0) * 10) + newBonusExp;
    const newLevel = Math.floor(newExp / 100) + 1;

    await saveSettings({ ...userSettings, stats: { ...stats, exp: newExp, level: newLevel, bonusExp: newBonusExp, completedSites: [...comps, siteName] } });
    setTimeout(() => {
      setShowBossDefeat(false);
      if (newLevel > (stats.level || 1)) { setLevelUpData({ level: newLevel, title: getTitle(newLevel) }); setTimeout(() => setLevelUpData(null), 4000); }
    }, 3000);
  };

  const handleEditClick = () => { 
    setEditingMemo(selectedMemo); 
    const safeMemo = {
      title: String(selectedMemo.title || ''), site: String(selectedMemo.site || ''), genre: String(selectedMemo.genre || (Object.keys(userSettings.genres || {})[0]) || ''),
      content: String(selectedMemo.content || ''), date: String(selectedMemo.date || new Date().toISOString().split('T')[0]),
      materials: Array.isArray(selectedMemo.materials) ? selectedMemo.materials.filter(Boolean).map(String) : [],
      images: Array.isArray(selectedMemo.images) ? selectedMemo.images.filter(Boolean).map(String) : [],
      teacher: String(selectedMemo.teacher || ''), needsReview: Boolean(selectedMemo.needsReview), reviewDate: String(selectedMemo.reviewDate || ''), isReviewed: Boolean(selectedMemo.isReviewed)
    };
    if (selectedMemo.markupImage && safeMemo.images.length === 0) safeMemo.images.push(String(selectedMemo.markupImage));
    setFormData(safeMemo); 
    setView('edit'); 
  };

  const filteredMemos = memos.filter(m => {
    const matchSearch = String(m.title || "").includes(searchTerm) || String(m.site || "").includes(searchTerm) || (m.materials || []).some(mat => String(mat).includes(searchTerm)) || String(m.teacher || "").includes(searchTerm);
    return matchSearch && (dateRange.start ? (m.date || "") >= dateRange.start : true) && (dateRange.end ? (m.date || "") <= dateRange.end : true) && (filterPending ? (m.needsReview && !m.isReviewed) : true);
  }).sort((a, b) => sortOrder === 'newest' ? ((b.date || "").localeCompare(a.date || "") || (parseInt(String(b.id).split('_')[1]) || 0) - (parseInt(String(a.id).split('_')[1]) || 0)) : ((a.date || "").localeCompare(b.date || "") || (parseInt(String(a.id).split('_')[1]) || 0) - (parseInt(String(b.id).split('_')[1]) || 0)));

  const groupedMemos = filteredMemos.reduce((acc, memo) => {
    if (listMode === 'all') return acc;
    if (listMode === 'site') { const k = String(memo.site || 'NO SITE DATA'); acc[k] = acc[k] || []; acc[k].push(memo); }
    else if (listMode === 'genre') { const k = String(memo.genre || 'UNCLASSIFIED'); acc[k] = acc[k] || []; acc[k].push(memo); }
    else if (listMode === 'material') { (memo.materials?.length ? memo.materials : ['NO TAGS']).forEach(mat => { const k = String(mat); acc[k] = acc[k] || []; acc[k].push(memo); }); }
    return acc;
  }, {});

  const currentExp = (memos.length * 25) + ((userSettings.stats?.streakDays || 0) * 10) + (userSettings.stats?.bonusExp || 0);
  const currentLevel = Math.floor(currentExp / 100) + 1;
  const expPercentage = currentExp % 100;
  const pendingReviews = memos.filter(m => m.needsReview && !m.isReviewed);

  const getWeaponStyle = (level) => {
    if (level >= 50) return { bg: 'bg-cyan-900', text: 'text-cyan-300', border: 'border-cyan-400', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.8)]' };
    if (level >= 20) return { bg: 'bg-yellow-900', text: 'text-yellow-400', border: 'border-yellow-500', shadow: 'shadow-[0_0_15px_rgba(250,204,21,0.5)]' };
    if (level >= 10) return { bg: 'bg-orange-950', text: 'text-orange-400', border: 'border-orange-500', shadow: 'shadow-[0_0_10px_rgba(251,146,60,0.4)]' };
    return { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-600', shadow: 'shadow-md' };
  };
  const weaponStyle = getWeaponStyle(currentLevel);

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
            const MAX_WIDTH = 600; 
            const scale = Math.min(MAX_WIDTH / img.width, 1);
            canvas.width = img.width * scale; canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.4)); 
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    };
    const newImageUrls = await Promise.all(files.map(processFile));
    setFormData(prev => ({...prev, images: Array.isArray(prev.images) ? [...prev.images, ...newImageUrls] : [...newImageUrls]}));
    e.target.value = null; 
  };

  const handleMoveItem = (type, key, direction) => {
    const items = userSettings[type]; 
    const arr = Object.entries(items).map(([k, v]) => ({ key: k, ...v })).sort((a, b) => a.order - b.order);
    const index = arr.findIndex(item => item.key === key);
    if (index === -1) return;
    if (direction === 'up' && index > 0) { const temp = arr[index].order; arr[index].order = arr[index - 1].order; arr[index - 1].order = temp; } 
    else if (direction === 'down' && index < arr.length - 1) { const temp = arr[index].order; arr[index].order = arr[index + 1].order; arr[index + 1].order = temp; } 
    else { return; }
    const newItems = {}; arr.forEach(item => { const { key, ...rest } = item; newItems[key] = rest; });
    saveSettings({ ...userSettings, [type]: newItems });
  };

  const handleAddItem = (type, name, colorId, icon, group) => {
    const items = userSettings[type] || {};
    const maxOrder = Math.max(...Object.values(items).map(i => i.order || 0), -1);
    const newItem = { colorId, icon, group, order: maxOrder + 1 };
    saveSettings({ ...userSettings, [type]: { ...items, [name]: newItem } });
  };

  const handleUpdateItem = async (type, oldKey, newKey, colorId, icon, group) => {
    const items = userSettings[type];
    const oldOrder = items[oldKey].order;
    if (oldKey !== newKey && items[newKey]) { alert("WARNING: その名前はすでに登録されています！"); return; }
    const newItems = { ...items }; delete newItems[oldKey]; newItems[newKey] = { colorId, icon, group, order: oldOrder };
    await saveSettings({ ...userSettings, [type]: newItems });

    if (oldKey !== newKey) {
      setIsSyncing(true);
      try {
        const promises = memos.map(async (memo) => {
          let needsUpdate = false; let updatedData = {};
          if (type === 'genres' && memo.genre === oldKey) { needsUpdate = true; updatedData.genre = newKey; } 
          else if (type === 'tags' && memo.materials && memo.materials.includes(oldKey)) { needsUpdate = true; updatedData.materials = memo.materials.map(m => m === oldKey ? newKey : m); }
          if (needsUpdate) await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', memo.id), updatedData, { merge: true });
        });
        await Promise.all(promises);
      } catch (e) { console.error(e); } finally { setIsSyncing(false); }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-200 font-sans antialiased selection:bg-cyan-500/30 relative">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20" style={{ backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/80 to-slate-950"></div>

      <div className="relative z-10">
        <LevelUpModal levelUpData={levelUpData} />
        <TrophiesModal showTrophiesModal={showTrophiesModal} setShowTrophiesModal={setShowTrophiesModal} memos={memos} userSettings={userSettings} />
        {markupModal.isOpen && <MarkupModalCanvas markupModal={markupModal} setMarkupModal={setMarkupModal} formData={formData} setFormData={setFormData} />}

        {showBossDefeat && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-red-950/90 overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-red-500 animate-ping mix-blend-overlay opacity-20"></div>
            <div className="text-center animate-in zoom-in duration-500">
              <Zap size={120} className="text-yellow-400 mx-auto animate-pulse drop-shadow-[0_0_30px_rgba(250,204,21,1)]" fill="currentColor"/>
              <h1 className="text-5xl font-black text-white mt-4 italic tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,1)]">現場討伐完了!!</h1>
              <p className="text-yellow-400 font-black mt-4 text-2xl drop-shadow-md">BONUS EXP +{bossExp}</p>
            </div>
          </div>
        )}

        {encounterMemo && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_30px_rgba(239,68,68,0.5)]">
              <h3 className="text-red-400 font-black text-xl mb-2 animate-pulse flex items-center gap-2"><AlertCircle /> WARNING!</h3>
              <p className="text-slate-300 text-sm font-bold mb-4">野生の「未確認メモ」が飛び出してきた！</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 shadow-inner">
                <p className="text-cyan-400 font-black text-lg truncate">{String(encounterMemo.title)}</p>
                <p className="text-slate-500 text-xs mt-1 truncate">📍 {String(encounterMemo.site)}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEncounterMemo(null)} className="flex-1 bg-slate-800 text-slate-400 py-3 rounded-xl font-bold active:scale-95 transition-transform">逃げる</button>
                <button onClick={() => { setSelectedMemo(encounterMemo); setView('detail'); setEncounterMemo(null); }} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95 transition-transform">立ち向かう</button>
              </div>
            </div>
          </div>
        )}
        
        <header className="bg-slate-900 border-b border-cyan-500/30 text-white px-5 py-4 rounded-b-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] sticky top-0 z-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-5 pointer-events-none"><Zap size={150} className="-mt-10 -mr-10 rotate-12 text-cyan-400" /></div>
          <div className="flex justify-between items-center mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 bg-cyan-400 blur-md opacity-40 rounded-xl"></div>
                <img src="https://raw.githubusercontent.com/TEASTREAM-FURADIN/VoltVault/main/apple-touch-icon.png.png" alt="苦菩茶の極意" className="w-10 h-10 rounded-xl border border-cyan-400/60 object-cover relative z-10 shadow-[0_0_10px_rgba(0,0,0,0.8)]" onError={(e) => { e.target.src = '/apple-touch-icon.png'; }} />
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_2px_rgba(34,211,238,0.8)] pr-2">苦菩茶の極意</h1>
                <div className="flex items-center gap-1 text-[8px] font-black text-cyan-600 mt-1 uppercase tracking-widest">
                  {isSyncing ? <Loader2 size={8} className="animate-spin" /> : <Cloud size={8} />} {user ? `SYSTEM ONLINE` : "CONNECTING..."}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setView('list'); setFilterPending(!filterPending); }} className={`p-2.5 rounded-xl shadow-lg transition-all relative ${filterPending ? 'bg-red-500 text-slate-900 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-cyan-400 hover:text-white border border-cyan-900'}`}>
                <Bell size={22} />
                {pendingReviews.length > 0 && !filterPending && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-slate-900">{pendingReviews.length}</span>}
              </button>
              <button onClick={() => { loadDraft(); setShowAdvanced(false); setShowNewGenre(false); setShowNewTag(false); setView('add'); }} className={`${weaponStyle.bg} ${weaponStyle.text} p-2.5 rounded-xl ${weaponStyle.shadow} border ${weaponStyle.border} active:scale-90 hover:scale-105 transition-all`}><ClipperIcon size={22} /></button>
            </div>
          </div>

          <div onClick={() => setShowTrophiesModal(true)} className="bg-slate-950/50 rounded-xl p-2 mb-3 backdrop-blur-md border border-cyan-900/50 shadow-inner relative z-10 cursor-pointer hover:bg-slate-900/80 active:scale-[0.98] transition-all">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-[0_0_5px_rgba(234,179,8,0.3)]"><Trophy size={10}/> Lv.{Number(currentLevel)}</span>
                <span className="text-[10px] font-bold text-cyan-50 tracking-wide truncate max-w-[120px]">{String(getTitle(currentLevel))}</span>
                {(userSettings.stats?.streakDays || 0) > 0 && <span className="bg-orange-500/20 border border-orange-500 text-orange-400 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-[0_0_5px_rgba(249,115,22,0.3)]"><Flame size={10}/> {Number(userSettings.stats.streakDays)}連コンボ</span>}
              </div>
              <span className="text-[8px] font-bold text-cyan-600 uppercase tracking-widest">DATA: {Number(memos.length)}</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1.5 rounded-full transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ width: `${expPercentage}%` }}><div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div></div>
            </div>
          </div>

          {view === 'list' && (
            <div className="space-y-2 animate-in slide-in-from-top-2 relative z-10">
              <div className="flex bg-slate-950/50 p-1 rounded-xl backdrop-blur-sm border border-slate-800">
                {['all', 'site', 'genre', 'material'].map(mode => (
                  <button key={mode} onClick={() => setListMode(mode)} className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all ${listMode === mode ? 'bg-cyan-600 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'text-slate-400 hover:text-cyan-400'}`}>
                    {mode === 'all' ? '全て' : mode === 'site' ? '現場別' : mode === 'genre' ? 'ジャンル' : '材料別'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2 text-cyan-600" size={16} />
                  <input type="text" placeholder="SEARCH DATABANKS..." className="w-full bg-slate-900 rounded-xl py-2 pl-9 text-cyan-50 placeholder-slate-600 outline-none text-xs font-bold focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 border border-slate-700 transition-all shadow-inner uppercase tracking-wider" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <button onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} className="bg-slate-800 border border-slate-700 px-3 rounded-xl text-[10px] font-black text-cyan-400 hover:bg-slate-700 whitespace-nowrap flex items-center gap-1">{sortOrder === 'newest' ? '▼ 新しい順' : '▲ 古い順'}</button>
              </div>
              <div className="flex gap-2 items-center bg-slate-950/50 p-1.5 rounded-xl backdrop-blur-sm border border-slate-800">
                <Calendar size={14} className="text-cyan-600 ml-1 shrink-0" />
                <input type="date" className="bg-transparent text-cyan-100 text-[10px] outline-none font-bold flex-1 w-full" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
                <span className="text-cyan-600 text-[10px] font-black shrink-0">〜</span>
                <input type="date" className="bg-transparent text-cyan-100 text-[10px] outline-none font-bold flex-1 w-full" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
              </div>
              {error && <div className="bg-red-950/50 border border-red-500/50 text-red-400 p-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mt-1 shadow-[0_0_10px_rgba(239,68,68,0.2)]"><AlertCircle size={12}/> {String(error)}</div>}
            </div>
          )}
        </header>

        {/* メイン画面群（List, Stats, Settings） */}
        <main className="p-4 max-w-xl mx-auto relative z-10">
          {view === 'list' && (
            <div className="space-y-4">
              {listMode === 'all' ? (
                <div className="space-y-3">
                  {filteredMemos.length === 0 && !isSyncing && !error && (
                    <div className="text-center py-24 opacity-30"><ClipperIcon size={64} className="mx-auto mb-3 text-cyan-500"/><p className="text-sm font-black uppercase italic tracking-widest text-cyan-600">NO DATA LOGGED</p></div>
                  )}
                  {filteredMemos.map(memo => (
                    <MemoCard key={memo.id} memo={memo} userSettings={userSettings} onClick={() => { setSelectedMemo(memo); setView('detail'); }} />
                  ))}
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
                          {String(groupKey)}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold bg-slate-800 border border-slate-600 text-cyan-400 px-2 py-1 rounded-full shadow-inner">{Number(groupMemos.length)} FILES</span>
                          {listMode === 'site' && groupKey !== 'NO SITE DATA' && !(userSettings.stats?.completedSites || []).includes(groupKey) && (
                            <button onClick={(e) => { e.stopPropagation(); handleBossDefeat(groupKey, groupMemos.length); }} className="bg-red-900/50 text-red-400 border border-red-500 text-[9px] font-black px-2 py-1 rounded-md shadow-[0_0_10px_rgba(239,68,68,0.3)] active:scale-95 flex items-center gap-1"><Skull size={10}/>討伐</button>
                          )}
                          {listMode === 'site' && (userSettings.stats?.completedSites || []).includes(groupKey) && (
                            <span className="bg-green-900/30 text-green-500 border border-green-500/50 text-[9px] font-black px-2 py-1 rounded-md shadow-inner flex items-center gap-1"><Check size={10}/>討伐済</span>
                          )}
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {groupMemos.map(memo => (
                          <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="p-2.5 bg-slate-800/50 rounded-xl cursor-pointer active:bg-slate-800 flex justify-between items-center border border-transparent hover:border-cyan-500/30 transition-colors gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-200 flex items-center gap-1 truncate">
                                {memo.needsReview && !memo.isReviewed && <Bell size={10} className="text-red-500 drop-shadow-[0_0_3px_rgba(239,68,68,0.8)] shrink-0"/>}
                                <span className="truncate">{String(memo.title)}</span>
                              </p>
                              <p className="text-[8px] font-bold text-slate-500 mt-1 flex gap-2">
                                {listMode !== 'site' && <span className="truncate">📍{String(memo.site)}</span>}
                                {listMode !== 'genre' && <span className="truncate">🏷️{String(memo.genre)}</span>}
                                <span className="text-cyan-800 shrink-0">{String(memo.date)}</span>
                              </p>
                            </div>
                            {((memo.images && memo.images.length > 0) || memo.markupImage) && (
                              <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-slate-600 shadow-sm">
                                <img src={memo.markupImage || memo.images[0]} alt="thumbnail" className="w-full h-full object-cover opacity-80" />
                              </div>
                            )}
                            <ChevronRight size={14} className="text-slate-600 shrink-0"/>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {view === 'stats' && (
            <div className="space-y-6 pb-10 animate-in slide-in-from-bottom-4">
              <h2 className="text-xl font-black text-cyan-400 flex items-center gap-2 mb-4 tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><Activity className="text-cyan-500"/> MASTER STATUS</h2>
              <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <h3 className="text-center text-xs font-black text-slate-400 tracking-widest mb-6">SKILL ANALYSIS</h3>
                <RadarChart memos={memos} userSettings={userSettings} />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center"><p className="text-[10px] font-black text-cyan-700 mb-1">TOTAL LOGS</p><p className="text-3xl font-black text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">{Number(memos.length)}</p></div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center"><p className="text-[10px] font-black text-yellow-600 mb-1">CURRENT LEVEL</p><p className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]">{Number(currentLevel)}</p></div>
                </div>
              </div>
              <div className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <h3 className="text-center text-xs font-black text-slate-400 tracking-widest mb-4">WEAPON MAINTENANCE</h3>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner flex flex-col items-center relative overflow-hidden">
                  <ClipperIcon size={48} className={`mb-4 ${weaponStyle.text} ${weaponStyle.shadow} transition-all duration-1000`} />
                  <p className="text-xs font-black text-slate-300 mb-2 tracking-widest">耐久度 / 切れ味</p>
                  <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full transition-all duration-500 ${(userSettings.stats?.clipperDurability ?? 100) > 50 ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : (userSettings.stats?.clipperDurability ?? 100) > 20 ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'}`} style={{ width: `${userSettings.stats?.clipperDurability ?? 100}%` }}></div>
                  </div>
                  <button onClick={() => { if ((userSettings.stats?.clipperDurability ?? 100) >= 100) return alert('今のところ完璧な切れ味です！'); saveSettings({ ...userSettings, stats: { ...userSettings.stats, clipperDurability: 100 } }); alert('メンテナンス完了！'); }} className="w-full bg-slate-800 border border-slate-600 text-cyan-400 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-[0.98] hover:bg-slate-700 transition-all flex justify-center items-center gap-2 shadow-md"><Wrench size={16}/> 研磨・注油する</button>
                </div>
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="space-y-6 pb-10 animate-in slide-in-from-right">
              <h2 className="text-xl font-black text-cyan-400 flex items-center gap-2 mb-4 tracking-widest drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"><Settings className="text-cyan-500"/> MASTER SETTINGS</h2>
              <EditorSection title="ジャンル編集" icon={ListFilter} items={userSettings.genres} placeholder="新ジャンル名..." onAdd={(name, colorId, icon, group) => handleAddItem('genres', name, colorId, icon, group)} onUpdate={(oldKey, newKey, colorId, icon, group) => handleUpdateItem('genres', oldKey, newKey, colorId, icon, group)} onDelete={(name) => { const obj = {...userSettings.genres}; delete obj[name]; saveSettings({...userSettings, genres: obj}); }} onMoveUp={(name) => handleMoveItem('genres', name, 'up')} onMoveDown={(name) => handleMoveItem('genres', name, 'down')} />
              <EditorSection title="材料・タグ編集" icon={Tags} items={userSettings.tags} placeholder="新しい材料・タグ..." onAdd={(name, colorId, icon, group) => handleAddItem('tags', name, colorId, icon, group)} onUpdate={(oldKey, newKey, colorId, icon, group) => handleUpdateItem('tags', oldKey, newKey, colorId, icon, group)} onDelete={(name) => { const obj = {...userSettings.tags}; delete obj[name]; saveSettings({...userSettings, tags: obj}); }} onMoveUp={(name) => handleMoveItem('tags', name, 'up')} onMoveDown={(name) => handleMoveItem('tags', name, 'down')} />
              <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)] space-y-4">
                <h3 className="text-sm font-black text-cyan-400 border-b border-slate-700 pb-2 flex items-center gap-2 tracking-widest"><Type size={16}/> クイックフレーズ編集</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.isArray(userSettings.quickPhrases) && userSettings.quickPhrases.map((phrase, idx) => (
                    typeof phrase === 'string' ? <span key={idx} className="bg-slate-900 text-cyan-100 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-600 shadow-inner">{String(phrase)} <button onClick={() => saveSettings({...userSettings, quickPhrases: userSettings.quickPhrases.filter((_, i) => i !== idx)})} className="text-slate-500 hover:text-red-500 transition-colors"><X size={12}/></button></span> : null
                  ))}
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2 shadow-inner">
                  <input id="newPhraseInput" type="text" placeholder="新しいフレーズ..." className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-sm font-bold text-cyan-50 outline-none placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                  <button onClick={() => { const input = document.getElementById('newPhraseInput'); if (input.value.trim()) { saveSettings({ ...userSettings, quickPhrases: [...userSettings.quickPhrases, input.value.trim()] }); input.value = ''; } }} className="w-full bg-slate-800 border border-cyan-500/50 text-cyan-400 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(34,211,238,0.2)] active:scale-[0.98] hover:bg-slate-700 transition-all flex justify-center items-center gap-2"><Sword size={14}/>装備に追加</button>
                </div>
              </div>
              <div className="text-center py-4 opacity-30"><Gamepad2 size={32} className="mx-auto text-cyan-600 mb-2"/><p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">ELECTRIC CLIPPER MASTER v3.0</p></div>
            </div>
          )}
        </main>

        {/* ★ 独立・最前面化された 詳細表示画面（ヘッダーに隠れない） */}
        {view === 'detail' && selectedMemo && (
          <div className="fixed inset-0 bg-slate-950 z-[100] overflow-y-auto pb-32 animate-in slide-in-from-right duration-300">
            <header className={`${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.bg || 'bg-slate-800'} text-slate-900 p-6 flex justify-between items-center sticky top-0 rounded-b-[2.5rem] shadow-[0_0_20px_rgba(0,0,0,0.8)] border-b border-white/20 relative overflow-hidden z-20`}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
              <button onClick={() => setView('list')} className="relative z-10 p-2 bg-black/20 rounded-full text-white backdrop-blur-sm active:scale-90"><ChevronLeft size={28}/></button>
              <h2 className="font-black italic text-[10px] tracking-widest uppercase relative z-10 opacity-80 text-white drop-shadow-md">DECRYPTED DATA</h2>
              <button onClick={handleEditClick} className="relative z-10 p-2 bg-black/20 rounded-full text-white backdrop-blur-sm active:scale-90"><Edit3 size={24}/></button>
            </header>
            <div className="p-8 space-y-8 max-w-xl mx-auto relative z-10">
              <div className="space-y-4 relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-cyan-900/30 rounded-full"></div>
                <div className="flex gap-2 items-center mb-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.light} ${ColorMap[userSettings.genres[selectedMemo.genre]?.colorId || 'gray']?.text} border shadow-inner`}><DynamicIcon name={userSettings.genres[selectedMemo.genre]?.icon} size={14}/> {String(selectedMemo.genre)}</span>
                </div>
                <h2 className="text-3xl font-black text-slate-100 leading-tight tracking-tighter drop-shadow-md">{String(selectedMemo.title)}</h2>
                <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-inner">
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-cyan-500"/> {String(selectedMemo.site)}</span><span className="flex items-center gap-1.5"><Calendar size={12} className="text-cyan-500"/> {String(selectedMemo.date)}</span>
                </div>
                {(selectedMemo.teacher || selectedMemo.needsReview) && (
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold mt-2">
                    {selectedMemo.teacher && <span className="bg-slate-800 text-cyan-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-600 shadow-sm"><User size={12} className="text-cyan-500"/> 伝授: {String(selectedMemo.teacher)}</span>}
                    {selectedMemo.needsReview && !selectedMemo.isReviewed && <span className="bg-red-950 text-red-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]"><Bell size={12}/> 要確認 ({String(selectedMemo.reviewDate) || '期限なし'})</span>}
                    {selectedMemo.needsReview && selectedMemo.isReviewed && <span className="bg-green-950 text-green-400 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-green-500/50 shadow-sm"><CheckSquare size={12}/> 確認完了</span>}
                  </div>
                )}
                {selectedMemo.materials && selectedMemo.materials.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedMemo.materials.map((mat, i) => {
                      const tagConf = userSettings.tags[mat] || { colorId: 'gray', icon: 'Tag' }; const tColor = ColorMap[tagConf.colorId] || ColorMap.gray;
                      return <span key={i} className={`${tColor.light} ${tColor.text} ${tColor.border} border px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-sm`}><DynamicIcon name={tagConf.icon} size={12}/> {String(mat)}</span>
                    })}
                  </div>
                )}
              </div>
              {((selectedMemo.images && selectedMemo.images.length > 0) || selectedMemo.markupImage) && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-cyan-600 flex items-center gap-1 tracking-widest"><Camera size={14}/> VISUAL DATA</h3>
                  <div className="flex flex-col gap-4">
                    {selectedMemo.markupImage && (!selectedMemo.images || selectedMemo.images.length===0) && <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)]"><img src={selectedMemo.markupImage} className="w-full opacity-90" /></div>}
                    {selectedMemo.images && selectedMemo.images.map((img, i) => <div key={i} className="bg-slate-900 rounded-[2.5rem] overflow-hidden border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] relative"><img src={img} className="w-full h-auto object-cover opacity-90" /></div>)}
                  </div>
                </div>
              )}
              <div className="bg-slate-900 p-8 rounded-[3rem] text-cyan-50 font-medium border border-cyan-900/50 leading-relaxed relative shadow-[0_0_20px_rgba(6,182,212,0.1)] whitespace-pre-wrap">
                <span className="absolute -top-3 left-10 bg-cyan-600 text-slate-900 px-4 py-1 rounded-full text-[10px] not-italic shadow-[0_0_8px_rgba(6,182,212,0.8)] tracking-widest font-black uppercase">Quest Log</span>
                {String(selectedMemo.content || '')}
              </div>
            </div>
          </div>
        )}

        {/* ★ 独立・最前面化された 追加・編集フォーム画面 */}
        {(view === 'add' || view === 'edit') && (
          <div className="fixed inset-0 bg-slate-950 z-[100] overflow-y-auto pb-32 animate-in slide-in-from-bottom-10">
            <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{ backgroundImage: `linear-gradient(to right, #facc15 1px, transparent 1px), linear-gradient(to bottom, #facc15 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
            <header className="bg-slate-900/90 backdrop-blur-md border-b border-yellow-500/30 p-5 flex justify-between items-center sticky top-0 shadow-[0_0_20px_rgba(234,179,8,0.15)] z-20">
              <button onClick={() => setView('list')} className="text-slate-400 hover:text-yellow-400 active:scale-90 transition-all"><X size={24}/></button>
              <h2 className="font-black text-yellow-400 tracking-tighter italic flex items-center gap-2 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]"><ClipperIcon size={18} strokeWidth={2.5}/> RECORD NEW DATA...</h2>
              <button onClick={handleSave} className="relative group overflow-hidden bg-slate-800 text-cyan-400 px-5 py-2.5 rounded-full font-black text-[10px] uppercase shadow-[0_0_15px_rgba(34,211,238,0.3)] border border-cyan-500/50 disabled:opacity-50 active:scale-95 transition-all">
                <span className="relative z-10 flex items-center gap-1.5"><ClipperIcon size={14}/> ログを刻印</span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </header>
            
            <div className="p-6 space-y-7 max-w-xl mx-auto relative z-10">
              {view === 'add' && (formData.title || formData.content || formData.images?.length > 0) && (
                <div className="flex justify-end mb-[-1rem]">
                  <button onClick={() => { if (window.confirm('入力内容をすべてリセットしますか？')) { setFormData(initialForm); localStorage.removeItem('voltVaultDraft'); } }} className="text-[10px] text-red-400 font-bold border border-red-500/50 px-2.5 py-1.5 rounded-md bg-red-950/50 shadow-sm active:scale-95"><Trash2 size={12} className="inline mr-1"/>一時保存をクリア</button>
                </div>
              )}

              <div className="space-y-4">
                <input list="title-history" className="w-full text-2xl font-black bg-transparent border-b-2 border-slate-700 py-2 text-slate-100 focus:border-cyan-400 outline-none transition-colors placeholder:text-slate-600" placeholder="クエスト名（作業・タイトル）" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                <datalist id="title-history">{uniqueTitles.map(t => <option key={t} value={t} />)}</datalist>

                <div className="grid grid-cols-2 gap-4">
                  <input type="date" className="p-3 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 shadow-inner focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} />
                  <div className="relative flex items-center">
                    <select className="p-3 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 shadow-inner w-full focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none" value={formData.genre || ''} onChange={e => setFormData({...formData, genre: e.target.value})}>
                      {groupedGenresForm.map(({ category, genres }) => (<optgroup key={category} label={`【${String(category)}】`}>{genres.map(g => <option key={g.key} value={g.key}>{String(g.key)}</option>)}</optgroup>))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 text-slate-500 pointer-events-none"/>
                    <button type="button" onClick={() => setShowNewGenre(!showNewGenre)} className="absolute -top-2 -right-2 bg-slate-800 text-cyan-400 rounded-full p-1.5 shadow-[0_0_8px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:bg-slate-700 active:scale-95 transition-all"><Plus size={14}/></button>
                  </div>
                </div>

                {showNewGenre && (
                  <div className="bg-cyan-950/30 p-3 rounded-2xl border border-cyan-900 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 shadow-inner">
                    <div className="flex gap-2">
                      <select value={newGenreGroup} onChange={e=>setNewGenreGroup(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 shrink-0 w-24">
                        {MainCategories.map(c => <option key={c} value={c}>{String(c)}</option>)}
                      </select>
                      <input type="text" placeholder="新ジャンル名" value={newGenreName} onChange={e=>setNewGenreName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-bold text-cyan-50 outline-none focus:border-cyan-500 min-w-0" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <ColorSelector value={newGenreColor} onChange={setNewGenreColor} />
                      <IconSelector value={newGenreIcon} onChange={setNewGenreIcon} />
                      <button type="button" onClick={() => { if(newGenreName.trim()) { handleAddItem('genres', newGenreName.trim(), newGenreColor, newGenreIcon, newGenreGroup); setFormData({...formData, genre: newGenreName.trim()}); setNewGenreName(''); setNewGenreColor('blue'); setNewGenreIcon('Info'); setShowNewGenre(false); } }} className="bg-cyan-600 text-slate-900 px-4 py-2.5 rounded-xl text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.5)] active:scale-95 shrink-0">追加</button>
                    </div>
                  </div>
                )}

                <div className="relative shadow-inner rounded-2xl">
                  <Building className="absolute left-3 top-3.5 text-cyan-700" size={16}/>
                  <input list="site-history" className="w-full p-3 pl-10 bg-slate-900 border border-slate-700 rounded-2xl font-bold outline-none text-sm text-cyan-50 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500" placeholder="ダンジョン名（現場・案件）" value={formData.site || ''} onChange={e => setFormData({...formData, site: e.target.value})} />
                  <datalist id="site-history">{uniqueSites.map(s => <option key={s} value={s} />)}</datalist>
                </div>
              </div>

              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-4 rounded-[2rem] border border-slate-700 shadow-lg">
                <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full flex justify-between items-center text-xs font-black text-cyan-600 py-1"><span className="flex items-center gap-1.5 tracking-widest"><Info size={14}/> ADVANCED SETTINGS</span>{showAdvanced ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>
                {showAdvanced && (
                  <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                    <div className="relative shadow-inner rounded-2xl"><User className="absolute left-3 top-3.5 text-cyan-700" size={16}/><input className="w-full p-3 pl-10 bg-slate-950 border border-slate-800 rounded-2xl font-bold outline-none text-sm text-cyan-50 focus:border-cyan-500 transition-colors" placeholder="教えてくれた人（師匠・先輩など）" value={formData.teacher || ''} onChange={e => setFormData({...formData, teacher: e.target.value})} /></div>
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 shadow-inner">
                      <label className="flex items-center gap-3 cursor-pointer group"><div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${formData.needsReview ? 'bg-cyan-600 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 border-slate-600 group-hover:border-cyan-500'}`}>{formData.needsReview && <Check size={14} className="text-slate-900" strokeWidth={4}/>}</div><input type="checkbox" checked={formData.needsReview || false} onChange={e => setFormData({...formData, needsReview: e.target.checked})} className="hidden" /><span className="text-xs font-black text-slate-300 group-hover:text-cyan-100 transition-colors">後で確認・復習が必要</span></label>
                      {formData.needsReview && (
                        <div className="pl-8 space-y-4 animate-in fade-in">
                          <div className="flex items-center gap-2"><Bell size={14} className="text-orange-500 shrink-0 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]"/><input type="date" className="p-2 bg-slate-900 border border-slate-700 rounded-xl font-bold outline-none text-xs text-cyan-50 shadow-inner w-full focus:border-orange-500 focus:ring-1 focus:ring-orange-500" value={formData.reviewDate || ''} onChange={e => setFormData({...formData, reviewDate: e.target.value})} /><span className="text-[10px] text-slate-500 font-bold shrink-0">にお知らせ</span></div>
                          <label className="flex items-center gap-3 cursor-pointer group"><div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${formData.isReviewed ? 'bg-green-500 border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-800 border-slate-600 group-hover:border-green-500'}`}>{formData.isReviewed && <Check size={14} className="text-slate-900" strokeWidth={4}/>}</div><input type="checkbox" checked={formData.isReviewed || false} onChange={e => setFormData({...formData, isReviewed: e.target.checked})} className="hidden" /><span className="text-xs font-black text-slate-300 group-hover:text-green-100 transition-colors">確認完了（クリア！）</span></label>
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
                  <div className="bg-cyan-950/30 p-3 rounded-2xl border border-cyan-900 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 shadow-inner">
                    <div className="flex gap-2">
                      <select value={newTagGroup} onChange={e=>setNewTagGroup(e.target.value)} className="bg-slate-900 border border-slate-700 p-2 rounded-xl text-[10px] sm:text-xs font-bold text-slate-200 outline-none focus:border-cyan-500 shrink-0 w-24">{MainCategories.map(c => <option key={c} value={c}>{String(c)}</option>)}</select>
                      <input type="text" placeholder="新タグ名" value={newTagName} onChange={e=>setNewTagName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-xs font-bold text-cyan-50 outline-none focus:border-cyan-500 min-w-0" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <ColorSelector value={newTagColor} onChange={setNewTagColor} />
                      <IconSelector value={newTagIcon} onChange={setNewTagIcon} />
                      <button type="button" onClick={() => { if(newTagName.trim()) { handleAddItem('tags', newTagName.trim(), newTagColor, newTagIcon, newTagGroup); const mats = formData.materials || []; if (!mats.includes(newTagName.trim())) { setFormData({...formData, materials: [...mats, newTagName.trim()]}); } setNewTagName(''); setNewTagColor('gray'); setNewTagIcon('Tags'); setShowNewTag(false); } }} className="bg-cyan-600 text-slate-900 px-4 py-2.5 rounded-xl text-xs font-black shadow-[0_0_10px_rgba(6,182,212,0.5)] active:scale-95 shrink-0">追加</button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-2">{groupedTagsForm.map(({ category, tags }) => <TagAccordion key={category} groupName={`【${String(category)}】`} tags={tags} formData={formData} setFormData={setFormData} />)}</div>
              </div>
              
              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-5 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <div className="flex justify-between items-center text-[10px] font-black text-cyan-600 mb-2 tracking-widest"><span className="flex items-center gap-1"><Camera size={14}/> VISUAL EVIDENCE</span><label className="text-slate-900 bg-cyan-600 px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-[0_0_10px_rgba(6,182,212,0.4)] hover:bg-cyan-500"><Upload size={14}/> 撮影 / 一括追加<input type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" /></label></div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {!formData.images || formData.images.length === 0 ? (
                    <div className="w-full flex-shrink-0 h-32 border-2 border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 font-bold text-xs bg-slate-950/50 shadow-inner"><ImageIcon size={24} className="mb-2 opacity-50"/> 現場の様子を記録しましょう</div>
                  ) : (
                    Array.isArray(formData.images) && formData.images.map((img, i) => (
                      typeof img === 'string' ? (
                        <div key={i} className="relative w-48 flex-shrink-0 snap-center group">
                          <img src={img} className="w-full h-32 object-cover rounded-[1.5rem] border border-slate-700 shadow-lg cursor-pointer opacity-90 hover:opacity-100 transition-opacity" onClick={() => setMarkupModal({ isOpen: true, imgIndex: i, dataUrl: img })} />
                          <button type="button" onClick={() => { const newImgs = [...formData.images]; newImgs.splice(i, 1); setFormData({...formData, images: newImgs}); }} className="absolute -top-2 -right-2 bg-red-500 text-slate-900 p-1.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"><X size={14}/></button>
                          <div className="absolute bottom-2 right-2 bg-cyan-900/80 text-cyan-100 p-1.5 rounded-full pointer-events-none border border-cyan-500"><Edit3 size={12}/></div>
                        </div>
                      ) : null
                    ))
                  )}
                </div>
              </div>
              
              <div className="space-y-3 bg-slate-900/80 backdrop-blur-sm p-5 rounded-[2.5rem] border border-slate-700 shadow-lg">
                <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-800">
                  {Array.isArray(userSettings.quickPhrases) && userSettings.quickPhrases.map((p, idx) => (
                    typeof p === 'string' ? <button key={idx} type="button" onClick={() => setFormData({...formData, content: formData.content + (formData.content?'\n':'') + p})} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-100 rounded-xl text-[10px] border border-slate-600 font-black transition-colors shadow-inner">+ {String(p)}</button> : null
                  ))}
                </div>
                <textarea className="w-full h-40 pt-2 bg-transparent outline-none text-sm font-medium leading-relaxed resize-none text-cyan-50 placeholder:text-slate-600" placeholder="攻略のヒント、配線の色、次回への引き継ぎ事項などを記録..." value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              
              {view === 'edit' && <button type="button" onClick={() => handleDelete(selectedMemo.id)} className="w-full py-5 text-red-500 font-black text-xs border-2 border-red-900/50 border-dashed rounded-[2.5rem] uppercase tracking-widest hover:bg-red-950 transition-all mt-8 shadow-inner">クエストを破棄する</button>}
            </div>
          </div>
        )}
      </div>

      {!markupModal.isOpen && view !== 'add' && view !== 'edit' && view !== 'detail' && <NavBtn view={view} setView={setView} />}
    </div>
  );
}
