const stripe = Stripe(
  'pk_test_51INNm9HHHlkkraI73ICsnoVVnn1rhctRa6Gak8mrJDDurJEYzSNm4f1lDzxj9sjDRfgfxNUAIJgnKSCwxAy5bJbM006myA9dLx'
);

// Disable pay button
document.querySelector('#submit').disabled = true;

fetch('/checkout/create-payment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
})
  .then((result) => {
    return result.json();
  })
  .then((data) => {
    const elements = stripe.elements();

    const style = {
      base: {
        color: '#32325d',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#32325d'
        }
      },
      invalid: {
        fontFamily: 'Arial, sans-serif',
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    const cardNumber = elements.create('cardNumber', { style: style });
    cardNumber.mount('#card-number');

    const cardExpiry = elements.create('cardExpiry', { style: style });
    cardExpiry.mount('#card-expiry');('#card-number');

    const cardCvc = elements.create('cardCvc', { style: style });
    cardCvc.mount('#card-cvc');

    cardNumber.on('change', (event) => {
      // Disable the pay button if there are no card details
      document.querySelector('#submit').disabled = event.empty;
      document.querySelector('#card-error').textContent = event.error ? event.error.message : '';
    });

    const form = document.getElementById('payment-form');

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      // Complete payment
      payWithCard(stripe, cardNumber, data.clientSecret);
    });
  });

const payWithCard = (stripe, card, clientSecret) => {
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then((result) => {
      if (result.error) {
        // Show error
        showError(result.error.message);
      } else {
        // Redirect to success page
        window.location.replace('/checkout/success');
      }
    });
};

// Shows a success message
const orderComplete = (paymentIntentId) => {
  document
    .querySelector('.result-message a')
    .setAttribute(
      'href',
      'https://dashboard.stripe.com/test/payments/' + paymentIntentId
    );
  document.querySelector('.result-message').classList.remove('hidden');
  document.querySelector('#submit').disabled = true;
};

// Show the customer the error
const showError = (errorMsgText) => {
  const errorMsg = document.querySelector('#card-error');
  errorMsg.textContent = errorMsgText;
  setTimeout(() => {
    errorMsg.textContent = '';
  }, 4000);
};