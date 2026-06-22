const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

class AuthService {
  constructor() {
    this.apiBaseUrl = `${API_URL}/api/auth`;
  }

  async requestJson(path, options = {}) {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({
      success: false,
      message: 'The server returned an invalid response',
    }));
    if (!response.ok) throw data;
    return data;
  }

  storeSession(response) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async register(userData) {
    const response = await this.requestJson('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return this.storeSession(response);
  }

  async login(username, password) {
    const response = await this.requestJson('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return this.storeSession(response);
  }

  async verifySession() {
    const token = this.getToken();
    if (!token) throw { success: false, message: 'Authentication required' };
    const response = await this.requestJson('/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async updateProfile(profile) {
    const response = await this.requestJson('/profile', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.getToken()}` },
      body: JSON.stringify(profile),
    });
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.requestJson('/password', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${this.getToken()}` },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
  }

  async requestPasswordReset(email) {
    const response = await this.requestJson('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (response.resetToken) {
      sessionStorage.setItem('passwordResetEmail', email);
      sessionStorage.setItem('passwordResetToken', response.resetToken);
    }
    return response;
  }

  async resetPassword(email, resetToken, newPassword, confirmPassword) {
    const response = await this.requestJson('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetToken, newPassword, confirmPassword }),
    });
    sessionStorage.removeItem('passwordResetEmail');
    sessionStorage.removeItem('passwordResetToken');
    return response;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return Boolean(this.getToken());
  }
}

export default new AuthService();
