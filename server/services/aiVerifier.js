import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

/**
 * Evaluates uploaded photo evidence using Gemini Vision AI.
 * If GEMINI_API_KEY is not configured or an unexpected API error occurs,
 * gracefully falls back to 'needs_review' so the coordinator can review it in the Admin Dashboard.
 *
 * @param {Array<{path: string, mimetype: string, originalname: string}>} files
 * @param {object} challenge
 * @param {string} userNotes
 * @returns {Promise<{
 *   status: 'passed' | 'flagged' | 'failed' | 'needs_review',
 *   confidence: number,
 *   relevance: 'high' | 'medium' | 'low' | 'irrelevant',
 *   quality: 'clear' | 'blurry' | 'dark' | 'unusable',
 *   reason: string,
 *   evidenceDescription: string,
 *   safetyFlag: boolean,
 *   rawJson: string
 * }>}
 */
export async function verifyEvidenceWithAI(files, challenge, userNotes = '') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('[AI Verifier] GEMINI_API_KEY not configured. Routing submission to coordinator review.');
    return {
      status: 'needs_review',
      confidence: 0.5,
      relevance: 'medium',
      quality: 'clear',
      reason: 'Evidence queued for coordinator review (AI vision key not configured on server).',
      evidenceDescription: 'Pending manual coordinator inspection',
      safetyFlag: false,
      rawJson: JSON.stringify({ mode: 'coordinator_review', reason: 'No GEMINI_API_KEY' })
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build image parts
    const imageParts = files.map(file => {
      const fileData = fs.readFileSync(file.path);
      return {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: file.mimetype || 'image/jpeg'
        }
      };
    });

    const promptText = `
You are an objective Sustainability Photo Evidence Auditor for the CarbonCalculator platform.
Evaluate the attached photo evidence submitted by a campus student, NSS volunteer, or citizen for the following challenge:

Challenge Title: "${challenge.title}"
Category: "${challenge.category}" (${challenge.category === 'daily' ? 'Daily habit' : 'Weekly initiative'})
Action Steps: "${challenge.action_steps}"
Evidence Guidance: "${challenge.evidence_guidance || 'Clear photo of the completed sustainable action.'}"
Acceptable Evidence / Alternatives: "${challenge.acceptable_evidence || 'Direct photo of action or acceptable eco-alternative.'}"
Privacy Guidance: "${challenge.privacy_guidance || 'No faces or private identification needed.'}"
User's Notes: "${userNotes || 'None provided'}"

Verification Rules:
1. Examine if the image shows genuine, plausible evidence of this action (e.g., switched-off power strip/unplugged charger, reusable bottle/tote bag, zero food plate waste, bicycle/transit ticket, waste segregation bins, natural breeze window/ceiling fan with AC off, empty classroom lights off, composting bin, or plant/tree care).
2. Check image quality: is it clear, recognizable, or too blurry/dark/corrupted to verify?
3. Safety check: flag if the photo depicts dangerous behavior (e.g. taking photos while actively riding a bicycle or driving a vehicle).
4. Phrasing commitment: Do NOT claim "scientifically proven carbon savings". If accepted, state: "Evidence accepted for this challenge."
5. Status determination:
   - "passed": The photo clearly shows relevant evidence meeting the requirements with high confidence (confidence >= 0.70).
   - "flagged": The photo might be relevant but is somewhat ambiguous, partially obscured, or borderline (confidence 0.45 - 0.69).
   - "failed": The photo is clearly irrelevant (e.g., random selfie, pet, meme, blank wall), completely unrecognizable, or unsafe (confidence < 0.45).

Respond ONLY with a valid JSON object matching this exact schema:
{
  "is_relevant": true,
  "relevance_level": "high",
  "image_quality": "clear",
  "confidence_score": 0.88,
  "evidence_description": "Brief description of what is visible in the photo",
  "status": "passed",
  "reason": "Evidence accepted for this challenge. Clear photo showing power strip toggled off.",
  "safety_flag": false
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [...imageParts, promptText],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text ? response.text.trim() : '';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Clean up markdown formatting if present
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }

    const confidence = typeof parsed.confidence_score === 'number' ? Math.max(0, Math.min(1, parsed.confidence_score)) : 0.5;
    const isRelevant = Boolean(parsed.is_relevant);
    const safetyFlag = Boolean(parsed.safety_flag);
    let finalStatus = parsed.status;

    // Strict validation logic
    if (safetyFlag) {
      finalStatus = 'flagged';
    } else if (finalStatus === 'passed' && (confidence < 0.65 || !isRelevant)) {
      finalStatus = confidence >= 0.45 ? 'flagged' : 'failed';
    }

    return {
      status: finalStatus,
      confidence,
      relevance: parsed.relevance_level || (isRelevant ? 'high' : 'irrelevant'),
      quality: parsed.image_quality || 'clear',
      reason: parsed.reason || (finalStatus === 'passed' ? 'Evidence accepted for this challenge.' : 'Evidence could not be verified automatically.'),
      evidenceDescription: parsed.evidence_description || '',
      safetyFlag,
      rawJson: responseText
    };
  } catch (error) {
    console.error('[AI Verifier] Error calling Gemini API:', error.message || error);
    // Graceful routing to coordinator review
    return {
      status: 'needs_review',
      confidence: 0.5,
      relevance: 'medium',
      quality: 'clear',
      reason: 'Evidence queued for coordinator review (AI vision verification temporarily unavailable).',
      evidenceDescription: 'Pending coordinator review',
      safetyFlag: false,
      rawJson: JSON.stringify({ error: error.message || 'API error' })
    };
  }
}
