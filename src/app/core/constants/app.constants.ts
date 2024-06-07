/* eslint-disable max-len, no-magic-numbers */

export const LANGUAGES = [
  { value: 'en_US', label: 'English', flagUrl: '/assets/images/flags/en.svg' },
  { value: 'de_CH', label: 'German', flagUrl: '/assets/images/flags/de.svg' }
] as const;

export const APP = {
  SUPPORT_EMAIL: 'sikhhistorymuseum@gmail.com',
  PAGE_OPTIONS: [10, 25, 50, 100],
  PAGE_SIZE: 10,
  PAGE_INDEX: 1,
  TIME_DELAY: 1500,
  DEBOUNCE_TIME: 500,
  LOGOUT: 'logout',
  MIN_SEARCH_LEN: 4,
  TIMEOUT: 0,
  LANGUAGE: LANGUAGES[0].value,
  IMAGE_TYPE: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  MAX_IMAGE_SIZE: 5242880, // 5MB
  CURRENCY_SYMBOL: '$',
  DIALOG_WIDTH: '400px',
  POPUP_WIDTH: '1024px',
  BYTES_PER_KB: 1024,
  DESCRIPTION_MAX_LENGTH: 100
};

export const REGEX = {
  EMAIL:
    /^[\p{L}\d!#$%&'*+=?^_`{|}~-]+(?:\.[\p{L}\d!#$%&'*+=?^_`{|}~-]+)*@(?:[_\p{L}\d][-_\p{L}\d]*\.)*(?:[\p{L}\d][-\p{L}\d]{0,62})\.(?:(?:[a-z]{2}\.)?[a-z]{2,})$/iu,
  PASSWORD: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d)(?=.*?[#?!@$%^&*-]).{8,16}$/,
  INTEGER: /^\d*$/,
  DECIMAL: /^\d*\.?\d*$/,
  URL: /^(https):\/\/(([a-z\d]([a-z\d-]*[a-z\d])?\.)+[a-z]{2,}|localhost)(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/,
  WEBSITE: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/,
  VIDEO_LINK: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]{1,5})?(\/[^\s]*)?$/
};

export const SORT_OPTIONS = [
  { value: 'desc', label: 'descending' },
  { value: 'asc', label: 'ascending' }
];

export const STATUS = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
];

export const TRUE_FALSE_OPTIONS = [
  { value: true, label: 'True' },
  { value: false, label: 'False' }
];

export const PAYMENT_STATUS = [
  { value: true, label: 'Paid' },
  { value: false, label: 'Unpaid' }
];

export const YES_NO_OPTIONS = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' }
];

export const MEDIA_EXTENSION = {
  IMAGE: 'jpeg, jpg, png and webp'
};

export const MEDIA_SIZE = {
  IMAGE: 5
};

export const MEDIA_RATIO = {
  HOME_LOGO: '64x54',
  HEADING: '330x200'
};

export const PARTNER_MODES = [
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
];

export const TOTAL_PERCENT = 100;
export const END_OF_DAY_HOURS = 23;
export const END_OF_DAY_MINUTES = 59;
export const END_OF_DAY_SECONDS = 59;
export const END_OF_DAY_MILLISECONDS = 999;
export const MINUTE_MILLISECONDS = 60000;
