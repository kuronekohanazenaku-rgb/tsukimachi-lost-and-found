import { initialState, transition, decodeSave, REQUIRED } from './game.js?v=cipher-1';
import { chapterInitial } from './chapters.js?v=cipher-1';

const cleared = s => s.chapter - 1 + Number(s.chapter === 1 ? s.recollectionRead : s.chapterProgress.stage === 'complete' || (s.chapter < 10 && s.chapterProgress.read) || (s.chapter === 10 && Boolean(s.chapterProgress.lastWords)));
const preferences = s => ({ bgmEnabled: s.bgmEnabled, bgmVolume: s.bgmVolume, textSize: s.textSize });
export const activeState = session => session.replay || session.main;
export function createSession(main = initialState()) { return { version: 1, main, unlocked: cleared(main), replay: null }; }
export function decodeSession(raw) {
  const data = JSON.parse(raw);
  if (data?.version !== 1) throw new Error('保存形式が不正です。');
  const main = decodeSave(JSON.stringify(data.main));
  if (!Number.isInteger(data.unlocked) || data.unlocked < cleared(main) || data.unlocked > 10) throw new Error('章の記録が不正です。');
  const replay = data.replay === null ? null : decodeSave(JSON.stringify(data.replay));
  if (replay && (replay.chapter > data.unlocked || replay.phase === 'title')) throw new Error('遊び直しの記録が不正です。');
  return { version: 1, main, unlocked: data.unlocked, replay };
}
export function startNew(session) {
  const main = { ...initialState(), ...preferences(activeState(session)), phase: 'introduction' };
  return { ...session, main, replay: null };
}
export function startReplay(session, chapter) {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > session.unlocked) return session;
  let replay = { ...initialState(), ...preferences(activeState(session)), phase: 'introduction' };
  if (chapter > 1) replay = { ...replay, phase: 'chapter', received: true, returned: true, recollectionRead: true,
    viewed: [...REQUIRED, 'receipt'], owner: '森田 澄', destination: '灯町', chapter,
    completed: Array.from({ length: chapter - 1 }, (_, i) => i + 1), chapterProgress: chapterInitial(chapter) };
  return { ...session, replay };
}
export function sessionAction(session, action, replaying = false) {
  if (replaying && (!session.replay || action.type === 'NEXT_CHAPTER')) return { session, message: null };
  const result = transition(replaying ? session.replay : session.main, action);
  const next = { ...session, [replaying ? 'replay' : 'main']: result.state };
  if (['BGM', 'BGM_VOLUME', 'TEXT_SIZE'].includes(action.type)) {
    next.main = { ...next.main, ...preferences(result.state) };
    if (next.replay) next.replay = { ...next.replay, ...preferences(result.state) };
  }
  next.unlocked = Math.max(next.unlocked, cleared(next.main));
  return { session: next, message: result.message };
}
