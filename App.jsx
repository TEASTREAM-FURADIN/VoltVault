import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Calendar, MapPin, Tag, Search, ChevronLeft, ClipboardList, HardHat, 
  Image as ImageIcon, Save, X, Map as MapIcon, Edit3, Trash2, Check, 
  Wrench, Layers, ChevronRight, ListChecks, Settings, Palette, AlertCircle, 
  Star, MousePointer2, Type, Box, Clock, Cloud, CloudOff, Loader2
} from 'lucide-react';

// Firebase 関連のインポート
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, onSnapshot, query, deleteDoc } from 'firebase/firestore';

// --- 社長から提供された Firebase 設定 (本番配線) ---
const firebaseConfig = {
  apiKey: "AIzaSyDMOwQv6Np1N38y8ecJSXCRDZ4G89wccnM",
  authDomain: "electricity-gokui.firebaseapp.com",
  projectId: "electricity-gokui",
  storageBucket: "electricity-gokui.firebasestorage.app",
  messagingSenderId: "910125375437",
  appId: "1:910125375437:web:a40c27cd1f932c2e726e84"
};

// 初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 環境から appId を取得（なければプロジェクト ID を代用）
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;

const App = () => {
  // --- 状態管理 ---
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); 
  const [activeTab, setActiveTab] = useState('genre');
  const [selectedMemo, setSelectedMemo] = useState(null);
  const [editingMemo, setEditingMemo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState(null);
  const [materialFilter, setMaterialFilter] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  // --- マスターデータとメモデータ ---
  const [genreSettings, setGenreSettings] = useState({});
  const [materialsMaster, setMaterialsMaster] = useState([]);
  const [memos, setMemos] = useState([]);
  const [globalTags] = useState(['重要', '注意', 'コツ', '隠蔽部', '雨天注意']);

  const quickPhrases = ["通電確認OK", "絶縁抵抗計 測定済み", "盤内清掃完了", "端子増し締め確認", "相色確認OK"];

  // --- 1. Firebase 認証 (RULE 3) ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 匿名ログインを実行（Firebase コンソールで有効化されている必要があります）
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth Error", e);
        setError("ログインに失敗しました。FirebaseのAuthenticationで『匿名』が有効か確認してください。");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setError(null);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Firestore リアルタイム同期 (RULE 1 & 2) ---
  useEffect(() => {
    if (!user) return;
    setIsSyncing(true);

    // メモ一覧の監視 (/artifacts/{appId}/public/data/memos)
    const memosCol = collection(db, 'artifacts', currentAppId, 'public', 'data', 'memos');
    const unsubscribeMemos = onSnapshot(memosCol, 
      (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMemos(data.sort((a, b) => (b.date || "").localeCompare(a.date || "")));
        setIsSyncing(false);
      },
      (err) => {
        console.error("Memos Error", err);
        setError("データの取得権限がありません。Firestoreのルールを『テストモード』にするか、権限設定を見直してください。");
        setIsSyncing(false);
      }
    );

    // ジャンル設定の監視
    const genresDoc = doc(db, 'artifacts', currentAppId, 'public', 'data', 'settings', 'genres');
    const unsubscribeGenres = onSnapshot(genresDoc, (d) => {
      if (d.exists()) setGenreSettings(d.data());
      else setGenreSettings({
        '幹線工事': { color: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' },
        '盤結線': { color: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
        '動力設備': { color: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-50' }
      });
    });

    // 資材マスターの監視
    const materialsCol = collection(db, 'artifacts', currentAppId, 'public', 'data', 'materials');
    const unsubscribeMaterials = onSnapshot(materialsCol, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMaterialsMaster(data.length > 0 ? data : [
        { id: 'm1', name: 'VVF 2.0-3c', category: 'ケーブル', favorite: true },
        { id: 'm2', name: 'CVT 60sq', category: 'ケーブル', favorite: true },
        { id: 'm3', name: 'インパクトドライバ', category: '工具', favorite: false }
      ]);
    });

    return () => { unsubscribeMemos(); unsubscribeGenres(); unsubscribeMaterials(); };
  }, [user]);

  // --- フォーム用初期化 ---
  const initialForm = { title: '', site: '', genre: '幹線工事', content: '', date: new Date().toISOString().split('T')[0], tags: [], relatedMaterials: [], steps: [], markupImage: null };
  const [formData, setFormData] = useState(initialForm);

  // --- 保存・削除ロジック ---
  const handleSave = async () => {
    if (!formData.title || !user) return;
    setIsSyncing(true);
    try {
      const id = view === 'edit' ? editingMemo.id : `memo_${Date.now()}`;
      await setDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id), { ...formData, id }, { merge: true });
      setView('list');
      setFormData(initialForm);
    } catch (e) {
      alert("保存エラー。電波状況かFirebaseの設定を確認してください。");
    } finally { setIsSyncing(false); }
  };

  const handleDelete = async (id) => {
    if (!user || !window.confirm("この施工極意を完全に削除しますか？")) return;
    setIsSyncing(true);
    try {
      await deleteDoc(doc(db, 'artifacts', currentAppId, 'public', 'data', 'memos', id));
      setView('list');
    } catch (e) {
      alert("削除エラー");
    } finally { setIsSyncing(false); }
  };

  const filteredMemos = memos.filter(m => 
    (m.title || "").includes(searchTerm) || (m.site || "").includes(searchTerm)
  );

  // --- マークアップキャンバス ---
  const MarkupCanvas = ({ data, onChange }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (data) { const img = new Image(); img.onload = () => ctx.drawImage(img,0,0); img.src = data; }
    }, [data]);
    const getPos = (e) => {
      const r = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX || (e.touches && e.touches[0].clientX)) - r.left;
      const y = (e.clientY || (e.touches && e.touches[0].clientY)) - r.top;
      return { x, y };
    };
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400">
          <span><MousePointer2 size={10} className="inline mr-1"/> 現場写真に赤入れ</span>
          <button onClick={() => { canvasRef.current.getContext('2d').clearRect(0,0,400,225); onChange(null); }} className="text-red-500">クリア</button>
        </div>
        <div className="bg-slate-200 rounded-2xl overflow-hidden aspect-video relative touch-none border-2 border-slate-300">
          <canvas ref={canvasRef} width={400} height={225} className="w-full h-full cursor-crosshair"
            onMouseDown={(e) => { setIsDrawing(true); const p=getPos(e); canvasRef.current.getContext('2d').beginPath(); canvasRef.current.getContext('2d').moveTo(p.x, p.y); }}
            onMouseMove={(e) => { if(!isDrawing) return; const p=getPos(e); canvasRef.current.getContext('2d').lineTo(p.x, p.y); canvasRef.current.getContext('2d').stroke(); }}
            onMouseUp={() => { setIsDrawing(false); onChange(canvasRef.current.toDataURL()); }}
            onTouchStart={(e) => { setIsDrawing(true); const p=getPos(e); canvasRef.current.getContext('2d').beginPath(); canvasRef.current.getContext('2d').moveTo(p.x, p.y); }}
            onTouchMove={(e) => { if(!isDrawing) return; const p=getPos(e); canvasRef.current.getContext('2d').lineTo(p.x, p.y); canvasRef.current.getContext('2d').stroke(); }}
            onTouchEnd={() => { setIsDrawing(false); onChange(canvasRef.current.toDataURL()); }}
          />
          {!data && !isDrawing && <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none font-bold text-xs"><ImageIcon size={24} className="mb-1"/>施工箇所をなぞる</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900 font-sans antialiased selection:bg-blue-100">
      {/* エラー警告 */}
      {error && (
        <div className="bg-red-600 text-white p-4 text-xs font-bold flex items-center gap-2 sticky top-0 z-50 shadow-lg">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* ヘッダー */}
      <header className="bg-blue-700 text-white p-7 rounded-b-[3.5rem] shadow-xl sticky top-0 z-20">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-2xl rotate-3 shadow-lg"><HardHat className="text-blue-900" size={24}/></div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter leading-none">VoltVault</h1>
              <div className="flex items-center gap-1.5 text-[8px] font-black text-blue-200 mt-1 uppercase tracking-widest">
                {isSyncing ? <Loader2 size={10} className="animate-spin" /> : <Cloud size={10} />}
                {user ? `Gokui Cloud: Connected` : "Wiring..."}
              </div>
            </div>
          </div>
          <button onClick={() => { setFormData(initialForm); setView('add'); }} className="bg-white text-blue-700 p-4 rounded-2xl shadow-xl active:scale-90 hover:scale-105 transition-all">
            <Plus size={28} strokeWidth={4} />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-blue-300" size={20} />
          <input type="text" placeholder="極意を検索..." className="w-full bg-blue-800/50 rounded-2xl py-3.5 pl-12 text-white placeholder-blue-300 outline-none text-sm font-bold focus:ring-2 focus:ring-blue-400" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </header>

      {/* メインエリア */}
      <main className="p-6 max-w-xl mx-auto">
        {view === 'list' && (
          <div className="space-y-4">
            {filteredMemos.length === 0 && !isSyncing && (
              <div className="text-center py-24 opacity-20">
                <ClipboardList size={64} className="mx-auto mb-2"/>
                <p className="text-xs font-black uppercase italic tracking-widest">No Secrets Found</p>
              </div>
            )}
            {filteredMemos.map(memo => {
              const config = genreSettings[memo.genre] || { color: 'bg-slate-400', light: 'bg-slate-50', text: 'text-slate-700' };
              return (
                <div key={memo.id} onClick={() => { setSelectedMemo(memo); setView('detail'); }} className="bg-white p-5 rounded-[2rem] border relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-md">
                  <div className={`absolute top-0 left-0 w-2.5 h-full ${config.color}`}></div>
                  <div className="flex justify-between items-start mb-2 font-black italic text-slate-300 text-[10px] uppercase">
                    <span>{memo.date}</span>
                    {memo.markupImage && <MousePointer2 size={12} className="text-red-500" />}
                  </div>
                  <h3 className="font-black text-slate-800 text-lg leading-tight mb-3 tracking-tight">{memo.title}</h3>
                  <div className="flex items-center justify-between text-[9px] font-black text-slate-400 pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> {memo.site}</span>
                    <span className={`px-2.5 py-0.5 rounded-lg ${config.light} ${config.text} uppercase`}>{memo.genre}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 詳細画面 */}
        {view === 'detail' && selectedMemo && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto pb-32 animate-in slide-in-from-right duration-300">
            <header className={`${genreSettings[selectedMemo.genre]?.color || 'bg-slate-800'} text-white p-6 flex justify-between items-center sticky top-0 rounded-b-[2.5rem] shadow-lg`}>
              <button onClick={() => setView('list')}><ChevronLeft size={28}/></button>
              <h2 className="font-black italic text-[10px] tracking-widest uppercase">Secret Knowledge Report</h2>
              <button onClick={() => { setEditingMemo(selectedMemo); setFormData(selectedMemo); setView('edit'); }}><Edit3 size={24}/></button>
            </header>
            <div className="p-8 space-y-8 max-w-xl mx-auto">
              <div className="space-y-4">
                <div className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase ${genreSettings[selectedMemo.genre]?.light} ${genreSettings[selectedMemo.genre]?.text} border border-current/10`}>{selectedMemo.genre}</div>
                <h2 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter">{selectedMemo.title}</h2>
                <div className="flex gap-6 text-[10px] font-black text-slate-400 uppercase italic">
                  <span className="flex items-center gap-1.5"><MapPin size={14} className="text-blue-500"/> {selectedMemo.site}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-500"/> {selectedMemo.date}</span>
                </div>
              </div>
              <div className="bg-slate-100 rounded-[2.5rem] overflow-hidden aspect-video flex items-center justify-center border shadow-inner">
                {selectedMemo.markupImage ? <img src={selectedMemo.markupImage} className="w-full h-full object-contain" alt="施工極意" /> : <ImageIcon size={48} className="text-slate-300 opacity-30"/>}
              </div>
              <div className="bg-blue-50/50 p-8 rounded-[3rem] italic text-blue-900 font-bold border-2 border-blue-100 leading-relaxed relative shadow-sm">
                <span className="absolute -top-3 left-10 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] not-italic shadow-md tracking-widest font-black uppercase">Technical Insight</span>
                "{selectedMemo.content}"
              </div>
            </div>
          </div>
        )}
      </main>

      {/* フォーム */}
      {(view === 'add' || view === 'edit') && (
        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto pb-32">
          <header className="bg-white border-b p-5 flex justify-between items-center sticky top-0 shadow-sm">
            <button onClick={() => setView('list')}><X size={24}/></button>
            <h2 className="font-black text-slate-800 tracking-tighter italic">Vault Archiving...</h2>
            <button onClick={handleSave} className="bg-blue-600 text-white px-7 py-2 rounded-full font-black text-xs uppercase shadow-lg disabled:opacity-50">Secure Save</button>
          </header>
          <div className="p-6 space-y-7 max-w-xl mx-auto">
            <div className="space-y-4">
              <input className="w-full text-2xl font-black bg-transparent border-b-2 border-slate-200 py-2 focus:border-blue-600 outline-none" placeholder="施工タイトル" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="p-3 bg-white border rounded-2xl font-bold" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <select className="p-3 bg-white border rounded-2xl font-bold outline-none" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                  {Object.keys(genreSettings).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <input className="w-full p-3 bg-white border rounded-2xl font-bold" placeholder="現場名" value={formData.site} onChange={e => setFormData({...formData, site: e.target.value})} />
            </div>
            <MarkupCanvas data={formData.markupImage} onChange={(img) => setFormData({...formData, markupImage: img})} />
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quickPhrases.map(p => <button key={p} onClick={() => setFormData({...formData, content: formData.content + (formData.content?'\n':'') + p})} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] border border-blue-100 font-black shadow-sm">+ {p}</button>)}
              </div>
              <textarea className="w-full h-48 p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] outline-none text-sm font-medium leading-relaxed focus:border-blue-600 shadow-inner" placeholder="気づいた極意・コツを記録..." value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
            </div>
            {view === 'edit' && <button onClick={() => handleDelete(selectedMemo.id)} className="w-full py-5 text-red-500 font-black text-xs border-2 border-red-100 border-dashed rounded-[2.5rem] uppercase tracking-widest hover:bg-red-50 transition-all">Erase From Vault</button>}
          </div>
        </div>
      )}

      {/* ボトムナビ */}
      <nav className="fixed bottom-8 left-8 right-8 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] p-3 flex justify-around items-center shadow-2xl z-40">
        <button onClick={() => setView('list')} className={`flex flex-col items-center p-4 rounded-[2.2rem] transition-all duration-300 ${view === 'list' ? 'bg-blue-600 text-white shadow-xl scale-110 -translate-y-2' : 'text-slate-300'}`}>
          <ClipboardList size={24} />
          <span className={`text-[7px] mt-1.5 font-black uppercase tracking-widest ${view === 'list' ? 'block' : 'hidden'}`}>Wisdom</span>
        </button>
        <button onClick={() => { setView('list'); alert("現場アーカイブ準備中"); }} className={`flex flex-col items-center p-4 rounded-[2.2rem] text-slate-300`}>
          <MapIcon size={24} />
          <span className="text-[7px] mt-1.5 font-black uppercase tracking-widest hidden">Map</span>
        </button>
        <button onClick={() => { setView('list'); alert("設定メニュー準備中"); }} className={`flex flex-col items-center p-4 rounded-[2.2rem] text-slate-300`}>
          <Settings size={24} />
          <span className="text-[7px] mt-1.5 font-black uppercase tracking-widest hidden">Master</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
