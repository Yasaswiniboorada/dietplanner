import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import mealService from '../../services/meal.service';
import progressService from '../../services/progress.service';
import MealRecommendations from '../../components/meals/MealRecommendations';
import userService from '../../services/user.service';
import Spinner from '../../components/ui/Spinner';

// Mock data for development
const MOCK_DATA = {
  meals: [
    {
      id: '1',
      name: 'Breakfast',
      time: '08:00',
      completed: false,
      items: [
        { id: '101', name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 45, fat: 8, isVegetarian: true },
        { id: '102', name: 'Greek Yogurt', calories: 150, protein: 15, carbs: 6, fat: 6, isVegetarian: true },
        { id: '103', name: 'Scrambled Eggs', calories: 180, protein: 14, carbs: 2, fat: 12, isVegetarian: true },
        { id: '104', name: 'Avocado Toast', calories: 260, protein: 8, carbs: 28, fat: 14, isVegetarian: true },
        { id: '105', name: 'Bacon', calories: 120, protein: 9, carbs: 0, fat: 10, isVegetarian: false },
        { id: '106', name: 'Vegetable Smoothie', calories: 200, protein: 6, carbs: 36, fat: 4, isVegetarian: true }
      ]
    },
    {
      id: '2',
      name: 'Lunch',
      time: '13:00',
      completed: false,
      items: [
        { id: '201', name: 'Grilled Chicken Salad', calories: 450, protein: 40, carbs: 25, fat: 15, isVegetarian: false },
        { id: '202', name: 'Whole Grain Bread', calories: 120, protein: 5, carbs: 20, fat: 2, isVegetarian: true },
        { id: '203', name: 'Lentil Soup', calories: 230, protein: 18, carbs: 32, fat: 4, isVegetarian: true },
        { id: '204', name: 'Tuna Sandwich', calories: 320, protein: 28, carbs: 30, fat: 10, isVegetarian: false },
        { id: '205', name: 'Chickpea Curry', calories: 380, protein: 16, carbs: 45, fat: 12, isVegetarian: true },
        { id: '206', name: 'Stir-Fried Tofu', calories: 290, protein: 20, carbs: 10, fat: 18, isVegetarian: true }
      ]
    },
    {
      id: '3',
      name: 'Dinner',
      time: '19:00',
      completed: false,
      items: [
        { id: '301', name: 'Baked Salmon', calories: 380, protein: 35, carbs: 0, fat: 22, isVegetarian: false },
        { id: '302', name: 'Steamed Vegetables', calories: 80, protein: 4, carbs: 15, fat: 1, isVegetarian: true },
        { id: '303', name: 'Quinoa', calories: 180, protein: 8, carbs: 30, fat: 3, isVegetarian: true },
        { id: '304', name: 'Grilled Beef Steak', calories: 420, protein: 48, carbs: 0, fat: 24, isVegetarian: false },
        { id: '305', name: 'Eggplant Parmesan', calories: 320, protein: 14, carbs: 24, fat: 18, isVegetarian: true },
        { id: '306', name: 'Mushroom Risotto', calories: 340, protein: 10, carbs: 45, fat: 12, isVegetarian: true }
      ]
    }
  ],
  progress: {
    weight: [
      { date: '2023-05-01', value: 185 },
      { date: '2023-05-08', value: 183 },
      { date: '2023-05-15', value: 181 }
    ],
    calories: [
      { date: '2023-05-01', value: 2200 },
      { date: '2023-05-02', value: 2050 },
      { date: '2023-05-03', value: 2150 }
    ],
    protein: [
      { date: '2023-05-01', value: 110 },
      { date: '2023-05-02', value: 120 },
      { date: '2023-05-03', value: 115 }
    ]
  },
  nutritionSummary: {
    calories: { consumed: 1580, target: 2100, remaining: 520 },
    protein: { consumed: 114, target: 150, remaining: 36 },
    carbs: { consumed: 141, target: 210, remaining: 69 },
    fat: { consumed: 53, target: 70, remaining: 17 }
  },
  userGoals: {
    targetWeight: 175,
    weeklyGoal: 1,
    calorieTarget: 2100
  },
  dietaryPreferences: {
    mealFrequency: 3,
    dietType: 'balanced',
    preferences: ['high-protein', 'low-carb'],
    restrictions: ['peanuts'],
    foodType: 'all'
  }
};

interface DietPlanFormData {
  mealFrequency: number;
  dietType: string;
  calorieTarget: number;
  preferences: string[];
  restrictions: string[];
  foodType: string; // 'vegetarian', 'non-veg', or 'all'
}

const dietOptions = [
  'balanced', 'high-protein', 'low-carb', 'low-fat',
  'keto', 'paleo', 'mediterranean', 'vegetarian', 'vegan'
];

const Dashboard: React.FC = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [nutritionSummary, setNutritionSummary] = useState<any>(null);
  const [userGoals, setUserGoals] = useState<any>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDietPlanForm, setShowDietPlanForm] = useState<boolean>(false);
  const [dietPlanFormData, setDietPlanFormData] = useState<DietPlanFormData>({
    mealFrequency: 3,
    dietType: 'balanced',
    calorieTarget: 2000,
    preferences: [],
    restrictions: [],
    foodType: 'all'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // For demo purposes - use mock data
      console.log('Using mock data for dashboard');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMeals(MOCK_DATA.meals);
      setProgressSummary(MOCK_DATA.progress);
      setNutritionSummary(MOCK_DATA.nutritionSummary);
      setUserGoals(MOCK_DATA.userGoals);
      setDietaryPreferences(MOCK_DATA.dietaryPreferences);
      
      /* 
      // Uncomment this when API is ready
      const [mealsData, progressData, userProfile] = await Promise.all([
        mealService.getDailyMeals(),
        progressService.getProgressSummary(),
        userService.getUserProfile()
      ]);
      
      setMeals(mealsData.meals);
      setProgressSummary(progressData);
      setNutritionSummary(mealsData.nutritionSummary);
      setUserGoals(userProfile.goals);
      setDietaryPreferences(userProfile.dietaryPreferences);
      */
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMealComplete = async (mealId: string, completed: boolean) => {
    try {
      // For demo purposes - update local state
      setMeals(prevMeals => 
        prevMeals.map(meal => 
          meal.id === mealId ? { ...meal, completed } : meal
        )
      );
      
      /* 
      // Uncomment this when API is ready
      await mealService.markMealCompleted(mealId, completed);
      await fetchData();
      */
    } catch (err: any) {
      console.error('Failed to update meal status:', err);
      setError('Failed to update meal. Please try again.');
    }
  };

  const handleRegenerateMealPlan = async () => {
    setLoading(true);
    try {
      // For demo purposes - simulate regeneration with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Just shuffle the meal items to simulate new plan
      setMeals(prevMeals => 
        prevMeals.map(meal => ({
          ...meal,
          items: [...meal.items].sort(() => Math.random() - 0.5)
        }))
      );
      
      /*
      // Uncomment this when API is ready
      await mealService.regenerateMealPlan();
      await fetchData();
      */
    } catch (err: any) {
      console.error('Failed to regenerate meal plan:', err);
      setError('Failed to regenerate meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDietPlanChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDietPlanFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (preference: string) => {
    setDietPlanFormData(prev => {
      const preferences = prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference];
      return { ...prev, preferences };
    });
  };

  const handleRestrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    if (e.target.checked) {
      setDietPlanFormData(prev => ({
        ...prev,
        restrictions: [...prev.restrictions, value]
      }));
    } else {
      setDietPlanFormData(prev => ({
        ...prev,
        restrictions: prev.restrictions.filter(r => r !== value)
      }));
    }
  };

  const handleDietPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // For demo purposes - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Ensure meal frequency is at most 3
      const updatedMealFrequency = Math.min(3, dietPlanFormData.mealFrequency);
      
      // Update local state with form data
      setDietaryPreferences({
        mealFrequency: updatedMealFrequency,
        dietType: dietPlanFormData.dietType,
        preferences: dietPlanFormData.preferences,
        restrictions: dietPlanFormData.restrictions,
        foodType: dietPlanFormData.foodType
      });
      
      setUserGoals({
        ...userGoals,
        calorieTarget: dietPlanFormData.calorieTarget
      });
      
      // Generate new meal plan based on food type preference
      let newMeals = [...MOCK_DATA.meals].map(meal => ({
        ...meal,
        items: [...meal.items].sort(() => Math.random() - 0.5)
      }));

      // Filter meal items based on food type preference
      if (dietPlanFormData.foodType === 'vegetarian') {
        newMeals = newMeals.map(meal => ({
          ...meal,
          items: meal.items.filter(item => item.isVegetarian)
        }));
      } else if (dietPlanFormData.foodType === 'non-veg') {
        // Ensure at least some non-veg items are included
        newMeals = newMeals.map(meal => {
          const vegItems = meal.items.filter(item => item.isVegetarian);
          const nonVegItems = meal.items.filter(item => !item.isVegetarian);
          // Ensure we have at least one non-veg item if available
          return {
            ...meal,
            items: nonVegItems.length > 0 
              ? [...nonVegItems, ...vegItems].slice(0, Math.max(2, meal.items.length - 1))
              : meal.items
          };
        });
      }
      
      setMeals(newMeals);
      setShowDietPlanForm(false);
      
      /*
      // Uncomment this when API is ready
      await userService.updateUserProfile({
        dietaryPreferences: {
          mealFrequency: dietPlanFormData.mealFrequency,
          dietType: dietPlanFormData.dietType,
          preferences: dietPlanFormData.preferences,
          restrictions: dietPlanFormData.restrictions,
          foodType: dietPlanFormData.foodType
        },
        goals: {
          ...userGoals,
          calorieTarget: dietPlanFormData.calorieTarget
        }
      });
      
      await mealService.regenerateMealPlan();
      await fetchData();
      setShowDietPlanForm(false);
      */
    } catch (err: any) {
      console.error('Failed to update diet plan:', err);
      setError('Failed to update diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !meals.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowDietPlanForm(!showDietPlanForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            {showDietPlanForm ? 'Cancel' : 'Change Diet Plan'}
          </button>
          <button
            onClick={handleRegenerateMealPlan}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400"
          >
            {loading ? 'Regenerating...' : 'Regenerate Meal Plan'}
          </button>
        </div>
      </div>

      {showDietPlanForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Customize Your Diet Plan</h2>
          <form onSubmit={handleDietPlanSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Frequency
                </label>
                <select
                  name="mealFrequency"
                  value={dietPlanFormData.mealFrequency}
                  onChange={handleDietPlanChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={1}>1 meal per day</option>
                  <option value={2}>2 meals per day</option>
                  <option value={3}>3 meals per day</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diet Type
                </label>
                <select
                  name="dietType"
                  value={dietPlanFormData.dietType}
                  onChange={handleDietPlanChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {dietOptions.map(diet => (
                    <option key={diet} value={diet}>
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Calorie Target
                </label>
                <input
                  type="number"
                  name="calorieTarget"
                  value={dietPlanFormData.calorieTarget}
                  onChange={handleDietPlanChange}
                  min={1200}
                  max={4000}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Restrictions
                </label>
                <div className="space-y-2">
                  {['peanuts', 'dairy', 'gluten', 'shellfish'].map(restriction => (
                    <div key={restriction} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`restriction-${restriction}`}
                        value={restriction}
                        checked={dietPlanFormData.restrictions.includes(restriction)}
                        onChange={handleRestrictionChange}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`restriction-${restriction}`} className="ml-2 text-sm text-gray-700">
                        {restriction.charAt(0).toUpperCase() + restriction.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="foodType"
                      value="all"
                      checked={dietPlanFormData.foodType === 'all'}
                      onChange={handleDietPlanChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Foods</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="foodType"
                      value="vegetarian"
                      checked={dietPlanFormData.foodType === 'vegetarian'}
                      onChange={handleDietPlanChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Vegetarian Only</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="foodType"
                      value="non-veg"
                      checked={dietPlanFormData.foodType === 'non-veg'}
                      onChange={handleDietPlanChange}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Non-Vegetarian</span>
                  </label>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diet Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {dietOptions.map(preference => (
                    <button
                      key={preference}
                      type="button"
                      onClick={() => handlePreferenceChange(preference)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        dietPlanFormData.preferences.includes(preference)
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                          : 'bg-gray-100 text-gray-800 border-gray-300'
                      } border`}
                    >
                      {preference.charAt(0).toUpperCase() + preference.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {loading ? 'Updating...' : 'Update Diet Plan'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold">Today's Meal Plan</h2>
              {dietaryPreferences && (
                <p className="text-sm text-gray-600 mt-1">
                  {dietaryPreferences.dietType.charAt(0).toUpperCase() + dietaryPreferences.dietType.slice(1)} diet • 
                  {dietaryPreferences.mealFrequency} meals per day • 
                  {dietaryPreferences.foodType === 'vegetarian' ? ' Vegetarian' : 
                   dietaryPreferences.foodType === 'non-veg' ? ' Non-Vegetarian' : ' All food types'}
                </p>
              )}
            </div>
            
            <div className="divide-y divide-gray-200">
              {meals.map(meal => (
                <div key={meal.id} className="px-6 py-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{meal.name}</h3>
                      <p className="text-gray-600 text-sm">{meal.time}</p>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={meal.completed}
                          onChange={() => handleMealComplete(meal.id, !meal.completed)}
                          className="h-5 w-5 text-indigo-600 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Completed</span>
                      </label>
                    </div>
                  </div>
                  
                  <ul className="space-y-2">
                    {meal.items.map((item: any) => (
                      <li key={item.id} className="flex justify-between">
                        <div className="flex items-center">
                          <span className="text-gray-800">{item.name}</span>
                          {item.isVegetarian && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                              Veg
                            </span>
                          )}
                          {!item.isVegetarian && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                              Non-Veg
                            </span>
                          )}
                        </div>
                        <span className="text-gray-600">{item.calories} kcal</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
                    {meal.items.reduce((total: number, item: any) => total + item.calories, 0)} calories • 
                    {meal.items.reduce((total: number, item: any) => total + item.protein, 0)}g protein • 
                    {meal.items.reduce((total: number, item: any) => total + item.carbs, 0)}g carbs • 
                    {meal.items.reduce((total: number, item: any) => total + item.fat, 0)}g fat
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold">Nutrition Summary</h2>
            </div>
            
            {nutritionSummary && (
              <div className="px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <h3 className="text-gray-600 text-sm">Calories</h3>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xl font-semibold">{nutritionSummary.calories.consumed}</span>
                      <span className="text-gray-500">/ {nutritionSummary.calories.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (nutritionSummary.calories.consumed / nutritionSummary.calories.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-600 text-sm">Protein</h3>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xl font-semibold">{nutritionSummary.protein.consumed}g</span>
                      <span className="text-gray-500">/ {nutritionSummary.protein.target}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (nutritionSummary.protein.consumed / nutritionSummary.protein.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-600 text-sm">Carbs</h3>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xl font-semibold">{nutritionSummary.carbs.consumed}g</span>
                      <span className="text-gray-500">/ {nutritionSummary.carbs.target}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (nutritionSummary.carbs.consumed / nutritionSummary.carbs.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-600 text-sm">Fat</h3>
                    <div className="mt-1 flex justify-between">
                      <span className="text-xl font-semibold">{nutritionSummary.fat.consumed}g</span>
                      <span className="text-gray-500">/ {nutritionSummary.fat.target}g</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (nutritionSummary.fat.consumed / nutritionSummary.fat.target) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <MealRecommendations dietType={dietaryPreferences?.foodType || 'all'} />
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold">Progress Summary</h2>
            </div>
            
            {progressSummary && userGoals && (
              <div className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h3 className="text-gray-600 text-sm">Weight Progress</h3>
                      <Link to="/progress" className="text-indigo-600 text-sm hover:text-indigo-500">View Details</Link>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold">{progressSummary.weight[progressSummary.weight.length - 1].value}</span>
                      <span className="text-gray-500 ml-2">lbs</span>
                      <span className="ml-2 text-sm text-green-600">
                        -
                        {progressSummary.weight[0].value - progressSummary.weight[progressSummary.weight.length - 1].value} 
                        lbs
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Target: {userGoals.targetWeight} lbs ({Math.abs(progressSummary.weight[progressSummary.weight.length - 1].value - userGoals.targetWeight)} lbs to go)
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-gray-600 text-sm">Recent Activity</h3>
                    </div>
                    <ul className="space-y-2">
                      <li className="text-sm">
                        <span className="text-gray-500">3 days ago</span> • Recorded new weight: {progressSummary.weight[progressSummary.weight.length - 1].value} lbs
                      </li>
                      <li className="text-sm">
                        <span className="text-gray-500">1 week ago</span> • Updated calorie target to {userGoals.calorieTarget} kcal
                      </li>
                      <li className="text-sm">
                        <span className="text-gray-500">2 weeks ago</span> • Completed 7-day streak of logging meals
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 