/**
 * Test Multi-Key Image API
 * Tests Stability AI key rotation + HuggingFace nscale fallback
 */

require('dotenv').config();

async function test() {
    console.log('\n🧪 Image API Multi-Key Test\n');

    // Check configured keys
    console.log('📋 Stability AI Keys:');
    let keyCount = 0;
    for (let i = 1; i <= 8; i++) {
        const key = process.env[`STABILITY_API_KEY${i}`];
        if (key) {
            console.log(`  STABILITY_API_KEY${i}: ${key.substring(0, 10)}...`);
            keyCount++;
        }
    }
    console.log(`  Total: ${keyCount} keys configured\n`);

    console.log('📋 HuggingFace:');
    const hfKey = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    console.log(`  HF_TOKEN: ${hfKey ? hfKey.substring(0, 10) + '...' : 'NOT SET'}\n`);

    // Load and test
    const imageAPI = require('./services/imageAPI');

    const testPrompt = 'Abstract minimalist composition with flowing geometric shapes in indigo and emerald gradients. Professional tech aesthetic.';

    console.log('🎨 Test Prompt:');
    console.log(`  "${testPrompt.substring(0, 60)}..."\n`);

    console.log('⏳ Generating image (may take 30-60s)...\n');

    try {
        const result = await imageAPI.generate(testPrompt, {
            width: 1024,
            height: 576
        });

        console.log('✅ SUCCESS!\n');
        console.log('📊 Result:');
        console.log(`  Provider: ${result.provider}`);
        console.log(`  Fallback: ${result.fallbackOccurred}`);
        console.log(`  Attempted: ${result.providersAttempted.join(' → ')}`);
        console.log(`  Metadata:`, result.metadata);

        if (result.imageUrl.startsWith('data:image')) {
            console.log(`  Image: Base64 data (${Math.round(result.imageUrl.length / 1024)}KB)`);

            // Save to file for viewing
            const fs = require('fs');
            const base64Data = result.imageUrl.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync('test-generated-image.png', Buffer.from(base64Data, 'base64'));
            console.log(`  Saved: test-generated-image.png`);
        } else {
            console.log(`  Image URL: ${result.imageUrl}`);
        }

        console.log('\n🎉 Image generation working!');

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

test();
