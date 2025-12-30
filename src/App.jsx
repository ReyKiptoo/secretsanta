import React, { useState, useEffect } from 'react';
import './index.css';

const FAMILY_NAMES = [
  'Evaline', 'Florence', 'Leonard', 'Howard', 'Faith', 
  'Reinhard', 'Florida', 'Barrack', 'Bahati', 'Jaba (Kipkalya Sr.)', 
  'Fadhili', 'Kai (Kipkalya Jr.)'
];

const ADMIN_PASSWORD = 'korir2025';

function App() {
  const [pairings, setPairings] = useState(null);
  const [revealedFor, setRevealedFor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [password, setPassword] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setPairings(decoded);
      } catch (e) {
        console.error("Invalid data in URL");
      }
    }
    
    const savedRevealed = localStorage.getItem('ss_revealed');
    if (savedRevealed) setRevealedFor(JSON.parse(savedRevealed));
  }, []);

  const generatePairings = () => {
    let names = [...FAMILY_NAMES];
    let shuffled = [...names].sort(() => Math.random() - 0.5);
    
    // Ensure derangement (no one gets themselves)
    // A simple way is to shift the shuffled array by 1
    const pairs = {};
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length];
      pairs[giver] = receiver;
    }
    
    const encoded = btoa(JSON.stringify(pairs));
    const newUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    window.location.href = newUrl;
  };

  const handleReveal = (name) => {
    setCurrentUser(name);
    setIsRevealing(true);
    
    const newRevealed = { ...revealedFor, [name]: true };
    setRevealedFor(newRevealed);
    localStorage.setItem('ss_revealed', JSON.stringify(newRevealed));
  };

  const handleReset = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.removeItem('ss_revealed');
      window.location.href = window.location.origin + window.location.pathname;
    } else {
      alert("Incorrect password");
    }
  };

  if (!pairings) {
    return (
      <div className="container admin-setup">
        <div className="snow-bg"></div>
        <div className="glass-card">
          <h1>🎄 Secret Santa Setup</h1>
          <p>Click the button below to generate the secret pairings and get your shareable link.</p>
          <button className="primary-btn" onClick={generatePairings}>🎁 Generate & Copy Link</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="snow-bg"></div>
      
      <header>
        <h1>🎅 Secret Santa 2025</h1>
        <p className="subtitle">Find your name to reveal your gift recipient</p>
      </header>

      <div className="name-grid">
        {FAMILY_NAMES.map(name => (
          <div 
            key={name} 
            className={`name-card ${revealedFor?.[name] ? 'opened' : ''}`}
            onClick={() => !revealedFor?.[name] && handleReveal(name)}
          >
            <div className="card-inner">
              <span className="name-text">{name}</span>
              {revealedFor?.[name] && <span className="status-tag">See Revealed</span>}
            </div>
          </div>
        ))}
      </div>

      {isRevealing && (
        <div className="modal-overlay" onClick={() => setIsRevealing(false)}>
          <div className="reveal-card glass-card animate-pop" onClick={e => e.stopPropagation()}>
            <h2>Hello {currentUser}!</h2>
            <p>You are the Secret Santa for:</p>
            <div className="recipient-name">
              {pairings[currentUser]}
            </div>
            <p className="hint">Keep it a secret! 🤫</p>
            <button className="close-btn" onClick={() => setIsRevealing(false)}>Close</button>
          </div>
        </div>
      )}

      <footer>
        <button className="reset-trigger" onClick={() => setShowReset(true)}>Reset System</button>
        {showReset && (
          <div className="reset-form">
            <input 
              type="password" 
              placeholder="Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleReset}>Confirm Reset</button>
            <button className="cancel" onClick={() => setShowReset(false)}>Cancel</button>
          </div>
        )}
      </footer>
    </div>
  );
}

export default App;
