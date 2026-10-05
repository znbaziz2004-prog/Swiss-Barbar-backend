import api, { unwrap } from './api'

export const createStripeCheckoutSession = async (subscriptionId) => {
  return unwrap(
    await api.post('/stripe/create-checkout-session', {
      subscriptionId,
    })
  )
}