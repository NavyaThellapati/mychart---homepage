class AuthService {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api/auth';
  }

  async requestJson(path, options) {
    const response = await fetch(`${this.apiBaseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  // Register new user
  async register(userData) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validation
      if (!userData.firstName || !userData.lastName || !userData.email || !userData.phone || !userData.password) {
        throw { success: false, message: 'All fields are required' };
      }

      if (userData.password !== userData.confirmPassword) {
        throw { success: false, message: 'Passwords do not match' };
      }

      if (userData.password.length < 6) {
        throw { success: false, message: 'Password must be at least 6 characters' };
      }

      // Check if user already exists in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.email === userData.email);

      if (existingUser) {
        throw { success: false, message: 'User with this email already exists' };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        username: userData.email.split('@')[0],
        password: userData.password, // In production, this should be hashed
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Generate mock token
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      }));

      return {
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(username, password) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validation
      if (!username || !password) {
        throw { success: false, message: 'Username and password are required' };
      }

      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.username === username || u.email === username);

      if (!user) {
        throw { success: false, message: 'Invalid username or password' };
      }

      // Check password (in production, use bcrypt)
      if (user.password !== password) {
        throw { success: false, message: 'Invalid username or password' };
      }

      // Generate mock token
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
      }));

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify account before password reset
  async requestPasswordReset(email) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!email) {
        throw { success: false, message: 'Email address is required' };
      }

      if (!email.includes('@')) {
        throw { success: false, message: 'Please enter a valid email address' };
      }

      try {
        const response = await this.requestJson('/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });

        if (response.resetToken) {
          sessionStorage.setItem('passwordResetEmail', email);
          sessionStorage.setItem('passwordResetToken', response.resetToken);
        }

        return response;
      } catch (apiError) {
        if (apiError?.message && apiError?.success === false) {
          throw apiError;
        }
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw { success: false, message: 'No account found with this email address' };
      }

      const resetToken = 'mock-reset-token-' + Date.now();
      sessionStorage.setItem('passwordResetEmail', user.email);
      sessionStorage.setItem('passwordResetToken', resetToken);

      return {
        success: true,
        message: 'Account verified. You can now reset your password.',
        resetToken,
      };
    } catch (error) {
      throw error;
    }
  }

  // Reset password for verified account
  async resetPassword(email, resetToken, newPassword, confirmPassword) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      if (!email || !resetToken) {
        throw { success: false, message: 'Password reset session has expired. Please start again.' };
      }

      if (!newPassword || !confirmPassword) {
        throw { success: false, message: 'Please enter and confirm your new password' };
      }

      if (newPassword.length < 6) {
        throw { success: false, message: 'Password must be at least 6 characters' };
      }

      if (newPassword !== confirmPassword) {
        throw { success: false, message: 'Passwords do not match' };
      }

      try {
        return await this.requestJson('/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            email,
            resetToken,
            newPassword,
            confirmPassword,
          }),
        });
      } catch (apiError) {
        if (apiError?.message && apiError?.success === false) {
          throw apiError;
        }
      }

      const storedEmail = sessionStorage.getItem('passwordResetEmail');
      const storedToken = sessionStorage.getItem('passwordResetToken');

      if (storedEmail !== email || storedToken !== resetToken) {
        throw { success: false, message: 'Password reset session has expired. Please start again.' };
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (userIndex === -1) {
        throw { success: false, message: 'No account found with this email address' };
      }

      users[userIndex] = {
        ...users[userIndex],
        password: newPassword,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem('users', JSON.stringify(users));
      sessionStorage.removeItem('passwordResetEmail');
      sessionStorage.removeItem('passwordResetToken');

      return {
        success: true,
        message: 'Password updated successfully. Please log in with your new password.',
      };
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Get token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
