/**
 * HuggingFace Free Inference API Test
 * Uses models that are free on HF inference
 */

require('dotenv').config();
const axios = require('axios');

async function testHuggingFace() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    console.log('Testing HuggingFace with key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');

    // Free models on HuggingFace inference API
    const models = [
        'stabilityai/stable-diffusion-2-1',
        'runwayml/stable-diffusion-v1-5',
        'CompVis/stable-diffusion-v1-4'
    ];

    for (const model of models) {
        console.log(`\n--- Testing: ${model} ---`);

        try {
            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    inputs: 'A beautiful abstract gradient with blue and purple colors'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    responseType: 'arraybuffer',
                    timeout: 120000  // 2 minutes - models can be slow to cold start
                }
            );

            console.log('Response status:', response.status);
            console.log('Content-Type:', response.headers['content-type']);
            console.log('Data size:', response.data.length, 'bytes');

            if (response.headers['content-type']?.includes('image')) {
                console.log('✅ SUCCESS! Got image data');

                // Save test image
                const fs = require('fs');
                fs.writeFileSync('test-output.png', response.data);
                console.log('Saved to: test-output.png');
                return;
            }

        } catch (error) {
            if (error.response) {
                // Try to parse error
                let errorData;
                try {
                    errorData = JSON.parse(Buffer.from(error.response.data).toString());
                } catch {
                    errorData = error.response.data.toString().substring(0, 200);
                }
                console.log('❌ Status:', error.response.status);
                console.log('Error:', JSON.stringify(errorData, null, 2));

                // If model is loading, wait and continue
                if (errorData?.error?.includes('loading')) {
                    console.log('Model is loading, waiting 30s...');
                    await new Promise(r => setTimeout(r, 30000));
                }
            } else {
                console.log('❌ Error:', error.message);
            }
        }
    }

    console.log('\n❌ All models failed');
}

testHuggingFace();
