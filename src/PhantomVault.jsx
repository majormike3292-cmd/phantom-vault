import React, { useState, useEffect, useRef } from 'react'

// ---------------------------
// Utility functions
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
  const [notes, setNotes] = useState([]) // encrypted notepad
  const [activityLog, setActivityLog] = useState([])
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
    if (t) {
      Object.entries(t).forEach(([k,v]) => {
        document.documentElement.style.setProperty(`--${k}`, v)
      })
    }
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
      pts.for
