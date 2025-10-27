require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: '*' }));

// ============================================
// CONFIGURACIÓN DE COSTOS DE ENVÍO POR PAÍS
// ============================================
// Todos los precios en céntimos/centavos
const costosEnvioPorPais = {
    // Zona Euro
    'ES': { eur: 500, usd: 550, gbp: 430, jpy: 80000, aud: 850, cad: 750, mxn: 10000 },
    'FR': { eur: 800, usd: 880, gbp: 690, jpy: 128000, aud: 1360, cad: 1200, mxn: 16000 },
    'DE': { eur: 900, usd: 990, gbp: 780, jpy: 144000, aud: 1530, cad: 1350, mxn: 18000 },
    'IT': { eur: 850, usd: 935, gbp: 735, jpy: 136000, aud: 1445, cad: 1275, mxn: 17000 },
    'PT': { eur: 900, usd: 990, gbp: 780, jpy: 144000, aud: 1530, cad: 1350, mxn: 18000 },
    'NL': { eur: 700, usd: 770, gbp: 605, jpy: 112000, aud: 1190, cad: 1050, mxn: 14000 },
    'BE': { eur: 750, usd: 825, gbp: 650, jpy: 120000, aud: 1275, cad: 1125, mxn: 15000 },
    'AT': { eur: 950, usd: 1045, gbp: 825, jpy: 152000, aud: 1615, cad: 1425, mxn: 19000 },
    'IE': { eur: 1000, usd: 1100, gbp: 865, jpy: 160000, aud: 1700, cad: 1500, mxn: 20000 },
    'GR': { eur: 1200, usd: 1320, gbp: 1040, jpy: 192000, aud: 2040, cad: 1800, mxn: 24000 },
    
    // Europa no-Euro
    'GB': { gbp: 1000, eur: 1150, usd: 1260, jpy: 184000, aud: 1950, cad: 1720, mxn: 22800 },
    'CH': { eur: 1500, usd: 1650, gbp: 1300, jpy: 240000, aud: 2550, cad: 2250, mxn: 30000 },
    'NO': { eur: 1400, usd: 1540, gbp: 1210, jpy: 224000, aud: 2380, cad: 2100, mxn: 28000 },
    'SE': { eur: 1300, usd: 1430, gbp: 1125, jpy: 208000, aud: 2210, cad: 1950, mxn: 26000 },
    'DK': { eur: 1250, usd: 1375, gbp: 1080, jpy: 200000, aud: 2125, cad: 1875, mxn: 25000 },
    'FI': { eur: 1350, usd: 1485, gbp: 1170, jpy: 216000, aud: 2295, cad: 2025, mxn: 27000 },
    'PL': { eur: 1100, usd: 1210, gbp: 950, jpy: 176000, aud: 1870, cad: 1650, mxn: 22000 },
    'CZ': { eur: 1150, usd: 1265, gbp: 995, jpy: 184000, aud: 1955, cad: 1725, mxn: 23000 },
    
    // América del Norte
    'US': { usd: 2000, eur: 1820, gbp: 1580, jpy: 290000, aud: 3080, cad: 2720, mxn: 36400 },
    'CA': { cad: 2800, usd: 2100, eur: 1910, gbp: 1660, jpy: 305000, aud: 3240, mxn: 38200 },
    'MX': { mxn: 35000, usd: 1900, eur: 1730, gbp: 1500, jpy: 276000, aud: 2930, cad: 2580 },
    
    // América Latina
    'BR': { usd: 2500, eur: 2275, gbp: 1975, jpy: 363000, aud: 3850, cad: 3400, mxn: 45500 },
    'AR': { usd: 2400, eur: 2185, gbp: 1900, jpy: 348000, aud: 3700, cad: 3265, mxn: 43680 },
    'CL': { usd: 2300, eur: 2095, gbp: 1820, jpy: 334000, aud: 3545, cad: 3130, mxn: 41860 },
    'CO': { usd: 2200, eur: 2005, gbp: 1740, jpy: 319000, aud: 3390, cad: 2995, mxn: 40040 },
    'PE': { usd: 2350, eur: 2140, gbp: 1860, jpy: 341000, aud: 3620, cad: 3195, mxn: 42770 },
    
    // Asia-Pacífico
    'JP': { jpy: 350000, usd: 2400, eur: 2185, gbp: 1900, aud: 3700, cad: 3265, mxn: 43680 },
    'AU': { aud: 3500, usd: 2400, eur: 2185, gbp: 1900, jpy: 348000, cad: 3265, mxn: 43680 },
    'NZ': { aud: 3800, usd: 2600, eur: 2365, gbp: 2055, jpy: 377000, cad: 3535, mxn: 47320 },
    'SG': { usd: 2100, eur: 1910, gbp: 1660, jpy: 305000, aud: 3240, cad: 2860, mxn: 38220 },
    'HK': { usd: 2200, eur: 2005, gbp: 1740, jpy: 319000, aud: 3390, cad: 2995, mxn: 40040 },
    'KR': { usd: 2300, eur: 2095, gbp: 1820, jpy: 334000, aud: 3545, cad: 3130, mxn: 41860 },
    'TH': { usd: 1900, eur: 1730, gbp: 1500, jpy: 276000, aud: 2930, cad: 2580, mxn: 34580 },
    'IN': { usd: 2000, eur: 1820, gbp: 1580, jpy: 290000, aud: 3080, cad: 2720, mxn: 36400 },
    
    // Medio Oriente
    'AE': { usd: 2200, eur: 2005, gbp: 1740, jpy: 319000, aud: 3390, cad: 2995, mxn: 40040 },
    'SA': { usd: 2300, eur: 2095, gbp: 1820, jpy: 334000, aud: 3545, cad: 3130, mxn: 41860 },
    'IL': { usd: 2100, eur: 1910, gbp: 1660, jpy: 305000, aud: 3240, cad: 2860, mxn: 38220 },
    
    // África
    'ZA': { usd: 2500, eur: 2275, gbp: 1975, jpy: 363000, aud: 3850, cad: 3400, mxn: 45500 },
    'EG': { usd: 2400, eur: 2185, gbp: 1900, jpy: 348000, aud: 3700, cad: 3265, mxn: 43680 },
    'NG': { usd: 2600, eur: 2365, gbp: 2055, jpy: 377000, aud: 4010, cad: 3535, mxn: 47320 },
};

// Lista de países permitidos para envío
const paisesPermitidos = Object.keys(costosEnvioPorPais);

// Estimaciones de entrega por zona geográfica
const tiemposEntrega = {
    // Europa Occidental (3-7 días)
    europa_oeste: { min: 3, max: 7, paises: ['ES', 'FR', 'DE', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE'] },
    // Europa del Norte/Este (5-10 días)
    europa_norte: { min: 5, max: 10, paises: ['GB', 'CH', 'NO', 'SE', 'DK', 'FI', 'PL', 'CZ', 'GR'] },
    // América del Norte (7-14 días)
    norteamerica: { min: 7, max: 14, paises: ['US', 'CA', 'MX'] },
    // América Latina (10-21 días)
    latinoamerica: { min: 10, max: 21, paises: ['BR', 'AR', 'CL', 'CO', 'PE'] },
    // Asia-Pacífico (10-21 días)
    asia_pacifico: { min: 10, max: 21, paises: ['JP', 'AU', 'NZ', 'SG', 'HK', 'KR', 'TH', 'IN'] },
    // Medio Oriente (10-18 días)
    medio_oriente: { min: 10, max: 18, paises: ['AE', 'SA', 'IL'] },
    // África (14-28 días)
    africa: { min: 14, max: 28, paises: ['ZA', 'EG', 'NG'] }
};

// Función para obtener tiempos de entrega según el país
function obtenerTiemposEntrega(pais) {
    for (const [zona, config] of Object.entries(tiemposEntrega)) {
        if (config.paises.includes(pais)) {
            return { min: config.min, max: config.max };
        }
    }
    // Por defecto: entrega internacional estándar
    return { min: 10, max: 21 };
}

// ============================================
// RUTA DE HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Servidor Stripe con shipping dinámico activo',
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'test' : 'live',
        paisesDisponibles: paisesPermitidos.length,
        paises: paisesPermitidos.sort()
    });
});

// ============================================
// ENDPOINT PRINCIPAL PARA CREAR CHECKOUT
// ============================================
app.post('/crear-checkout', async (req, res) => {
    const { nombre, precio, id, moneda, pais } = req.body;

    // ========== VALIDACIÓN ==========
    if (!nombre || !precio) {
        return res.status(400).json({ 
            error: 'Faltan datos del producto',
            detalles: 'Se requiere nombre y precio'
        });
    }

    // Normalizar valores
    const monedaFinal = (moneda || 'eur').toLowerCase();
    const paisFinal = (pais || 'ES').toUpperCase();

    console.log('\n========================================');
    console.log('📦 NUEVA SOLICITUD DE CHECKOUT');
    console.log('========================================');
    console.log(`Producto: ${nombre}`);
    console.log(`Precio: ${precio/100} ${monedaFinal.toUpperCase()}`);
    console.log(`ID: ${id}`);
    console.log(`País: ${paisFinal}`);
    console.log(`Moneda: ${monedaFinal.toUpperCase()}`);

    try {
        // ========== CALCULAR COSTO DE ENVÍO ==========
        let costoEnvio;
        
        if (costosEnvioPorPais[paisFinal] && costosEnvioPorPais[paisFinal][monedaFinal]) {
            // Costo específico para el país y moneda
            costoEnvio = costosEnvioPorPais[paisFinal][monedaFinal];
            console.log(`✅ Envío específico: ${costoEnvio/100} ${monedaFinal.toUpperCase()}`);
        } else if (costosEnvioPorPais[paisFinal]) {
            // País existe pero no tiene la moneda, usar conversión básica
            const costoBase = costosEnvioPorPais[paisFinal]['eur'] || costosEnvioPorPais[paisFinal]['usd'] || 1000;
            costoEnvio = costoBase;
            console.log(`⚠️ Usando costo base: ${costoEnvio/100} ${monedaFinal.toUpperCase()}`);
        } else {
            // País no configurado, usar envío internacional estándar
            const costosInternacionales = {
                'eur': 1500,
                'usd': 1650,
                'gbp': 1300,
                'jpy': 240000,
                'aud': 2550,
                'cad': 2250,
                'mxn': 30000
            };
            costoEnvio = costosInternacionales[monedaFinal] || 1500;
            console.log(`🌍 Envío internacional: ${costoEnvio/100} ${monedaFinal.toUpperCase()}`);
        }

        // ========== OBTENER TIEMPOS DE ENTREGA ==========
        const tiempos = obtenerTiemposEntrega(paisFinal);
        console.log(`📅 Entrega estimada: ${tiempos.min}-${tiempos.max} días hábiles`);

        // ========== CREAR CHECKOUT SESSION ==========
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            
            // Items del carrito
            line_items: [{
                price_data: {
                    currency: monedaFinal,
                    product_data: { 
                        name: nombre,
                        description: `Producto ID: ${id}`
                    },
                    unit_amount: parseInt(precio)
                },
                quantity: 1
            }],
            
            mode: 'payment',
            
            // Colección de dirección de envío
            shipping_address_collection: {
                allowed_countries: paisesPermitidos
            },
            
            // SHIPPING DINÁMICO - se crea en tiempo real
            shipping_options: [{
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: costoEnvio,
                        currency: monedaFinal
                    },
                    display_name: `Envío estándar a ${paisFinal}`,
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: tiempos.min
                        },
                        maximum: {
                            unit: 'business_day',
                            value: tiempos.max
                        }
                    }
                }
            }],
            
            // URLs de éxito y cancelación
            success_url: `https://successpage`,
            cancel_url: `https://cancelpage`
        });
        
        console.log('✅ Checkout Session creada exitosamente');
        console.log(`ID: ${session.id}`);
        console.log(`URL: ${session.url}`);
        console.log('========================================\n');
        
        // Responder con la URL de checkout
        res.json({ 
            url: session.url,
            sessionId: session.id
        });

    } catch (error) {
        console.error('❌ ERROR AL CREAR CHECKOUT');
        console.error(`Mensaje: ${error.message}`);
        console.error(`Tipo: ${error.type || 'Desconocido'}`);
        console.error('========================================\n');
        
        res.status(500).json({ 
            error: error.message,
            tipo: error.type,
            detalles: 'Error al procesar el checkout'
        });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   SERVIDOR STRIPE ACTIVO               ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`🚀 Puerto: ${PORT}`);
    console.log(`🌍 Países soportados: ${paisesPermitidos.length}`);
    console.log(`💰 Monedas: EUR, USD, GBP, JPY, AUD, CAD, MXN`);
    console.log(`📦 Shipping: 100% Dinámico`);
    console.log('════════════════════════════════════════\n');
});
