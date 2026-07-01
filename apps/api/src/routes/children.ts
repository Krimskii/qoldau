/**
 * GET /api/children — список детей (hard-coded в Phase 1).
 * GET /api/children/:id — одно дитя.
 */
import { Router } from 'express';

export const childrenRouter = Router();

const CHILDREN = [
  {
    id: 'child-alikhan',
    name: 'Алихан',
    age: 7,
    diagnosisLabel: 'РАС',
    currentState: 'спокойный',
    avatar: 'А',
    mainSignals: [
      { id: 'sig-1', signal: '«ту-ту»', possibleMeaning: 'возможно — туалет', confidence: 0.82, confirmedCount: 14 },
      { id: 'sig-2', signal: '«ва»', possibleMeaning: 'возможно — пить', confidence: 0.88, confirmedCount: 18 },
      { id: 'sig-3', signal: 'закрывает уши', possibleMeaning: 'шум / перегрузка', confidence: 0.90, confirmedCount: 22 },
    ],
  },
  {
    id: 'child-mira',
    name: 'Мира',
    age: 5,
    diagnosisLabel: 'РАС',
    currentState: 'активная',
    avatar: 'М',
  },
  {
    id: 'child-timur',
    name: 'Тимур',
    age: 9,
    diagnosisLabel: 'РАС',
    currentState: 'сфокусирован',
    avatar: 'Т',
  },
];

childrenRouter.get('/', (_req, res) => {
  res.json({ ok: true, count: CHILDREN.length, children: CHILDREN });
});

childrenRouter.get('/:id', (req, res) => {
  const child = CHILDREN.find((c) => c.id === req.params.id);
  if (!child) {
    return res.status(404).json({ ok: false, error: 'Child not found' });
  }
  res.json({ ok: true, child });
});