/* eslint-disable */
import axios from 'axios';
const stripe = Stripe(
  'pk_test_51KgyZJGuNfNgJ7LTmH8jxJBioIP3zPRL2XDpWek6eGPdIzvHNagGko0i3fstREdwxeuy0zSDICaOmQPzZN3w2Ks500j0IbuAGF'
);

// Esta funcion incluira un ID de recorrido.
export const bookTour = async (tourId) => {
  // 1) Get checkout session from API.
  const session = await axios(
    `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
  );

  console.log();

  // 2) Create checkout form + change credit card
};
