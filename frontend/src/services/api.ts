import axios from 'axios';

const API_BASE =
  (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const getSportsData = async (country: string) => {
  try {
    const response = await apiClient.get('/sports/by-country', {
      params: { country },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch sports data:', error);
    throw error;
  }
};

export const getLiveEvents = async () => {
  try {
    const response = await apiClient.get('/sports/live');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch live events:', error);
    throw error;
  }
};

export const getCountryStats = async (countryCode: string) => {
  try {
    const response = await apiClient.get(`/stats/${countryCode}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch country stats:', error);
    throw error;
  }
};

export default apiClient;
