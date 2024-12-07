import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [formMode, setFormMode] = useState('login'); // 'login', 'create', 'update'
  const [formData, setFormData] = useState({
    name: '',
    netid: '',
    majorid: '',
    egrad: 1,
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const numbers = Array.from({ length: 11 }, (_, i) => 1 + i * 0.5);

  const toggleForm = (mode) => {
    setFormMode(mode);
    setMessage('');
    setMessageType('');
    setFormData({
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
    let method = '';

    if (formMode === 'login') {
      endpoint = 'http://127.0.0.1:5000/api/login';
      method = 'POST';
    } else if (formMode === 'create') {
      endpoint = 'http://127.0.0.1:5000/api/create-account';
      method = 'POST';
    } else if (formMode === 'update') {
      endpoint = 'http://127.0.0.1:5000/api/update-account';
      method = 'PUT';
    }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        const successMessage =
          formMode === 'login'
            ? 'Login successful!'
            : formMode === 'create'
            ? 'Account created successfully!'
            : 'Information updated successfully!';
        setMessage(successMessage);
        setMessageType('success');
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
      <h1>
        {formMode === 'login'
          ? 'Login'
          : formMode === 'create'
          ? 'Create Account'
          : 'Update Information'}
      </h1>

      <form onSubmit={handleSubmit}>
        {formMode !== 'create' && (
          <>
            <label htmlFor="login-netid">NetID</label>
            <input
              type="text"
              id="login-netid"
              name="netid"
              value={formData.netid}
              onChange={handleInputChange}
              placeholder="Enter your NetID"
              required
            />

            <label htmlFor="update-name">Name</label>
            <input
              type="text"
              id="update-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />
          </>
        )}

        {(formMode === 'update') && (
          <>

          <label htmlFor="update-majorid">Major Name</label>
          <input
            type="text"
            id="update-majorid"
            name="majorid"
            value={formData.majorid}
            onChange={handleInputChange}
            placeholder="Enter your major"
          />

          <label htmlFor="update-egrad">Expected Graduation</label>
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

        {(formMode === 'create') && (
          <>

            <label htmlFor="login-netid">NetID</label>
            <input
              type="text"
              id="login-netid"
              name="netid"
              value={formData.netid}
              onChange={handleInputChange}
              placeholder="Enter your NetID"
              required
            />
            
            <label htmlFor="update-name">Name</label>
            <input
              type="text"
              id="update-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
            />

            <label htmlFor="update-majorid">Major Name</label>
            <input
              type="text"
              id="update-majorid"
              name="majorid"
              value={formData.majorid}
              onChange={handleInputChange}
              placeholder="Enter your major"
            />

            <label htmlFor="update-egrad">Expected Graduation</label>
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

      {message && (
        <p className={`message ${messageType}`}>{message}</p>
      )}

      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={() => toggleForm('login')} id="toggle-button">
          Login
        </button>
        <button onClick={() => toggleForm('create')} id="toggle-button">
          Create Account
        </button>
        <button onClick={() => toggleForm('update')} id="toggle-button">
          Update Information
        </button>
      </div>
    </div>
  );
}

export default Login;
