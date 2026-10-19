import { CHAPTERS, chapterInitial, chapterTransition, validChapterProgress } from './chapters.js';
export const REQUIRED = ['watchBack', 'ticket', 'repairLedger', 'timetable'];
export const EVIDENCE = {
  watchFront: { title: '懐中時計・表', text: '針は18時40分を指したまま動かない。駅の壁時計と同じ時刻だ。' },
  watchBack: { title: '懐中時計・裏', text: '裏ぶたに、製造番号「417」が刻まれている。' },
  ticket: { title: '古い切符', text: '行き先の文字だけがかすれて読めない。日付、乗車駅、列車番号ははっきり残っている。' },
  repairLedger: { title: '修理台帳', rows: [['142', '川瀬 灯', '鎖交換'], ['417', '森田 澄', '針の調整'], ['704', '榊 修一', '留め具修理']] },
  timetable: { title: '最終運行表', rows: [['最終03便', '17:20', '花浜'], ['最終05便', '18:10', '雨野'], ['最終07便', '18:40', '灯町']] },
  receipt: { title: '返却控え', text: '品物：懐中時計・古い切符\n持ち主：森田 澄\n返却先：灯町\n受付時刻：10月31日 18:25' },
};
export const INTRODUCTION = [
  '父が亡くなって、三年になる。\n\n遺品の中に、小さな駅の絵葉書があった。裏には「ハルへ」。隅に「父・修一」と署名があった。',
  '月待駅。二十年前に廃止された終着駅。\n\n資料整理の仕事に応募したのは、その名前が気になったからだった。',
  '閉館後の資料室。壁の時計は、18時40分で止まっている。\n\n忘れもの台帳の最初のページには、父と同じ「榊」という署名。名前の続きは汚れて読めない。',
  '窓口の灯りを点けると、棚のベルが鳴った。\n\nさっきまで空だった棚に、古い懐中時計と切符がある。',
  '机の説明書には、こうあった。\n\n「記録を確かめ、持ち主と届け先を書いて、返却箱へ」\n\nまずは品物と資料を調べてみよう。',
];
export const RECOLLECTION = [
  '宛名を付けた時計と切符を、返却箱に入れた。\n\nふたを閉じると、かすかな灯りがこぼれた。箱を開けると、品物はもうなかった。',
  '「忘れたことにして、預かってもらえませんか」\n\n森田さんは、時計を窓口に置いた。',
  '「主人は、この駅の時計が五分遅れているって、毎朝言っていたんです。乗る列車もないのに、毎朝」',
  '榊という駅員は、返却を急かさなかった。\n\n「では、ここでお預かりします」',
  '森田さんは、最後の列車の時刻に針を合わせ、時計を止めてから預けた。\n\n列車が出たあと、榊さんは駅時計も止めた。',
  '置いていったものも、忘れものになるんだ。\n\n榊さん。父と同じ名字だ。あの絵葉書も、この駅だった。',
];
export const HINTS = [
  '時計の裏と修理台帳で持ち主を、切符と最終運行表で届け先を確かめよう。',
  '時計の裏には製造番号「417」。切符には「10月31日・最終07便」と書かれている。',
  '修理台帳の417は「森田 澄」。10月31日の最終07便は「灯町」行き。返却票にはこの二つを選ぼう。',
];
export const OWNERS = ['川瀬 灯', '森田 澄', '榊 修一'];
export const DESTINATIONS = ['花浜', '雨野', '灯町'];
export const initialState = () => ({
  version: 1, phase: 'title', received: false, viewed: [], owner: '', destination: '',
  returned: false, storyIndex: 0, hintLevel: 0, textSize: 18, recollectionRead: false, bgmEnabled: false, bgmVolume: 30,
  chapter: 1, chapterProgress: null, completed: [],
});
export function canSubmit(s) {
  return s.phase === 'investigation' && s.received && !s.returned && REQUIRED.every(id => s.viewed.includes(id));
}
export function transition(s, action) {
  if (action.type === 'NEXT_CHAPTER') {
    const id = s.chapter ?? 1;
    const finished = id === 1 ? s.phase === 'complete' : s.phase === 'chapter' && s.chapterProgress?.stage === 'complete';
    if (!finished || id >= 10) return { state: s, message: null };
    return { state: { ...s, phase: 'chapter', chapter: id + 1, chapterProgress: chapterInitial(id + 1), completed: Array.from({ length: id }, (_, i) => i + 1) }, message: null };
  }
  if (s.phase === 'chapter' && action.type.startsWith('CH_')) {
    const result = chapterTransition(s.chapter, s.chapterProgress, action);
    return { state: result.state === s.chapterProgress ? s : { ...s, chapterProgress: result.state }, message: result.message };
  }
  let next = s;
  let message = null;
  switch (action.type) {
    case 'START': if (s.phase === 'title') next = { ...s, phase: 'introduction', storyIndex: 0 }; break;
    case 'ADVANCE': {
      if (!['introduction', 'recollection'].includes(s.phase)) break;
      const pages = s.phase === 'introduction' ? INTRODUCTION : RECOLLECTION;
      next = s.storyIndex + 1 < pages.length ? { ...s, storyIndex: s.storyIndex + 1 }
        : { ...s, phase: s.phase === 'introduction' ? 'investigation' : 'complete', storyIndex: 0,
            recollectionRead: s.recollectionRead || s.phase === 'recollection' };
      break;
    }
    case 'RECEIVE': if (s.phase === 'investigation' && !s.received) next = { ...s, received: true }; break;
    case 'VIEW': {
      if (!(action.id in EVIDENCE)) break;
      if (['watchFront', 'watchBack', 'ticket'].includes(action.id) && !s.received) break;
      if (action.id === 'receipt' && !s.returned) break;
      if (!s.viewed.includes(action.id)) next = { ...s, viewed: [...s.viewed, action.id] };
      break;
    }
    case 'OWNER': if (!s.returned && OWNERS.includes(action.value)) next = { ...s, owner: action.value }; break;
    case 'DESTINATION': if (!s.returned && DESTINATIONS.includes(action.value)) next = { ...s, destination: action.value }; break;
    case 'SUBMIT': {
      if (!canSubmit(s)) { message = '時計の裏、切符、修理台帳、最終運行表を確認してから、返却票を書こう。'; break; }
      const errors = [];
      if (s.owner !== '森田 澄') errors.push('持ち主を確かめる番号が、品物に残っているようだ。');
      if (s.destination !== '灯町') errors.push('切符の便名と、同じ日の運行表を照らし合わせてみよう。');
      if (errors.length) {
        next = { ...s, owner: s.owner === '森田 澄' ? s.owner : '', destination: s.destination === '灯町' ? s.destination : '' };
        message = errors.join('\n\n');
      } else next = { ...s, returned: true, viewed: [...s.viewed, 'receipt'], phase: 'recollection', storyIndex: 0 };
      break;
    }
    case 'HINT': if (s.hintLevel < 3) next = { ...s, hintLevel: s.hintLevel + 1 }; break;
    case 'TEXT_SIZE': if (Number.isInteger(action.value) && action.value >= 16 && action.value <= 26) next = { ...s, textSize: action.value }; break;
    case 'BGM': if (typeof action.value === 'boolean') next = { ...s, bgmEnabled: action.value }; break;
    case 'BGM_VOLUME': if (Number.isInteger(action.value) && action.value >= 0 && action.value <= 100) next = { ...s, bgmVolume: action.value }; break;
    case 'REPLAY': if (s.phase === 'complete') next = { ...s, phase: 'recollection', storyIndex: 0 }; break;
    case 'SKIP': if (s.phase === 'recollection' && s.recollectionRead) next = { ...s, phase: 'complete', storyIndex: 0 }; break;
  }
  return { state: next, message };
}
export function decodeSave(raw) {
  const s = JSON.parse(raw);
  const phases = ['title', 'introduction', 'investigation', 'recollection', 'complete', 'chapter'];
  if (!s || s.version !== 1 || !phases.includes(s.phase) ||
      !['received', 'returned', 'recollectionRead'].every(key => typeof s[key] === 'boolean') ||
      !Array.isArray(s.viewed) || !s.viewed.every(id => Object.hasOwn(EVIDENCE, id)) || new Set(s.viewed).size !== s.viewed.length ||
      !['', ...OWNERS].includes(s.owner) || !['', ...DESTINATIONS].includes(s.destination) ||
      !Number.isInteger(s.storyIndex) || s.storyIndex < 0 ||
      s.storyIndex >= (s.phase === 'introduction' ? INTRODUCTION.length : RECOLLECTION.length) ||
      (!['introduction', 'recollection'].includes(s.phase) && s.storyIndex !== 0) ||
      !Number.isInteger(s.hintLevel) || s.hintLevel < 0 || s.hintLevel > 3 ||
      !Number.isInteger(s.textSize) || s.textSize < 16 || s.textSize > 26 ||
      (s.returned && (!s.received || !s.viewed.includes('receipt') || !REQUIRED.every(id => s.viewed.includes(id)) || s.owner !== '森田 澄' || s.destination !== '灯町')) ||
      (s.viewed.includes('receipt') && !s.returned) ||
      (s.viewed.some(id => ['watchFront', 'watchBack', 'ticket'].includes(id)) && !s.received) ||
      (['recollection', 'complete', 'chapter'].includes(s.phase) !== s.returned) ||
      (s.phase === 'complete' && !s.recollectionRead)) throw new Error('保存データの形式が不正です。');
  if (s.bgmEnabled !== undefined && typeof s.bgmEnabled !== 'boolean') throw new Error('保存データの音設定が不正です。');
  if (s.bgmVolume !== undefined && (!Number.isInteger(s.bgmVolume) || s.bgmVolume < 0 || s.bgmVolume > 100)) throw new Error('保存データの音量が不正です。');
  const chapter = s.chapter ?? 1, chapterProgress = s.chapterProgress ?? null, completed = s.completed ?? [];
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 10 || !Array.isArray(completed) ||
      completed.length !== chapter - 1 || !completed.every((id, i) => id === i + 1) ||
      (chapter === 1 ? s.phase === 'chapter' || chapterProgress !== null : s.phase !== 'chapter' || !s.recollectionRead || !validChapterProgress(chapter, chapterProgress))) throw new Error('保存データの章の進行が不正です。');
  return { ...s, bgmEnabled: s.bgmEnabled ?? false, bgmVolume: s.bgmVolume ?? 30, chapter, chapterProgress, completed };
}
