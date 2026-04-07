import React from 'react'

export default function PhantomVault() {
  return (
    <div style={styles.container}>
      <h1 style={styles.glowText}>Phantom Vault</h1>
    </div>
  )
}

export const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#080810',
  },
  glowText: {
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
