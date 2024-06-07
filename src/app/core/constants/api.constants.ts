import { environment } from '@environment/environment';

export const API = {
  DASHBOARD: `${environment.authApi}/api/dashboard`,
  FORGOT_PASSWORD: `${environment.authApi}/auth/forgot-password`,
  HEADING: `${environment.collectionApi}/api/heading`,
  LOGIN: `${environment.authApi}/auth/login`,
  RESET_PASSWORD: `${environment.authApi}/auth/reset-password`,
  CHANGE_PASSWORD: `${environment.authApi}/api/admin/change-password`,
  ROLES: `${environment.authApi}/roles`,
  MEMBERS: `${environment.authApi}/users`,
  CATEGORIES: `${environment.authApi}/categories`,
  PRODUCTS: `${environment.authApi}/products`,
  PROFILE: `${environment.authApi}/api/admin/me`,
  UPDATE_PROFILE: `${environment.authApi}/api/admin`,
  UPLOAD_URL: `${environment.collectionApi}/api/artefact/upload-media`,
  GENERATE_URL: `${environment.collectionApi}/api/generate-url`,
  NATIONALITIES: `${environment.authApi}/api/constant`,
  PERMISSIONS: `${environment.authApi}/api/permission`,
  WHAT_WE_DO: `${environment.authApi}/what-we-dos`,
  PARTNERS: `${environment.authApi}/partners`,
};

export const CACHE_API = [API.NATIONALITIES, API.PERMISSIONS];
