import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import API_BASE_URL from '../config';

function Auth() {
  const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('token'));
  const [formMode, setFormMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    netid: '',
    majorid: '',
    egrad: 1,
  });
  const [profileData, setProfileData] = useState({
    name: '',
    majorid: '',
    egrad: 1,
  });
  const [majors, setMajors] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileMessageType, setProfileMessageType] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const numbers = Array.from({ length: 11 }, (_, i) => 1 + i * 0.5);
  const navigate = useNavigate();

  // Fetch majors on component mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/majors`)
      .then((response) => response.json())
      .then((data) => setMajors(data))
      .catch((error) => console.error('Error fetching majors:', error));
  }, []);

  // Load user info if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('name');
    const majorid = localStorage.getItem('majorid');
    const egrad = localStorage.getItem('egrad');
    if (token) {
      setIsAuthed(true);
      setProfileData({
        name: name || '',
        majorid: majorid || '',
        egrad: egrad ? parseFloat(egrad) : 1,
      });
    }
  }, []);

  const toggleForm = (mode) => {
    setFormMode(mode);
    setMessage('');
    setMessageType('');
    setErrors({});
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      name: '',
      netid: '',
      majorid: '',
      egrad: 1,
    });
    setProfileMessage('');
    setProfileMessageType('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const validateNetID = (netid) => {
    if (!netid || netid.length < 3) {
      return 'NetID must be at least 3 characters long';
    }
    if (!/^[a-zA-Z0-9]+$/.test(netid)) {
      return 'NetID can only contain letters and numbers';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};

    if (formMode === 'login') {
      if (!formData.username) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else if (formMode === 'create') {
      const usernameError = validateUsername(formData.username);
      if (usernameError) newErrors.username = usernameError;

      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      const netidError = validateNetID(formData.netid);
      if (netidError) newErrors.netid = netidError;

      if (!formData.name || formData.name.trim().length < 2) {
        newErrors.name = 'Full name is required';
      }

      if (!formData.majorid) {
        newErrors.majorid = 'Please select a major';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setMessage('Please fix the errors above');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    let endpoint = '';
    let method = 'POST';
    let payload = {};

    if (formMode === 'login') {
      endpoint = `${API_BASE_URL}/api/auth/login`;
      payload = {
        username: formData.username,
        password: formData.password
      };
    } else if (formMode === 'create') {
      endpoint = `${API_BASE_URL}/api/auth/register`;
      payload = {
        username: formData.username,
        password: formData.password,
        name: formData.name.trim(),
        netid: formData.netid,
        majorid: formData.majorid,
        egrad: parseFloat(formData.egrad)
      };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        let successMessage = '';

        if (formMode === 'login') {
          successMessage = 'Login successful! Redirecting...';
          // Store JWT token and user info
          localStorage.setItem('token', result.access_token);
          localStorage.setItem('netid', result.netid);
          localStorage.setItem('name', result.name);
          localStorage.setItem('majorid', result.majorid || '');
          localStorage.setItem('egrad', result.egrad || '');

          setMessage(successMessage);
          setMessageType('success');

          // Redirect to plans page
          setTimeout(() => {
            navigate('/combinedpage');
          }, 1000);
        } else if (formMode === 'create') {
          successMessage = 'Account created successfully! Please login.';
          setMessage(successMessage);
          setMessageType('success');
          setTimeout(() => toggleForm('login'), 2000);
        } 
      } else {
        setMessage(result.error || 'Something went wrong. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Request error:', error);
      setMessage('Error connecting to the server. Please check your connection.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#ff4444' };
    if (strength <= 4) return { strength, label: 'Medium', color: '#ffaa00' };
    return { strength, label: 'Strong', color: '#00C851' };
  };

  const passwordStrength = formMode === 'create' ? getPasswordStrength(formData.password) : null;

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');

    if (!token) {
      setProfileMessage('Please login first to update your profile');
      setProfileMessageType('error');
      return;
    }

    headers['Authorization'] = `Bearer ${token}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          name: profileData.name.trim(),
          majorid: profileData.majorid,
          egrad: parseFloat(profileData.egrad)
        })
      });

      const result = await response.json();
      if (response.ok) {
        localStorage.setItem('name', profileData.name);
        localStorage.setItem('majorid', profileData.majorid);
        localStorage.setItem('egrad', profileData.egrad);
        setProfileMessage('Profile updated successfully!');
        setProfileMessageType('success');
      } else {
        setProfileMessage(result.error || 'Something went wrong. Please try again.');
        setProfileMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setProfileMessage('Error connecting to the server.');
      setProfileMessageType('error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    localStorage.removeItem('majorid');
    localStorage.removeItem('egrad');

    // Dispatch custom event to notify other components (like navbar)
    window.dispatchEvent(new Event('authChange'));

    setIsAuthed(false);
    setFormMode('login');
    setProfileData({ name: '', majorid: '', egrad: 1 });
    setMessage('');
    setProfileMessage('');
    navigate('/login');
  };

  return (
    <div className="page-shell">
      <div className="page-grid">
        <div className="auth-layout">
          <div className="glass-card hero-card auth-hero">
          <div className="eyebrow">CurriculumCrafter</div>
          <h1>Plan your academic journey with clarity</h1>
          <p className="muted-strong">
            A focused workspace to sign in, register, or tune your profile before diving into your academic plans.
          </p>

          <div className="badge-row" style={{ marginTop: '18px' }}>
            <span className="tag accent">JWT Secure</span>
            <span className="tag soft">Student-first</span>
            <span className="tag">No frills login</span>
          </div>

          <ul className="list-reset" style={{ marginTop: '18px' }}>
            <li>Stay signed in securely while you explore your plans</li>
            <li>Sign up quickly, then update your profile once you're logged in</li>
            <li>Built to mirror the streamlined flow from our design mockups</li>
          </ul>
        </div>

        <div className="glass-card auth-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Account Center</p>
              <h2>
                {formMode === 'login'
                  ? 'Welcome Back'
                  : formMode === 'create'
                  ? 'Create your account'
                  : 'Account'}
              </h2>
              <p className="muted">
                Choose a mode to continue. You can hop between tabs without losing your place.
              </p>
            </div>
            {isAuthed && (
              <div className="badge-row">
                <span className="chip">Logged in as {localStorage.getItem('name') || localStorage.getItem('netid')}</span>
                <button className="btn ghost" type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>

          {!isAuthed && (
            <div className="tab-switch">
              <button
                onClick={() => toggleForm('login')}
                className={`tab-button ${formMode === 'login' ? 'active' : ''}`}
                disabled={isLoading}
              >
                Login
              </button>
              <button
                onClick={() => toggleForm('create')}
                className={`tab-button ${formMode === 'create' ? 'active' : ''}`}
                disabled={isLoading}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form-grid">
            {/* Login Mode */}
            {formMode === 'login' && (
              <>
                <div className="field">
                  <label htmlFor="login-username">Username</label>
                  <input
                    type="text"
                    id="login-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className={`input ${errors.username ? 'has-error' : ''}`}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>

                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`input ${errors.password ? 'has-error' : ''}`}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-password btn ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
              </>
            )}

            {/* Create Account Mode */}
            {formMode === 'create' && (
              <>
                <div className="field">
                  <label htmlFor="create-username">Username *</label>
                  <input
                    type="text"
                    id="create-username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Choose a unique username"
                    className={`input ${errors.username ? 'has-error' : ''}`}
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                  <small className="hint-text">3+ characters, letters, numbers, and underscores only</small>
                </div>

                <div className="field">
                  <label htmlFor="create-password">Password *</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="create-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className={`input ${errors.password ? 'has-error' : ''}`}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="toggle-password btn ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                  {passwordStrength && formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar-container">
                        <div
                          className="strength-bar"
                          style={{
                            width: `${(passwordStrength.strength / 6) * 100}%`,
                            backgroundColor: passwordStrength.color
                          }}
                        />
                      </div>
                      <span style={{ color: passwordStrength.color, fontSize: '12px' }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                  <small className="hint-text">6+ characters, with uppercase, lowercase, and numbers</small>
                </div>

                <div className="field">
                  <label htmlFor="confirm-password">Confirm Password *</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter your password"
                    className={`input ${errors.confirmPassword ? 'has-error' : ''}`}
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="field">
                  <label htmlFor="create-netid">NetID *</label>
                  <input
                    type="text"
                    id="create-netid"
                    name="netid"
                    value={formData.netid}
                    onChange={handleInputChange}
                    placeholder="Your university NetID"
                    className={`input ${errors.netid ? 'has-error' : ''}`}
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  {errors.netid && <span className="error-text">{errors.netid}</span>}
                </div>

                <div className="field">
                  <label htmlFor="create-name">Full Name *</label>
                  <input
                    type="text"
                    id="create-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`input ${errors.name ? 'has-error' : ''}`}
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="field">
                  <label htmlFor="create-majorid">Major *</label>
                  <select
                    id="create-majorid"
                    name="majorid"
                    value={formData.majorid}
                    onChange={handleInputChange}
                    className={`input ${errors.majorid ? 'has-error' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">-- Select your major --</option>
                    {majors.map((major) => (
                      <option key={major.MajorID} value={major.MajorID}>
                        {major.MajorID}
                      </option>
                    ))}
                  </select>
                  {errors.majorid && <span className="error-text">{errors.majorid}</span>}
                </div>

                <div className="field">
                  <label htmlFor="create-egrad">Expected Graduation (years) *</label>
                  <select
                    id="create-egrad"
                    name="egrad"
                    value={formData.egrad}
                    onChange={handleInputChange}
                    className="input"
                    disabled={isLoading}
                  >
                    {numbers.map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'year' : 'years'}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className={`btn primary ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">Processing...</span>
              ) : (
                formMode === 'login'
                  ? 'Login'
                  : 'Create Account'
              )}
            </button>
          </form>

          {message && (
            <div className={`inline-alert ${messageType === 'success' ? 'success' : 'error'}`}>
              <span>{messageType === 'success' ? '✓' : '✗'}</span> {message}
            </div>
          )}

          {formMode === 'create' && (
            <p className="form-footer">
              Already have an account?{' '}
              <button
                className="link-button"
                onClick={() => toggleForm('login')}
                disabled={isLoading}
              >
                Login here
              </button>
            </p>
          )}

          {formMode === 'login' && (
            <p className="form-footer">
              Don't have an account?{' '}
              <button
                className="link-button"
                onClick={() => toggleForm('create')}
                disabled={isLoading}
              >
                Sign up here
              </button>
            </p>
          )}
        </div>
      </div>

      {isAuthed && (
        <div className="glass-card stack profile-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Profile</p>
              <h3>Update your information</h3>
            </div>
            <span className="chip soft">Logged in</span>
          </div>

          <form className="form-grid" onSubmit={handleProfileUpdate}>
            <div className="field">
              <label htmlFor="profile-name">Full Name</label>
              <input
                type="text"
                id="profile-name"
                name="name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input"
                placeholder="Update your name"
              />
            </div>
            <div className="field">
              <label htmlFor="profile-major">Major</label>
              <select
                id="profile-major"
                name="majorid"
                value={profileData.majorid}
                onChange={(e) => setProfileData({ ...profileData, majorid: e.target.value })}
                className="input"
              >
                <option value="">-- Select your major --</option>
                {majors.map((major) => (
                  <option key={major.MajorID} value={major.MajorID}>
                    {major.MajorID}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-egrad">Expected Graduation (years)</label>
              <select
                id="profile-egrad"
                name="egrad"
                value={profileData.egrad}
                onChange={(e) => setProfileData({ ...profileData, egrad: e.target.value })}
                className="input"
              >
                {numbers.map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'year' : 'years'}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn primary" type="submit">Save changes</button>
          </form>

          {profileMessage && (
            <div className={`inline-alert ${profileMessageType === 'success' ? 'success' : 'error'}`}>
              <span>{profileMessageType === 'success' ? '✓' : '✗'}</span> {profileMessage}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
}

export default Auth;
