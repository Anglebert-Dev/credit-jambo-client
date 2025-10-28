export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
} as const;

export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },
  users: {
    profile: '/users/profile',
    updateProfile: '/users/profile',
    changePassword: '/users/password',
  },
  savings: {
    account: '/savings/account',
    createAccount: '/savings/create',
    updateAccount: '/savings/account',
    deleteAccount: '/savings/account',
    deposit: '/savings/deposit',
    withdraw: '/savings/withdraw',
    balance: '/savings/balance',
    transactions: '/savings/transactions',
    freeze: '/savings/freeze',
    unfreeze: '/savings/unfreeze',
  },
  credit: {
    request: '/credit/request',
    requests: '/credit/requests',
    requestById: (id: string) => `/credit/requests/${id}`,
    repay: (id: string) => `/credit/repay/${id}`,
    repayments: (requestId: string) => `/credit/repayments/${requestId}`,
  },
  notifications: {
    list: '/notifications',
    markAsRead: (id: string) => `/notifications/${id}/read`,
  },
} as const;

