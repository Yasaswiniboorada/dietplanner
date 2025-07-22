import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
  category: string;
  isVegetarian: boolean;
}

export interface MealFood {
  foodItem: FoodItem;
  quantity: number;
}

export interface Meal {
  id: string;
  mealPlanId: string;
  type: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  completed: boolean;
}

export interface MealPlan {
  id: string;
  userId: string;
  date: string;
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  completed: boolean;
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
const MOCK_MEAL_PLAN_STORAGE_KEY = 'mock_meal_plans';
const MOCK_COMPLETED_MEALS_KEY = 'mock_completed_meals';

// Mock food items
const mockFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Protein',
    isVegetarian: false
  },
  {
    id: '2',
    name: 'Brown Rice',
    calories: 112,
    protein: 2.6,
    carbs: 22.9,
    fats: 0.9,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Carbs',
    isVegetarian: true
  },
  {
    id: '3',
    name: 'Broccoli',
    calories: 55,
    protein: 3.7,
    carbs: 11.2,
    fats: 0.6,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Vegetables',
    isVegetarian: true
  },
  {
    id: '4',
    name: 'Salmon',
    calories: 206,
    protein: 22.1,
    carbs: 0,
    fats: 12.4,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Protein',
    isVegetarian: false
  },
  {
    id: '5',
    name: 'Sweet Potato',
    calories: 86,
    protein: 1.6,
    carbs: 20.1,
    fats: 0.1,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Carbs',
    isVegetarian: true
  },
  {
    id: '6',
    name: 'Avocado',
    calories: 160,
    protein: 2,
    carbs: 8.5,
    fats: 14.7,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Fats',
    isVegetarian: true
  },
  {
    id: '7',
    name: 'Tofu',
    calories: 144,
    protein: 17,
    carbs: 2.8,
    fats: 8.7,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Protein',
    isVegetarian: true
  },
  {
    id: '8',
    name: 'Quinoa',
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fats: 1.9,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Carbs',
    isVegetarian: true
  },
  {
    id: '9',
    name: 'Eggs',
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fats: 10.6,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Protein',
    isVegetarian: true
  },
  {
    id: '10',
    name: 'Spinach',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    servingSize: 100,
    servingUnit: 'g',
    category: 'Vegetables',
    isVegetarian: true
  }
];

// Mock meal items
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
  },
  {
    id: '6',
    name: 'Quinoa Bowl with Vegetables',
    type: 'lunch',
    calories: 420,
    protein: 15,
    carbs: 60,
    fats: 14,
    categories: ['vegetarian', 'high-fiber'],
    isVegetarian: true
  },
  {
    id: '7',
    name: 'Chicken and Broccoli',
    type: 'dinner',
    calories: 380,
    protein: 40,
    carbs: 20,
    fats: 12,
    categories: ['high-protein', 'low-carb'],
    isVegetarian: false
  },
  {
    id: '8',
    name: 'Vegetable Curry with Tofu',
    type: 'dinner',
    calories: 420,
    protein: 20,
    carbs: 50,
    fats: 15,
    categories: ['vegetarian', 'spicy'],
    isVegetarian: true
  }
];

class MealService {
  // Get mock meal plans from localStorage
  private getMockMealPlans(): Record<string, MealPlan> {
    const mealsStr = localStorage.getItem(MOCK_MEAL_PLAN_STORAGE_KEY);
    return mealsStr ? JSON.parse(mealsStr) : {};
  }

  // Save mock meal plan to localStorage
  private saveMockMealPlan(mealPlan: MealPlan): MealPlan {
    const mealPlans = this.getMockMealPlans();
    mealPlans[mealPlan.id] = mealPlan;
    localStorage.setItem(MOCK_MEAL_PLAN_STORAGE_KEY, JSON.stringify(mealPlans));
    return mealPlan;
  }

  // Get completed meals
  private getCompletedMeals(): string[] {
    const completedStr = localStorage.getItem(MOCK_COMPLETED_MEALS_KEY);
    return completedStr ? JSON.parse(completedStr) : [];
  }

  // Mark meal as completed
  private setMealCompleted(mealId: string): void {
    const completed = this.getCompletedMeals();
    if (!completed.includes(mealId)) {
      completed.push(mealId);
      localStorage.setItem(MOCK_COMPLETED_MEALS_KEY, JSON.stringify(completed));
    }
  }

  async getCurrentPlan(): Promise<MealPlan> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const mealPlans = this.getMockMealPlans();
        const userId = user.user.id;
        
        // Find the latest meal plan for the user
        const userPlans = Object.values(mealPlans)
          .filter(plan => plan.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (userPlans.length > 0) {
          // Update completed status based on stored completed meals
          const completedMeals = this.getCompletedMeals();
          const plan = userPlans[0];
          
          plan.meals.forEach(meal => {
            meal.completed = completedMeals.includes(meal.id);
          });
          
          plan.completed = plan.meals.every(meal => meal.completed);
          
          resolve(plan);
        } else {
          // No existing plan, generate a new one
          this.generatePlan().then(resolve).catch(reject);
        }
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealPlan>(`${API_URL}/meal-plans/current`, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async generatePlan(): Promise<MealPlan> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        // Create a new meal plan with random meals
        const mealPlanId = uuidv4();
        const userId = user.user.id;
        const today = new Date().toISOString().split('T')[0];
        
        // Create meals based on types (breakfast, lunch, dinner)
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        const meals: Meal[] = [];
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        
        mealTypes.forEach(type => {
          // Filter meal items by type
          const availableMeals = mockMealItems
            .filter(item => item.type === type);
          
          if (availableMeals.length === 0) return;
          
          // Randomly select a meal
          const selectedMeal = availableMeals[Math.floor(Math.random() * availableMeals.length)];
          
          // Create foods for the meal
          const foods: MealFood[] = [];
          // Select 2-3 food items that match the meal category
          const numFoods = Math.floor(Math.random() * 2) + 2; // 2-3 food items
          
          for (let i = 0; i < numFoods; i++) {
            // Filter by vegetarian preference if the meal is vegetarian
            const availableFoods = mockFoodItems.filter(food => 
              !selectedMeal.isVegetarian || food.isVegetarian
            );
            
            if (availableFoods.length === 0) continue;
            
            const selectedFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
            const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 servings
            
            foods.push({
              foodItem: selectedFood,
              quantity
            });
          }
          
          // Calculate meal totals
          const mealTotalCalories = foods.reduce((sum, food) => sum + (food.foodItem.calories * food.quantity), 0);
          const mealTotalProtein = foods.reduce((sum, food) => sum + (food.foodItem.protein * food.quantity), 0);
          const mealTotalCarbs = foods.reduce((sum, food) => sum + (food.foodItem.carbs * food.quantity), 0);
          const mealTotalFats = foods.reduce((sum, food) => sum + (food.foodItem.fats * food.quantity), 0);
          
          // Create the meal
          const meal: Meal = {
            id: uuidv4(),
            mealPlanId,
            type,
            foods,
            totalCalories: mealTotalCalories,
            totalProtein: mealTotalProtein,
            totalCarbs: mealTotalCarbs,
            totalFats: mealTotalFats,
            completed: false
          };
          
          meals.push(meal);
          
          // Update plan totals
          totalCalories += mealTotalCalories;
          totalProtein += mealTotalProtein;
          totalCarbs += mealTotalCarbs;
          totalFats += mealTotalFats;
        });
        
        // Create the meal plan
        const mealPlan: MealPlan = {
          id: mealPlanId,
          userId,
          date: today,
          meals,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFats,
          completed: false
        };
        
        // Save to localStorage
        this.saveMockMealPlan(mealPlan);
        
        resolve(mealPlan);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.post<MealPlan>(`${API_URL}/meal-plans/generate`, {}, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async getMealPlanHistory(startDate?: string, endDate?: string): Promise<MealPlan[]> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const mealPlans = this.getMockMealPlans();
        const userId = user.user.id;
        
        // Filter by user and date range
        let userPlans = Object.values(mealPlans)
          .filter(plan => plan.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (startDate) {
          userPlans = userPlans.filter(plan => plan.date >= startDate);
        }
        
        if (endDate) {
          userPlans = userPlans.filter(plan => plan.date <= endDate);
        }
        
        resolve(userPlans);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealPlan[]>(`${API_URL}/meal-plans/history`, {
    //   params: { startDate, endDate },
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async markMealCompleted(mealPlanId: string, mealId: string): Promise<void> {
    // Mock implementation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = authService.getCurrentUser();
        if (!user) {
          reject({ message: 'User not authenticated' });
          return;
        }
        
        const mealPlans = this.getMockMealPlans();
        const mealPlan = mealPlans[mealPlanId];
        
        if (!mealPlan) {
          reject({ message: 'Meal plan not found' });
          return;
        }
        
        // Find the meal and mark as completed
        const meal = mealPlan.meals.find(m => m.id === mealId);
        if (!meal) {
          reject({ message: 'Meal not found' });
          return;
        }
        
        // Mark the meal as completed
        meal.completed = true;
        this.setMealCompleted(mealId);
        
        // Check if all meals are completed
        mealPlan.completed = mealPlan.meals.every(m => m.completed);
        
        // Save the updated meal plan
        this.saveMockMealPlan(mealPlan);
        
        resolve();
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // await axios.post(
    //   `${API_URL}/meal-plans/${mealPlanId}/meals/${mealId}/complete`,
    //   {},
    //   { headers: authService.getAuthHeader() }
    // );
  }

  async getFoodItems(category?: string, isVegetarian?: boolean): Promise<FoodItem[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredItems = [...mockFoodItems];
        
        if (category) {
          filteredItems = filteredItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
        }
        
        if (isVegetarian !== undefined) {
          filteredItems = filteredItems.filter(item => item.isVegetarian === isVegetarian);
        }
        
        resolve(filteredItems);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<FoodItem[]>(`${API_URL}/food-items`, {
    //   params: { category, isVegetarian },
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async getFoodCategories(): Promise<string[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = [...new Set(mockFoodItems.map(item => item.category))];
        resolve(categories);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<string[]>(`${API_URL}/food-items/categories`, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async getMealItems(type?: string): Promise<MealItem[]> {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredItems = [...mockMealItems];
        
        if (type) {
          filteredItems = filteredItems.filter(item => item.type.toLowerCase() === type.toLowerCase());
        }
        
        resolve(filteredItems);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealItem[]>(`${API_URL}/meal-items`, {
    //   params: { type },
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }

  async getMealRecommendations(
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
        
        // If we don't have enough items, add some random ones
        if (filteredItems.length < count) {
          let additionalItems = mockMealItems
            .filter(item => !filteredItems.includes(item))
            .filter(item => isVegetarian ? item.isVegetarian : true);
          
          if (type) {
            additionalItems = additionalItems.filter(item => item.type.toLowerCase() === type.toLowerCase());
          }
          
          // Randomly select additional items
          while (filteredItems.length < count && additionalItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * additionalItems.length);
            filteredItems.push(additionalItems[randomIndex]);
            additionalItems.splice(randomIndex, 1);
          }
        }
        
        resolve(filteredItems);
      }, 500); // Simulate network delay
    });

    // Server implementation (uncomment when backend is ready)
    // const response = await axios.get<MealItem[]>(`${API_URL}/meal-items/recommendations`, {
    //   params: { goal, type, count },
    //   headers: authService.getAuthHeader(),
    // });
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
    // const response = await axios.get<string[]>(`${API_URL}/meal-items/categories`, {
    //   headers: authService.getAuthHeader(),
    // });
    // return response.data;
  }
}

export default new MealService(); 