import httpClient from './httpClient.api';
const ENDPOINT = '/roomhours';

export const getHours = (month, year) =>
  httpClient.get(ENDPOINT, {
    params: {
      month,
      year,
    },
  });
