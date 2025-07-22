import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Mock user data storage
const MOCK_USER_STORAGE_KEY = 'mock_users';

class AuthService {
  // Get mock users from localStorage
  private getMockUsers(): Record<string, { id: string; name: string; email: string; password: string }> {
    const usersStr = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : {};
  }

  // Save mock users to localStorage
  private saveMockUser(email: string, name: string, password: string): string {
    const users = this.getMockUsers();
    const id = uuidv4();
    
    users[email] = { id, name, email, password };
    localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(users));
    
    return id;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getMockUsers();
        const user = users[credentials.email];
        
        if (user && user.password === credentials.password) {
          const authResponse: AuthResponse = {
            token: `mock_token_${user.id}`,
            user: {
              id: user.id,
              email: user.email,
              name: user.name
            }
          };
          
          localStorage.setItem('user', JSON.stringify(authResponse));
          resolve(authResponse);
        } else {
          reject({ message: 'Invalid email or password' });
        }
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
    // if (response.data.token) {
    //   localStorage.setItem('user', JSON.stringify(response.data));
    // }
    // return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getMockUsers();
        
        // Check if user already exists
        if (users[userData.email]) {
          reject({ message: 'Email already in use' });
          return;
        }
        
        // Create new user
        const userId = this.saveMockUser(userData.email, userData.name, userData.password);
        
        const authResponse: AuthResponse = {
          token: `mock_token_${userId}`,
          user: {
            id: userId,
            email: userData.email,
            name: userData.name
          }
        };
        
        localStorage.setItem('user', JSON.stringify(authResponse));
        resolve(authResponse);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, userData);
    // if (response.data.token) {
    //   localStorage.setItem('user', JSON.stringify(response.data));
    // }
    // return response.data;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as AuthResponse;
    }
    return null;
  }

  getAuthHeader() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      return { Authorization: `Bearer ${user.token}` };
    }
    return {};
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}

export default new AuthService(); 