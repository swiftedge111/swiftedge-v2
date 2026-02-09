
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '4000') {
    return 'http://localhost:4000';  
  }
  return 'https://swiftedge-v2.onrender.com'; 
};

window.API_BASE_URL = getApiBaseUrl();