require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: '*' // En producción, especifica tu dominio de Shopify
}));


const costesEnvioPorPais = {
    'ES': 'shr_1SMpZEPzhoxcP320Yho9KLwO',
    'FR': 'shr_1DEF456_francia',
    'DE': 'shr_1GHI789_alemania',
    'US': 'shr_1SMpZEPzhoxcP320Yho9KLwO',
    'GB': 'shr_1MNO345_uk'
};

// Ruta de health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Servidor Stripe activo',
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live'
    });
});

app.post('/crear-checkout', async (req, res) => {
    const { nombre, precio, id, pais } = req.body;

    const shippingRateId = costesEnvioPorPais[pais] || 'shr_default';

    // Validación de datos
    if (!nombre || !precio) {
        return res.status(400).json({ error: 'Faltan datos del producto' });
    }

    console.log('Creando checkout para:', { nombre, precio, id });

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: { 
                        name: nombre,
                        description: `ID: ${id}`
                    },
                    unit_amount: parseInt(precio) // Asegura que sea número entero
                },
                quantity: 1
            }],
            mode: 'payment',
            shipping_address_collection: {
                allowed_countries: ['ES', 'FR', 'DE', 'US']
            },
            shipping_options: [
                {
                    shipping_rate: shippingRateId
                }
            ],
            success_url: 'https://successpage',
            cancel_url: 'https://cancelpage' + id
        });
        
        console.log('✅ Session creada:', session.id);
        console.log('URL:', session.url);
        
        res.json({ url: session.url });
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
});
