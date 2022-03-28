/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51KgyZJGuNfNgJ7LTmH8jxJBioIP3zPRL2XDpWek6eGPdIzvHNagGko0i3fstREdwxeuy0zSDICaOmQPzZN3w2Ks500j0IbuAGF'
);

// Esta funcion incluira un ID de recorrido.
export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API.
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // console.log(session);

    // 2) Create checkout form + change credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
