/**
 * API utility functions for authenticated requests
 * Automatically adds JWT token to headers
 */

import API_BASE_URL from '../config';

/**
 * Get authorization headers with JWT token
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Make authenticated GET request
 */
export async function authGet(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    // Token expired or invalid, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
}

/**
 * Make authenticated POST request
 */
export async function authPost(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
}

/**
 * Make authenticated PUT request
 */
export async function authPut(endpoint, data) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
}

/**
 * Make authenticated DELETE request
 */
export async function authDelete(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('netid');
    localStorage.removeItem('name');
    window.location.href = '/login';
    throw new Error('Authentication required');
  }

  return response;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('netid');
  localStorage.removeItem('name');
  window.location.href = '/login';
}
