import npm from '../../package.json';

export const environment = {
  production: true,
  type: 'production',
  encryptedKey: process.env.ENCRYPTED_KEY,
  version: npm.version,
  authApi: 'https://sikh-api.focalat.com/auth',
  cmsApi: 'https://sikh-api.focalat.com/cms',
  contributionApi: 'https://sikh-api.focalat.com/contribution',
  collectionApi: 'https://sikh-api.focalat.com/collection',
  museumEduSagaApi: 'https://sikh-api.focalat.com/museum-edu-saga',
  preferredCountries: ['us', 'in'],
  awsUrl: 'https://shm-stg.s3.ap-south-1.amazonaws.com/dshm-dev/',
  logo: '/assets/images/logo.svg',
  title: 'Saseanee Console',
  email: 'sikhhistorymuseum@gmail.com',
  webDomainUrl: 'https://sikhhistorymuseum.org'
};
