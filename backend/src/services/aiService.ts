import Groq from 'groq-sdk';
import axios from 'axios';

const getGroqClient = () => {
    const key = process.env.GROQ_API_KEY;
    if (!key || key.trim() === '') {
        console.warn("AI Intelligence Unit: GROQ_API_KEY not found in environment.");
        return null;
    }
    console.log("AI Intelligence Unit: Groq client initialized successfully.");
    return new Groq({ apiKey: key });
};

const groq = getGroqClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://gaykar-aiservice.hf.space/process-complaint';

/**
 * Utility to convert MongoDB string ID to a 32-bit integer for AI Service compatibility.
 */
const stringToHash = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

interface AIClassificationResult {
    department: string;
    priority: string;
    priority_score?: number;
    frequency?: number;
}

export const processComplaintAI = async (payload: any): Promise<AIClassificationResult> => {
    try {
        console.log(`[AI-SYNC] Dispatching to HF Service: ${AI_SERVICE_URL}`);
        
        const response = await axios.post(AI_SERVICE_URL, {
            title: payload.title,
            description: payload.description,
            timeOfOccurrence: payload.timeOfOccurrence || new Date().toISOString(),
            address: payload.address || "Unknown",
            city: payload.city || "Unknown",
            state: payload.state || "Unknown",
            lat: Number(payload.lat) || 0,
            lng: Number(payload.lng) || 0,
            user_id: stringToHash(payload.user_id || "0")
        }, {
            timeout: 10000 // 10s timeout
        });

        const data = response.data;
        return {
            department: data.department || "General Maintenance",
            priority: data.urgency_level || "Medium",
            priority_score: data.priority_score,
            frequency: data.freq
        };
    } catch (error: any) {
        console.error(`[AI-SYNC] HF Service failed, falling back to Groq:`, error.message);
        return getAIClassification(payload);
    }
};

export const getAIClassification = async (payload: any): Promise<AIClassificationResult> => {
    if (!groq) {
        console.warn("GROQ_API_KEY missing. Bypassing AI model request.");
        return { department: "General Governance", priority: "Standard" };
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a city governance assistant. Based on the citizen complaint provided, classify it into a department and priority (Critical, High, Medium, Low). Return only JSON: {"department": "...", "priority": "..."}'
                },
                {
                    role: 'user',
                    content: `Complaint: Title: ${payload.title}, Description: ${payload.description}`
                }
            ],
            model: 'llama-3.1-8b-instant',
            response_format: { type: 'json_object' }
        });

        const result = JSON.parse(completion.choices[0].message.content || '{}');
        return {
            department: result.department || "Infrastructure",
            priority: result.priority || "Medium"
        };
    } catch (error) {
        console.error("Groq classification failed:", error);
        return { department: "General Maintenance", priority: "High" };
    }
}

export const analyzeThread = async (messages: any[]): Promise<any> => {
    if (!groq) {
        return {
            issues: [{ title: "Analysis Offline", description: "GROQ_API_KEY missing in server environment.", priority: "Neutral" }]
        };
    }

    // Combine author and text for context
    const threadText = messages
        .filter(m => m.text && m.text.trim().length > 0)
        .map(m => `${m.authorName || 'User'}: ${m.text}`)
        .join('\n');
    
    console.log(`[AI-DEBUG] Processing ${messages.length} messages.`);
    
    if (!threadText.trim()) {
        console.warn("[AI-DEBUG] Thread text is empty after filtering.");
        return { issues: [{ title: "No Data", description: "Not enough conversation data to build a report.", priority: "Low" }] };
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert Urban Civic Analyst. 
                    Structure your response as a JSON object with exactly one key "issues", containing an array of 3-5 objects.
                    Each object must have "title", "description", and "priority" (Low, Medium, or High).
                    Focus on infrastructure, safety, utilities, and community welfare.
                    
                    Example Output:
                    {
                      "issues": [
                        { "title": "Streetlight Outage", "description": "Multiple residents reported dark zones on Main St.", "priority": "High" }
                      ]
                    }`
                },
                {
                    role: 'user',
                    content: `Analyze this community chat log and provide a report:\n\n${threadText}`
                }
            ],
            model: 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0]?.message?.content;
        console.log("[AI-DEBUG] Raw Groq Content Length:", rawContent?.length);

        if (!rawContent) {
            throw new Error("Empty response from Groq API");
        }

        const parsed = JSON.parse(rawContent);
        
        // Ensure the structure is correct
        if (!parsed.issues || !Array.isArray(parsed.issues)) {
             console.error("[AI-DEBUG] Invalid JSON structure - missing 'issues' array");
             return { issues: [{ title: "Processing Error", description: "Intelligence report structure was malformed.", priority: "Neutral" }] };
        }

        if (parsed.issues.length === 0) {
             return { issues: [{ title: "Quiet Zone", description: "No significant civic issues detected in the current conversation.", priority: "Low" }] };
        }

        return parsed;
    } catch (error: any) {
        console.error("[AI-DEBUG] Groq execution error:", error.message);
        return { 
            issues: [{ title: "Intelligence Failure", description: "The AI unit encountered a protocol error during analysis.", priority: "High" }] 
        };
    }
}
