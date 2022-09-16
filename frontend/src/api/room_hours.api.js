import httpClient from './httpClient.api';
const ENDPOINT = '/room-hours';

export const getHoursFenix = (data) => httpClient.post(`${ENDPOINT}/fenix`, data);
export const getHours = (month, year) =>
  httpClient.get(`${ENDPOINT}`, {
    params: {
      month,
      year,
    },
  });
export const createHours = (data) => httpClient.post(ENDPOINT, data);
export const deleteHours = (id) => httpClient.delete(`${ENDPOINT}/${id}`);
export const updateHours = (id, data) => httpClient.put(`${ENDPOINT}/${id}`, data);
