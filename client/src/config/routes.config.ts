export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',

  DASHBOARD: '/dashboard',
  
  SAVINGS: '/savings',
  SAVINGS_DEPOSIT: '/savings/deposit',
  SAVINGS_WITHDRAW: '/savings/withdraw',
  
  CREDIT: '/credit',
  CREDIT_REQUEST: '/credit/request',
  CREDIT_REPAY: '/credit/repay',
  
  NOTIFICATIONS: '/notifications',
  
  PROFILE: '/profile',
} as const;

export const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.REGISTER];

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.SAVINGS,
  ROUTES.SAVINGS_DEPOSIT,
  ROUTES.SAVINGS_WITHDRAW,
  ROUTES.CREDIT,
  ROUTES.CREDIT_REQUEST,
  ROUTES.CREDIT_REPAY,
  ROUTES.NOTIFICATIONS,
  ROUTES.PROFILE,
];

