/**
 * POST /api/ai/parse — AI parser (v0.6.0).
 *
 * Phase 1: keyword-matching (mock fallback)
 * Phase 2: OpenAI via llmService (opt-in, OPENAI_API_KEY).
 *
 * Body: { transcript: string, childId?: string }
 * Response: { ok, events: [...], insight: string, clarificationQuestions: [...], aiSource }
 */
import { Router } from 'express';
import { llmService } from '../services/llmService.js';
import { aiRateLimit } from '../middleware/rateLimit.js';

export const aiRouter = Router();

aiRouter.post('/parse', aiRateLimit, async (req, res) => {
  const { transcript } = req.body as { transcript?: string };
  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Missing required field: transcript',
    });
  }

  // Имитация AI-задержки для UX-консистентности.
  const t0 = Date.now();
  const result = await llmService.parseTranscript({ transcript });
  const elapsed = Date.now() - t0;
  if (elapsed < 400) {
    await new Promise((r) => setTimeout(r, 400 - elapsed));
  }

  res.json({
    ok: true,
    events: result.events,
    insight: result.insight,
    clarificationQuestions: result.clarificationQuestions,
    aiSource: result.source,
    aiFallback: result.aiFallback,
    aiError: result.aiError,
    model: llmService.model,
  });
});

aiRouter.get('/health', (_req, res) => {
  const status = llmService.status();
  res.json({
    ok: true,
    service: 'ai',
    enabled: status.enabled,
    mode: status.source,
    model: status.model,
  });
});
