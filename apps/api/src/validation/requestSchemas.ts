import { z } from 'zod';
import { DEFAULT_MAX_TRANSCRIPT_CHARS, readPositiveIntEnv } from '../config/env.js';

const MAX_DIGEST_STRING_CHARS = 500;
const MAX_DIGEST_ARRAY_ITEMS = 50;
const MAX_EVENT_COUNT_KEYS = 50;
const MAX_AUDIO_BASE64_CHARS = 50 * 1024 * 1024;

const digestString = z.string().trim().max(MAX_DIGEST_STRING_CHARS);

const forbiddenDigestFields = new Set([
  'transcript',
  'rawTranscript',
  'audioTranscript',
  'childName',
  'name',
  'fullName',
]);

function findForbiddenDigestField(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (forbiddenDigestFields.has(key)) return key;
    if (Array.isArray(nested)) {
      for (const item of nested) {
        const found = findForbiddenDigestField(item);
        if (found) return found;
      }
    } else {
      const found = findForbiddenDigestField(nested);
      if (found) return found;
    }
  }
  return null;
}

export const aiParseBodySchema = z.object({
  transcript: z
    .string({ error: 'transcript required' })
    .trim()
    .min(1, 'transcript required')
    .max(readPositiveIntEnv('MAX_TRANSCRIPT_CHARS', DEFAULT_MAX_TRANSCRIPT_CHARS), 'transcript too long'),
  childId: z.string().trim().max(128).optional(),
}).passthrough();

export const aiDigestBodySchema = z.object({
  windowLabel: digestString.optional(),
  eventCounts: z
    .record(z.string().trim().min(1).max(80), z.number().finite().nonnegative())
    .refine((value) => Object.keys(value).length <= MAX_EVENT_COUNT_KEYS, 'eventCounts too large')
    .optional(),
  topTypes: z.array(digestString).max(MAX_DIGEST_ARRAY_ITEMS).optional(),
  safetyFlags: z.array(digestString).max(MAX_DIGEST_ARRAY_ITEMS).optional(),
  notes: z.array(digestString).max(MAX_DIGEST_ARRAY_ITEMS).optional(),
}).passthrough().superRefine((value, ctx) => {
  const forbiddenField = findForbiddenDigestField(value);
  if (forbiddenField) {
    ctx.addIssue({
      code: 'custom',
      message: `Digest accepts aggregates only; field is not allowed: ${forbiddenField}`,
    });
  }
});

export const sttTranscribeBodySchema = z.object({
  audio: z.string({ error: 'audio required' }).trim().min(1, 'audio required').max(MAX_AUDIO_BASE64_CHARS, 'audio too large'),
  language: z.string().trim().max(16).optional(),
}).passthrough();

export const audioIngestBodySchema = z.object({
  audioBase64: z.string().trim().max(MAX_AUDIO_BASE64_CHARS, 'audio too large').optional(),
  childId: z.string().trim().max(128).optional(),
  sourceRole: z.string().trim().max(32).optional(),
  durationSec: z.number().finite().nonnegative().max(24 * 60 * 60).optional(),
  language: z.string().trim().max(16).optional(),
  mimeType: z.string().trim().max(128).optional(),
  mode: z.enum(['observation', 'child_speech', 'tutor_note']).optional(),
}).passthrough();
