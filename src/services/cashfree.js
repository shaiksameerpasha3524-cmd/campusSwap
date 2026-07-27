// cashfree.js - Cashfree payment integration

/**
 * Dynamically loads the Cashfree Checkout script.
 * @returns {Promise<boolean>} Resolves to true when script loads successfully.
 */
export const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (window.Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    // Official Cashfree Checkout script URL (as per documentation)
    script.src = 'https://checkout.cashfree.com/assets/js/v1/cashfreecheckout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initializes Cashfree payment checkout.
 * This function assumes you have a backend endpoint that creates an order and returns a token.
 * Adjust the endpoint URL as needed for your backend implementation.
 * @param {object} params - Payment details.
 * @param {number} params.amount - Amount in INR (e.g., 49).
 * @param {string} params.studentName - Full name of the student.
 * @param {string} params.studentEmail - Email of the student.
 * @param {string} params.studentPhone - Mobile number of the student.
 * @param {function} params.onSuccess - Callback invoked with { paymentId } on success.
 * @param {function} params.onFailure - Callback invoked with Error on failure/cancel.
 */
export const initializeCashfreePayment = async ({
  amount,
  studentName,
  studentEmail,
  studentPhone,
  onSuccess,
  onFailure,
}) => {
  const isLoaded = await loadCashfreeScript();
  if (!isLoaded) {
    onFailure(new Error('Cashfree SDK failed to load. Check your internet connection.'));
    return;
  }

  // Fetch order token from your backend. Replace the URL with your actual endpoint.
  try {
    const response = await fetch('/api/cashfree/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise as Cashfree expects amount in the smallest unit
        customer: {
          name: studentName || '',
          email: studentEmail || '',
          phone: studentPhone || '',
        },
        // You may include additional metadata here if required by your backend.
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.token || !data.orderId) {
      throw new Error(data.message || 'Failed to retrieve Cashfree token');
    }

    const options = {
      token: data.token,
      orderId: data.orderId,
      // Optional: you can pass embed, paymentModes, etc., based on Cashfree docs.
      onSuccess: (payment) => {
        // payment contains orderId, paymentId, etc.
        onSuccess({ paymentId: payment.paymentId || payment.orderId });
      },
      onFailure: (err) => {
        onFailure(new Error(err.message || 'Cashfree payment failed'));
      },
      // Prefill customer details
      customer: {
        name: studentName || '',
        email: studentEmail || '',
        phone: studentPhone || '',
      },
    };

    // Open Cashfree Checkout
    if (window.Cashfree) {
      window.Cashfree.open(options);
    } else {
      throw new Error('Cashfree SDK not available after load');
    }
  } catch (err) {
    console.error('Cashfree payment initialization error:', err);
    onFailure(err);
  }
};
