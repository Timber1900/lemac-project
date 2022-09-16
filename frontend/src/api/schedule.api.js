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
export const getUserTargets = () => httpClient.get(`${ENDPOINT}/targets`);
export const setUserTarget = (data) => httpClient.post(`${ENDPOINT}/targets`, data);
export const getOffDays = () => httpClient.get(`${ENDPOINT}/off_days`);
export const setOffDays = (data) => httpClient.post(`${ENDPOINT}/off_days`, data);
export const deleteOffDay = (id) => httpClient.delete(`${ENDPOINT}/off_days/${id}`);
