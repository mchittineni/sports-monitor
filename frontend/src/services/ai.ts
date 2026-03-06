import apiClient from './api';

export const chatWithAI = async (message: string): Promise<string> => {
  try {
    const response = await apiClient.post('/ai/chat', {
      message,
      context: 'sports',
    });
    return response.data.response;
  } catch (error) {
    console.error('AI chat error:', error);
    throw error;
  }
};

export const generateMatchSummary = async (matchData: any): Promise<string> => {
  try {
    const response = await apiClient.post('/ai/summarize-match', {
      match: matchData,
    });
    return response.data.summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    throw error;
  }
};

export const getPrediction = async (matchId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/ai/prediction/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Prediction error:', error);
    throw error;
  }
};

export default {
  chatWithAI,
  generateMatchSummary,
  getPrediction,
};
