// First-game tips: which tip shows at which moment (src/components/game/Tutor.js).
import { TIPS } from '../src/components/game/Tutor';

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const pick = (ctx, seen = {}) => TIPS.find((t) => !seen[t.id] && t.when(ctx))?.id ?? null;
const base = {
  mine: false, over: false, cover: null, event: null, sawBuyout: false, sawCharter: false, phase: 'place', canBell: false,
};

test('your build step shows the build tip, even after a rival chartered a company', () => {
  expect(pick({ ...base, mine: true, sawCharter: true })).toBe('build');
});

test('explanations of what just happened wait for a rival turn', () => {
  const yourInvest = { ...base, mine: true, phase: 'buy', sawCharter: true, sawBuyout: true };
  expect(pick(yourInvest, { invest: true })).toBe(null);
  expect(pick({ ...base, sawCharter: true, sawBuyout: true })).toBe('buyout');
  expect(pick({ ...base, sawCharter: true }, { buyout: true })).toBe('chartered');
});

test('nothing docks over a full-screen charter or buyout moment', () => {
  expect(pick({ ...base, sawCharter: true, event: { fx: { kind: 'found' } } })).toBe(null);
});

test('decisions get their tip inside the sheet', () => {
  for (const [phase, id] of [['found', 'charter'], ['survivor', 'survivor'], ['dispose', 'settle']]) {
    const tip = TIPS.find((t) => t.id === pick({ ...base, mine: true, phase }));
    expect(tip.id).toBe(id);
    expect(tip.where).toBe('sheet');
  }
});

test('the closing bell tip beats the plain invest tip', () => {
  expect(pick({ ...base, mine: true, phase: 'buy', canBell: true })).toBe('bell');
  expect(pick({ ...base, mine: true, phase: 'buy', canBell: true }, { bell: true })).toBe('invest');
});

test('a finished game or a pass-and-play cover shows no rival tip', () => {
  expect(pick({ ...base, over: true })).toBe(null);
  expect(pick({ ...base, cover: { name: 'Ada' } })).toBe(null);
});
