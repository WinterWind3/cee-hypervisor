import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

export const useClusters = () => useApi(() => apiService.getClusters());
export const useServers = () => useApi(() => apiService.getServers());
export const useVMs = () => useApi(() => apiService.getVMs());
export const useImages = () => useApi(() => apiService.getImages());