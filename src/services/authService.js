class AuthService {
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
