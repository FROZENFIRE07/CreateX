/**
 * Manager Interact Service - AI-First Redesign
 * 
 * Philosophy: Use LLM intelligence at every decision point, not just intent classification.
 * The system should understand context, infer user intent, and execute intelligently.
 * 
 * Key Improvements:
 * - Context-aware execution: LLM understands what user is referring to
 * - Natural language editing: No more "replace X with Y" nonsense
 * - Smart inference: If there's only one variant, assume that's what user means
 * - Conversational refinement: Understands "make it shorter", "add more examples", etc.
 * - Error recovery: If something is ambiguous, ask smart clarifying questions
 */

const { ChatGroq } = require('@langchain/groq');
const { PromptTemplate } = require('@langchain/core/prompts');
const { RunnableSequence } = require('@langchain/core/runnables');
const { StringOutputParser } = require('@langchain/core/output_parsers');

const Content = require('../../models/Content');
const BrandDNA = require('../../models/BrandDNA');
const managerAgent = require('./managerAgent');
const orchestrationEmitter = require('../orchestrationEmitter');

class ManagerInteract {
    constructor() {
        this.llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1, // Lower temperature for more consistent JSON output
            // Note: Groq doesn't support response_format yet, but keeping low temp helps
        });

        // Separate LLM for content editing - can be more creative
        this.editLLM = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4 // Slightly higher for creative content edits
        });

        // Main execution prompt - handles everything in one intelligent pass
        this.executionPrompt = PromptTemplate.fromTemplate(`
You are an AI assistant managing a content repurposing system. Analyze the user's request and determine the best action.

USER MESSAGE: "{message}"

CURRENT PROJECT CONTEXT:
{contextSummary}

AVAILABLE VARIANTS:
{variantsSummary}

BRAND DNA:
{brandDNASummary}

CRITICAL ANALYSIS STEPS:
1. What is the user asking for? (be precise - don't over-interpret)
2. Are they asking to PRESERVE most content and change only specific parts?
3. Which variant(s) are they referring to? (use context clues intelligently)
4. What exact changes do they want? (be specific about what to modify)
5. Do we have enough information, or is genuine clarification needed?

UNDERSTANDING "KEEP AS IS EXCEPT X" INSTRUCTIONS:
- "everything looks fine except X" → EDIT_CONTENT: preserve all, change only X
- "keep this as it is except Y" → EDIT_CONTENT: surgical edit of Y only
- "I want 5 bullet points instead of 3" → EDIT_CONTENT: expand that specific section
- "don't use * in bullet points, use dots" → EDIT_CONTENT: formatting change only
- "change X to Y" → EDIT_CONTENT: simple replacement
- These are NOT requests to regenerate - they're precision edits

CRITICAL: You MUST respond with VALID JSON ONLY. No explanations, no markdown, no extra text.
Start your response with {{ and end with }}

Your JSON response structure:
{{
    "understanding": "Clear explanation of what the user wants (be specific about what to preserve vs change)",
    "action": "ORCHESTRATE|REFINE_VARIANT|EDIT_CONTENT|REGENERATE_IMAGE|UPDATE_STATE|QUERY|CLARIFY",
    "confidence": 0.0-1.0,
    "targetPlatforms": ["twitter", "linkedin", etc] or null,
    "changes": {{
        "type": "content_edit|style_change|structural_change|formatting_change|parameter_shift",
        "preserveExisting": true/false,
        "specificInstructions": "Exact surgical instructions: 'Keep everything except [section]. In [section], change [specific thing]'"
    }},
    "needsClarification": true/false,
    "clarificationQuestion": "Only if genuinely ambiguous - don't ask lazy questions",
    "reasoning": "Why you chose this action and interpretation"
}}

SMART INFERENCE RULES:
1. SINGLE VARIANT CONTEXT:
   - "regenerate image" + only 1 variant → targetPlatforms: [that variant]
   - "make it shorter" + only 1 variant → EDIT_CONTENT for that variant
   - "keep as is except X" + only 1 variant → EDIT_CONTENT for that variant
   - "don't use *" + only 1 variant → EDIT_CONTENT formatting change

2. PRESERVATION SIGNALS:
   - "everything looks fine except" → EDIT_CONTENT with preserveExisting: true
   - "keep this as it is except" → EDIT_CONTENT with preserveExisting: true
   - "just change the X" → EDIT_CONTENT with surgical focus on X
   - "only modify Y" → EDIT_CONTENT targeting Y specifically
   - "don't use X, use Y" → EDIT_CONTENT formatting/style change with preserveExisting: true

3. PLATFORM INFERENCE:
   - Only 1 variant exists → assume that's the target
   - User says "the post" → use the only or most recent variant
   - User says "all posts" → all unlocked variants
   - Ambiguous with multiple variants → ask which one

4. WHEN TO CLARIFY (rarely):
   - Genuinely ambiguous (e.g., "change it" with 5 variants and no context)
   - Contradictory instructions
   - Missing critical information that can't be inferred
   - DON'T clarify when it's obvious from context

EXAMPLES OF VALID JSON RESPONSES:

Example 1 - Preservation with structural change:
{{
    "understanding": "Keep the LinkedIn variant exactly as is, but expand the bullet points in the 'key considerations for scaling' section from 3 to 5 items",
    "action": "EDIT_CONTENT",
    "confidence": 0.95,
    "targetPlatforms": ["linkedin"],
    "changes": {{
        "type": "structural_change",
        "preserveExisting": true,
        "specificInstructions": "Keep all content identical. Locate 'key considerations for scaling' section. Expand bullet points from 3 to 5 by adding 2 new relevant points. Don't modify any other section."
    }},
    "needsClarification": false,
    "reasoning": "User explicitly wants to preserve everything except one specific section. This is a surgical edit, not a regeneration."
}}

Example 2 - Simple formatting change:
{{
    "understanding": "Change bullet point markers from asterisks (*) to dots (•) throughout the content",
    "action": "EDIT_CONTENT",
    "confidence": 0.98,
    "targetPlatforms": ["linkedin"],
    "changes": {{
        "type": "formatting_change",
        "preserveExisting": true,
        "specificInstructions": "Keep all content text identical. Only change the bullet point markers: replace all '* ' with '• ' (bullet dot). Don't modify any actual content."
    }},
    "needsClarification": false,
    "reasoning": "Simple formatting change - user wants dots instead of asterisks for bullets. Only one variant exists so target is clear."
}}

Example 3 - Image regeneration:
{{
    "understanding": "Regenerate the image for the Instagram variant",
    "action": "REGENERATE_IMAGE",
    "confidence": 0.95,
    "targetPlatforms": ["instagram"],
    "changes": null,
    "needsClarification": false,
    "reasoning": "Only one variant exists, obvious they mean that one"
}}

Example 4 - Needs clarification:
{{
    "understanding": "Apply a more casual tone",
    "action": "CLARIFY",
    "confidence": 0.6,
    "targetPlatforms": null,
    "changes": null,
    "needsClarification": true,
    "clarificationQuestion": "I can make the tone more casual. Would you like me to update both Twitter and LinkedIn, or just one of them?",
    "reasoning": "Multiple variants exist and tone change is significant - should confirm which to modify"
}}

REMEMBER: Output ONLY the JSON object. No markdown code blocks, no explanations before or after. Just the JSON.
`);

        this.executionChain = RunnableSequence.from([
            this.executionPrompt,
            this.llm,
            new StringOutputParser()
        ]);

        // Content editing prompt - intelligently applies user's requested changes
        this.contentEditPrompt = PromptTemplate.fromTemplate(`
You are a precise content editor. The user wants to change ONLY specific parts of their content while keeping everything else EXACTLY as it is.

CURRENT CONTENT:
{currentContent}

USER INSTRUCTION: {instruction}

BRAND VOICE: {brandVoice}
PLATFORM: {platform}

CRITICAL RULES:
1. Make ONLY the changes the user explicitly requested
2. Keep EVERYTHING ELSE completely unchanged (same wording, structure, formatting)
3. If user says "keep this as it is except X", literally keep everything except X
4. Preserve all formatting, line breaks, emojis, hashtags unless user asks to change them
5. Be surgical - don't rewrite sections the user didn't mention

EXAMPLES OF SURGICAL EDITING:

Example 1:
User: "everything looks fine except those bullet points in key considerations, instead of 3 i want total 5"
Current: "Key Considerations:\n• Point 1\n• Point 2\n• Point 3\n\nConclusion: ..."
Action: Find the "Key Considerations" section, expand from 3 to 5 bullet points, keep EVERYTHING else identical
Output: "Key Considerations:\n• Point 1\n• Point 2\n• Point 3\n• Point 4 (new)\n• Point 5 (new)\n\nConclusion: ..."

Example 2:
User: "add 2 more examples in the benefits section"
Action: Locate "benefits" section, add exactly 2 more examples, don't touch other sections
Keep: Everything outside the benefits section EXACTLY as is

Example 3:
User: "make the intro shorter"
Action: Condense only the introduction paragraph, keep all other content identical

Example 4:
User: "change the tone to more casual"
Action: Rewrite with casual tone but preserve structure, key points, and formatting

Example 5:
User: "remove the last paragraph"
Action: Delete only the final paragraph, keep everything before it untouched

OUTPUT REQUIREMENTS:
- Return the COMPLETE revised content (not just the changed parts)
- Maintain exact formatting unless user asks to change it
- Don't add explanations or meta-commentary
- Just output the edited content
`);

        this.contentEditChain = RunnableSequence.from([
            this.contentEditPrompt,
            this.editLLM, // Use the dedicated edit LLM with higher temperature
            new StringOutputParser()
        ]);

        // Query answering prompt
        this.queryPrompt = PromptTemplate.fromTemplate(`
Answer the user's question about their content project.

USER QUESTION: "{question}"

PROJECT CONTEXT:
{fullContext}

Provide a helpful, conversational answer. Be specific and reference actual data when available.
`);

        this.queryChain = RunnableSequence.from([
            this.queryPrompt,
            this.llm,
            new StringOutputParser()
        ]);
    }

    /**
     * Main interaction entry point - now fully AI-powered
     */
    async interact(contentId, message, userId) {
        console.log(`[ManagerInteract] Processing: "${message}"`);
        const idString = String(contentId);

        try {
            // Load full context
            const content = await Content.findOne({ _id: contentId, userId });
            if (!content) {
                return { success: false, error: 'Content not found' };
            }

            const brandDNA = await BrandDNA.findOne({ userId });

            // Build rich context for LLM
            const context = this.buildContext(content, brandDNA);

            this.emitDecision(idString, '🤔 Understanding your request...');

            // Let LLM analyze and decide
            const decision = await this.analyzeAndDecide(message, context);

            // Log what we understood
            this.emitDecision(idString, `✓ ${decision.understanding}`);

            // If we need clarification, ask
            if (decision.needsClarification) {
                return {
                    success: true,
                    needsClarification: true,
                    question: decision.clarificationQuestion,
                    decision
                };
            }

            // Execute the decision
            const result = await this.executeDecision(decision, content, brandDNA, userId);

            return {
                success: true,
                action: decision.action,
                result,
                understanding: decision.understanding
            };

        } catch (error) {
            console.error('[ManagerInteract] Error:', error);
            this.emit(idString, `❌ Error: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Build comprehensive context for LLM decision-making
     */
    buildContext(content, brandDNA) {
        const variants = content.variants || [];
        const stateOverrides = content.projectStateOverrides || {};

        // Build context summary
        const contextSummary = `
- Project: "${content.title}"
- Status: ${content.orchestrationStatus}
- Content Type: ${content.type}
- State Overrides: ${JSON.stringify(stateOverrides)}
- Number of variants: ${variants.length}
        `.trim();

        // Build variants summary with actual content previews
        const variantsSummary = variants.length > 0
            ? variants.map(v => {
                const preview = v.content?.substring(0, 200) || '';
                const status = v.isLocked ? '[LOCKED]' : v.isUserModified ? '[USER-MODIFIED]' : '[AUTO]';
                const hasImage = v.image ? '🖼️' : '';
                return `
${v.platform.toUpperCase()} ${status} ${hasImage}
Preview: ${preview}...
Char count: ${v.content?.length || 0}
                `.trim();
            }).join('\n\n')
            : 'No variants generated yet';

        // Build brand DNA summary
        const brandDNASummary = brandDNA
            ? `
Voice: ${brandDNA.voice?.personality || 'Not defined'}
Tone: ${brandDNA.voice?.tone?.join(', ') || 'Not defined'}
Audience: ${brandDNA.audience?.primary || 'Not defined'}
            `.trim()
            : 'No brand DNA configured';

        return {
            contextSummary,
            variantsSummary,
            brandDNASummary,
            variants,
            content,
            brandDNA,
            stateOverrides
        };
    }

    /**
     * Let LLM analyze the request and decide what to do
     */
    async analyzeAndDecide(message, context) {
        try {
            const response = await this.executionChain.invoke({
                message,
                contextSummary: context.contextSummary,
                variantsSummary: context.variantsSummary,
                brandDNASummary: context.brandDNASummary
            });

            // Clean and parse response with multiple fallback strategies
            let cleanResponse = response.trim();
            
            // Strategy 1: Remove markdown code blocks
            if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
            }

            // Strategy 2: Extract JSON if LLM added explanation
            const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanResponse = jsonMatch[0];
            }

            // Strategy 3: Try to parse
            let decision;
            try {
                decision = JSON.parse(cleanResponse);
            } catch (parseError) {
                console.error('[ManagerInteract] JSON parse failed, raw response:', cleanResponse.substring(0, 200));
                
                // If parsing failed completely, check if LLM just gave plain text
                // This happens with very simple requests like "use dots instead of asterisks"
                if (!cleanResponse.startsWith('{')) {
                    console.log('[ManagerInteract] LLM returned plain text, inferring action...');
                    
                    // Infer action based on the plain text response and original message
                    decision = this.inferActionFromPlainText(message, cleanResponse, context);
                } else {
                    throw parseError;
                }
            }

            // Smart inference: if targetPlatforms is null but we have context, infer
            if (!decision.targetPlatforms && context.variants.length === 1) {
                decision.targetPlatforms = [context.variants[0].platform];
                decision.understanding += ` (Inferred platform: ${context.variants[0].platform})`;
            }

            return decision;

        } catch (error) {
            console.error('[ManagerInteract] Decision analysis failed:', error);
            // Fallback to safe clarification
            return {
                understanding: "I'm not quite sure what you're asking for.",
                action: 'CLARIFY',
                confidence: 0.3,
                needsClarification: true,
                clarificationQuestion: "Could you rephrase that? For example: 'Make the LinkedIn post shorter' or 'Regenerate all images'",
                reasoning: 'Failed to parse request'
            };
        }
    }

    /**
     * Fallback: Infer action when LLM returns plain text instead of JSON
     */
    inferActionFromPlainText(message, plainTextResponse, context) {
        const msgLower = message.toLowerCase();
        
        // Detect formatting/style changes
        if (msgLower.includes('use') && msgLower.includes('instead') ||
            msgLower.includes('change') && (msgLower.includes('to') || msgLower.includes('from')) ||
            msgLower.includes('replace') ||
            msgLower.includes('don\'t use')) {
            
            return {
                understanding: `Apply formatting/content change: ${message}`,
                action: 'EDIT_CONTENT',
                confidence: 0.85,
                targetPlatforms: context.variants.length === 1 ? [context.variants[0].platform] : null,
                changes: {
                    type: 'formatting_change',
                    preserveExisting: true,
                    specificInstructions: `Keep all content text identical. Apply this change: ${message}`
                },
                needsClarification: context.variants.length > 1,
                clarificationQuestion: context.variants.length > 1 
                    ? `Should I apply this change to all variants or just one?`
                    : null,
                reasoning: 'Inferred from plain text response - simple formatting change'
            };
        }

        // Detect regeneration requests
        if (msgLower.includes('regenerate') || msgLower.includes('generate') || msgLower.includes('create')) {
            if (msgLower.includes('image')) {
                return {
                    understanding: 'Regenerate image(s)',
                    action: 'REGENERATE_IMAGE',
                    confidence: 0.9,
                    targetPlatforms: context.variants.length === 1 ? [context.variants[0].platform] : null,
                    changes: null,
                    needsClarification: false,
                    reasoning: 'Inferred from plain text - image regeneration request'
                };
            } else {
                return {
                    understanding: 'Generate new content variants',
                    action: 'ORCHESTRATE',
                    confidence: 0.85,
                    targetPlatforms: null,
                    changes: null,
                    needsClarification: false,
                    reasoning: 'Inferred from plain text - orchestration request'
                };
            }
        }

        // Default to clarification if we can't infer confidently
        return {
            understanding: plainTextResponse.substring(0, 100),
            action: 'CLARIFY',
            confidence: 0.5,
            needsClarification: true,
            clarificationQuestion: "I understand you want to make a change, but could you be more specific? For example: 'Change the bullet points from * to •' or 'Make it shorter'",
            reasoning: 'Could not confidently infer action from plain text'
        };
    }

    /**
     * Execute the LLM's decision
     */
    async executeDecision(decision, content, brandDNA, userId) {
        const idString = String(content._id);

        switch (decision.action) {
            case 'ORCHESTRATE':
                return await this.runOrchestration(content, brandDNA, userId, decision);

            case 'REFINE_VARIANT':
                return await this.refineVariant(content, brandDNA, decision);

            case 'EDIT_CONTENT':
                return await this.editContent(content, brandDNA, decision);

            case 'REGENERATE_IMAGE':
                return await this.regenerateImages(content, brandDNA, decision);

            case 'UPDATE_STATE':
                return await this.updateProjectState(content, decision);

            case 'QUERY':
                return await this.answerQuery(content, brandDNA, decision);

            case 'CLARIFY':
                // Already handled in interact()
                return { action: 'clarification_needed' };

            default:
                this.emit(idString, '💡 I can help you generate content, refine variants, regenerate images, or answer questions.');
                return { action: 'no_action' };
        }
    }

    /**
     * Run orchestration with smart platform selection
     */
    async runOrchestration(content, brandDNA, userId, decision) {
        const idString = String(content._id);

        // Use LLM's inferred platforms or default to common ones
        const platforms = decision.targetPlatforms || ['twitter', 'linkedin', 'email'];

        // Filter out protected variants
        const protectedVariants = content.variants?.filter(v =>
            platforms.includes(v.platform) && (v.isLocked || v.isUserModified)
        ) || [];

        if (protectedVariants.length > 0) {
            this.emit(idString, `⚠️ Skipping ${protectedVariants.length} protected variant(s)`);
        }

        const platformsToProcess = platforms.filter(p => {
            const variant = content.variants?.find(v => v.platform === p);
            return !variant || (!variant.isLocked && !variant.isUserModified);
        });

        if (platformsToProcess.length === 0) {
            this.emit(idString, `⛔ All requested variants are protected`);
            return { action: 'blocked', reason: 'All variants protected' };
        }

        this.emitProgress(idString, `🚀 Generating for: ${platformsToProcess.join(', ')}`);

        const result = await managerAgent.orchestrate(content, brandDNA, platformsToProcess);

        // Update variants
        await this.updateContentVariants(content, result.variants, false);
        content.orchestrationStatus = 'completed';
        await content.save();

        this.emitResult(idString, { platforms: platformsToProcess, count: platformsToProcess.length },
            `✅ Generated ${platformsToProcess.length} variant(s)`);

        return { action: 'orchestration_complete', platforms: platformsToProcess, result };
    }

    /**
     * Refine variant using AI-powered content editing
     */
    async refineVariant(content, brandDNA, decision) {
        const idString = String(content._id);

        const platforms = decision.targetPlatforms || [];
        if (platforms.length === 0) {
            this.emit(idString, '❌ Could not determine which variant to refine');
            return { action: 'need_platform' };
        }

        const results = [];

        for (const platform of platforms) {
            const variant = content.variants?.find(v => v.platform === platform);

            if (!variant) {
                this.emit(idString, `⚠️ No ${platform} variant exists`);
                continue;
            }

            if (variant.isLocked) {
                this.emit(idString, `⚠️ ${platform} is locked, skipping`);
                continue;
            }

            this.emitProgress(idString, `✏️ Refining ${platform}...`, platform);

            // Use LLM to intelligently edit content
            const refinedContent = await this.contentEditChain.invoke({
                currentContent: variant.content,
                instruction: decision.changes?.specificInstructions || decision.understanding,
                brandVoice: brandDNA?.voice?.personality || 'professional',
                platform
            });

            // Save history
            if (!variant.generationHistory) variant.generationHistory = [];
            variant.generationHistory.push({
                content: variant.content,
                generatedAt: new Date(),
                source: 'manager', // Valid enum: 'manager', 'orchestration', 'user'
                instruction: decision.understanding
            });

            // Update variant
            variant.content = refinedContent.trim();
            variant.metadata = { ...variant.metadata, charCount: refinedContent.length };
            variant.isUserModified = true;

            results.push({ platform, success: true });
            this.emitProgress(idString, `✓ ${platform} refined (${refinedContent.length} chars)`, platform);
        }

        await content.save();

        this.emitResult(idString, { refined: results.length }, `✅ Refined ${results.length} variant(s)`);

        return { action: 'variants_refined', results };
    }

    /**
     * Edit content intelligently based on natural language instructions
     */
    async editContent(content, brandDNA, decision) {
        const idString = String(content._id);

        const platforms = decision.targetPlatforms || content.variants?.map(v => v.platform) || [];
        
        if (platforms.length === 0) {
            this.emit(idString, '❌ Could not determine which variant to edit');
            return { action: 'no_targets' };
        }

        let edited = 0;
        const preserveMode = decision.changes?.preserveExisting || false;

        // Show what we're doing
        if (preserveMode) {
            this.emitDecision(idString, `📝 Making surgical edits while preserving existing content`);
        } else {
            this.emitDecision(idString, `✏️ Editing content based on your instructions`);
        }

        for (const platform of platforms) {
            const variant = content.variants?.find(v => v.platform === platform);

            if (!variant) {
                this.emit(idString, `⚠️ No ${platform} variant exists`);
                continue;
            }

            if (variant.isLocked) {
                this.emit(idString, `⚠️ ${platform} is locked, skipping`);
                continue;
            }

            this.emitProgress(idString, `Analyzing ${platform} content...`, platform);

            // Log the instruction for debugging
            console.log(`[ManagerInteract] Editing ${platform} with instruction:`, decision.changes?.specificInstructions);
            console.log(`[ManagerInteract] Current content length:`, variant.content?.length);

            try {
                // Use LLM to intelligently edit content
                const editedContent = await this.contentEditChain.invoke({
                    currentContent: variant.content,
                    instruction: decision.changes?.specificInstructions || decision.understanding,
                    brandVoice: brandDNA?.voice?.personality || 'professional',
                    platform
                });

                console.log(`[ManagerInteract] Edited content length:`, editedContent?.length);

                // Save history
                if (!variant.generationHistory) variant.generationHistory = [];
                variant.generationHistory.push({
                    content: variant.content,
                    generatedAt: new Date(),
                    source: 'manager'
                });

                variant.content = editedContent.trim();
                variant.metadata = { 
                    ...variant.metadata, 
                    charCount: editedContent.length,
                    lastEditedAt: new Date(),
                    editType: preserveMode ? 'surgical' : 'standard'
                };
                variant.isUserModified = true;
                edited++;

                this.emitProgress(idString, `✓ ${platform} updated (${editedContent.length} chars)`, platform);
            } catch (editError) {
                console.error(`[ManagerInteract] Edit failed for ${platform}:`, editError);
                this.emit(idString, `❌ Failed to edit ${platform}: ${editError.message}`);
            }
        }

        if (edited > 0) {
            await content.save();
            this.emitResult(idString, { edited, platforms: platforms.slice(0, edited) }, 
                `✅ Successfully updated ${edited} variant(s)`);
        } else {
            this.emit(idString, '⚠️ No variants were modified');
        }

        return { action: 'content_edited', edited, preserveMode };
    }

    /**
     * Regenerate images with smart platform inference
     */
    async regenerateImages(content, brandDNA, decision) {
        const idString = String(content._id);

        // Smart inference: if no platforms specified, use all available non-locked variants
        let platforms = decision.targetPlatforms || [];
        
        if (platforms.length === 0) {
            // If user just said "regenerate image" and there's only one variant, use that
            if (content.variants && content.variants.length === 1) {
                platforms = [content.variants[0].platform];
                this.emitDecision(idString, `Inferred platform: ${platforms[0]}`);
            } else if (content.variants) {
                // Otherwise use all unlocked variants
                platforms = content.variants
                    .filter(v => !v.isLocked)
                    .map(v => v.platform);
            }
        }

        if (platforms.length === 0) {
            this.emit(idString, '❌ No variants available for image regeneration');
            return { action: 'no_variants' };
        }

        const variantsToUpdate = content.variants.filter(v =>
            platforms.includes(v.platform) && !v.isLocked
        );

        if (variantsToUpdate.length === 0) {
            this.emit(idString, `⚠️ Requested variants are locked`);
            return { action: 'variants_locked', platforms };
        }

        this.emitProgress(idString, `🎨 Regenerating images for: ${variantsToUpdate.map(v => v.platform).join(', ')}`);

        try {
            const imageGeneratorAgent = require('./imageGeneratorAgent');
            const ingestAgent = require('./ingestAgent');

            // Get context
            let ingestResult;
            try {
                ingestResult = await ingestAgent.analyze(content);
            } catch (e) {
                ingestResult = { themes: [], sentiment: 'neutral', keyMessages: [content.title] };
            }

            // Apply user's instruction to image generation context
            if (decision.changes?.specificInstructions) {
                if (!ingestResult.themes) ingestResult.themes = [];
                ingestResult.themes.push(decision.changes.specificInstructions);
                ingestResult.additionalContext = decision.changes.specificInstructions;
            }

            let regenerated = 0;
            for (const variant of variantsToUpdate) {
                this.emitProgress(idString, `Generating ${variant.platform} image...`, variant.platform);

                try {
                    const imageResult = await imageGeneratorAgent.generate(
                        content,
                        ingestResult,
                        brandDNA,
                        variant.platform
                    );

                    if (imageResult.status === 'generated') {
                        variant.image = {
                            url: imageResult.url,
                            prompt: imageResult.prompt,
                            provider: imageResult.provider,
                            regeneratedAt: new Date(),
                            regenerationInstruction: decision.understanding
                        };
                        regenerated++;
                        this.emitProgress(idString, `✓ ${variant.platform} image done`, variant.platform);
                    }
                } catch (genError) {
                    console.error(`Image gen failed for ${variant.platform}:`, genError);
                    this.emit(idString, `⚠️ ${variant.platform}: ${genError.message}`);
                }
            }

            await content.save();

            this.emitResult(idString, { regenerated, platforms: variantsToUpdate.map(v => v.platform) },
                `✅ Regenerated ${regenerated} image(s)`);

            return { action: 'images_regenerated', regenerated };

        } catch (error) {
            console.error('[ManagerInteract] Image regeneration error:', error);
            this.emit(idString, `❌ ${error.message}`);
            return { action: 'error', error: error.message };
        }
    }

    /**
     * Update project state (tone, audience, etc.)
     */
    async updateProjectState(content, decision) {
        const idString = String(content._id);

        if (!content.projectStateOverrides) {
            content.projectStateOverrides = {};
        }

        // LLM has already determined what needs to change
        const changes = decision.changes || {};
        
        if (changes.toneOverride) {
            content.projectStateOverrides.toneOverride = changes.toneOverride;
        }
        if (changes.audienceOverride) {
            content.projectStateOverrides.audienceOverride = changes.audienceOverride;
        }
        if (changes.customInstructions) {
            content.projectStateOverrides.customInstructions = changes.customInstructions;
        }

        await content.save();

        this.emitResult(idString, { changes }, `✅ Project state updated`);

        return { action: 'state_updated', changes };
    }

    /**
     * Answer query about the project
     */
    async answerQuery(content, brandDNA, decision) {
        const idString = String(content._id);

        const fullContext = this.buildContext(content, brandDNA);

        const answer = await this.queryChain.invoke({
            question: decision.understanding,
            fullContext: JSON.stringify(fullContext, null, 2)
        });

        this.emit(idString, `💡 ${answer}`);

        return { action: 'query_answered', answer };
    }

    /**
     * Update content variants (helper method)
     */
    async updateContentVariants(content, newVariants, forceAll = false) {
        for (const newVariant of newVariants || []) {
            const existingIndex = content.variants?.findIndex(v => v.platform === newVariant.platform);

            if (existingIndex >= 0) {
                const existing = content.variants[existingIndex];

                if ((existing.isLocked || existing.isUserModified) && !forceAll) {
                    continue;
                }

                if (!existing.generationHistory) existing.generationHistory = [];
                existing.generationHistory.push({
                    content: existing.content,
                    generatedAt: new Date(),
                    source: 'orchestration'
                });

                content.variants[existingIndex] = {
                    ...newVariant,
                    generationHistory: existing.generationHistory,
                    isUserModified: false,
                    isLocked: existing.isLocked
                };
            } else {
                content.variants.push({
                    ...newVariant,
                    isUserModified: false,
                    isLocked: false,
                    generationHistory: []
                });
            }
        }

        await content.save();
    }

    // SSE emission methods
    emitDecision(contentId, message) {
        if (!contentId) return;
        console.log(`[ManagerInteract:Decision] ${message}`);
        orchestrationEmitter.decision(contentId, message);
    }

    emitProgress(contentId, message, step = null) {
        if (!contentId) return;
        console.log(`[ManagerInteract:Progress] ${message}`);
        orchestrationEmitter.progress(contentId, message, step);
    }

    emitResult(contentId, data, message = null) {
        if (!contentId) return;
        console.log(`[ManagerInteract:Result] ${message || 'Complete'}`);
        orchestrationEmitter.result(contentId, data, message);
    }

    emit(contentId, message) {
        if (!contentId) return;
        console.log(`[ManagerInteract] ${message}`);
        orchestrationEmitter.log(contentId, message);
    }
}

module.exports = new ManagerInteract();