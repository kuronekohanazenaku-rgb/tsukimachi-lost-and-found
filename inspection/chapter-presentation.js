import { CHAPTERS } from './chapters.js';

export function visibleChapterDocuments(id, progress) {
  return Object.keys(CHAPTERS[id].docs).filter(key => key !== 'item' && (key !== 'reveal' || progress.solved));
}
export function inspectionPhase(state) { return state.chapter > 1 ? state.chapterProgress.stage : state.phase; }
export function inspectionPages(state, introduction, recollection) {
  if (state.chapter === 1) return state.phase === 'introduction' ? introduction : recollection;
  const chapter = CHAPTERS[state.chapter];
  return state.chapterProgress.stage === 'intro' ? chapter.intro : chapter.recollection;
}
export function dropAction(id, progress, value, slot) {
  const puzzle = CHAPTERS[id]?.puzzle;
  if (!puzzle || progress.stage !== 'investigation' || !progress.received || progress.solved || !puzzle.choices.includes(value) || !Number.isInteger(slot) || slot < 0 || slot >= puzzle.answer.length) return null;
  return { type: 'CH_PLACE', value, slot };
}
export function pieceLabel(puzzle, value, back) {
  if (!value) return '空いている枠';
  if (!puzzle.grid) return value;
  const letter = 'ABCD'[puzzle.choices.indexOf(value)];
  return `写真片${letter}${back ? ` · ${value.split(' · ')[1]}` : ''}`;
}
