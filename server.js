require('dotenv').config({ path: 'server.env' }); // Чете server.env вместо .env
const express = require('express');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

// Сервиране на статични файлове (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Health check за Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Endpoint за създаване на PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
    const { firstName, email, phone, amount } = req.body;
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'BGN',
            receipt_email: email,
            metadata: { firstName, phone }
        });
        res.send({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Зареждане на главната страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
