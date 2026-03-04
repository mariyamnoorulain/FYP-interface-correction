const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    throw error;
  }
};

const confirmPayment = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    throw error;
  }
};

const createRefund = async (chargeId, amount, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      amount: Math.round(amount * 100), // Convert to cents
      reason
    });
    return refund;
  } catch (error) {
    console.error('Stripe refund error:', error);
    throw error;
  }
};

const createSubscription = async (customerId, priceId, metadata = {}) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata
    });
    return subscription;
  } catch (error) {
    console.error('Stripe subscription creation error:', error);
    throw error;
  }
};

const cancelSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe subscription cancellation error:', error);
    throw error;
  }
};

const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  createSubscription,
  cancelSubscription,
  createCustomer
};

