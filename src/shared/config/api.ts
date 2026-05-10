// Extended API endpoints for new feature modules
export const API_ENDPOINTS = {
  // ... existing endpoints from api.ts

  // Appointments (patient)
  appointments: {
    list: '/platform/appointments/my-appointments',
    book: '/platform/appointments/book',
    cancel: (id: string) => `/platform/appointments/${id}/cancel`,
    get: (id: string) => `/platform/appointments/${id}`,
    reschedule: (id: string) => `/platform/appointments/${id}/reschedule`,
  },

  // Discovery / Doctors
  doctors: {
    search: '/platform/discovery/doctors',
    detail: (id: string) => `/platform/discovery/doctors/${id}`,
    availability: (id: string) => `/platform/doctors/${id}/availability`,
    profile: (id: string) => `/platform/doctors/${id}`,
    reviews: (id: string) => `/platform/doctors/${id}/reviews`,
  },

  // Consultation sessions
  consultations: {
    list: '/platform/consultations/my-sessions',
    session: (id: string) => `/platform/consultations/${id}`,
    join: (id: string) => `/platform/consultations/${id}/join`,
    end: (id: string) => `/platform/consultations/${id}/end`,
  },

  // Notifications
  notifications: {
    list: '/platform/notifications/my-notifications',
    preferences: '/platform/notifications/my-preferences',
    markRead: (id: string) => `/platform/notifications/${id}/read`,
    markAllRead: '/platform/notifications/read-all',
    count: '/platform/notifications/count',
  },

  // Profile & Settings
  profile: {
    me: '/platform/auth/me',
    update: '/platform/auth/me/update',
    changePassword: '/platform/auth/change-password',
    deleteAccount: '/platform/auth/delete-account',
  },

  // GDPR
  gdpr: {
    requests: '/platform/gdpr/requests',
    export: '/platform/gdpr/export',
    submitRequest: '/platform/gdpr/requests/submit',
  },

  // Research
  research: {
    studies: '/platform/research/studies',
    enroll: (id: string) => `/platform/research/studies/${id}/enroll`,
    withdraw: (id: string) => `/platform/research/studies/${id}/withdraw`,
    myStudies: '/platform/research/my-studies',
  },

  // Admin
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    doctors: {
      pending: '/admin/doctors/pending',
      verify: (id: string) => `/admin/doctors/${id}/verify`,
      reject: (id: string) => `/admin/doctors/${id}/reject`,
    },
    billing: {
      all: '/billing/admin/consultations',
      refund: (id: string) => `/billing/${id}/refund`,
      feeStructure: '/billing/admin/fee-structure',
    },
    support: {
      tickets: '/support/agent/tickets',
      assign: (id: string) => `/support/agent/tickets/${id}/assign`,
      resolve: (id: string) => `/support/agent/tickets/${id}/resolve',
      escalate: (id: string) => `/support/agent/tickets/${id}/escalate`,
    },
  },
}

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
}