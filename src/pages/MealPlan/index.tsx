import React, { useState, useEffect } from 'react';
import mealService, { MealPlan, Meal } from '../../services/meal.service';
import { format, parseISO, addDays } from 'date-fns';

const MealPlanPage: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mealHistory, setMealHistory] = useState<MealPlan[]>([]);

  useEffect(() => {
    const fetchMealPlanData = async () => {
      try {
        setLoading(true);
        
        // Get current meal plan
        const currentPlan = await mealService.getCurrentPlan();
        setMealPlan(currentPlan);
        
        // Get meal plan history for the last 7 days
        const today = new Date();
        const sevenDaysAgo = addDays(today, -7);
        
        const historyData = await mealService.getMealPlanHistory(
          sevenDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
        setMealHistory(historyData);
      } catch (err) {
        setError('Failed to load meal plan data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlanData();
  }, []);

  const handleRegenerateMealPlan = async () => {
    try {
      setLoading(true);
      const newPlan = await mealService.generatePlan();
      setMealPlan(newPlan);
      setSuccess('New meal plan generated successfully.');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to generate new meal plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMealCompleted = async (mealPlanId: string, mealId: string) => {
    try {
      await mealService.markMealCompleted(mealPlanId, mealId);
      
      // Refresh meal plan after marking meal as completed
      const updatedPlan = await mealService.getCurrentPlan();
      setMealPlan(updatedPlan);
      
      setSuccess('Meal marked as completed.');
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to mark meal as completed. Please try again.');
    }
  };

  const getMealPlanCompletion = (plan: MealPlan): { completed: number, total: number } => {
    const totalMeals = plan.meals.length;
    const completedMeals = plan.meals.filter(meal => meal.completed).length;
    return { completed: completedMeals, total: totalMeals };
  };

  const getCompliancePercentage = (plan: MealPlan): number => {
    const { completed, total } = getMealPlanCompletion(plan);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading meal plan...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {/* Current Meal Plan */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Your Meal Plan</h1>
          <button
            onClick={handleRegenerateMealPlan}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Generate New Plan
          </button>
        </div>

        {mealPlan ? (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg text-gray-700">
                <span className="font-medium">Date: </span>
                {mealPlan.date ? format(parseISO(mealPlan.date), 'MMMM d, yyyy') : 'Today'}
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-full bg-gray-200 rounded-full dark:bg-gray-700 w-40">
                  <div 
                    className="h-2.5 bg-indigo-600 rounded-full" 
                    style={{ width: `${getCompliancePercentage(mealPlan)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {getMealPlanCompletion(mealPlan).completed}/{getMealPlanCompletion(mealPlan).total} completed
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {mealPlan.meals.map((meal) => (
                <div 
                  key={meal.id} 
                  className={`border rounded-lg p-4 ${meal.completed ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium capitalize">{meal.type}</h3>
                    <div className="flex items-center space-x-2">
                      {meal.completed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkMealCompleted(mealPlan.id, meal.id)}
                          className="text-sm text-indigo-600 hover:text-indigo-900"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {meal.foods.map(({ foodItem, quantity }) => (
                      <div key={foodItem.id} className="flex justify-between text-sm">
                        <div className="flex items-center">
                          <div 
                            className={`w-2 h-2 rounded-full mr-2 ${
                              foodItem.isVegetarian ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <span>{foodItem.name}</span>
                        </div>
                        <span>{quantity} {foodItem.servingUnit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t grid grid-cols-4 gap-2 text-sm text-gray-500">
                    <div>Calories: {Math.round(meal.totalCalories)}</div>
                    <div>Protein: {Math.round(meal.totalProtein)}g</div>
                    <div>Carbs: {Math.round(meal.totalCarbs)}g</div>
                    <div>Fats: {Math.round(meal.totalFats)}g</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Daily Nutrition Summary</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Calories</div>
                  <div className="text-xl font-bold text-indigo-600">{Math.round(mealPlan.totalCalories)}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Protein</div>
                  <div className="text-xl font-bold text-indigo-600">{Math.round(mealPlan.totalProtein)}g</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Carbs</div>
                  <div className="text-xl font-bold text-indigo-600">{Math.round(mealPlan.totalCarbs)}g</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500">Fats</div>
                  <div className="text-xl font-bold text-indigo-600">{Math.round(mealPlan.totalFats)}g</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You don't have an active meal plan.</p>
            <button
              onClick={handleRegenerateMealPlan}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Generate Meal Plan
            </button>
          </div>
        )}
      </div>

      {/* Meal History */}
      {mealHistory.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Meal Plans</h2>
          
          <div className="space-y-4">
            {mealHistory.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">
                      {plan.date ? format(parseISO(plan.date), 'MMMM d, yyyy') : 'No date'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getMealPlanCompletion(plan).completed}/{getMealPlanCompletion(plan).total} meals completed
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-24 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-indigo-600 rounded-full" 
                        style={{ width: `${getCompliancePercentage(plan)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getCompliancePercentage(plan)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanPage; 