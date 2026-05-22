const API_URL = 'http://localhost:5000/api';

// ── Auth ──
export const loginCall = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }
  return response.json();
};

export const registerCall = async (name, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  return response.json();
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

export const updateProfile = async (token, data) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

// ── Admin User Management ──
export const fetchAllUsers = async (token) => {
  const response = await fetch(`${API_URL}/auth/users`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const deleteUser = async (token, id) => {
  const response = await fetch(`${API_URL}/auth/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

// ── Products ──
export const fetchProducts = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/products?${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
};

export const fetchProductById = async (token, id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
};

export const createProduct = async (token, formData) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData, // FormData for multipart upload
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Failed to create product');
  }
  return response.json();
};

export const updateProduct = async (token, id, formData) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to update product');
  return response.json();
};

export const deleteProduct = async (token, id) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete product');
  return response.json();
};

// ── Orders ──
export const fetchOrders = async (token, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/orders?${queryString}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
};

export const updateOrderStatus = async (token, id, status) => {
  const response = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
};

export const deleteOrder = async (token, id) => {
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to delete order');
  return response.json();
};

// ── Analytics ──
export const fetchDashboardStats = async (token) => {
  const response = await fetch(`${API_URL}/analytics/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
};

// ── AI ──
export const generateAIContent = async (token, id) => {
  const response = await fetch(`${API_URL}/ai/generate/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate AI content');
  }
  return response.json();
};

export const improveAIDescription = async (token, id) => {
  const response = await fetch(`${API_URL}/ai/improve/${id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to improve description');
  }
  return response.json();
};

export const fetchAISalesSuggestions = async (token) => {
  const response = await fetch(`${API_URL}/ai/sales-suggestions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch AI suggestions');
  return response.json();
};
