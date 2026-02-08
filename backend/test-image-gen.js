/**
 * Test Image Generation - Direct API Test
 * Run with: node test-image-gen.js
 */

require('dotenv').config();

const imageAPI = require('./services/imageAPI');

async function testImageGeneration() {
    console.log('='.repeat(60));
    console.log('IMAGE GENERATION TEST');
    console.log('='.repeat(60));

    // Simple test prompt
    const testPrompt = "A minimalist geometric abstract design with blue and purple gradient, professional business concept";

    console.log('\n📝 Test Prompt:', testPrompt.substring(0, 80) + '...');
    console.log('\n🔄 Starting image generation...\n');

    const startTime = Date.now();

    try {
        const result = await imageAPI.generate(testPrompt, {
            width: 1024,
            height: 1024,
            negativePrompt: 'text, words, letters, watermark'
        });

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('✅ SUCCESS!');
        console.log('='.repeat(60));
        console.log('Provider:', result.provider);
        console.log('Fallback occurred:', result.fallbackOccurred);
        console.log('Providers attempted:', result.providersAttempted.join(' → '));
        console.log('Duration:', duration + 's');
        console.log('Image URL (first 100 chars):', result.imageUrl?.substring(0, 100) + '...');
        console.log('Metadata:', JSON.stringify(result.metadata, null, 2));

        // If it's a base64 image, show size
        if (result.imageUrl?.startsWith('data:image')) {
            const base64Size = result.imageUrl.length;
            console.log('Base64 size:', (base64Size / 1024).toFixed(2) + ' KB');
        }

    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ FAILED!');
        console.log('='.repeat(60));
        console.log('Error:', error.message);
        console.log('Stack:', error.stack);
    }
}

testImageGeneration();
