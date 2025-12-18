import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import API_BASE_URL from '../config';

function Auth() {
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
  const [majors, setMajors] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
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
    if (token && formMode === 'update') {
      // Load current user info for update form
      const name = localStorage.getItem('name');
      const majorid = localStorage.getItem('majorid');
      const egrad = localStorage.getItem('egrad');
      setFormData(prev => ({
        ...prev,
        name: name || '',
        majorid: majorid || '',
        egrad: egrad ? parseFloat(egrad) : 1
      }));
    }
  }, [formMode]);

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
    } else if (formMode === 'update') {
      if (formData.name && formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
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
    } else if (formMode === 'update') {
      endpoint = `${API_BASE_URL}/api/auth/update-profile`;
      method = 'PUT';
      payload = {
        name: formData.name.trim(),
        majorid: formData.majorid,
        egrad: parseFloat(formData.egrad)
      };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };

      // Add JWT token for update operation
      if (formMode === 'update') {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          setMessage('Please login first to update your profile');
          setMessageType('error');
          setIsLoading(false);
          return;
        }
      }

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
          setTimeout(() => navigate('/combinedpage'), 1500);
        } else if (formMode === 'create') {
          successMessage = 'Account created successfully! Please login.';
          setMessage(successMessage);
          setMessageType('success');
          setTimeout(() => toggleForm('login'), 2000);
        } else if (formMode === 'update') {
          successMessage = 'Profile updated successfully!';
          // Update stored user info
          localStorage.setItem('name', formData.name);
          localStorage.setItem('majorid', formData.majorid);
          localStorage.setItem('egrad', formData.egrad);
          setMessage(successMessage);
          setMessageType('success');
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

  return (
    <div className="page-shell">
      <div className="page-grid two-column auth-layout">
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
            <li>Swap between login, sign up, and profile updates instantly</li>
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
                  : 'Tune your profile'}
              </h2>
              <p className="muted">
                Choose a mode to continue. You can hop between tabs without losing your place.
              </p>
            </div>
          </div>

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
            <button
              onClick={() => toggleForm('update')}
              className={`tab-button ${formMode === 'update' ? 'active' : ''}`}
              disabled={isLoading}
            >
              Update Profile
            </button>
          </div>

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

            {/* Update Information Mode */}
            {formMode === 'update' && (
              <>
                <div className="field">
                  <label htmlFor="update-name">Full Name</label>
                  <input
                    type="text"
                    id="update-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`input ${errors.name ? 'has-error' : ''}`}
                    disabled={isLoading}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="field">
                  <label htmlFor="update-majorid">Major</label>
                  <select
                    id="update-majorid"
                    name="majorid"
                    value={formData.majorid}
                    onChange={handleInputChange}
                    className="input"
                    disabled={isLoading}
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
                  <label htmlFor="update-egrad">Expected Graduation (years)</label>
                  <select
                    id="update-egrad"
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
                  : formMode === 'create'
                  ? 'Create Account'
                  : 'Update Information'
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
    </div>
  );
}

export default Auth;
