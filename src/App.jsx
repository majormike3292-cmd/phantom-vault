import React, { useState, useEffect, useRef } from 'react'

// ---------------------------
// Utilities
// ---------------------------
async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}

const THEMES = {
  'Phantom Dark': { bg: '#080810', accent: '#00ffff', text: '#e2e8f0' },
  'Neon Pulse': { bg: '#0a0a23', accent: '#ff00ff', text: '#f0f0f0' },
  'Ghost White': { bg: '#f8f8f8', accent: '#ff4500', text: '#000' },
  'Midnight Steel': { bg: '#12121f', accent: '#00ff7f', text: '#ccc' },
  'Crimson Ops 🩸': { bg: '#1a0000', accent: '#ff0000', text: '#fff' },
  'Aurora 🌊': { bg: '#001a33', accent: '#00ffff', text: '#fff' },
}

// ---------------------------
// PhantomVault Component
// ---------------------------
export default function PhantomVault() {
  const canvasRef = useRef(null)
  const [theme, setTheme] = useState('Phantom Dark')
  const [pinInput, setPinInput] = useState('')
  const [storedPinHash, setStoredPinHash] = useState(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [lockoutTime, setLockoutTime] = useState(0)
  const [vaultTab, setVaultTab] = useState('Files')
  const [notes, setNotes] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [files, setFiles] = useState([{ id:1, name:'SecretDoc.txt' }])
  const [disguiseMode, setDisguiseMode] = useState('Default')
  const [particleCount, setParticleCount] = useState(50)
  const [particles, setParticles] = useState([])

  // ---------------------------
  // LocalStorage Init
  // ---------------------------
  useEffect(() => {
    const savedTheme = localStorage.getItem('phantom.theme')
    if (savedTheme) setTheme(savedTheme)

    const savedTab = localStorage.getItem('phantom.tab')
    if (savedTab) setVaultTab(savedTab)

    const savedNotes = JSON.parse(localStorage.getItem('phantom.notes') || '[]')
    setNotes(savedNotes)

    const savedLog = JSON.parse(localStorage.getItem('phantom.log') || '[]')
    setActivityLog(savedLog)

    const savedDisguise = localStorage.getItem('phantom.disguise')
    if (savedDisguise) setDisguiseMode(savedDisguise)

    (async () => {
      const storedHash = localStorage.getItem('phantom.pinHash')
      if (storedHash) setStoredPinHash(storedHash)
      else {
        const defaultHash = await sha256Hex('password') // default PIN
        localStorage.setItem('phantom.pinHash', defaultHash)
        setStoredPinHash(defaultHash)
      }
    })()
  }, [])

  // ---------------------------
  // Theme persistence
  // ---------------------------
  useEffect(() => {
    localStorage.setItem('phantom.theme', theme)
    const t = THEMES[theme]
    if (t) Object.entries(t).forEach(([k,v]) => document.documentElement.style.setProperty(`--${k}`, v))
  }, [theme])

  // ---------------------------
  // Lockout timer
  // ---------------------------
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => setLockoutTime(t => Math.max(t - 1, 0)), 1000)
      return () => clearInterval(timer)
    }
  }, [lockoutTime])

  // ---------------------------
  // Particle animation
  // ---------------------------
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = canvas.width = window.innerWidth
    let height = canvas.height = window.innerHeight
    let pts = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
    }))
    setParticles(pts)

    const animate = () => {
      ctx.clearRect(0,0,width,height)
      pts.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x>width) p.x=0; if (p.x<0)p.x=width
        if (p.y>height)p.y=0; if (p.y<0)p.y=height
        ctx.fillStyle = THEMES[theme].accent
        ctx.beginPath()
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2)
        ctx.fill()
      })
      requestAnimationFrame(animate)
    }
    animate()
    window.addEventListener('resize',()=>{width=canvas.width=window.innerWidth;height=canvas.height=window.innerHeight})
  }, [particleCount, theme])

  // ---------------------------
  // Shake-to-exit
  // ---------------------------
  useEffect(() => {
    const handleMotion = e => {
      const acc = e.accelerationIncludingGravity
      if (!acc) return
      const total = Math.abs(acc.x)+Math.abs(acc.y)+Math.abs(acc.z)
      if (total > 25) alert('Fast Exit triggered!')
    }
    if (typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission) {
      DeviceMotionEvent.requestPermission().then(p => p==='granted' && window.addEventListener('devicemotion', handleMotion))
    } else window.addEventListener('devicemotion', handleMotion)
    return ()=>window.removeEventListener('devicemotion', handleMotion)
  }, [])

  // ---------------------------
  // PIN validation
  // ---------------------------
  const handlePinKey = async (key) => {
    if (lockoutTime>0) return
    const next = pinInput + key
    setPinInput(next)
    if (next.length>=4 && storedPinHash) {
      const h = await sha256Hex(next)
      if (h === storedPinHash) {
        setWrongAttempts(0)
        logActivity('Vault unlocked')
        alert('Vault unlocked!')
        setPinInput('')
      } else {
        const attempts = wrongAttempts + 1
        setWrongAttempts(attempts)
        logActivity('Wrong PIN attempt')
        setPinInput('')
        if (attempts>=5) setLockoutTime(60)
      }
    }
  }

  const logActivity = (msg) => {
    const ts = new Date().toISOString()
    const updated = [{ msg, ts }, ...activityLog]
    setActivityLog(updated)
    localStorage.setItem('phantom.log', JSON.stringify(updated))
  }

  const saveNote = (text) => {
    const updated = [...notes, { id: Date.now(), text }]
    setNotes(updated)
    localStorage.setItem('phantom.notes', JSON.stringify(updated))
    logActivity('Note saved')
  }
  const deleteNote = (id) => {
    const updated = notes.filter(n=>n.id!==id)
    setNotes(updated)
    localStorage.setItem('phantom.notes', JSON.stringify(updated))
    logActivity('Note deleted')
  }

  // ---------------------------
  // Render vault tab content
  // ---------------------------
  const renderVaultTab = () => {
    switch(vaultTab){
      case 'Files':
        return <div>{files.map(f=><div key={f.id}>{f.name}</div>)}</div>
      case 'Notes':
        return (
          <div>
            <input type="text" placeholder="New note" id="noteInput"/>
            <button onClick={()=>{const val=document.getElementById('noteInput').value;if(val){saveNote(val);document.getElementById('noteInput').value=''}}}>Save</button>
            <ul>{notes.map(n=><li key={n.id}>{n.text} <button onClick={()=>deleteNote(n.id)}>Delete</button></li>)}</ul>
          </div>
        )
      case 'Settings':
        return (
          <div>
            <div>
              <label>Theme:</label>
              <select value={theme} onChange={e=>setTheme(e.target.value)}>
                {Object.keys(THEMES).map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Disguise Mode:</label>
              <select value={disguiseMode} onChange={e=>{setDisguiseMode(e.target.value);localStorage.setItem('phantom.disguise', e.target.value)}}>
                {['Default','News','GameStore','Home','Weather','Music'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        )
      case 'Logs':
        return <ul>{activityLog.map((l,i)=><li key={i}>{l.ts}: {l.msg}</li>)}</ul>
      default: return null
    }
  }

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.particlesCanvas}></canvas>
      <div style={styles.gradientBackground}></div>

      <h1 style={styles.glowText}>Phantom Vault v2</h1>

      <div style={{marginTop:'30px', width:'90%', maxWidth:'600px'}}>
        <div><strong>Lockout Timer:</strong> {lockoutTime>0 ? `${lockoutTime}s` : 'Unlocked'}</div>
        <div><strong>Wrong Attempts:</strong> {wrongAttempts}</div>

        <div style={{marginTop:'10px'}}>
          <input type="password" value={pinInput} onChange={e=>setPinInput(e.target.value)} placeholder="Enter PIN" />
          <button onClick={()=>handlePinKey(pinInput)}>Enter</button>
        </div>

        <div style={{marginTop:'20px'}}>
          <strong>Tabs:</strong> {['Files','Notes','Settings','Logs'].map(t=><button key={t} onClick={()=>{setVaultTab(t);localStorage.setItem('phantom.tab',t)}}>{t}</button>)}
        </div>

        <div style={{marginTop:'20px'}}>
          {renderVaultTab()}
        </div>

      </div>
    </div>
  )
}

// ---------------------------
// Styles
// ---------------------------
export const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    overflowY: 'auto',
    paddingTop: '50px',
    backgroundColor: 'var(--bg)',
  },
  particlesCanvas: {
    position: 'absolute',
    top:0,left:0,
    width:'100%',height:'100%',
    zIndex:0,
  },
  gradientBackground: {
    position: 'absolute',
    top:0,left:0,
    width:'200%',height:'200%',
    background: 'linear-gradient(270deg, #ff00ff, #00ffff, #ff00ff, #00ffff)',
    backgroundSize:'800% 800%',
    animation:'gradientShift 15s ease infinite',
    zIndex:1,
  },
  glowText: {
    position:'relative',
    zIndex:2,
    color:'var(--accent)',
    fontSize:'3rem',
    textShadow:'0 0 5px var(--accent),0 0 10px var(--accent),0 0 20px var(--accent),0 0 40px var(--accent)',
    animation:'glowPulse 2s infinite alternate'
  }
}
