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

const FORBIDDEN_DIGEST_FIELDS = new Set([
  'transcript',
  'rawTranscript',
  'audioTranscript',
  'childName',
  'name',
  'fullName',
]);

function containsForbiddenDigestField(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_DIGEST_FIELDS.has(key)) return key;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = containsForbiddenDigestField(item);
        if (found) return found;
      }
    } else {
      const found = containsForbiddenDigestField(nested);
      if (found) return found;
    }
  }
  return null;
}

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
    safetyFlag: result.safetyFlag,
    model: llmService.model,
  });
});

aiRouter.post('/digest', aiRateLimit, async (req, res) => {
  const forbiddenField = containsForbiddenDigestField(req.body);
  if (forbiddenField) {
    return res.status(400).json({
      ok: false,
      error: `Digest accepts aggregates only; field is not allowed: ${forbiddenField}`,
    });
  }

  const body = req.body as {
    windowLabel?: string;
    eventCounts?: Record<string, number>;
    topTypes?: string[];
    safetyFlags?: string[];
    notes?: string[];
  };
  const result = await llmService.digestAggregates({
    windowLabel: body.windowLabel,
    eventCounts: body.eventCounts,
    topTypes: body.topTypes,
    safetyFlags: body.safetyFlags,
    notes: body.notes,
  });

  res.json({
    ok: true,
    digest: result.digest,
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
    promptVersion: status.promptVersion,
  });
});
