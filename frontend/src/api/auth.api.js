import httpClient from './httpClient.api';

const ENDPOINT = '/auth';

export const apiLogin = (code) =>
  httpClient.get(`${ENDPOINT}/fenix?code=${encodeURIComponent(code)}`, { skipInterceptor: true });

export const getFenixInfo = (code) =>
  httpClient.get(`${ENDPOINT}/fenix_info?code=${encodeURIComponent(code)}`, { skipInterceptor: true });

export const getProfile = async () => {
  const response = await httpClient.get(`${ENDPOINT}/profile`);
  return response.data;
};
