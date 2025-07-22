import React, { useState, useEffect } from 'react';
import mealService, { MealItem } from '../../services/meal.service';

interface MealBrowserProps {
  initialType?: string;
  initialCategory?: string;
}

const MealBrowser: React.FC<MealBrowserProps> = ({ 
  initialType = '', 
  initialCategory = '' 
}) => {
  const [meals, setMeals] = useState<MealItem[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<MealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const [mealItems, categoryList] = await Promise.all([
          mealService.getMealItems(),
          mealService.getMealCategories()
        ]);
        setMeals(mealItems);
        setFilteredMeals(mealItems);
        setCategories(categoryList);
      } catch (err) {
        setError('Failed to load meal data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...meals];
    
    if (selectedType) {
      result = result.filter(meal => meal.type === selectedType);
    }
    
    if (selectedCategory) {
      result = result.filter(meal => 
        meal.categories && meal.categories.includes(selectedCategory)
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(meal => 
        meal.name.toLowerCase().includes(term)
      );
    }
    
    setFilteredMeals(result);
  }, [meals, selectedType, selectedCategory, searchTerm]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading meals...</div>
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse Meal Options</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Meals
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Type Filter Buttons */}
          <div className="flex flex-col">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Type
            </span>
            <div className="flex space-x-2 mt-1">
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
        </div>
        
        {/* Results */}
        {filteredMeals.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md">
            <div className="text-yellow-700">No meals found with the selected filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
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
    </div>
  );
};

export default MealBrowser; 