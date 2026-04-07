import React from 'react'

export default function PhantomVault() {
  return (
    <div style={styles.container}>
      <div style={styles.gradientBackground}></div>
      <h1 style={styles.glowText}>Phantom Vault</h1>
    </div>
  )
}

export const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#080810',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%',
    height: '200%',
    background: 'linear-gradient(270deg, #ff00ff, #00ffff, #ff00ff, #00ffff)',
    backgroundSize: '800% 800%',
    animation: 'gradientShift 15s ease infinite',
    zIndex: 0,
  },
  glowText: {
    position: 'relative',
    zIndex: 1,
    color: '#00ffff',
    fontSize: '4rem',
    fontFamily: 'Arial, sans-serif',
    textShadow: `
      0 0 5px #00ffff,
      0 0 10px #00ffff,
      0 0 20px #00ffff,
      0 0 40px #0ff,
      0 0 80px #0ff
    `,
    animation: 'glowPulse 2s infinite alternate',
  },
}
