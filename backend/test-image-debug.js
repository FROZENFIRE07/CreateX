/**
 * Debug test for Image Generation APIs
 * Shows detailed error info for each provider
 */

require('dotenv').config();

const axios = require('axios');

async function testReplicate() {
    console.log('\n=== Testing Replicate ===');
    const apiKey = process.env.REPLICATE_API_KEY;

    if (!apiKey) {
        console.log('❌ REPLICATE_API_KEY not set');
        return false;
    }

    console.log(`API Key: ${apiKey.substring(0, 10)}...`);

    try {
        const response = await axios.post(
            'https://api.replicate.com/v1/predictions',
            {
                version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                input: {
                    prompt: 'A simple blue gradient abstract image',
                    width: 512,
                    height: 512,
                    num_outputs: 1
                }
            },
            {
                headers: {
                    'Authorization': `Token ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );

        console.log('✅ Replicate response:', response.status, response.data.status);
        console.log('Prediction ID:', response.data.id);
        return true;

    } catch (error) {
        console.log('❌ Replicate error:', error.response?.status, error.response?.data || error.message);
        return false;
    }
}

async function testHuggingFace() {
    console.log('\n=== Testing HuggingFace ===');
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
        console.log('❌ HUGGINGFACE_API_KEY not set');
        return false;
    }

    console.log(`API Key: ${apiKey.substring(0, 10)}...`);

    try {
        const response = await axios.post(
            'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
            {
                inputs: 'A simple blue gradient abstract image'
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer',
                timeout: 60000
            }
        );

        console.log('✅ HuggingFace response:', response.status, 'Image size:', response.data.length, 'bytes');
        return true;

    } catch (error) {
        if (error.response?.headers?.['content-type']?.includes('application/json')) {
            const errorData = JSON.parse(Buffer.from(error.response.data).toString());
            console.log('❌ HuggingFace error:', error.response?.status, errorData);
        } else {
            console.log('❌ HuggingFace error:', error.response?.status, error.message);
        }
        return false;
    }
}

async function main() {
    console.log('🧪 Image API Debug Test\n');

    await testReplicate();
    await testHuggingFace();

    console.log('\n=== Done ===');
}

main();
