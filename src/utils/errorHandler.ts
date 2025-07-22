import axios from 'axios';

/**
 * Extracts a user-friendly error message from an API error
 */
export const getErrorMessage = (error: any): string => {
  // Check if the error is an Axios error
  if (error && error.isAxiosError) {
    if (error.response) {
      // Server responded with a status code that falls out of the range of 2xx
      const data = error.response.data;
      if (data && data.message) {
        return data.message;
      } else if (data && data.error) {
        return data.error;
      } else if (data && typeof data === 'string') {
        return data;
      } else if (error.response.status === 401) {
        return 'You are not authorized to perform this action. Please log in again.';
      } else if (error.response.status === 403) {
        return 'You do not have permission to perform this action.';
      } else if (error.response.status === 404) {
        return 'The requested resource was not found.';
      } else if (error.response.status >= 500) {
        return 'A server error occurred. Please try again later.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      return 'No response from server. Please check your internet connection.';
    } else {
      // Something happened in setting up the request
      return error.message || 'An unknown error occurred.';
    }
  }
  
  // Not an Axios error
  return error?.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Generic error handler for API requests
 */
export const handleApiError = (error: any, setError: (message: string) => void): void => {
  console.error('API Error:', error);
  const message = getErrorMessage(error);
  setError(message);
};

export default {
  getErrorMessage,
  handleApiError,
}; 