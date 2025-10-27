require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const costesEnvio = {
    'ES': 'shr_1234_españa',
    'FR': 'shr_5678_francia',
    'DE': 'shr_9012_alemania',
    'US': 'shr_3456_usa'
};

app.post('/crear-checkout', async (req, res) => {
    const { nombre, precio, id } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { name: nombre },
                    unit_amount: precio
                },
                quantity: 1
            }],
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['ES', 'FR', 'DE', 'US']
            },
            success_url: 'https://www.youtube.com',
            cancel_url: 'https://www.facebook.com'
        });
        
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
