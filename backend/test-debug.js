/**
 * Test Stability AI with FormData (required for v2 API)
 */
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function testStabilityUltra() {
    console.log('\n=== Stability AI Ultra (FormData) ===');
    const key = process.env.STABILITY_API_KEY1;

    if (!key) { console.log('No key'); return; }
    console.log('Key:', key.substring(0, 15) + '...');

    const formData = new FormData();
    formData.append('prompt', 'A simple blue and purple gradient, abstract art, minimalist');
    formData.append('output_format', 'png');

    try {
        const response = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/ultra',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Accept': 'image/*',
                    ...formData.getHeaders()
                },
                responseType: 'arraybuffer',
                timeout: 120000
            }
        );

        console.log('✅ Status:', response.status);
        console.log('✅ Image size:', response.data.length, 'bytes');

        require('fs').writeFileSync('test-stability-ultra.png', response.data);
        console.log('✅ Saved to test-stability-ultra.png');
        return true;

    } catch (e) {
        console.log('❌ Status:', e.response?.status);
        if (e.response?.data) {
            const text = Buffer.from(e.response.data).toString('utf8');
            console.log('❌ Error:', text.substring(0, 400));
        } else {
            console.log('❌ Error:', e.message);
        }
        return false;
    }
}

async function testStabilityCore() {
    console.log('\n=== Stability AI Core (FormData) ===');
    const key = process.env.STABILITY_API_KEY1;

    if (!key) { console.log('No key'); return; }

    const formData = new FormData();
    formData.append('prompt', 'A simple blue and purple gradient, abstract art');
    formData.append('output_format', 'png');

    try {
        const response = await axios.post(
            'https://api.stability.ai/v2beta/stable-image/generate/core',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Accept': 'image/*',
                    ...formData.getHeaders()
                },
                responseType: 'arraybuffer',
                timeout: 120000
            }
        );

        console.log('✅ Status:', response.status);
        console.log('✅ Image size:', response.data.length, 'bytes');

        require('fs').writeFileSync('test-stability-core.png', response.data);
        console.log('✅ Saved to test-stability-core.png');
        return true;

    } catch (e) {
        console.log('❌ Status:', e.response?.status);
        if (e.response?.data) {
            const text = Buffer.from(e.response.data).toString('utf8');
            console.log('❌ Error:', text.substring(0, 400));
        } else {
            console.log('❌ Error:', e.message);
        }
        return false;
    }
}

async function main() {
    let success = await testStabilityUltra();
    if (!success) {
        success = await testStabilityCore();
    }
    console.log('\n=== Done ===');
    console.log(success ? '🎉 Image generation successful!' : '❌ All attempts failed');
}

main();
