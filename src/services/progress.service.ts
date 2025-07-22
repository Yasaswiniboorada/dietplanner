import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface WeightEntry {
  id: string;
  userId: string;
  date: string;
  weight: number;
  note?: string;
}

export interface ComplianceEntry {
  id: string;
  userId: string;
  date: string;
  mealPlanId: string;
  mealsCompleted: number;
  totalMeals: number;
  complianceRate: number;
}

export interface ProgressSummary {
  startDate: string;
  endDate: string;
  startWeight: number;
  currentWeight: number;
  weightChange: number;
  averageComplianceRate: number;
}

export interface MealItem {
  id: string;
  name: string;
  type: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  categories: string[];
  isVegetarian: boolean;
}

// Mock data storage
const MOCK_WEIGHT_ENTRIES_KEY = 'mock_weight_entries';
const MOCK_COMPLIANCE_ENTRIES_KEY = 'mock_compliance_entries';

// Mock meal items for recommendations
const mockMealItems: MealItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken and Vegetables',
    type: 'lunch',
    calories: 350,
    protein: 35,
    carbs: 30,
    fats: 10,
    categories: ['high-protein', 'low-carb'],
    isVegetarian: false
  },
  {
    id: '2',
    name: 'Vegetable Omelette',
    type: 'breakfast',
    calories: 300,
    protein: 20,
    carbs: 10,
    fats: 20,
    categories: ['high-protein', 'low-carb', 'keto-friendly'],
    isVegetarian: true
  },
  {
    id: '3',
    name: 'Salmon and Sweet Potato',
    type: 'dinner',
    calories: 450,
    protein: 30,
    carbs: 40,
    fats: 15,
    categories: ['balanced', 'omega-3'],
    isVegetarian: false
  },
  {
    id: '4',
    name: 'Tofu Stir Fry',
    type: 'lunch',
    calories: 380,
    protein: 25,
    carbs: 40,
    fats: 12,
    categories: ['vegetarian', 'high-protein'],
    isVegetarian: true
  },
  {
    id: '5',
    name: 'Greek Yogurt with Berries',
    type: 'breakfast',
    calories: 250,
    protein: 18,
    carbs: 30,
    fats: 8,
    categories: ['high-protein', 'low-fat'],
    isVegetarian: true
  }
];

class ProgressService {
  // Get mock weight entries from localStorage
  private getWeightEntries(): WeightEntry[] {
    const entriesStr = localStorage.getItem(MOCK_WEIGHT_ENTRIES_KEY);
    return entriesStr ? JSON.parse(entriesStr) : [];
  }

  // Save mock weight entry to localStorage
  private saveWeightEntry(entry: WeightEntry): WeightEntry {
    const entries = this.getWeightEntries();
    entries.push(entry);
    localStorage.setItem(MOCK_WEIGHT_ENTRIES_KEY, JSON.stringify(entries));
    return entry;
  }

  // Get mock compliance entries from localStorage
  private getComplianceEntries(): ComplianceEntry[] {
    const entriesStr = localStorage.getItem(MOCK_COMPLIANCE_ENTRIES_KEY);
    return entriesStr ? JSON.parse(entriesStr) : [];
  }

  // Save mock compliance entry to localStorage
  private saveComplianceEntry(entry: ComplianceEntry): ComplianceEntry {
    const entries = this.getComplianceEntries();
    entries.push(entry);
    localStorage.setItem(MOCK_COMPLIANCE_ENTRIES_KEY, JSON.stringify(entries));
    return entry;
  }

  async addWeightEntry(weight: number, date: string, note?: string): Promise<WeightEntry> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const userId = user.user.id;
        const entry: WeightEntry = {
          id: uuidv4(),
          userId,
          date,
          weight,
          note
        };
        
        this.saveWeightEntry(entry);
        resolve(entry);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.post<WeightEntry>(
    //   `${API_URL}/progress/weight`,
    //   { weight, date, note },
    //   { headers: authService.getAuthHeader() }
    // );
    // return response.data;
  }

  async getWeightHistory(startDate: string, endDate: string): Promise<WeightEntry[]> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const userId = user.user.id;
        let entries = this.getWeightEntries()
          .filter(entry => entry.userId === userId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (startDate) {
          entries = entries.filter(entry => entry.date >= startDate);
        }
        
        if (endDate) {
          entries = entries.filter(entry => entry.date <= endDate);
        }
        
        // If no entries exist, create some mock history
        if (entries.length === 0) {
          const mockHistory: WeightEntry[] = [];
          const startDateTime = startDate ? new Date(startDate).getTime() : new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
          const endDateTime = endDate ? new Date(endDate).getTime() : new Date().getTime();
          
          // Create an entry every 3-4 days
          for (let time = startDateTime; time <= endDateTime; time += (3 + Math.floor(Math.random() * 2)) * 24 * 60 * 60 * 1000) {
            const entryDate = new Date(time);
            const dateStr = entryDate.toISOString().split('T')[0];
            
            // Generate a weight that fluctuates slightly (assuming weight is around 70kg)
            const baseWeight = 70;
            const fluctuation = (Math.random() * 2 - 1) * 0.5; // -0.5 to +0.5 kg
            
            const entry: WeightEntry = {
              id: uuidv4(),
              userId,
              date: dateStr,
              weight: baseWeight + fluctuation,
              note: ''
            };
            
            mockHistory.push(entry);
            this.saveWeightEntry(entry); // Save to localStorage for future use
          }
          
          entries = mockHistory;
        }
        
        resolve(entries);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<WeightEntry[]>(
    //   `${API_URL}/progress/weight/history`,
    //   {
    //     params: { startDate, endDate },
    //     headers: authService.getAuthHeader(),
    //   }
    // );
    // return response.data;
  }

  async getComplianceHistory(startDate: string, endDate: string): Promise<ComplianceEntry[]> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const userId = user.user.id;
        let entries = this.getComplianceEntries()
          .filter(entry => entry.userId === userId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (startDate) {
          entries = entries.filter(entry => entry.date >= startDate);
        }
        
        if (endDate) {
          entries = entries.filter(entry => entry.date <= endDate);
        }
        
        // If no entries exist, create some mock history
        if (entries.length === 0) {
          const mockHistory: ComplianceEntry[] = [];
          const startDateTime = startDate ? new Date(startDate).getTime() : new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
          const endDateTime = endDate ? new Date(endDate).getTime() : new Date().getTime();
          
          // Create an entry every day
          for (let time = startDateTime; time <= endDateTime; time += 24 * 60 * 60 * 1000) {
            const entryDate = new Date(time);
            const dateStr = entryDate.toISOString().split('T')[0];
            
            // Random total meals (2-3)
            const totalMeals = 2 + Math.floor(Math.random() * 2);
            // Random completed meals (0 to totalMeals)
            const mealsCompleted = Math.floor(Math.random() * (totalMeals + 1));
            // Calculate compliance rate
            const complianceRate = totalMeals > 0 ? mealsCompleted / totalMeals : 0;
            
            const entry: ComplianceEntry = {
              id: uuidv4(),
              userId,
              date: dateStr,
              mealPlanId: uuidv4(),
              mealsCompleted,
              totalMeals,
              complianceRate
            };
            
            mockHistory.push(entry);
            this.saveComplianceEntry(entry); // Save to localStorage for future use
          }
          
          entries = mockHistory;
        }
        
        resolve(entries);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<ComplianceEntry[]>(
    //   `${API_URL}/progress/compliance/history`,
    //   {
    //     params: { startDate, endDate },
    //     headers: authService.getAuthHeader(),
    //   }
    // );
    // return response.data;
  }

  async getProgressSummary(startDate: string, endDate: string): Promise<ProgressSummary> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const weightEntries = await this.getWeightHistory(startDate, endDate);
          const complianceEntries = await this.getComplianceHistory(startDate, endDate);
          
          if (weightEntries.length === 0) {
            reject({ message: 'No weight data available' });
            return;
          }
          
          // Sort by date
          weightEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
          const startWeight = weightEntries[0].weight;
          const currentWeight = weightEntries[weightEntries.length - 1].weight;
          const weightChange = currentWeight - startWeight;
          
          // Calculate average compliance rate
          let totalComplianceRate = 0;
          complianceEntries.forEach(entry => {
            totalComplianceRate += entry.complianceRate;
          });
          const averageComplianceRate = complianceEntries.length > 0 
            ? totalComplianceRate / complianceEntries.length 
            : 0;
          
          const summary: ProgressSummary = {
            startDate,
            endDate,
            startWeight,
            currentWeight,
            weightChange,
            averageComplianceRate
          };
          
          resolve(summary);
        } catch (error) {
          reject(error);
        }
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<ProgressSummary>(
    //   `${API_URL}/progress/summary`,
    //   {
    //     params: { startDate, endDate },
    //     headers: authService.getAuthHeader(),
    //   }
    // );
    // return response.data;
  }

  // Meal items methods
  async getRecommendedMeals(
    goal: string, 
    type?: string, 
    count: number = 3,
    isVegetarian: boolean = false
  ): Promise<MealItem[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredItems = [...mockMealItems];
        
        // Filter by type if provided
        if (type) {
          filteredItems = filteredItems.filter(item => item.type.toLowerCase() === type.toLowerCase());
        }
        
        // Filter by vegetarian preference
        if (isVegetarian) {
          filteredItems = filteredItems.filter(item => item.isVegetarian);
        }
        
        // Filter by goal
        if (goal === 'lose weight') {
          // For weight loss, prioritize high-protein, low-carb meals
          filteredItems = filteredItems.filter(item => 
            item.categories.includes('high-protein') || 
            item.categories.includes('low-carb')
          );
        } else if (goal === 'gain weight') {
          // For weight gain, prioritize high-calorie meals
          filteredItems.sort((a, b) => b.calories - a.calories);
        } else if (goal === 'maintain weight') {
          // For maintenance, prioritize balanced meals
          filteredItems = filteredItems.filter(item => 
            item.categories.includes('balanced')
          );
        }
        
        // Limit to requested count
        filteredItems = filteredItems.slice(0, count);
        
        resolve(filteredItems);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealItem[]>(
    //   `${API_URL}/meal-items/recommendations`,
    //   {
    //     params: { goal, type, count },
    //     headers: authService.getAuthHeader(),
    //   }
    // );
    // return response.data;
  }

  async getAllMealItems(type?: string, category?: string): Promise<MealItem[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredItems = [...mockMealItems];
        
        if (type) {
          filteredItems = filteredItems.filter(item => item.type.toLowerCase() === type.toLowerCase());
        }
        
        if (category) {
          filteredItems = filteredItems.filter(item => item.categories.includes(category.toLowerCase()));
        }
        
        resolve(filteredItems);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealItem[]>(
    //   `${API_URL}/meal-items`,
    //   {
    //     params: { type, category },
    //     headers: authService.getAuthHeader(),
    //   }
    // );
    // return response.data;
  }

  async getMealCategories(): Promise<string[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const allCategories = mockMealItems.flatMap(item => item.categories);
        const uniqueCategories = [...new Set(allCategories)];
        resolve(uniqueCategories);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<string[]>(
    //   `${API_URL}/meal-items/categories`,
    //   { headers: authService.getAuthHeader() }
    // );
    // return response.data;
  }
}

export default new ProgressService(); 