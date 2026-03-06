import axios, { type AxiosInstance } from 'axios';

const API_BASE =
  (import.meta as any).env.VITE_API_URL || 'http://localhost:3001/api';

const actualAxios = (axios as any).default || axios;

const apiClient: AxiosInstance = actualAxios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

/**
 * Fetches sports events currently happening or scheduled in a specific country.
 *
 * @param {string} country - The name or code of the country to query.
 * @returns {Promise<any>} The sports events data matching the country.
 */
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

/**
 * Fetches all globally live sports events.
 *
 * @returns {Promise<any>} An array of live sports events from the backend.
 */
export const getLiveEvents = async () => {
  try {
    const response = await apiClient.get('/sports/live');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch live events:', error);
    throw error;
  }
};

/**
 * Retrieves aggregate statistics or descriptive data about sports in a country.
 *
 * @param {string} countryCode - The standard country code (e.g. 'US', 'GB').
 * @returns {Promise<any>} Statistical data for the specified country.
 */
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
