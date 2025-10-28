export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT),
} as const;

export const API_ENDPOINTS = {
  // Auth
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  // Users
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/change-password',
  },
  // Savings
  savings: {
    account: '/savings/account',
    createAccount: '/savings/account',
    updateAccount: '/savings/account',
    deleteAccount: '/savings/account',
    deposit: '/savings/deposit',
    withdraw: '/savings/withdraw',
    balance: '/savings/balance',
    transactions: '/savings/transactions',
    freeze: '/savings/freeze',
    unfreeze: '/savings/unfreeze',
  },
  // Credit
  credit: {
    request: '/credit/request',
    requests: '/credit/requests',
    requestById: (id: string) => `/credit/requests/${id}`,
    repay: '/credit/repay',
    repayments: (requestId: string) => `/credit/requests/${requestId}/repayments`,
  },
  // Notifications
  notifications: {
    list: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
  },
} as const;

