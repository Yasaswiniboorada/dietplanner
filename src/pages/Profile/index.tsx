import React, { useState, useEffect } from 'react';
import userService, { UserProfile } from '../../services/user.service';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await userService.getProfile();
        setProfile(userProfile);
        setFormData(userProfile);
      } catch (err) {
        setError('Failed to load profile data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'weight' || name === 'height' || name === 'age' 
        ? Number(value) 
        : value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData as UserProfile);
      setProfile(formData as UserProfile);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 rounded-md">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  step="0.1"
                  min="20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  step="0.1"
                  min="50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Level
                </label>
                <select
                  name="activityLevel"
                  value={formData.activityLevel || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Activity Level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="very_active">Very active (very hard exercise & physical job)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal
                </label>
                <select
                  name="goal"
                  value={formData.goal || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Goal</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Frequency
                </label>
                <select
                  name="mealFrequency"
                  value={formData.mealFrequency || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Meal Frequency</option>
                  <option value="three">Three meals per day</option>
                  <option value="four">Four meals per day</option>
                  <option value="five">Five meals per day</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dietary Preference
                </label>
                <select
                  name="dietaryPreference"
                  value={formData.dietaryPreference || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Dietary Preference</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profile || {});
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Age</p>
                <p className="text-base font-medium">{profile.age} years</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Gender</p>
                <p className="text-base font-medium capitalize">{profile.gender}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Weight</p>
                <p className="text-base font-medium">{profile.weight} kg</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Height</p>
                <p className="text-base font-medium">{profile.height} cm</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Activity Level</p>
                <p className="text-base font-medium">
                  {profile.activityLevel === 'sedentary' && 'Sedentary'}
                  {profile.activityLevel === 'light' && 'Lightly Active'}
                  {profile.activityLevel === 'moderate' && 'Moderately Active'}
                  {profile.activityLevel === 'active' && 'Active'}
                  {profile.activityLevel === 'very_active' && 'Very Active'}
                </p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Goal</p>
                <p className="text-base font-medium">
                  {profile.goal === 'weight_loss' && 'Weight Loss'}
                  {profile.goal === 'muscle_gain' && 'Muscle Gain'}
                  {profile.goal === 'maintenance' && 'Maintenance'}
                </p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Meal Frequency</p>
                <p className="text-base font-medium">
                  {profile.mealFrequency === 'three' && 'Three meals per day'}
                  {profile.mealFrequency === 'four' && 'Four meals per day'}
                  {profile.mealFrequency === 'five' && 'Five meals per day'}
                </p>
              </div>
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Dietary Preference</p>
                <p className="text-base font-medium">
                  {profile.dietaryPreference === 'veg' && 'Vegetarian'}
                  {profile.dietaryPreference === 'non-veg' && 'Non-Vegetarian'}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Profile; 