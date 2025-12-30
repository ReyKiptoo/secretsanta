import React, { useState, useEffect } from 'react';
import './index.css';

const FAMILY_NAMES = [
  'Evaline', 'Florence', 'Leonard', 'Howard', 'Faith',
  'Reinhard', 'Florida', 'Barrack', 'Bahati', 'Jaba (Kipkalya Sr.)',
  'Fadhili', 'Kai (Kipkalya Jr.)', 'VG', 'Dan'
];

const ADMIN_PASSWORD = 'korir2025';

const USER_PINS = {
  'Evaline': '8391',
  'Florence': '2457',
  'Leonard': '6108',
  'Howard': '3942',
  'Faith': '7215',
  'Reinhard': '5084',
  'Florida': '1629',
  'Barrack': '9473',
  'Bahati': '4156',
  'Jaba (Kipkalya Sr.)': '2831',
  'Fadhili': '5790',
  'Kai (Kipkalya Jr.)': '8024',
  'VG': '6317',
  'Dan': '9124'
};

function App() {
  const [pairings, setPairings] = useState(null);
  const [revealedFor, setRevealedFor] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showReset, setShowReset] = useState(false);
  const [password, setPassword] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [userPin, setUserPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [sessionRevealSuccess, setSessionRevealSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlData = params.get('data');
    if (urlData) {
      try {
        const decoded = JSON.parse(atob(urlData));
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
    const pairs = {};
    for (let i = 0; i < shuffled.length; i++) {
      pairs[shuffled[i]] = shuffled[(i + 1) % shuffled.length];
    }

    const encoded = btoa(JSON.stringify(pairs));
    const newUrl = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    window.location.href = newUrl;
  };

  const startReveal = (name) => {
    setCurrentUser(name);
    setIsRevealing(true);
    setUserPin('');
    setPinError('');
    setSessionRevealSuccess(false);
  };

  const handleRevealConfirm = () => {
    if (USER_PINS[currentUser] === userPin) {
      const newRevealed = { ...revealedFor, [currentUser]: true };
      setRevealedFor(newRevealed);
      localStorage.setItem('ss_revealed', JSON.stringify(newRevealed));
      setPinError('');
      setSessionRevealSuccess(true);
    } else {
      setPinError('Incorrect PIN ❌');
    }
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
          <p>Click the button below to generate secret pairings and create your link.</p>
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
        <p className="subtitle">Enter your secret PIN to reveal your recipient</p>
      </header>

      <div className="name-grid">
        {FAMILY_NAMES.map(name => (
          <div
            key={name}
            className={`name-card ${revealedFor?.[name] ? 'opened' : ''}`}
            onClick={() => startReveal(name)}
          >
            <div className="card-inner">
              <span className="name-text">{name}</span>
              {revealedFor?.[name] && <span className="status-tag">Already Checked</span>}
            </div>
          </div>
        ))}
      </div>

      {isRevealing && (
        <div className="modal-overlay" onClick={() => setIsRevealing(false)}>
          <div className="reveal-card glass-card animate-pop" onClick={e => e.stopPropagation()}>
            <h2>Hello {currentUser}!</h2>
            {!sessionRevealSuccess ? (
              <div className="pin-section">
                <p>Enter your 4-digit PIN:</p>
                <input
                  type="password"
                  maxLength="4"
                  className="pin-input"
                  value={userPin}
                  onChange={(e) => setUserPin(e.target.value)}
                  placeholder="0000"
                  autoFocus
                />
                {pinError && <p className="error-msg">{pinError}</p>}
                <button className="primary-btn reveal-btn" onClick={handleRevealConfirm}>Reveal Recipient</button>
              </div>
            ) : (
              <div className="result-section">
                <p>You are the Secret Santa for:</p>
                <div className="recipient-name">
                  {pairings[currentUser]}
                </div>
                <p className="hint">Keep it a secret! 🤫</p>
                <button className="close-btn" onClick={() => setIsRevealing(false)}>Close</button>
              </div>
            )}
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
