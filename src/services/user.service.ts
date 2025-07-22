import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface UserProfile {
  id?: string;
  userId?: string;
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  dietaryPreference: string;
  goal: string;
  mealFrequency: number;
  bodyFatPercentage?: number;
}

export interface BMRCalculation {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

// Mock profile data storage
const MOCK_PROFILE_STORAGE_KEY = 'mock_profiles';

class UserService {
  // Get mock profile from localStorage
  private getMockProfiles(): Record<string, UserProfile> {
    const profilesStr = localStorage.getItem(MOCK_PROFILE_STORAGE_KEY);
    return profilesStr ? JSON.parse(profilesStr) : {};
  }

  // Save mock profile to localStorage
  private saveMockProfile(profile: UserProfile): UserProfile {
    const profiles = this.getMockProfiles();
    const user = authService.getCurrentUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const userId = user.user.id;
    const profileWithId = {
      ...profile,
      id: profile.id || uuidv4(),
      userId
    };
    
    profiles[userId] = profileWithId;
    localStorage.setItem(MOCK_PROFILE_STORAGE_KEY, JSON.stringify(profiles));
    
    return profileWithId;
  }

  async getProfile(): Promise<UserProfile> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const profiles = this.getMockProfiles();
        const profile = profiles[user.user.id];
        
        if (profile) {
          resolve(profile);
        } else {
          reject({ message: 'Profile not found' });
        }
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<UserProfile>(`${API_URL}/profile`, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async saveProfile(profile: UserProfile): Promise<UserProfile> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const savedProfile = this.saveMockProfile(profile);
        resolve(savedProfile);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.post<UserProfile>(`${API_URL}/profile`, profile, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }
  
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    // Mock implementation - reuse the save logic for simplicity
    return this.saveProfile(profile);

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.put<UserProfile>(`${API_URL}/profile`, profile, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async calculateBMR(profile: UserProfile): Promise<BMRCalculation> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Use the Mifflin-St Jeor Equation
        let bmr = 0;
        
        if (profile.gender.toLowerCase() === 'male') {
          bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) + 5;
        } else {
          bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age) - 161;
        }
        
        // Calculate TDEE based on activity level
        const activityMultiplier = (() => {
          switch (profile.activityLevel.toLowerCase()) {
            case 'sedentary': return 1.2;
            case 'lightly active': return 1.375;
            case 'moderately active': return 1.55;
            case 'very active': return 1.725;
            case 'extra active': return 1.9;
            default: return 1.2;
          }
        })();
        
        const tdee = bmr * activityMultiplier;
        
        // Calculate target calories based on goal
        const targetCalories = (() => {
          switch (profile.goal.toLowerCase()) {
            case 'lose weight': return tdee * 0.8; // 20% deficit
            case 'gain weight': return tdee * 1.2; // 20% surplus
            default: return tdee; // maintain weight
          }
        })();
        
        // Calculate macros (protein: 30%, carbs: 40%, fats: 30%)
        const macros = {
          protein: (targetCalories * 0.3) / 4, // 4 calories per gram of protein
          carbs: (targetCalories * 0.4) / 4,   // 4 calories per gram of carbs
          fats: (targetCalories * 0.3) / 9     // 9 calories per gram of fat
        };
        
        resolve({
          bmr,
          tdee,
          targetCalories,
          macros
        });
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<BMRCalculation>(`${API_URL}/profile/nutrition`, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }
}

export default new UserService(); 