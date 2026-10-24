const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

if (!configuredApiUrl) {
  throw new Error('VITE_API_URL is not configured. Add it to CodeExplainr/.env.');
}

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  explain: `${API_BASE_URL}/api/v1/explain`,
  formatCode: `${API_BASE_URL}/api/v1/format-code`,
  validateApiKey: `${API_BASE_URL}/api/v1/validate-api-key`,
  answerQuestion: `${API_BASE_URL}/api/v1/answer-question`,
};
