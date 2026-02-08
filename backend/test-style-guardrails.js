/**
 * Test Updated Style Guardrails
 * Shows how prompts adapt to different content types
 */

require('dotenv').config();
const promptConstructor = require('./services/promptConstructor');
const imageAPI = require('./services/imageAPI');
const fs = require('fs');

const testCases = [
    {
        name: 'Tech Innovation',
        context: {
            title: 'AI is Revolutionizing Healthcare',
            themes: ['artificial intelligence', 'healthcare', 'innovation', 'technology'],
            sentiment: 'positive',
            keyMessage: 'AI-powered diagnostics are saving lives and transforming patient care',
            brandColors: ['#4F46E5', '#10B981'],
            moodKeywords: ['cutting-edge', 'hopeful', 'transformative']
        }
    },
    {
        name: 'Business Challenge',
        context: {
            title: 'Navigating Market Uncertainty',
            themes: ['business', 'challenges', 'strategy', 'resilience'],
            sentiment: 'negative',
            keyMessage: 'Companies must adapt quickly to survive economic headwinds',
            brandColors: ['#1E293B', '#64748B'],
            moodKeywords: ['determined', 'serious', 'strategic']
        }
    },
    {
        name: 'Team Culture',
        context: {
            title: 'Building a Culture of Belonging',
            themes: ['team', 'community', 'culture', 'people'],
            sentiment: 'positive',
            keyMessage: 'Great teams are built on trust, inclusion, and shared purpose',
            brandColors: ['#F59E0B', '#EC4899'],
            moodKeywords: ['warm', 'connected', 'human']
        }
    }
];

async function runTests() {
    console.log('\n🧪 Testing Updated Style Guardrails\n');
    console.log('='.repeat(60));

    for (const test of testCases) {
        console.log(`\n📌 TEST: ${test.name}`);
        console.log(`   Sentiment: ${test.context.sentiment}`);
        console.log(`   Themes: ${test.context.themes.slice(0, 2).join(', ')}`);
        console.log('');

        try {
            // Construct prompt
            const constructed = await promptConstructor.construct(test.context);
            console.log(`📝 PROMPT:\n   "${constructed.prompt.substring(0, 200)}..."\n`);
            console.log(`🚫 NEGATIVE: ${constructed.negativePrompt.substring(0, 80)}...`);
            console.log(`🎭 TONE: ${constructed.derivedFrom.emotionalTone || 'adaptive'}`);

        } catch (error) {
            console.log(`❌ Error: ${error.message}`);
        }

        console.log('\n' + '-'.repeat(60));
    }

    // Generate one actual image
    console.log('\n🎨 Generating sample image with new style...\n');

    try {
        const sampleContext = testCases[2].context; // Team Culture - tests human elements
        const constructed = await promptConstructor.construct(sampleContext);

        console.log('Calling Stability AI...');
        const result = await imageAPI.generate(constructed.prompt, {
            width: 1024,
            height: 576
        });

        console.log(`\n✅ Image generated!`);
        console.log(`   Provider: ${result.provider}`);

        if (result.imageUrl.startsWith('data:')) {
            const base64Data = result.imageUrl.replace(/^data:image\/\w+;base64,/, '');
            fs.writeFileSync('test-new-style.png', Buffer.from(base64Data, 'base64'));
            console.log('   Saved: test-new-style.png');
        }

    } catch (error) {
        console.log(`❌ Image gen failed: ${error.message}`);
    }

    console.log('\n✅ Tests Complete!\n');
}

runTests();
