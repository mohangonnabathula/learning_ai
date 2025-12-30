import React, { useState } from 'react';
import './LoginScreen.css';

function LoginScreen({ onLogin, onDemoMode }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullName && email) {
      onLogin(email, fullName);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-content">
          <h1 className="login-title">ExpenseTrack</h1>
          <p className="login-subtitle">Track your spending and income with ease</p>

          {!showForm ? (
            <div className="login-options">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => setShowForm(true)}
              >
                Get Started
              </button>
              <button 
                className="btn btn-secondary btn-large"
                onClick={onDemoMode}
              >
                Demo Mode
              </button>
              <p className="demo-note">Continue as Demo User</p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-large">
                Sign In
              </button>

              <button 
                type="button"
                className="btn-link"
                onClick={() => setShowForm(false)}
              >
                Back
              </button>
            </form>
          )}

          <div className="features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Track daily spending and income</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Monthly financial reports</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Categorized expense tracking</span>
            </div>
          </div>

          {!showForm && (
            <p className="privacy-note">Demo • No data is stored on servers</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
