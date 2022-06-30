import httpClient from './httpClient.api';
const ENDPOINT = '/room-events';

export const getEvents = () => httpClient.get(`${ENDPOINT}`);
export const createEvent = (data) => httpClient.post(ENDPOINT, data);
export const updateEvent = (id, data) => httpClient.put(`${ENDPOINT}/${id}`, data);
export const deleteEvent = (id) => httpClient.delete(`${ENDPOINT}/${id}`);
