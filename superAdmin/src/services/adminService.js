import api, { unwrap, toList } from './api'

/*
 * NOTE: endpoint paths below follow the plan. If your backend routes
 * are named differently, change them here only.
 */

/* AUTH */
export const loginRequest = async (payload) =>
  unwrap(await api.post('/auth/login', payload))

/* DASHBOARD */
export const getDashboardStats = async () =>
  unwrap(await api.get('/dashboard/stats'))

/* REGISTRATIONS */
/* REGISTRATIONS */

export const getRegistrations = async (params = {}) =>
  toList(
    unwrap(
      await api.get('/admin/owners/registrations', {
        params,
      }),
    ),
    'registrations',
  )

export const getRegistration = async (id) =>
  unwrap(
    await api.get(`/admin/owners/registrations/${id}`),
  )

export const approveRegistration = async (id) =>
  unwrap(
    await api.patch(
      `/admin/owners/registrations/${id}/review`,
      {
        action: 'approve',
      },
    ),
  )

export const rejectRegistration = async (id, reason) =>
  unwrap(
    await api.patch(
      `/admin/owners/registrations/${id}/review`,
      {
        action: 'reject',
        rejectionReason: reason,
      },
    ),
  )

/* SHOPS */
export const getShops = async (params) =>
  toList(unwrap(await api.get('/shops', { params })), 'shops')

export const getShop = async (id) => {
  const data = unwrap(await api.get(`/shops/${id}`))
  return data?.shop ?? data
}

export const updateShopStatus = async (id, status) =>
  unwrap(await api.patch(`/shops/${id}/status`, { status }))

export const toggleShopFeatured = async (id, isFeatured) =>
  unwrap(
    await api.patch(`/admin/owners/shops/${id}/featured`, {
      isFeatured: Boolean(isFeatured),
    }),
  )

/* OWNERS */
export const getOwners = async (params) =>
  toList(unwrap(await api.get('/admin/owners', { params })), 'owners')

export const getOwner = async (id) => {
  const data = unwrap(await api.get(`/admin/owners/${id}`))
  return data?.owner ?? data
}

export const updateOwnerStatus = async (id, status) =>
  unwrap(await api.patch(`/admin/owners/${id}/status`, { status }))

/* SUBSCRIPTION PLANS */
export const getPlans = async () =>
  toList(unwrap(await api.get('/subscription-plans')), 'plans')

export const createPlan = async (payload) =>
  unwrap(await api.post('/subscription-plans', payload))

export const updatePlan = async (id, payload) =>
  unwrap(await api.put(`/subscription-plans/${id}`, payload))

export const deletePlan = async (id) =>
  unwrap(await api.delete(`/subscription-plans/${id}`))

/* SUBSCRIPTIONS */
export const getSubscriptions = async (params) =>
  toList(unwrap(await api.get('/subscriptions', { params })), 'subscriptions')

export const updateSubscriptionStatus = async (id, status) =>
  unwrap(await api.patch(`/subscriptions/${id}/status`, { status }))

/* SUBSCRIPTION PAYMENTS */
export const getSubscriptionPayments = async (params) =>
  toList(
    unwrap(await api.get('/subscription-payments', { params })),
    'payments',
  )

/* REPORTS */
export const getReports = async (params) =>
  unwrap(await api.get('/reports/summary', { params }))

/* SETTINGS */
export const getSettings = async () => unwrap(await api.get('/settings'))

export const saveSettings = async (payload) =>
  unwrap(await api.put('/settings', payload))
