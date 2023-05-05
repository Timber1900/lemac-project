import httpClient from './httpClient.api';
const ENDPOINT = '/entrances';

export const getLemacUser = (id) => httpClient.get(`${ENDPOINT}/${id}`);
export const setLemacUser = (user) => httpClient.put(`${ENDPOINT}`, user);
export const createLemacUser = (user) => httpClient.post(`${ENDPOINT}/create_user`, user);
export const getLemacUsers = () => httpClient.get(ENDPOINT);
