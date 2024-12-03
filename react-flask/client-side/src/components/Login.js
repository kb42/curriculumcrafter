import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    netid: '',
    majorid: '',
    egrad: 1,
  });
  const [message, setMessage] = useState('');

  const numbers = Array.from({ length: 11 }, (_, i) => 1 + i * 0.5);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setMessage(''); // Clear message on form toggle
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/create-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (response.ok) {
          setMessage('Account created successfully!');
        } else {
          setMessage(result.error || 'Something went wrong.');
        }
      } catch (error) {
        setMessage('Error connecting to the server.');
      }
    }
  };

  return (
    <div id="form-container">
      <h1>{isLogin ? 'Login' : 'Create Account'}</h1>

      {isLogin ? (
        <form id="login-form">
          <label htmlFor="login-name">Name</label>
          <input type="text" id="login-name" name="name" placeholder="Enter your name" />

          <label htmlFor="login-netid">NetID</label>
          <input type="text" id="login-netid" name="netid" placeholder="Enter your NetID" />

          <input type="submit" value="Login" />
        </form>
      ) : (
        <form id="create-account-form" onSubmit={handleSubmit}>
          <label htmlFor="create-egrad">Expected Graduation</label>
          <select id="create-egrad" name="egrad" value={formData.egrad} onChange={handleInputChange}>
            {numbers.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>

          <label htmlFor="create-majorid">Major Name</label>
          <input
            type="text"
            id="create-majorid"
            name="majorid"
            value={formData.majorid}
            onChange={handleInputChange}
            placeholder="Enter your major"
          />

          <label htmlFor="create-name">Name</label>
          <input
            type="text"
            id="create-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />

          <label htmlFor="create-netid">NetID</label>
          <input
            type="text"
            id="create-netid"
            name="netid"
            value={formData.netid}
            onChange={handleInputChange}
            placeholder="Enter your NetID"
          />

          <input type="submit" value="Create Account" />
        </form>
      )}

      {message && <p className="message">{message}</p>}

      <button onClick={toggleForm} id="toggle-button">
        {isLogin ? 'Switch to Create Account' : 'Switch to Login'}
      </button>
    </div>
  );
}

export default Login;
