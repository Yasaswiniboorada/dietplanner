import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import userService from '../../services/user.service';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber: string;
  dob: string;
  height: number;
  gender: string;
  activityLevel: string;
  bodyFat: string;
  mealFrequency: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  phoneNumber?: string;
  dob?: string;
  mealFrequency?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phoneNumber: '',
    dob: '',
    height: 170,
    gender: 'Male',
    activityLevel: 'Lightly active, workout 3-4 times/week',
    bodyFat: 'Medium',
    mealFrequency: '',
  });
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);
  const [units, setUnits] = useState<string>('Metric');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field is updated
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateFirstStep = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;
    
    // Validate email
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Validate name
    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate phone number
    if (!formData.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
      isValid = false;
    }
    
    // Validate date of birth
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
      isValid = false;
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleNextStep = () => {
    if (validateFirstStep()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleUnitChange = (unit: string) => {
    setUnits(unit);
    // Convert height if changing units
    if (unit === 'U.S. Standard' && units === 'Metric') {
      // Convert from cm to inches (approximate)
      setFormData(prev => ({
        ...prev,
        height: Math.round(prev.height / 2.54)
      }));
    } else if (unit === 'Metric' && units === 'U.S. Standard') {
      // Convert from inches to cm
      setFormData(prev => ({
        ...prev,
        height: Math.round(prev.height * 2.54)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFirstStep()) {
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // For demo purposes - simulate a successful registration without API
      // Remove this code when API is ready
      console.log('Registration data:', {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        gender: formData.gender,
        height: formData.height,
        bodyFat: formData.bodyFat,
        activityLevel: formData.activityLevel
      });
      
      // Store fake user data in localStorage for demo
      const fakeAuthResponse = {
        token: 'fake-jwt-token',
        user: {
          id: '123456',
          name: formData.name,
          email: formData.email
        }
      };
      
      localStorage.setItem('user', JSON.stringify(fakeAuthResponse));
      
      // Navigate to dashboard after "successful" registration
      navigate('/dashboard');
      
      /* 
      // Uncomment this when API is ready
      // Register user account
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: formData.name
      };
      
      const authResponse = await authService.register(registerData);
      
      // After successful registration, create user profile
      const dobDate = new Date(formData.dob);
      const age = Math.floor((new Date().getTime() - dobDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      const userProfile = {
        age,
        gender: formData.gender,
        height: formData.height,
        weight: 70, // Default weight - will be updated later
        activityLevel: formData.activityLevel,
        dietaryPreference: 'non-veg', // Default - can be updated later
        goal: 'weight_loss', // Default - can be updated later
        mealFrequency: formData.mealFrequency,
        bodyFatPercentage: formData.bodyFat === 'Low' ? 15 : formData.bodyFat === 'Medium' ? 22 : 30,
        phoneNumber: formData.phoneNumber
      };
      
      await userService.saveProfile(userProfile);
      
      navigate('/dashboard');
      */
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone number</label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.phoneNumber ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                  {validationErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.dob ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.dob}
                    onChange={handleChange}
                  />
                  {validationErrors.dob && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.dob}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {validationErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={`mt-1 block w-full px-3 py-2 border ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred units</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleUnitChange('U.S. Standard')}
                        className={`px-4 py-2 ${units === 'U.S. Standard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        U.S. Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange('Metric')}
                        className={`px-4 py-2 ${units === 'Metric' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Metric
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sex</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: 'Male' }))}
                        className={`px-4 py-2 ${formData.gender === 'Male' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: 'Female' }))}
                        className={`px-4 py-2 ${formData.gender === 'Female' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Female
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gender: 'Non-Binary' }))}
                        className={`px-4 py-2 ${formData.gender === 'Non-Binary' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Non-Binary
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                      Height {units === 'Metric' ? '(cm)' : '(inches)'}
                    </label>
                    <input
                      id="height"
                      name="height"
                      type="number"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">Activity Level</label>
                    <select
                      id="activityLevel"
                      name="activityLevel"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.activityLevel}
                      onChange={handleChange}
                    >
                      <option value="Sedentary, rarely exercise">Sedentary, rarely exercise</option>
                      <option value="Lightly active, workout 1-2 times/week">Lightly active, workout 1-2 times/week</option>
                      <option value="Lightly active, workout 3-4 times/week">Lightly active, workout 3-4 times/week</option>
                      <option value="Very active, workout 5+ times/week">Very active, workout 5+ times/week</option>
                      <option value="Extremely active, physical job or athlete">Extremely active, physical job or athlete</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Body Fat</label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bodyFat: 'Low' }))}
                        className={`px-4 py-2 ${formData.bodyFat === 'Low' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bodyFat: 'Medium' }))}
                        className={`px-4 py-2 ${formData.bodyFat === 'Medium' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        Medium
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, bodyFat: 'High' }))}
                        className={`px-4 py-2 ${formData.bodyFat === 'High' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'} border border-gray-300 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                      >
                        High
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mealFrequency" className="block text-sm font-medium text-gray-700">
                      Preferred Meals Per Day <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="mealFrequency"
                      name="mealFrequency"
                      value={formData.mealFrequency}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select</option>
                      <option value="1">1 meal</option>
                      <option value="2">2 meals</option>
                      <option value="3">3 meals</option>
                    </select>
                    {validationErrors.mealFrequency && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.mealFrequency}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register; 