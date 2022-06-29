import httpClient from './httpClient.api';
const ENDPOINT = '/roomhours';

export const getHours = () => httpClient.get(ENDPOINT);
