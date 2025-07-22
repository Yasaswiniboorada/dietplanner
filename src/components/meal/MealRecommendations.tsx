import React, { useState, useEffect } from 'react';
import mealService, { MealItem } from '../../services/meal.service';

interface MealRecommendationsProps {
  goal?: string;
  type?: string;
  count?: number;
}

const MealRecommendations: React.FC<MealRecommendationsProps> = ({ 
  goal = 'Weight Loss', 
  type, 
  count = 3 
}) => {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(type || '');

  const fetchRecommendations = async (mealType: string) => {
    try {
      setLoading(true);
      const data = await mealService.getMealRecommendations(goal, mealType, count);
      setMeals(data);
    } catch (err) {
      setError('Failed to load meal recommendations. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedType);
  }, [goal, selectedType, count]);

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Loading recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Recommended Meals for {goal}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleTypeChange('')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedType === '' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTypeChange('Vegetarian')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedType === 'Vegetarian' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Vegetarian
          </button>
          <button
            onClick={() => handleTypeChange('Non-Vegetarian')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              selectedType === 'Non-Vegetarian' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Non-Vegetarian
          </button>
        </div>
      </div>
      
      {meals.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <div className="text-yellow-700">No meal recommendations found for the selected criteria.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-md font-medium text-gray-900">{meal.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    meal.type === 'Vegetarian' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {meal.type}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold block">Calories</span>
                    <span>{meal.calories}</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Protein</span>
                    <span>{meal.protein}g</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Carbs</span>
                    <span>{meal.carbs}g</span>
                  </div>
                  <div>
                    <span className="font-semibold block">Fats</span>
                    <span>{meal.fats}g</span>
                  </div>
                </div>

                {meal.categories && meal.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {meal.categories.map((category, idx) => (
                      <span 
                        key={idx} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealRecommendations; 