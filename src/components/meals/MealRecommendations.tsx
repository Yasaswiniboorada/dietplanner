import React, { useState } from 'react';

// Mock data for recommendations
const MOCK_RECOMMENDATIONS = [
  {
    id: '1',
    name: 'High Protein Overnight Oats',
    calories: 320,
    protein: 24,
    carbs: 36,
    fat: 10,
    imageUrl: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    mealType: 'breakfast',
    tags: ['high-protein', 'vegetarian'],
    isVegetarian: true
  },
  {
    id: '2',
    name: 'Grilled Chicken & Quinoa Bowl',
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 12,
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    mealType: 'lunch',
    tags: ['high-protein', 'low-fat'],
    isVegetarian: false
  },
  {
    id: '3',
    name: 'Salmon & Vegetable Stir Fry',
    calories: 390,
    protein: 28,
    carbs: 25,
    fat: 18,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    mealType: 'dinner',
    tags: ['omega-3', 'low-carb'],
    isVegetarian: false
  },
  {
    id: '4',
    name: 'Vegetable Curry with Tofu',
    calories: 380,
    protein: 22,
    carbs: 40,
    fat: 14,
    imageUrl: 'https://images.unsplash.com/photo-1606756790138-261d2b21cd75?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    mealType: 'dinner',
    tags: ['plant-based', 'spicy', 'vegetarian'],
    isVegetarian: true
  },
  {
    id: '5',
    name: 'Greek Yogurt Parfait',
    calories: 280,
    protein: 18,
    carbs: 30,
    fat: 9,
    imageUrl: 'https://images.unsplash.com/photo-1560401692-0b17fa81a8a3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    mealType: 'breakfast',
    tags: ['high-protein', 'vegetarian'],
    isVegetarian: true
  }
];

interface MealRecommendationsProps {
  dietType?: string;
}

const MealRecommendations: React.FC<MealRecommendationsProps> = ({ dietType }) => {
  const [filterType, setFilterType] = useState<string>(dietType || 'all');
  
  // Filter based on vegetarian preference
  const filteredRecommendations = MOCK_RECOMMENDATIONS.filter(meal => {
    if (filterType === 'all') return true;
    if (filterType === 'vegetarian' || filterType === 'vegan') return meal.isVegetarian;
    return !meal.isVegetarian;
  });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Meal Recommendations</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs rounded-md ${
                filterType === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType('vegetarian')}
              className={`px-3 py-1 text-xs rounded-md ${
                filterType === 'vegetarian' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Vegetarian
            </button>
            <button 
              onClick={() => setFilterType('non-veg')}
              className={`px-3 py-1 text-xs rounded-md ${
                filterType === 'non-veg' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {filteredRecommendations.length > 0 ? (
          filteredRecommendations.map(meal => (
            <div key={meal.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                  {meal.imageUrl ? (
                    <img 
                      src={meal.imageUrl} 
                      alt={meal.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">{meal.name}</h3>
                    {meal.isVegetarian && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                        Veg
                      </span>
                    )}
                    {!meal.isVegetarian && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                        Non-Veg
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span className="capitalize">{meal.mealType}</span>
                    <span className="mx-1">•</span>
                    <span>{meal.calories} calories</span>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-1">
                    {meal.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <button 
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Add to Plan
                  </button>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <div>Protein: {meal.protein}g</div>
                <div>Carbs: {meal.carbs}g</div>
                <div>Fat: {meal.fat}g</div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No meals found for your current filter selection.
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
        <button className="w-full text-center text-sm text-indigo-600 font-medium">
          View More Recommendations
        </button>
      </div>
    </div>
  );
};

export default MealRecommendations; 