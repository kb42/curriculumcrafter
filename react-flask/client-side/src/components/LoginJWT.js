import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import API_BASE_URL from '../config';

function LoginJWT() {
  const [formMode, setFormMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    netid: '',
    majorid: '',
    egrad: 1,
  });
  const [majors, setMajors] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const numbers = Array.from({ length: 11 }, (_, i) => 1 + i * 0.5);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/majors`)
      .then((response) => response.json())
      .then((data) => setMajors(data))
      .catch((error) => console.error('Error fetching majors:', error));
  }, []);

  const toggleForm = (mode) => {
    setFormMode(mode);
    setMessage('');
    setMessageType('');
    setFormData({
      username: '',
      password: '',
      name: '',
      netid: '',
      majorid: '',
      egrad: 1,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        name: formData.name,
        netid: formData.netid,
        majorid: formData.majorid,
        egrad: formData.egrad
      };
    } else if (formMode === 'update') {
      endpoint = `${API_BASE_URL}/api/auth/update-profile`;
      method = 'PUT';
      payload = {
        name: formData.name,
        majorid: formData.majorid,
        egrad: formData.egrad
      };
    }

    try {
      const headers = { 'Content-Type': 'application/json' };

      // Add JWT token for update operation
      if (formMode === 'update') {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        const successMessage =
          formMode === 'login'
            ? 'Login successful!'
            : formMode === 'create'
            ? 'Account created successfully! Please login.'
            : 'Information updated successfully!';

        setMessage(successMessage);
        setMessageType('success');

        if (formMode === 'login') {
          // Store JWT token and user info
          localStorage.setItem('token', result.access_token);
          localStorage.setItem('netid', result.netid);
          localStorage.setItem('name', result.name);
          setTimeout(() => navigate('/combinedpage'), 2000);
        } else if (formMode === 'create') {
          // After successful registration, switch to login mode
          setTimeout(() => toggleForm('login'), 2000);
        }
      } else {
        setMessage(result.error || 'Something went wrong.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error connecting to the server.');
      setMessageType('error');
    }
  };

  return (
    <div id="form-container">
      <div className="toggle-container">
        <button
          onClick={() => toggleForm('login')}
          className={`toggle-button ${formMode === 'login' ? 'active' : ''}`}
        >
          Login
        </button>
        <button
          onClick={() => toggleForm('create')}
          className={`toggle-button ${formMode === 'create' ? 'active' : ''}`}
        >
          Create Account
        </button>
        <button
          onClick={() => toggleForm('update')}
          className={`toggle-button ${formMode === 'update' ? 'active' : ''}`}
        >
          Update Information
        </button>
      </div>
      <h1>
        {formMode === 'login'
          ? 'Login'
          : formMode === 'create'
          ? 'Create Account'
          : 'Update Information'}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Login Mode */}
        {formMode === 'login' && (
          <>
            <label htmlFor="login-username">Username</label>
            <input
              type="text"
              id="login-username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              required
            />

            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </>
        )}

        {/* Create Account Mode */}
        {formMode === 'create' && (
          <>
            <label htmlFor="create-username">Username</label>
            <input
              type="text"
              id="create-username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              required
            />

            <label htmlFor="create-password">Password</label>
            <input
              type="password"
              id="create-password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Choose a password"
              required
              minLength="6"
            />

            <label htmlFor="create-netid">NetID</label>
            <input
              type="text"
              id="create-netid"
              name="netid"
              value={formData.netid}
              onChange={handleInputChange}
              placeholder="Enter your NetID"
              required
            />

            <label htmlFor="create-name">Name</label>
            <input
              type="text"
              id="create-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />

            <label htmlFor="create-majorid">Major</label>
            <select
              id="create-majorid"
              name="majorid"
              value={formData.majorid}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a major</option>
              {majors.map((major) => (
                <option key={major.MajorID} value={major.MajorID}>
                  {major.MajorID}
                </option>
              ))}
            </select>

            <label htmlFor="create-egrad">Expected Graduation (years)</label>
            <select
              id="create-egrad"
              name="egrad"
              value={formData.egrad}
              onChange={handleInputChange}
              required
            >
              {numbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Update Information Mode */}
        {formMode === 'update' && (
          <>
            <label htmlFor="update-name">Name</label>
            <input
              type="text"
              id="update-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />

            <label htmlFor="update-majorid">Major</label>
            <select
              id="update-majorid"
              name="majorid"
              value={formData.majorid}
              onChange={handleInputChange}
            >
              <option value="">Select a major</option>
              {majors.map((major) => (
                <option key={major.MajorID} value={major.MajorID}>
                  {major.MajorID}
                </option>
              ))}
            </select>

            <label htmlFor="update-egrad">Expected Graduation (years)</label>
            <select
              id="update-egrad"
              name="egrad"
              value={formData.egrad}
              onChange={handleInputChange}
            >
              {numbers.map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </>
        )}

        <input
          type="submit"
          value={
            formMode === 'login'
              ? 'Login'
              : formMode === 'create'
              ? 'Create Account'
              : 'Update Information'
          }
        />
      </form>

      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
}

export default LoginJWT;
