/**
 * Dynamically loads the Razorpay checkout.js script.
 * @returns {Promise<boolean>} True if loaded successfully, otherwise false.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Initializes the Razorpay payment modal on the client.
 * @param {object} params - Payment details.
 * @param {number} params.amount - Amount in INR (e.g. 49).
 * @param {string} params.studentName - Full name of the student.
 * @param {string} params.studentEmail - Email of the student.
 * @param {string} params.studentPhone - Mobile number of the student.
 * @param {function} params.onSuccess - Callback on success. Takes payment response.
 * @param {function} params.onFailure - Callback on modal close or error.
 */
export const initializeRazorpayPayment = async ({
  amount,
  studentName,
  studentEmail,
  studentPhone,
  onSuccess,
  onFailure,
}) => {
  const isLoaded = await loadRazorpayScript()
  if (!isLoaded) {
    onFailure(new Error('Razorpay SDK failed to load. Please check your internet connection.'))
    return
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_defaultKeyPlaceholder'

  if (razorpayKey === 'rzp_test_defaultKeyPlaceholder') {
    console.warn(
      'Razorpay Key ID is not configured. Running in fallback/demo mode with placeholder key.'
    )
  }

  const options = {
    key: razorpayKey,
    amount: amount * 100, // convert INR to paise (e.g. 49 INR = 4900 paise)
    currency: 'INR',
    name: 'CampusSwap',
    description: 'Seller Membership Activation (30 Days)',
    image: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2280%22>🔄</text></svg>',
    handler: function (response) {
      if (response.razorpay_payment_id) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
        })
      } else {
        onFailure(new Error('Payment completed but no transaction reference was returned.'))
      }
    },
    prefill: {
      name: studentName || '',
      email: studentEmail || '',
      contact: studentPhone || '',
    },
    notes: {
      membership_type: 'Paid Seller Membership',
      validity_days: '30',
    },
    theme: {
      color: '#0B5CFF', // CampusSwap Primary Blue
    },
    modal: {
      ondismiss: function () {
        onFailure(new Error('Payment window closed by user.'))
      },
    },
  }

  try {
    const paymentInstance = new window.Razorpay(options)
    paymentInstance.open()
  } catch (err) {
    console.error('Failed to trigger Razorpay modal:', err)
    onFailure(err)
  }
}
