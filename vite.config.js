import React, { useState, useEffect, useRef } from 'react'

// --------------------------- // Utilities // --------------------------- async function sha256Hex(input) { const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)) return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('') }

const THEMES = { 'Phantom Dark': { bg: '#080810', accent: '#00ffff', text: '#e2e8f0' }, 'Neon Pulse': { bg: '#0a0a23', accent: '#ff00ff', text: '#f0f0f0' }, 'Ghost White': { bg: '#f8f8f8', accent: '#ff4500', text: '#000' }, 'Midnight Steel': { bg: '#12121f', accent: '#00ff7f', text: '#ccc' }, 'Crimson Ops 🩸': { bg: '#1a0000', accent: '#ff0000', text: '#fff' }, 'Aurora 🌊': { bg: '#001a33', accent: '#00ffff', text: '#fff' }, }

export default function PhantomVault() { const canvasRef = useRef(null) const [theme, setTheme] = useState('Phantom Dark') const [pinInput, setPinInput] = useState('') const [storedPinHash, setStoredPinHash] = useState(null) const [wrongAttempts, setWrongAttempts] = useState(0) const [lockoutTime, setLockoutTime] = useState(0) const [vaultTab, setVaultTab] = useState('Disguise') const [notes, setNotes] = useState([]) const [activityLog, setActivityLog] = useState([]) const [files, setFiles] = useState([{ id:1, name:'SecretDoc.txt' }]) const [disguiseMode, setDisguiseMode] = useState('Default') const [passwords, setPasswords] = useState([]) const [searchQuery, setSearchQuery] = useState('')

// --------------------------- // LocalStorage Init // --------------------------- useEffect(() => { const savedTheme = localStorage.getItem('phantom.theme') if (savedTheme) setTheme(savedTheme)

const savedTab = localStorage.getItem('phantom.tab')
if (savedTab) setVaultTab(savedTab)

const savedNotes = JSON.parse(localStorage.getItem('phantom.notes') || '[]')
setNotes(savedNotes)

const savedLog = JSON.parse(localStorage.getItem('phantom.log') || '[]')
setActivityLog(savedLog)

const savedDisguise = localStorage.getItem('phantom.disguise')
if (savedDisguise) setDisguiseMode(savedDisguise)

const savedPasswords = JSON.parse(localStorage.getItem('phantom.passwords') || '[]')
setPasswords(savedPasswords)

(async () => {
  const storedHash = localStorage.getItem('phantom.pinHash')
  if (storedHash) setStoredPinHash(storedHash)
  else {
    const defaultHash = await sha256Hex('password')
    localStorage.setItem('phantom.pinHash', defaultHash)
    setStoredPinHash(defaultHash)
  }
})()

}, [])

// --------------------------- // Theme persistence // --------------------------- useEffect(() => { localStorage.setItem('phantom.theme', theme) const t = THEMES[theme] if (t) Object.entries(t).forEach(([k,v]) => document.documentElement.style.setProperty(--${k}, v)) }, [theme])

// --------------------------- // Lockout timer // --------------------------- useEffect(() => { if (lockoutTime > 0) { const timer = setInterval(() => setLockoutTime(t => Math.max(t - 1, 0)), 1000) return () => clearInterval(timer) } }, [lockoutTime])

// --------------------------- // PIN validation & intruder capture // --------------------------- const handlePinKey = async (key) => { if (lockoutTime>0) return const next = pinInput + key setPinInput(next) if (next.length>=4 && storedPinHash) { const h = await sha256Hex(next) if (h === storedPinHash) { setWrongAttempts(0) logActivity('Vault unlocked') alert('Vault unlocked!') setPinInput('') } else { const attempts = wrongAttempts + 1 setWrongAttempts(attempts) logActivity('Wrong PIN attempt') setPinInput('') if (attempts >= 3) captureIntruder() if (attempts>=5) setLockoutTime(60) } } }

const captureIntruder = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ video: true }) const video = document.createElement('video') video.srcObject = stream await video.play() const canvas = document.createElement('canvas') canvas.width = video.videoWidth canvas.height = video.videoHeight const ctx = canvas.getContext('2d') ctx.drawImage(video,0,0) const dataUrl = canvas.toDataURL() logActivity('Intruder capture taken') stream.getTracks().forEach(t=>t.stop()) // store locally for demo localStorage.setItem('phantom.intruder', dataUrl) } catch(err){console.warn('Intruder capture failed',err)} }

const logActivity = (msg) => { const ts = new Date().toISOString() const updated = [{ msg, ts }, ...activityLog] setActivityLog(updated) localStorage.setItem('phantom.log', JSON.stringify(updated)) }

// --------------------------- // Notes // --------------------------- const saveNote = (text) => { const updated = [...notes, { id: Date.now(), text }] setNotes(updated) localStorage.setItem('phantom.notes', JSON.stringify(updated)) logActivity('Note saved') } const deleteNote = (id) => { const updated = notes.filter(n=>n.id!==id) setNotes(updated) localStorage.setItem('phantom.notes', JSON.stringify(updated)) logActivity('Note deleted') }

// --------------------------- // Password Manager // --------------------------- const savePassword = (site,user,p
