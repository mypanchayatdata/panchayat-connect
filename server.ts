import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// In-memory store for synchronized Panchayat records from client
let cachedPanchayatData: any = null;

// Lazy initialize GoogleGenAI client with standard header
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser for records and search
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Panchayat Connect Backend',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Sync endpoint: receives database state from client
  app.post('/api/sync', (req, res) => {
    try {
      const data = req.body;
      if (data && typeof data === 'object') {
        cachedPanchayatData = data;
        return res.json({
          success: true,
          message: 'Panchayat database state synchronized with backend',
          syncedAt: new Date().toISOString(),
        });
      }
      return res.status(400).json({ error: 'Invalid payload' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Sync failed' });
    }
  });

  // Universal AI Assistant Search Endpoint
  app.post('/api/gemini/search', async (req, res) => {
    try {
      const { query, localContext } = req.body;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query is required' });
      }

      const activeContext = localContext || cachedPanchayatData || {};
      const ai = getAIClient();

      if (!ai) {
        // Fallback local smart semantic search if API key not yet set
        return res.json({
          aiPowered: false,
          summary: `Search results for "${query}". Note: Configure GEMINI_API_KEY in Settings > Secrets for full AI semantic reasoning.`,
          matches: [],
        });
      }

      // Compact context for model prompt
      const summaryContext = {
        panchayat: activeContext.panchayat?.name || 'Bilaspur Gram Panchayat',
        villagesCount: activeContext.villages?.length || 0,
        villages: (activeContext.villages || []).map((v: any) => ({ id: v.id, name: v.name })),
        wards: (activeContext.wards || []).map((w: any) => ({ id: w.id, number: w.wardNumber, villageId: w.villageId })),
        familiesCount: activeContext.families?.length || 0,
        sampleFamilies: (activeContext.families || []).slice(0, 30).map((f: any) => ({
          id: f.id,
          headName: f.headName,
          wardId: f.wardId,
          economicStatus: f.economicStatus,
          houseType: f.houseType,
          address: f.address,
        })),
        sampleMembers: (activeContext.members || []).slice(0, 40).map((m: any) => ({
          id: m.id,
          name: m.name,
          familyId: m.familyId,
          age: m.age,
          gender: m.gender,
          isVoter: m.isVoter,
          occupation: m.occupation,
        })),
        tickets: (activeContext.tickets || []).slice(0, 25).map((t: any) => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          title: t.title,
          status: t.status,
          priority: t.priority,
          targetDate: t.targetDate,
          familyId: t.familyId,
        })),
        problems: (activeContext.problems || []).slice(0, 25).map((p: any) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          priority: p.priority,
          status: p.status,
          villageId: p.villageId,
          wardId: p.wardId,
        })),
        schemes: (activeContext.schemes || []).slice(0, 25).map((s: any) => ({
          id: s.id,
          schemeName: s.schemeName,
          applicantName: s.applicantName,
          status: s.status,
          familyId: s.familyId,
        })),
      };

      const systemPrompt = `You are the AI Assistant for "Panchayat Connect", a social worker and administrative platform for Gram Panchayat field work.
Your task is to analyze the user's natural language query against the provided Panchayat records context, extract relevant records, and provide:
1. A concise, helpful summary in friendly, professional language (2-4 sentences).
2. A list of actionable matches with explicit navigation links so the social worker can click directly to open each record.

Available target views:
- "families" (targetId is family.id, e.g. "FAM-001")
- "tickets" (targetId is ticket.id, e.g. "TCK-001")
- "problems" (targetId is problem.id, e.g. "PRB-001")
- "schemes" (targetId is scheme.id, e.g. "SCH-001")
- "wards" (targetId is ward.id, e.g. "w-1")
- "villages" (targetId is village.id, e.g. "v-1")
- "people" (targetId is key person id, e.g. "kp-1")

Return your response strictly in JSON format matching this schema:
{
  "summary": "String explaining what was found or answering the query",
  "matches": [
    {
      "id": "entity-id",
      "type": "family" | "ticket" | "problem" | "scheme" | "ward" | "village" | "member",
      "title": "Clear title e.g. Ramesh Chandra Nayak (FAM-001)",
      "subtitle": "Informative details e.g. Ward 1 • BPL • 4 Members",
      "badge": "e.g. BPL or Urgent or Sanctioned",
      "targetView": "families" | "tickets" | "problems" | "schemes" | "wards" | "villages" | "people",
      "targetId": "entity-id or parent-id",
      "snippet": "Short insight why this matches"
    }
  ],
  "suggestedActions": ["Optional array of 2-3 recommended next steps or related search queries"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Query: "${query}"\n\nPanchayat Records Context:\n${JSON.stringify(summaryContext, null, 2)}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '{}';
      const parsed = JSON.parse(responseText);

      return res.json({
        aiPowered: true,
        summary: parsed.summary || 'Search complete.',
        matches: parsed.matches || [],
        suggestedActions: parsed.suggestedActions || [],
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/search:', error);
      return res.status(500).json({
        error: error.message || 'AI Search request failed',
        aiPowered: false,
      });
    }
  });

  // Multi-Turn AI Assistant Chatbot Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, localContext, role = 'Field Social Worker Assistant' } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
      }

      const ai = getAIClient();
      if (!ai) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured in backend environment.',
        });
      }

      const activeContext = localContext || cachedPanchayatData || {};
      const contextSummary = {
        panchayatName: activeContext.panchayat?.name || 'Bilaspur Gram Panchayat',
        sarpanch: activeContext.panchayat?.sarpanchName,
        block: activeContext.panchayat?.block,
        district: activeContext.panchayat?.district,
        totalVillages: activeContext.villages?.length || 0,
        totalWards: activeContext.wards?.length || 0,
        totalFamilies: activeContext.families?.length || 0,
        openTicketsCount: (activeContext.tickets || []).filter((t: any) => t.status !== 'Resolved').length,
        unresolvedProblemsCount: (activeContext.problems || []).filter((p: any) => p.status !== 'Completed').length,
        villagesList: (activeContext.villages || []).map((v: any) => v.name).join(', '),
      };

      const systemInstruction = `You are Panchayat Connect AI, an expert digital co-pilot for Gram Panchayat field administrators and community social workers in India.
Current User Role: "${role}".
Administrative Jurisdiction: ${contextSummary.panchayatName} (${contextSummary.block} Block, ${contextSummary.district} District).
Overview: ${contextSummary.totalVillages} Villages (${contextSummary.villagesList}), ${contextSummary.totalWards} Wards, ${contextSummary.totalFamilies} Registered Families, ${contextSummary.openTicketsCount} Open Tickets, ${contextSummary.unresolvedProblemsCount} Community Grievances.

Your Core Capabilities:
1. Answering questions about central and state government schemes (PMAY-G, PM-KISAN, NFSA/Ration, Old Age & Widow Pensions, Jal Jeevan Mission, MGNREGA, Ayushman Bharat / Health cards).
2. Guiding social workers during household surveys, grievance documentation, and ticket escalation.
3. Drafting official letters, Gram Sabha agenda points, resolutions, and community notices.
4. Analyzing ward-level development problems and recommending priority interventions.
5. Referencing entities by their exact ID (e.g. [FAM-001], [TCK-002], [PRB-001], [w-1], [v-1]) whenever applicable so the UI can link them directly.

Formatting & Tone:
- Clear, respectful, professional, and practical for ground-level public service.
- Use markdown formatting with bullet points and bold highlights for readability.
- If recommending government assistance, specify eligibility criteria and required documents (Aadhaar, Voter ID, Ration Card, Bank Passbook, Land record/RoR).`;

      // Convert conversation history into model turns
      // Last message is the active prompt
      const historyContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: historyContents,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      return res.json({
        reply: response.text || 'I could not generate a response.',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Error in /api/gemini/chat:', error);
      return res.status(500).json({
        error: error.message || 'Chatbot request failed',
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Panchayat Connect server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
