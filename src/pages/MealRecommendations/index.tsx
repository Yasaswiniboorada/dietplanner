import React, { useState, useEffect } from 'react';
import userService, { UserProfile } from '../../services/user.service';
import MealRecommendations from '../../components/meal/MealRecommendations';
import MealBrowser from '../../components/meal/MealBrowser';

const MealRecommendationsPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [userGoal, setUserGoal] = useState<string>('Weight Loss');
  const [userDietType, setUserDietType] = useState<string>('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await userService.getProfile();
        setProfile(userProfile);
        
        // Set meal preferences based on profile
        if (userProfile) {
          // Set diet type
          if (userProfile.dietaryPreference === 'veg') {
            setUserDietType('Vegetarian');
          } else if (userProfile.dietaryPreference === 'non-veg') {
            setUserDietType(''); // Show both
          }
          
          // Set goal
          if (userProfile.goal === 'weight_loss') {
            setUserGoal('Weight Loss');
          } else if (userProfile.goal === 'muscle_gain') {
            setUserGoal('Muscle Gain');
          } else if (userProfile.goal === 'maintenance') {
            setUserGoal('Diabetic-Friendly');
          }
        }
      } catch (err) {
        setError('Failed to load user profile. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Meal Recommendations</h1>
        <p className="text-gray-600 mb-6">
          Here are personalized meal recommendations based on your preferences and dietary goals.
          These meals are designed to help you achieve your {userGoal.toLowerCase()} goal.
        </p>

        <div className="mb-8">
          <MealRecommendations 
            goal={userGoal} 
            type={userDietType} 
            count={6} 
          />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Meal Options</h2>
        <p className="text-gray-600 mb-6">
          Browse through our complete collection of meals and filter by type, category, or nutritional content.
        </p>

        <MealBrowser initialType={userDietType} />
      </div>
    </div>
  );
};

export default MealRecommendationsPage; 