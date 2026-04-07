import { useState, useEffect, useRef } from "react";

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

const THEMES = {
  phantom: { name:"Phantom Dark",   bg:"#080810", surface:"#0f0f1a", card:"#13131f", border:"#1e1e35", accent:"#7c3aed", accent2:"#a855f7", glow:"rgba(124,58,237,0.4)",  text:"#e2e8f0", sub:"#64748b", danger:"#ef4444", success:"#10b981", warn:"#f59e0b" },
  neon:    { name:"Neon Pulse",     bg:"#000a0a", surface:"#001a1a", card:"#002020", border:"#003333", accent:"#00ffcc", accent2:"#00e5ff", glow:"rgba(0,255,204,0.35)",   text:"#e0fffa", sub:"#4d8a80", danger:"#ff4444", success:"#00ffcc", warn:"#ffcc00" },
  ghost:   { name:"Ghost White",    bg:"#f0f2f8", surface:"#ffffff", card:"#f8f9ff", border:"#dde1f0", accent:"#4f46e5", accent2:"#7c3aed", glow:"rgba(79,70,229,0.25)",   text:"#1e1b4b", sub:"#6366f1", danger:"#dc2626", success:"#059669", warn:"#d97706" },
  steel:   { name:"Midnight Steel", bg:"#0a0c14", surface:"#111520", card:"#161b2e", border:"#1f2744", accent:"#3b82f6", accent2:"#60a5fa", glow:"rgba(59,130,246,0.35)",  text:"#cdd6f4", sub:"#6272a4", danger:"#ff5555", success:"#50fa7b", warn:"#ffb86c" },
  crimson: { name:"Crimson Ops",    bg:"#0d0608", surface:"#160b0d", card:"#1c0e11", border:"#2e1317", accent:"#e11d48", accent2:"#fb7185", glow:"rgba(225,29,72,0.4)",    text:"#fce7f3", sub:"#9f4057", danger:"#ff2d55", success:"#34d399", warn:"#fbbf24" },
  aurora:  { name:"Aurora",         bg:"#060d12", surface:"#091520", card:"#0d1e2a", border:"#132b3d", accent:"#06b6d4", accent2:"#67e8f9", glow:"rgba(6,182,212,0.35)",   text:"#ecfeff", sub:"#4e7d8f", danger:"#f43f5e", success:"#4ade80", warn:"#fde68a" },
};

const DISGUISES = {
  news:     { label:"Daily Pulse News",   icon:"📰", tag:"NEWS"     },
  games:    { label:"ArcadeBox Games",    icon:"🎮", tag:"GAMES"    },
  launcher: { label:"QuickLaunch Home",   icon:"🏠", tag:"LAUNCHER" },
  weather:  { label:"SkyWatch Weather",   icon:"🌤️", tag:"WEATHER"  },
  music:    { label:"WaveFlow Music",     icon:"🎵", tag:"MUSIC"    },
};

const NEWS_ITEMS = [
  { cat:"TECH",    title:"AI Chips Reach 10x Efficiency Milestone",  time:"2h ago", read:"4 min", emoji:"💻" },
  { cat:"WORLD",   title:"Climate Summit Reaches Historic Agreement", time:"4h ago", read:"6 min", emoji:"🌍" },
  { cat:"FINANCE", title:"Markets Surge on Fed Rate Decision",        time:"5h ago", read:"3 min", emoji:"💰" },
  { cat:"SCIENCE", title:"NASA Confirms Water Ice on Moon's Surface", time:"7h ago", read:"5 min", emoji:"🔬" },
  { cat:"HEALTH",  title:"New Study Links Sleep to Memory Formation", time:"9h ago", read:"4 min", emoji:"🧠" },
];

const GAMES_LIST = [
  { name:"Shadow Run",   genre:"Action",   icon:"⚔️",  rating:"4.8" },
  { name:"Neon Racer",   genre:"Racing",   icon:"🏎️",  rating:"4.6" },
  { name:"Puzzle Realm", genre:"Puzzle",   icon:"🧩",  rating:"4.9" },
  { name:"Star Forge",   genre:"Strategy", icon:"🚀",  rating:"4.7" },
  { name:"Beat Drop",    genre:"Rhythm",   icon:"🥁",  rating:"4.5" },
  { name:"City Builder", genre:"Sim",      icon:"🏙️",  rating:"4.8" },
];

const APP_GRID = [
  { name:"Messages", icon:"💬" }, { name:"Camera",   icon:"📷" },
  { name:"Gallery",  icon:"🖼️" }, { name:"Maps",     icon:"🗺️" },
  { name:"Browser",  icon:"🌐" }, { name:"Email",    icon:"✉️" },
  { name:"Settings", icon:"⚙️" }, { name:"Clock",    icon:"🕐" },
  { name:"Store",    icon:"🛍️" }, { name:"Contacts", icon:"👥" },
  { name:"Calendar", icon:"📅" }, { name:"Notes",    icon:"📝" },
];

const VAULT_FILES = [
  { name:"Personal_Docs",   type:"folder", items:12,  icon:"📁",  locked:true  },
  { name:"Private Photos",  type:"folder", items:47,  icon:"🔒",  locked:true  },
  { name:"Finance_Records", type:"folder", items:8,   icon:"📊",  locked:false },
  { name:"Passwords.enc",   type:"file",   size:"2KB",    icon:"🔑", locked:true  },
  { name:"backup_2026.zip", type:"file",   size:"840MB",  icon:"💾", locked:false },
  { name:"Private Videos",  type:"folder", items:6,   icon:"🎬",  locked:true  },
];

const INIT_DUAL = [
  { name:"WhatsApp #1",  color:"#25d366", icon:"💬", active:true  },
  { name:"WhatsApp #2",  color:"#128c7e", icon:"💬", active:true  },
  { name:"Instagram #1", color:"#e1306c", icon:"📸", active:true  },
  { name:"Instagram #2", color:"#833ab4", icon:"📸", active:false },
  { name:"Telegram #1",  color:"#2ca5e0", icon:"✈️",  active:true  },
  { name:"Telegram #2",  color:"#1a7db5", icon:"✈️",  active:false },
];

function PinDot({ filled, bouncing, t }) {
  return (
    <div style={{
      width:20, height:20, borderRadius:"50%",
      background: filled ? t.accent : "transparent",
      border: `2.5px solid ${filled ? t.accent : t.border}`,
      transition:"all 0.18s cubic-bezier(.34,1.56,.64,1)",
      transform: bouncing ? "scale(1.5)" : filled ? "scale(1.15)" : "scale(1)",
      boxShadow: filled ? `0 0 14px ${t.glow},0 0 4px ${t.accent}` : "none",
    }} />
  );
}

function Toggle({ on, onChange, t }) {
  return (
    <div onClick={onChange} style={{
      width:42, height:24, borderRadius:12,
      background: on ? t.accent : t.border,
      position:"relative", cursor:"pointer", flexShrink:0,
      transition:"background 0.25s", boxShadow: on ? `0 0 8px ${t.glow}` : "none",
    }}>
      <div style={{
        width:18, height:18, borderRadius:9, background:"#fff",
        position:"absolute", top:3, left: on ? 21 : 3,
        transition:"left 0.22s cubic-bezier(.34,1.56,.64,1)",
        boxShadow:"0 1px 4px rgba(0,0,0,0.3)",
      }} />
    </div>
  );export default function PhantomVault() {
  const [theme,         setTheme]         = useState("phantom");
  const [disguise,      setDisguise]      = useState("news");
  const [screen,        setScreen]        = useState("disguised");
  const [vaultTab,      setVaultTab]      = useState("files");
  const [mounted,       setMounted]       = useState(false);
  const [pinInput,      setPinInput]      = useState("");
  const [storedPinHash, setStoredPinHash] = useState(null);
  const [shakeAnim,     setShakeAnim]     = useState(false);
  const [bounceDot,     setBounceDot]     = useState(-1);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [lockoutUntil,  setLockoutUntil]  = useState(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const [tapCount,      setTapCount]      = useState(0);
  const [showPinSetup,  setShowPinSetup]  = useState(false);
  const [pinStep,       setPinStep]       = useState(1);
  const [newPin,        setNewPin]        = useState("");
  const [confirmPin,    setConfirmPin]    = useState("");
  const [alertLog,      setAlertLog]      = useState([]);
  const [alertEmail,    setAlertEmail]    = useState("");
  const [alertToggles,  setAlertToggles]  = useState({ email:true, sms:true, camera:false, location:false });
  const [noteText,      setNoteText]      = useState("");
  const [notesSaved,    setNotesSaved]    = useState([]);
  const [passManager,   setPassManager]   = useState([]);
  const [showPassForm,  setShowPassForm]  = useState(false);
  const [newPass,       setNewPass]       = useState({ site:"", user:"", pass:"" });
  const [vaultSearch,   setVaultSearch]   = useState("");
  const [intruderSnap,  setIntruderSnap]  = useState(null);
  const [activityLog,   setActivityLog]   = useState([]);
  const [dualApps,      setDualApps]      = useState(INIT_DUAL);
  const [notification,  setNotification]  = useState(null);
  const [fastExitAnim,  setFastExitAnim]  = useState(false);
  const [shakeEnabled,  setShakeEnabled]  = useState(true);
  const [time,          setTime]          = useState(new Date());
  const [screenAnim,    setScreenAnim]    = useState("fadeIn");
  const tapTimerRef = useRef(null);
  const t = THEMES[theme];

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date());
      if (lockoutUntil) {
        const rem = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (rem <= 0) { setLockoutUntil(null); setLockCountdown(0); setWrongAttempts(0); }
        else setLockCountdown(rem);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [lockoutUntil]);

  useEffect(() => {
    (async () => {
      try {
        const th  = localStorage.getItem("pv.theme");      if (th)  setTheme(th);
        const dis = localStorage.getItem("pv.disguise");   if (dis) setDisguise(dis);
        const no  = localStorage.getItem("pv.notes");      if (no)  setNotesSaved(JSON.parse(no));
        const pw  = localStorage.getItem("pv.passwords");  if (pw)  setPassManager(JSON.parse(pw));
        const al  = localStorage.getItem("pv.actlog");     if (al)  setActivityLog(JSON.parse(al));
        const em  = localStorage.getItem("pv.alertEmail"); if (em)  setAlertEmail(em);
        const at  = localStorage.getItem("pv.alertToggles"); if (at) setAlertToggles(JSON.parse(at));
        const da  = localStorage.getItem("pv.dualApps");   if (da)  setDualApps(JSON.parse(da));
        const h   = localStorage.getItem("pv.pinHash");
        if (h) { setStoredPinHash(h); }
        else { const dh = await sha256Hex("1234"); localStorage.setItem("pv.pinHash",dh); setStoredPinHash(dh); }
      } catch {}
    })();
  }, []);

  useEffect(() => { try { localStorage.setItem("pv.theme",         theme);                       } catch {} }, [theme]);
  useEffect(() => { try { localStorage.setItem("pv.disguise",      disguise);                    } catch {} }, [disguise]);
  useEffect(() => { try { localStorage.setItem("pv.notes",         JSON.stringify(notesSaved));  } catch {} }, [notesSaved]);
  useEffect(() => { try { localStorage.setItem("pv.passwords",     JSON.stringify(passManager)); } catch {} }, [passManager]);
  useEffect(() => { try { localStorage.setItem("pv.actlog",        JSON.stringify(activityLog)); } catch {} }, [activityLog]);
  useEffect(() => { try { localStorage.setItem("pv.alertEmail",    alertEmail);                  } catch {} }, [alertEmail]);
  useEffect(() => { try { localStorage.setItem("pv.alertToggles",  JSON.stringify(alertToggles));} catch {} }, [alertToggles]);
  useEffect(() => { try { localStorage.setItem("pv.dualApps",      JSON.stringify(dualApps));    } catch {} }, [dualApps]);

  useEffect(() => {
    if (!shakeEnabled) return;
    let last = 0;
    const handler = (e) => {
      const { x=0, y=0, z=0 } = e.accelerationIncludingGravity || {};
      if (Math.abs(x)+Math.abs(y)+Math.abs(z) > 60 && Date.now()-last > 1200) {
        last = Date.now();
        if (screen === "vault") triggerFastExit();
      }
    };
    const showNotif = (msg, type="info") => { setNotification({msg,type}); setTimeout(()=>setNotification(null),3000); };
  const logActivity = (msg) => { const e={id:Date.now(),msg,time:new Date().toLocaleTimeString()}; setActivityLog(p=>[e,...p].slice(0,60)); };
  const goScreen = (s) => { setScreenAnim("fadeOut"); setTimeout(()=>{ setScreen(s); setScreenAnim("fadeIn"); },180); };
  const triggerFastExit = () => { setFastExitAnim(true); logActivity("Fast exit triggered"); setTimeout(()=>{ setScreen("disguised"); setPinInput(""); setFastExitAnim(false); },320); };

  const handleDisguiseTap = () => {
    clearTimeout(tapTimerRef.current);
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 5) { setTapCount(0); goScreen("pin"); return; }
    tapTimerRef.current = setTimeout(() => setTapCount(0), 2000);
  };

  const takeIntruderPhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:{facingMode:"user"} });
      const video = document.createElement("video");
      video.srcObject = stream;
      await new Promise(r=>{ video.onloadedmetadata=r; });
      await video.play();
      const canvas = document.createElement("canvas");
      canvas.width=320; canvas.height=240;
      canvas.getContext("2d").drawImage(video,0,0,320,240);
      stream.getTracks().forEach(t=>t.stop());
      setIntruderSnap(canvas.toDataURL("image/jpeg",0.7));
    } catch {}
  };

  const handlePinKey = async (key) => {
    if (lockoutUntil && Date.now() < lockoutUntil) return;
    if (key==="DEL") { setPinInput(p=>p.slice(0,-1)); return; }
    const next = pinInput + key;
    const idx  = next.length - 1;
    setPinInput(next);
    setBounceDot(idx);
    setTimeout(()=>setBounceDot(-1), 300);
    if (next.length === 4) {
      const hash = await sha256Hex(next);
      if (hash === storedPinHash) {
        setPinInput(""); setWrongAttempts(0);
        logActivity("Vault unlocked ✅");
        goScreen("vault");
      } else {
        setShakeAnim(true);
        const att = wrongAttempts + 1;
        setWrongAttempts(att);
        setAlertLog(p=>[{id:Date.now(),type:"TAMPER",msg:`Wrong PIN — attempt #${att}`,time:new Date().toLocaleTimeString()},...p]);
        logActivity(`❌ Failed PIN attempt #${att}`);
        if (att>=3 && alertToggles.camera) takeIntruderPhoto();
        if (att>=5) { const u=Date.now()+60000; setLockoutUntil(u); showNotif("🔒 Locked 60s","danger"); }
        else showNotif(`Wrong PIN (${att}/5)`,"danger");
        setTimeout(()=>{ setPinInput(""); setShakeAnim(false); },700);
      }
    }
  };
    const exportVault = () => {
    const data = { exportedAt:new Date().toISOString(), notes:notesSaved, passwords:passManager.map(p=>({...p,pass:"••••••"})), alertLog, activityLog };
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
    a.download = `phantom-vault-${Date.now()}.json`;
    a.click();
    logActivity("Vault exported 📦");
    showNotif("Export downloaded!","success");
  };

  const S = {
    page:      { width:"100%", maxWidth:430, minHeight:"100vh", background:t.bg, color:t.text, fontFamily:"'Rajdhani','Orbitron',monospace", margin:"0 auto", display:"flex", flexDirection:"column", overflow:"hidden", position:"relative" },
    scroll:    { flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch", paddingBottom:90 },
    header:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"13px 18px", background:t.surface, borderBottom:`1px solid ${t.border}`, flexShrink:0, position:"sticky", top:0, zIndex:10 },
    card:      { background:t.card, border:`1px solid ${t.border}`, borderRadius:14, padding:"13px 15px", marginBottom:10 },
    btn:       { background:t.accent, color:"#fff", border:"none", borderRadius:11, padding:"11px 20px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, letterSpacing:1, transition:"all 0.15s", boxShadow:`0 2px 12px ${t.glow}` },
    ghost:     { background:"transparent", color:t.accent, border:`1px solid ${t.border}`, borderRadius:11, padding:"11px 20px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, transition:"all 0.15s" },
    dangerBtn: { background:t.danger, color:"#fff", border:"none", borderRadius:9, padding:"7px 14px", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:11, letterSpacing:1 },
    tab:       (a) => ({ flex:1, padding:"9px 0", background:a?t.accent:"transparent", color:a?"#fff":t.sub, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:10, letterSpacing:.5, borderRadius:7, transition:"all 0.2s", whiteSpace:"nowrap", flexShrink:0 }),
    input:     { background:t.surface, border:`1px solid ${t.border}`, borderRadius:9, padding:"9px 13px", color:t.text, fontFamily:"inherit", fontSize:13, width:"100%", outline:"none", transition:"border-color 0.2s" },
    badge:     (c) => ({ background:c+"22", color:c, borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700, letterSpacing:1 }),
    pinBtn:    { width:76, height:76, borderRadius:"50%", background:t.surface, border:`1.5px solid ${t.border}`, color:t.text, fontSize:24, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"all 0.12s", boxShadow:`0 2px 8px rgba(0,0,0,0.3)` },
  };

  const TapZone = ({ label }) => (
    <div onClick={handleDisguiseTap} style={{ textAlign:"center", padding:"16px 0 44px", color:t.border, fontSize:11, cursor:"pointer", userSelect:"none", letterSpacing:1 }}>
      {label}{tapCount>0?` (${5-tapCount} more)`:""}
    </div>
  );

  const renderNews = () => (
    <div style={S.page}>
      <div style={{ ...S.header, flexDirection:"column", alignItems:"flex-start", gap:6 }}>
        <div style={{ display:"flex", justifyContent:"space-between", width:"100%" }}>
          <span style={{ fontSize:20, fontWeight:900, letterSpacing:3, color:t.accent }}>DAILY PULSE</span>
          <span style={{ fontSize:12, color:t.sub }}>{time.toLocaleTimeString()}</span>
        </div>
        <div style={{ display:"flex", gap:7 }}>
          {["Top","Tech","World","Finance","Health"].map(c=>(
            <span key={c} style={{ fontSize:10, color:t.sub, padding:"2px 9px", borderRadius:20, border:`1px solid ${t.border}`, cursor:"pointer" }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ ...S.scroll, padding:"12px 15px 0" }}>
        <div style={{ ...S.card, background:t.accent, color:"#fff", marginBottom:14 }}>
          <div style={{ fontSize:10, letterSpacing:2, marginBottom:5, opacity:.8 }}>BREAKING</div>
          <div style={{ fontSize:17, fontWeight:700, lineHeight:1.35 }}>Global Tech Leaders Meet at Annual Innovation Summit 2026</div>
          <div style={{ fontSize:11, marginTop:8, opacity:.75 }}>1h ago · 8 min read</div>
        </div>
        {NEWS_ITEMS.map((n,i)=>(
          <div key={i} style={{ ...S.card, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:46,height:46,borderRadius:10,background:t.border,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{n.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10,color:t.accent,letterSpacing:1,marginBottom:2 }}>{n.cat}</div>
              <div style={{ fontSize:13,fontWeight:600,lineHeight:1.3 }}>{n.title}</div>
              <div style={{ fontSize:10,color:t.sub,marginTop:3 }}>{n.time} · {n.read}</div>
            </div>
          </div>
        ))}
        <TapZone label="Tap to refresh" />
      </div>
    </div>
  );

  const renderGames = () => (
    <div style={S.page}>
      <div style={S.header}>
        <span style={{ fontSize:18,fontWeight:900,letterSpacing:2,color:t.accent }}>🎮 ARCADEBOX</span>
        <span style={{ fontSize:12,color:t.sub }}>{time.toLocaleTimeString()}</span>
      </div>
      <div style={{ ...S.scroll, padding:"14px 14px 0" }}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
          {GAMES_LIST.map((g,i)=>(
            <div key={i} style={{ ...S.card,textAlign:"center",cursor:"pointer" }} onClick={i===0?handleDisguiseTap:undefined}>
              <div style={{ fontSize:34,marginBottom:7 }}>{g.icon}</div>
              <div style={{ fontSize:13,fontWeight:700 }}>{g.name}</div>
              <div style={{ fontSize:10,color:t.sub }}>{g.genre}</div>
              <div style={{ fontSize:11,color:t.accent,marginTop:4 }}>★ {g.rating}</div>
            </div>
          ))}
        </div>
        <TapZone label="Load more" />
      </div>
    </div>
  );
    const renderLauncher = () => (
    <div style={{ ...S.page }}>
      <div style={{ padding:"32px 20px 16px",textAlign:"center" }}>
        <div style={{ fontSize:48,fontWeight:900,color:t.text,letterSpacing:-2,fontFamily:"'Orbitron',monospace" }}>{time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div>
        <div style={{ fontSize:13,color:t.sub,marginTop:4 }}>{time.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric"})}</div>
      </div>
      <div style={{ ...S.scroll,padding:"0 16px" }}>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,marginBottom:20 }}>
          {APP_GRID.map((a,i)=>(
            <div key={i} style={{ textAlign:"center",cursor:"pointer" }} onClick={i===0?handleDisguiseTap:undefined}>
              <div style={{ width:54,height:54,borderRadius:15,background:t.surface,border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 5px" }}>{a.icon}</div>
              <div style={{ fontSize:10,color:t.sub }}>{a.name}</div>
            </div>
          ))}
        </div>
        <TapZone label="• • •" />
      </div>
    </div>
  );

  const renderWeather = () => (
    <div style={{ ...S.page,background:`linear-gradient(160deg,${t.accent}18 0%,${t.bg} 50%)` }}>
      <div style={S.header}>
        <span style={{ fontSize:18,fontWeight:900,letterSpacing:2,color:t.accent }}>🌤️ SKYWATCH</span>
        <span style={{ fontSize:12,color:t.sub }}>{time.toLocaleTimeString()}</span>
      </div>
      <div style={{ ...S.scroll,padding:"20px 16px 0" }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ fontSize:80 }}>🌤️</div>
          <div style={{ fontSize:64,fontWeight:900,color:t.text,lineHeight:1 }}>74°</div>
          <div style={{ fontSize:15,color:t.sub,marginTop:6 }}>Partly Cloudy · Your City</div>
        </div>
        <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:10 }}>
          {["Now","1PM","2PM","3PM","4PM","5PM","6PM"].map((h,i)=>(
            <div key={i} style={{ ...S.card,minWidth:62,textAlign:"center",flexShrink:0,padding:"10px 8px" }}>
              <div style={{ fontSize:10,color:t.sub }}>{h}</div>
              <div style={{ fontSize:20,margin:"5px 0" }}>{["🌤️","☀️","⛅","🌥️","☀️","🌤️","🌙"][i]}</div>
              <div style={{ fontSize:13,fontWeight:700 }}>{[74,76,75,73,72,70,68][i]}°</div>
            </div>
          ))}
        </div>
        <TapZone label="Update forecast" />
      </div>
    </div>
  );

  const renderMusic = () => (
    <div style={S.page}>
      <div style={S.header}>
        <span style={{ fontSize:18,fontWeight:900,letterSpacing:2,color:t.accent }}>🎵 WAVEFLOW</span>
        <span style={{ fontSize:12,color:t.sub }}>{time.toLocaleTimeString()}</span>
      </div>
      <div style={{ ...S.scroll,display:"flex",flexDirection:"column",alignItems:"center",padding:"30px 16px 0" }}>
        <div style={{ width:160,height:160,borderRadius:80,background:`conic-gradient(${t.accent},${t.accent2},${t.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:64,boxShadow:`0 0 40px ${t.glow}`,marginBottom:24,animation:"spin 8s linear infinite" }}>🎵</div>
        <div style={{ fontSize:20,fontWeight:700,marginBottom:4 }}>Midnight Dreams</div>
        <div style={{ fontSize:13,color:t.sub,marginBottom:28 }}>The Phantom Collective</div>
        <div style={{ display:"flex",gap:32 }}>
          {["⏮️","⏸️","⏭️"].map((b,i)=>(
            <div key={i} style={{ fontSize:36,cursor:"pointer" }} onClick={i===1?handleDisguiseTap:undefined}>{b}</div>
          ))}
        </div>
        <TapZone label="Shuffle playlist" />
      </div>
    </div>
  );

  const renderDisguise = () => ({ news:renderNews,games:renderGames,launcher:renderLauncher,weather:renderWeather,music:renderMusic }[disguise]??renderNews)();

  const renderPin = () => (
    <div style={{ ...S.page,justifyContent:"center",alignItems:"center",padding:24 }}>
      <div style={{ position:"absolute",width:300,height:300,borderRadius:"50%",background:t.glow,filter:"blur(80px)",opacity:.4,top:"15%",left:"50%",transform:"translateX(-50%)",pointerEvents:"none" }} />
      <div style={{ textAlign:"center",marginBottom:32,zIndex:1 }}>
        <div style={{ fontSize:54,marginBottom:10,filter:`drop-shadow(0 0 16px ${t.glow})` }}>🔐</div>
        <div style={{ fontSize:22,fontWeight:900,letterSpacing:4,color:t.accent }}>PHANTOM VAULT</div>
        <div style={{ fontSize:12,color:t.sub,marginTop:5 }}>Enter PIN to unlock</div>
        {wrongAttempts>0&&!lockoutUntil&&<div style={{ color:t.danger,fontSize:12,marginTop:8 }}>⚠️ {wrongAttempts}/5 attempts</div>}
        {lockoutUntil&&<div style={{ background:t.danger+"22",border:`1px solid ${t.danger}`,borderRadius:10,padding:"8px 18px",marginTop:10,color:t.danger,fontWeight:700 }}>🔒 Locked — {lockCountdown}s</div>}
      </div>
      <div style={{ display:"flex",gap:18,marginBottom:44,zIndex:1,animation:shakeAnim?"shake 0.5s":"none" }}>
        {[0,1,2,3].map(i=><PinDot key={i} filled={i<pinInput.length} bouncing={bounceDot===i} t={t} />)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(3,76px)",gap:14,zIndex:1,opacity:lockoutUntil?.35:1 }}>
        {["1","2","3","4","5","6","7","8","9","","0","DEL"].map((k,i)=>(
          <button key={i} aria-label={k==="DEL"?"Delete":k}
            style={{ ...S.pinBtn,visibility:k===""?"hidden":"visible",fontSize:k==="DEL"?13:24 }}
            onClick={()=>k&&handlePinKey(k)}>{k}</button>
        ))}
      </div>
      <button style={{ ...S.ghost,marginTop:24,fontSize:12,zIndex:1 }} onClick={triggerFastExit}>✕ Cancel</button>
    </div>
  );

  const renderFiles = () => {
    const filtered = VAULT_FILES.filter(f=>f.name.toLowerCase().includes(vaultSearch.toLowerCase()));
    return (
      <>
        <input style={{ ...S.input,marginBottom:12 }} placeholder="🔍  Search vault..." value={vaultSearch} onChange={e=>setVaultSearch(e.target.value)} />
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <span style={{ fontSize:11,color:t.sub,letterSpacing:1 }}>SECURE STORAGE</span>
          <button style={{ ...S.btn,padding:"6px 14px",fontSize:11 }}>+ ADD</button>
        </div>
        {filtered.map((f,i)=>(
          <div key={i} style={{ ...S.card,display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ fontSize:30 }}>{f.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}>
                <span style={{ fontSize:14,fontWeight:600 }}>{f.name}</span>
                {f.locked&&<span style={S.badge(t.accent)}>ENC</span>}
              </div>
              <div style={{ fontSize:11,color:t.sub }}>{f.type==="folder"?`${f.items} items`:f.size}</div>
            </div>
            <div style={{ color:t.sub,fontSize:20 }}>›</div>
          </div>
        ))}
        {filtered.length===0&&<div style={{ textAlign:"center",color:t.sub,padding:24 }}>No results for "{vaultSearch}"</div>}
        <div style={{ ...S.card,border:`1px dashed ${t.border}`,textAlign:"center",color:t.sub,cursor:"pointer" }}><div style={{ fontSize:12 }}>+ Import from Camera / Gallery</div></div>
      </>
    );
  };
    const renderDual = () => (
    <>
      <div style={{ ...S.card,background:t.surface,marginBottom:14 }}>
        <div style={{ fontSize:12,color:t.sub,lineHeight:1.5 }}>Two isolated instances of the same app — separate accounts, no cross-data.</div>
      </div>
      {dualApps.map((a,i)=>(
        <div key={i} style={{ ...S.card,display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:46,height:46,borderRadius:13,background:a.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>{a.icon}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:600 }}>{a.name}</div>
            <div style={{ fontSize:11,color:a.active?t.success:t.sub }}>● {a.active?"Running":"Inactive"}</div>
          </div>
          <Toggle on={a.active} t={t} onChange={()=>setDualApps(p=>p.map((d,j)=>j===i?{...d,active:!d.active}:d))} />
        </div>
      ))}
      <button style={{ ...S.btn,width:"100%",marginTop:6 }}>+ Clone New App</button>
    </>
  );

  const renderNotes = () => (
    <>
      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,marginBottom:12 }}>🗒️ ENCRYPTED NOTES</div>
      <textarea style={{ ...S.input,height:110,resize:"none",marginBottom:8,lineHeight:1.5 }} placeholder="Write a private note..." value={noteText} onChange={e=>setNoteText(e.target.value)} />
      <button style={{ ...S.btn,width:"100%",marginBottom:18,fontSize:12 }} onClick={()=>{
        if (!noteText.trim()) return;
        setNotesSaved(p=>[{id:Date.now(),text:noteText.trim(),time:new Date().toLocaleString()},...p]);
        setNoteText(""); logActivity("Note saved 🗒️"); showNotif("Note saved 🔒","success");
      }}>Save Note</button>
      {notesSaved.length===0&&<div style={{ textAlign:"center",color:t.sub,padding:20,fontSize:13 }}>No notes yet.</div>}
      {notesSaved.map(n=>(
        <div key={n.id} style={{ ...S.card,borderLeft:`3px solid ${t.accent}` }}>
          <div style={{ fontSize:13,lineHeight:1.6,marginBottom:8 }}>{n.text}</div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:10,color:t.sub }}>{n.time}</span>
            <button style={{ background:"none",border:"none",color:t.danger,cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:600 }} onClick={()=>{setNotesSaved(p=>p.filter(x=>x.id!==n.id));logActivity("Note deleted");}}>Delete</button>
          </div>
        </div>
      ))}
    </>
  );

  const renderPasswords = () => (
    <>
      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,marginBottom:12 }}>🔑 PASSWORD VAULT</div>
      {showPassForm?(
        <div style={S.card}>
          <div style={{ fontSize:13,fontWeight:700,marginBottom:12 }}>New Entry</div>
          {[["Site / App","site","text"],["Username","user","text"],["Password","pass","password"]].map(([lbl,key,type])=>(
            <div key={key} style={{ marginBottom:9 }}>
              <div style={{ fontSize:11,color:t.sub,marginBottom:4 }}>{lbl}</div>
              <input style={S.input} type={type} value={newPass[key]} onChange={e=>setNewPass(p=>({...p,[key]:e.target.value}))} placeholder={lbl} />
            </div>
          ))}
          <div style={{ display:"flex",gap:8,marginTop:10 }}>
            <button style={{ ...S.btn,flex:1,fontSize:12 }} onClick={()=>{
              if (!newPass.site.trim()) return;
              setPassManager(p=>[{...newPass,id:Date.now(),visible:false},...p]);
              setNewPass({site:"",user:"",pass:""}); setShowPassForm(false);
              logActivity("Password added 🔑"); showNotif("Saved 🔒","success");
            }}>Save</button>
            <button style={{ ...S.ghost,flex:1,fontSize:12 }} onClick={()=>setShowPassForm(false)}>Cancel</button>
          </div>
        </div>
      ):(
        <button style={{ ...S.btn,width:"100%",marginBottom:14,fontSize:12 }} onClick={()=>setShowPassForm(true)}>+ Add Entry</button>
      )}
      {passManager.length===0&&!showPassForm&&<div style={{ textAlign:"center",color:t.sub,padding:24 }}>No passwords saved.</div>}
      {passManager.map((p,i)=>(
        <div key={p.id} style={S.card}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:14,fontWeight:700 }}>{p.site}</div>
              <div style={{ fontSize:12,color:t.sub,marginTop:2 }}>{p.user}</div>
              <div style={{ fontSize:12,color:t.sub,fontFamily:"monospace",marginTop:3 }}>{p.visible?p.pass:"••••••••"}</div>
            </div>
            <div style={{ display:"flex",gap:6,marginTop:4 }}>
              <button style={{ ...S.ghost,padding:"5px 10px",fontSize:11,borderRadius:7 }} onClick={()=>setPassManager(p=>p.map((x,j)=>j===i?{...x,visible:!x.visible}:x))}>{p.visible?"Hide":"Show"}</button>
              <button style={{ background:t.danger+"22",color:t.danger,border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit" }} onClick={()=>{setPassManager(p=>p.filter((_,j)=>j!==i));logActivity("Password deleted");}}>Del</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );

  const renderAlerts = () => (
    <>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <span style={{ fontSize:11,color:t.sub,letterSpacing:1 }}>TAMPER ALERTS</span>
        <button style={{ ...S.ghost,padding:"5px 12px",fontSize:11 }} onClick={()=>setAlertLog([])}>Clear All</button>
      </div>
      <div style={{ ...S.card,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,marginBottom:8 }}>Alert Email</div>
        <input style={{ ...S.input,marginBottom:6 }} placeholder="your@email.com" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} />
        <div style={{ fontSize:11,color:t.sub }}>Notified on breach attempts</div>
      </div>
      <div style={{ ...S.card,marginBottom:14 }}>
        <div style={{ fontSize:12,fontWeight:600,marginBottom:10 }}>Alert Channels</div>
        {[{key:"email",label:"📧 Email on wrong PIN"},{key:"sms",label:"📱 SMS on tamper"},{key:"camera",label:"📸 Intruder photo (3+ fails)"},{key:"location",label:"📍 Location on breach"}].map(({key,label},i,arr)=>(
          <div key={key} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<arr.length-1?`1px solid ${t.border}`:"none" }}>
            <span style={{ fontSize:12 }}>{label}</span>
            <Toggle on={alertToggles[key]} t={t} onChange={()=>setAlertToggles(p=>({...p,[key]:!p[key]}))} />
          </div>
        ))}
      </div>
      {intruderSnap&&(
        <div style={{ ...S.card,borderLeft:`3px solid ${t.danger}`,marginBottom:14 }}>
          <div style={{ fontSize:12,fontWeight:700,color:t.danger,marginBottom:8 }}>📸 INTRUDER CAPTURED</div>
          <img src={intruderSnap} alt="intruder" style={{ width:"100%",borderRadius:9 }} />
          <button style={{ ...S.ghost,width:"100%",marginTop:8,fontSize:11 }} onClick={()=>setIntruderSnap(null)}>Clear</button>
        </div>
      )}
      {alertLog.length===0
        ?<div style={{ textAlign:"center",color:t.sub,padding:30 }}><div style={{ fontSize:32,marginBottom:8 }}>✅</div>No events</div>
        :alertLog.map(a=>(
          <div key={a.id} style={{ ...S.card,borderLeft:`3px solid ${t.danger}`,padding:"10px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between" }}>
              <span style={{ fontSize:12,fontWeight:700,color:t.danger }}>🚨 {a.type}</span>
              <span style={{ fontSize:10,color:t.sub }}>{a.time}</span>
            </div>
            <div style={{ fontSize:12,marginTop:4 }}>{a.msg}</div>
          </div>
        ))
      }
    </>
  );

  const renderSettings = () => (
    <>
      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,marginBottom:12 }}>THEME</div>
      {Object.entries(THEMES).map(([key,th])=>(
        <div key={key} onClick={()=>{setTheme(key);logActivity(`Theme → ${th.name}`);}}
          style={{ ...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:theme===key?`2px solid ${th.accent}`:`1px solid ${t.border}`,boxShadow:theme===key?`0 0 14px ${th.glow}`:"none",transition:"all 0.2s" }}>
          <div style={{ width:42,height:42,borderRadius:11,background:th.bg,border:`2px solid ${th.accent}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
            {["🌑","💚","👻","🔵","🩸","🌊"][["phantom","neon","ghost","steel","crimson","aurora"].indexOf(key)]}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14,fontWeight:600,color:th.accent }}>{th.name}</div>
            <div style={{ display:"flex",gap:5,marginTop:4 }}>{[th.accent,th.accent2,th.text,th.sub].map((c,i)=><div key={i} style={{ width:13,height:13,borderRadius:4,background:c }} />)}</div>
          </div>
          {theme===key&&<span style={{ color:th.accent,fontSize:20 }}>✓</span>}
        </div>
      ))}

      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,margin:"18px 0 12px" }}>DISGUISE</div>
      {Object.entries(DISGUISES).map(([key,d])=>(
        <div key={key} onClick={()=>{setDisguise(key);logActivity(`Disguise → ${d.label}`);}}
          style={{ ...S.card,display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:disguise===key?`2px solid ${t.accent}`:`1px solid ${t.border}` }}>
          <div style={{ fontSize:30 }}>{d.icon}</div>
          <div style={{ flex:1 }}><div style={{ fontSize:14,fontWeight:600 }}>{d.label}</div><div style={{ fontSize:11,color:t.sub }}>{d.tag}</div></div>
          {disguise===key&&<span style={{ color:t.accent,fontSize:18 }}>✓</span>}
        </div>
      ))}

      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,margin:"18px 0 12px" }}>SECURITY</div>
      <div style={S.card}>
        <div style={{ fontSize:13,fontWeight:700,marginBottom:10 }}>Change PIN</div>
        {showPinSetup?(
          <>
            <div style={{ fontSize:12,color:t.sub,marginBottom:8 }}>{pinStep===1?"New PIN:":"Confirm PIN:"}</div>
            <div style={{ display:"flex",gap:14,marginBottom:14 }}>
              {[0,1,2,3].map(i=><PinDot key={i} filled={i<(pinStep===1?newPin:confirmPin).length} bouncing={false} t={t} />)}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10 }}>
              {["1","2","3","4","5","6","7","8","9","","0","DEL"].map((k,i)=>(
                <button key={i} style={{ ...S.pinBtn,width:"100%",height:52,fontSize:k==="DEL"?12:18,visibility:k===""?"hidden":"visible",borderRadius:9 }}
                  onClick={async()=>{
                    if (!k) return;
                    if (pinStep===1){const n=k==="DEL"?newPin.slice(0,-1):newPin+k;setNewPin(n);if(n.length===4)setPinStep(2);}
                    else{const c=k==="DEL"?confirmPin.slice(0,-1):confirmPin+k;setConfirmPin(c);if(c.length===4){if(c===newPin){const h=await sha256Hex(newPin);setStoredPinHash(h);localStorage.setItem("pv.pinHash",h);logActivity("PIN changed 🔐");showNotif("PIN updated!","success");}else showNotif("PINs don't match","danger");setShowPinSetup(false);setNewPin("");setConfirmPin("");setPinStep(1);}}
                  }}>{k}</button>
              ))}
            </div>
            <button style={{ ...S.ghost,width:"100%",fontSize:12 }} onClick={()=>{setShowPinSetup(false);setNewPin("");setConfirmPin("");setPinStep(1);}}>Cancel</button>
          </>
        ):(
          <button style={{ ...S.btn,width:"100%",fontSize:12 }} onClick={()=>setShowPinSetup(true)}>Change PIN</button>
        )}
      </div>

      <div style={S.card}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div><div style={{ fontSize:13,fontWeight:700 }}>📳 Shake to Exit</div><div style={{ fontSize:11,color:t.sub,marginTop:2 }}>Shake phone → exit vault instantly</div></div>
          <Toggle on={shakeEnabled} t={t} onChange={()=>setShakeEnabled(p=>!p)} />
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize:13,fontWeight:700,marginBottom:6 }}>📦 Export Backup</div>
        <div style={{ fontSize:11,color:t.sub,marginBottom:10 }}>Download notes, logs & masked passwords as JSON.</div>
        <button style={{ ...S.btn,width:"100%",fontSize:12 }} onClick={exportVault}>Export Now</button>
      </div>

      <div style={{ fontSize:11,color:t.sub,letterSpacing:1,margin:"18px 0 12px" }}>ACTIVITY LOG</div>
      {activityLog.length===0
        ?<div style={{ textAlign:"center",color:t.sub,padding:20 }}>No activity yet.</div>
        :activityLog.slice(0,20).map(a=>(
          <div key={a.id} style={{ ...S.card,padding:"8px 13px",display:"flex",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontSize:12 }}>{a.msg}</span>
            <span style={{ fontSize:10,color:t.sub,flexShrink:0,marginLeft:8 }}>{a.time}</span>
          </div>
        ))
      }
    </>
  );

  const TABS = [
    {id:"files",     icon:"📁", label:"Files"   },
    {id:"dual",      icon:"👥", label:"Dual"    },
    {id:"notes",     icon:"🗒️",  label:"Notes"   },
    {id:"passwords", icon:"🔑", label:"Keys"    },
    {id:"alerts",    icon:"🚨", label:"Alerts"  },
    {id:"settings",  icon:"⚙️",  label:"Settings"},
  ];

  const renderVault = () => (
    <div style={S.page}>
      <div style={{ ...S.header,zIndex:10 }}>
        <div>
          <div style={{ fontSize:16,fontWeight:900,letterSpacing:2,color:t.accent }}>⚡ PHANTOM VAULT</div>
          <div style={{ fontSize:10,color:t.success }}>● Private Space Active</div>
        </div>
        <button style={S.dangerBtn} onClick={triggerFastExit}>✕ EXIT</button>
      </div>
      <div style={{ display:"flex",padding:"8px 10px",gap:5,background:t.surface,borderBottom:`1px solid ${t.border}`,overflowX:"auto",flexShrink:0 }}>
        {TABS.map(tab=>(
          <button key={tab.id} style={S.tab(vaultTab===tab.id)} onClick={()=>setVaultTab(tab.id)}>
            {tab.icon} {tab.label}{tab.id==="alerts"&&alertLog.length>0?` (${alertLog.length})`:""}
          </button>
        ))}
      </div>
      <div style={{ ...S.scroll,padding:"14px 14px 0" }}>
        {vaultTab==="files"     && renderFiles()}
        {vaultTab==="dual"      && renderDual()}
        {vaultTab==="notes"     && renderNotes()}
        {vaultTab==="passwords" && renderPasswords()}
        {vaultTab==="alerts"    && renderAlerts()}
        {vaultTab==="settings"  && renderSettings()}
      </div>
    </div>
  );

  const notifBg = {info:t.accent,danger:t.danger,success:t.success,warn:t.warn};

  return (
    <div style={{ width:"100%",minHeight:"100vh",background:t.bg,display:"flex",justifyContent:"center",opacity:mounted?1:0,transition:"opacity 0.4s",fontFamily:"'Rajdhani','Orbitron',monospace" }}>
      <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
      {notification&&(
        <div style={{ position:"fixed",top:18,left:"50%",transform:"translateX(-50%)",background:notifBg[notification.type]||t.accent,color:"#fff",padding:"10px 24px",borderRadius:22,fontSize:12,fontWeight:700,zIndex:9999,letterSpacing:1,whiteSpace:"nowrap",boxShadow:`0 4px 24px rgba(0,0,0,0.5)`,animation:"slideDown 0.3s ease" }}>
          {notification.msg}
        </div>
      )}
      {fastExitAnim&&<div style={{ position:"fixed",inset:0,background:"#000",zIndex:9998,opacity:.95 }} />}
      <div style={{ width:"100%",maxWidth:430,animation:`${screenAnim} 0.22s ease` }}>
        {screen==="disguised" && renderDisguise()}
        {screen==="pin"       && renderPin()}
        {screen==="vault"     && renderVault()}
      </div>
      <style>{`
        @keyframes slideDown {from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes shake     {0%,100%{transform:translateX(0)}20%{transform:translateX(-9px)}40%{transform:translateX(9px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
        @keyframes fadeIn    {from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeOut   {from{opacity:1}to{opacity:0}}
        @keyframes spin      {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes pulse     {0%,100%{opacity:1}50%{opacity:.5}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:3px;height:3px;}
        ::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}
        button:active{transform:scale(0.94);}
        input::placeholder,textarea::placeholder{color:${t.sub};opacity:.7;}
        textarea{resize:none;}
      `}</style>
    </div>
  );
        }
    
}
