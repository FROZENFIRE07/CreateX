/**
 * Simple Replicate API Test
 */

require('dotenv').config();
const axios = require('axios');

async function test() {
    const apiKey = process.env.REPLICATE_API_KEY;
    console.log('Testing Replicate with key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');

    try {
        console.log('\nCalling Flux Schnell...');

        const response = await axios.post(
            'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
            {
                input: {
                    prompt: 'A simple gradient in blue and purple colors',
                    go_fast: true,
                    num_outputs: 1,
                    aspect_ratio: '16:9',
                    output_format: 'png'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'wait'
                },
                timeout: 120000
            }
        );

        console.log('\nResponse status:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2).substring(0, 500));

        if (response.data.output) {
            console.log('\n✅ SUCCESS! Image URL:', response.data.output);
        }

    } catch (error) {
        console.log('\n❌ ERROR');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
        console.log('Message:', error.message);
    }
}

test();
