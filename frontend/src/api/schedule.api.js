import httpClient from './httpClient.api';
const ENDPOINT = '/schedule';

export const getHours = (month, year) =>
  httpClient.get(ENDPOINT, {
    params: {
      month,
      year,
    },
  });

export const createHours = (data) => httpClient.post(ENDPOINT, data);
export const deleteHours = (id) => httpClient.delete(`${ENDPOINT}/${id}`);
export const updateHour = (id, data) => httpClient.put(`${ENDPOINT}/${id}`, data);
