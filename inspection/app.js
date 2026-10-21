import { initialState, decodeSave, EVIDENCE, INTRODUCTION, RECOLLECTION, REQUIRED, HINTS, OWNERS, DESTINATIONS, canSubmit } from './game.js';
import { createWatchViewer } from './watch-viewer.js';
import { createChapterUI } from './chapter-ui.js?v=menu-1';
import { CHAPTERS } from './chapters.js';
import { createSession, decodeSession, startNew, startReplay, sessionAction } from './play-session.js';

const $ = id => document.getElementById(id);
const saveKey = 'tsukimachi/inspection-v1';
const sessionKey = 'tsukimachi/inspection-session-v1';
const inspect = $('inspect-dialog'), story = $('story-dialog');
let session = createSession(), state = session.main, replaying = false, menuOpen = true, savingDisabled = false, viewer = null, returnFocus = null, toastTimer, chapterUI;
try { const raw = localStorage.getItem(sessionKey), legacy = localStorage.getItem(saveKey); session = raw ? decodeSession(raw) : createSession(legacy ? decodeSave(legacy) : initialState()); state = session.main; }
catch { savingDisabled = true; $('save-warning').hidden = false; $('save-warning').textContent = '保存データを読み込めませんでした。この試遊は保存せず進めます。以前のデータは上書きしません。'; }
function escape(text) { return String(text).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]); }
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500); }
function save() { if (savingDisabled) return; try { localStorage.setItem(sessionKey, JSON.stringify(session)); } catch { $('save-warning').hidden = false; $('save-warning').textContent = 'このブラウザーに保存できませんでした。ページを閉じると今回の進行が失われることがあります。'; } }
function act(action) { const result = sessionAction(session, action, replaying); session = result.session; state = replaying ? session.replay : session.main; save(); renderRoom(); syncMusic(); return result.message; }
function renderRoom() {
  $('play-mode').textContent = replaying ? '章の遊び直し · 本編の続きは保存中' : '';
  if (state.chapter > 1) { chapterUI?.renderRoom(); return; }
  $('chapter-label').textContent = 'CHAPTER 01 · 月待駅'; $('chapter-title').textContent = '最後の列車';
  $('room').classList.remove('later-chapter'); document.body.classList.remove('morning');
  $('room-image').src = './assets/station.png'; $('watch').classList.remove('chapter-item');
  $('watch-image').src = './assets/watch-front.png'; $('watch').setAttribute('aria-label', '受け取り棚の懐中時計を手に取る');
  $('ticket').hidden = false; $('timetable').hidden = false; $('chapter-docs').innerHTML = '';
  $('board-caption').textContent = '最終運行表'; $('timetable').setAttribute('aria-label', '壁の最終運行表を調べる');
  $('drawer-tag').textContent = '修理の記録'; $('drawer').setAttribute('aria-label', '左の引き出しを開けて修理台帳を調べる'); $('box-caption').textContent = '返却箱';
  const count = REQUIRED.filter(id => state.viewed.includes(id)).length;
  $('clue-count').textContent = `${count} / 4`;
  $('room').classList.toggle('finished', state.returned);
  $('objective').textContent = state.returned ? '棚に、一枚の返却控えが残っている。' : count === 4 ? '持ち主と届け先が、見えてきた。' : '気になるものに、触れてみよう。';
  $('scene-note').textContent = state.returned ? '返した品物に残っていた、誰かの記憶。' : state.viewed.includes('watchBack') ? '裏ぶたの「417」。記録と照らし合わせよう。' : state.received ? '時計には、まだ見ていない面がある。' : '棚のベルが鳴った。時計と切符が届いている。';
  $('return-box').setAttribute('aria-label', state.returned ? '返却箱に残った控えを読む' : '右の返却箱を調べる');
}
function closeInspection() { if (menuOpen) return; viewer?.dispose(); viewer = null; inspect.close(); document.body.classList.remove('modal-open'); returnFocus?.focus({ preventScroll: true }); }
function openInspection(title, kind, html, after) {
  if (inspect.open) { viewer?.dispose(); viewer = null; } else returnFocus = document.activeElement;
  $('inspect-title').textContent = title; $('inspect-kind').textContent = kind; $('inspect-content').innerHTML = html;
  $('close-inspect').hidden = menuOpen;
  if (!inspect.open) inspect.showModal(); inspect.scrollTop = 0; document.body.classList.add('modal-open'); after?.();
}
$('close-inspect').addEventListener('click', closeInspection);
inspect.addEventListener('cancel', event => { event.preventDefault(); closeInspection(); });
function paper(id, headers) {
  const evidence = EVIDENCE[id];
  return `<article class="paper"><h3>${escape(evidence.title)}</h3>${evidence.rows ? `<table><thead><tr>${headers.map(label => `<th scope="col">${escape(label)}</th>`).join('')}</tr></thead><tbody>${evidence.rows.map(row => `<tr>${row.map(value => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table>` : `<p>${escape(evidence.text)}</p>`}</article>`;
}
function collect(id) { if (!state.received && ['watchFront', 'ticket'].includes(id)) act({ type: 'RECEIVE' }); const previous = state.viewed.includes(id); act({ type: 'VIEW', id }); if (!previous && REQUIRED.includes(id)) toast(`手がかりを記録した · ${EVIDENCE[id].title}`); }
function openWatch() {
  collect('watchFront');
  const discovered = () => { if (!state.viewed.includes('watchBack')) { collect('watchBack'); } const clue = $('watch-discovery'); if (clue) { clue.textContent = '裏ぶたに、製造番号「417」が刻まれている。'; clue.classList.add('found'); } };
  let unavailable = false;
  const fallback = () => {
    if (unavailable) return; unavailable = true;
    $('watch-stage').innerHTML = `<p class="inspect-help">この環境では3D表示が使えません。写真で同じ品物を調べられます。</p><div class="fallback-photos"><img src="./assets/watch-front.png" alt="18時40分で止まった時計の表"><button class="quiet" id="fallback-back">写真で裏側を確認する</button></div>`;
    $('fallback-back').onclick = () => { $('watch-stage').innerHTML = '<div class="fallback-photos"><img src="./assets/watch-back.png" alt="時計の裏。製造番号417"></div>'; discovered(); };
  };
  openInspection('懐中時計', '手に取って、角度を変える', `<div id="watch-stage"><canvas class="inspection-canvas" id="watch-canvas" tabindex="0" role="img" aria-label="3Dの懐中時計。ドラッグ、または矢印キーで上下左右に回して調べる。" aria-describedby="watch-help"></canvas><p class="inspect-help" id="watch-help">指でドラッグして、くるりと回す。<br>二本指で拡大・縮小 / キーボードは矢印キー</p><div class="rotation-tools"><button class="quiet" id="zoom-in" aria-label="時計を拡大する">＋ 拡大</button><button class="quiet" id="zoom-out" aria-label="時計を縮小する">− 縮小</button><button class="quiet" id="reset-angle">正面へ戻す</button></div></div><p class="discovery ${state.viewed.includes('watchBack') ? 'found' : ''}" id="watch-discovery" role="status" aria-live="polite">${state.viewed.includes('watchBack') ? '裏ぶたに、製造番号「417」が刻まれている。' : '針は18時40分で止まっている。ほかの面も調べてみよう。'}</p>`, () => {
    viewer = createWatchViewer($('watch-canvas'), { onDiscover: discovered, onUnavailable: fallback });
    if (!unavailable) { $('zoom-in').onclick = () => viewer?.zoom(-0.4); $('zoom-out').onclick = () => viewer?.zoom(0.4); $('reset-angle').onclick = () => viewer?.reset(); }
  });
}
$('watch').onclick = openWatch;
$('ticket').onclick = () => { collect('ticket'); openInspection('古い切符', '受け取り棚', '<div class="ticket-large">月待駅 発行 / 乗車券<br><strong>月待 → ░░</strong><br>10月31日　最終07便</div><p>行き先の文字だけがかすれて読めない。<br>日付、乗車駅、列車番号ははっきり残っている。</p>'); };
$('drawer').onclick = () => { collect('repairLedger'); openInspection('資料の引き出し', 'そっと開けると、修理の記録がある', paper('repairLedger', ['製造番号', '依頼者', '作業']) + '<p class="inspect-help">品物に刻まれた番号を、台帳の番号と照らし合わせる。</p>'); };
$('timetable').onclick = () => { collect('timetable'); openInspection('壁の運行表', '十月三十一日 · 最後の日', paper('timetable', ['便名', '出発時刻', '行き先']) + '<p class="inspect-help">切符の便名と、同じ日の運行表を照らし合わせる。</p>'); };
$('wall-clock').onclick = () => openInspection('壁の駅時計', '動かなくなった駅の時間', '<article class="paper"><h3>18時40分</h3><p>壁の駅時計は、18時40分で止まっている。</p><p>時刻だけでは、品物の持ち主や返却先は分からない。品物と資料を照らし合わせよう。</p></article>');
function form(message = '') {
  if (state.returned) return showReceipt();
  const options = (values, chosen) => '<option value="">選んでください</option>' + values.map(value => `<option ${chosen === value ? 'selected' : ''}>${escape(value)}</option>`).join('');
  openInspection('返却箱', '品物に、宛名を添える', `<article class="paper"><h3>返却票</h3><div class="fields"><label>持ち主<select id="owner">${options(OWNERS, state.owner)}</select></label><label>届け先<select id="destination">${options(DESTINATIONS, state.destination)}</select></label></div><button class="primary" id="submit-return" ${!canSubmit(state) || !state.owner || !state.destination ? 'disabled' : ''}>品物を返却箱に入れる</button></article><p class="missing">返却する前に、四つの手がかりを確認しよう。</p><ul class="checklist">${REQUIRED.map(id => `<li class="${state.viewed.includes(id) ? 'seen' : ''}">${state.viewed.includes(id) ? '✓' : '○'} ${escape(EVIDENCE[id].title)}</li>`).join('')}</ul><p class="discovery" role="status">${escape(message)}</p>`, () => {
    $('owner').onchange = event => { act({ type: 'OWNER', value: event.target.value }); updateSubmit(); };
    $('destination').onchange = event => { act({ type: 'DESTINATION', value: event.target.value }); updateSubmit(); };
    function updateSubmit() { $('submit-return').disabled = !canSubmit(state) || !state.owner || !state.destination; }
    $('submit-return').onclick = () => { const error = act({ type: 'SUBMIT' }); if (error) form(error); else { closeInspection(); showStory(); } };
  });
}
$('return-box').onclick = () => form();
function showReceipt() {
  if (replaying) return replayComplete();
  openInspection('返却控え', '第一話 · 了 / 全十話', paper('receipt') + '<p>置いていったものも、忘れものになるんだ。</p><button class="primary" id="next-chapter">第二話「鳴らなかった音楽箱」へ</button><button class="quiet" id="replay">品物に残った記憶を読み返す</button> <button class="quiet" id="inspect-again">時計の操作をもう一度試す</button>', () => { $('next-chapter').onclick = () => { act({ type: 'NEXT_CHAPTER' }); closeInspection(); showStory(); }; $('replay').onclick = () => { act({ type: 'REPLAY' }); closeInspection(); showStory(); }; $('inspect-again').onclick = openWatch; });
}
function showStory() {
  if (state.chapter > 1) return chapterUI.showStory();
  if (!['introduction', 'recollection'].includes(state.phase)) return;
  const recalling = state.phase === 'recollection', pages = recalling ? RECOLLECTION : INTRODUCTION;
  $('story-label').textContent = `${recalling ? '品物に残った記憶' : '第一話 · 夜の受付'}　${state.storyIndex + 1} / ${pages.length}`;
  $('story-text').textContent = pages[state.storyIndex];
  $('story-next').textContent = state.storyIndex === pages.length - 1 ? recalling ? '画面に触れて、記憶を胸にしまう →' : '画面に触れて、窓口を調べる →' : '画面に触れて、つづきを読む →';
  document.body.classList.add('modal-open'); if (!story.open) story.showModal();
}
function advanceStory() {
  if (state.chapter > 1) return chapterUI.advanceStory();
  act({ type: 'ADVANCE' });
  if (['introduction', 'recollection'].includes(state.phase)) showStory();
  else { story.close(); document.body.classList.remove('modal-open'); if (state.phase === 'complete') showReceipt(); else toast('窓口の気になるところを調べてみよう。'); }
}
$('story-page').onclick = advanceStory;
$('story-page').onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); advanceStory(); } };
story.addEventListener('cancel', event => event.preventDefault());
$('journal').onclick = () => openInspection('手がかりの手帳', '確認したことを、書き留める', REQUIRED.map(id => `<article class="archive-note"><h3>${state.viewed.includes(id) ? '✓' : '○'} ${escape(EVIDENCE[id].title)}</h3><p>${state.viewed.includes(id) ? escape(EVIDENCE[id].text || EVIDENCE[id].rows.map(row => row.join(' ／ ')).join('\n')) : id === 'watchBack' ? '時計を手に取り、裏側まで回して調べよう。' : '窓口の品物や家具に触れて、調べてみよう。'}</p></article>`).join(''));
function hints() {
  openInspection('小さな手がかり', '必要なときだけ、少しずつ', '<p>品物に残されたことと、駅の記録を照らし合わせよう。</p>' + HINTS.slice(0, state.hintLevel).map((text, index) => `<div class="hint-answer"><p class="eyebrow">${index + 1}段階目</p><p>${escape(text)}</p></div>`).join('') + (state.hintLevel < 3 ? `<button class="quiet" id="next-hint">${state.hintLevel === 2 ? '答えを含む最後のヒントを開く' : '次のヒントを開く'}</button>` : ''), () => { if ($('next-hint')) $('next-hint').onclick = () => { act({ type: 'HINT' }); hints(); }; });
}
$('hint').onclick = hints;
const songs = [{ file: 'musicbox.wav', name: '窓口の灯り' }, { file: 'platform.wav', name: '夜更けのホーム' }, { file: 'shelf.wav', name: '小さな預かり棚' }];
const audio = new Audio(); audio.preload = 'none'; let musicIndex = 0, unlocked = false, audioError = '', musicScene = '';
const specialSongs = { memory: { file: 'memory.wav', name: '窓口の灯り · 回想' }, letter: { file: 'letter.wav', name: '窓口の灯り · 手紙' } };
const activeSong = () => specialSongs[musicScene] || songs[musicIndex];
function syncMusic() {
  if (menuOpen) { audio.pause(); return; }
  const desired = state.chapter === 10 ? 'letter' : state.phase === 'recollection' || state.chapterProgress?.stage === 'recollection' ? 'memory' : 'main';
  if (desired === musicScene) return;
  musicScene = desired; audio.pause(); audio.loop = desired !== 'main'; audio.src = new URL(`./assets/${activeSong().file}`, import.meta.url).href; audioError = ''; playMusic();
}
audio.volume = state.bgmVolume / 100;
async function playMusic() {
  if (menuOpen || !state.bgmEnabled || !unlocked || document.hidden) return;
  if (!audio.getAttribute('src')) audio.src = new URL(`./assets/${activeSong().file}`, import.meta.url).href;
  try { await audio.play(); audioError = ''; } catch (error) { if (error.name !== 'AbortError') audioError = 'BGMを再生できませんでした。もう一度再生してください。'; }
  refreshAudio();
}
audio.addEventListener('ended', () => { if (musicScene === 'main') musicIndex = (musicIndex + 1) % songs.length; audio.src = new URL(`./assets/${activeSong().file}`, import.meta.url).href; playMusic(); });
audio.addEventListener('error', () => { audioError = 'BGMの読み込みに失敗しました。通信を確認してください。'; refreshAudio(); });
audio.addEventListener('playing', refreshAudio); audio.addEventListener('pause', refreshAudio);
document.addEventListener('visibilitychange', () => { if (document.hidden) { audio.pause(); save(); } else playMusic(); });
function refreshAudio() { if ($('audio-toggle')) $('audio-toggle').textContent = state.bgmEnabled && unlocked ? 'BGMを止める' : 'オルゴールBGMを聴く'; if ($('audio-state')) $('audio-state').textContent = audioError || (!audio.paused ? `${activeSong().name} · 再生中` : 'BGM · 停止中'); }
$('settings').onclick = () => openInspection('設定', '窓口で過ごす時間', '<button class="quiet" id="audio-toggle"></button><p class="inspect-help" id="audio-state" role="status"></p><label class="setting-row">BGMの音量<input id="volume" aria-label="BGMの音量" type="range" min="0" max="100" step="10"><output id="volume-value"></output></label><p class="inspect-help">通常時はオルゴール3曲を順番に再生します。<br>回想と手紙では専用曲に切り替わります。</p><button class="quiet" id="read-intro">序章を読み返す</button><p class="inspect-help">試作の進行は、このブラウザーに保存します。<br>全10話の公開版のセーブとは別です。</p>', () => {
  refreshAudio(); $('volume').value = state.bgmVolume; $('volume-value').textContent = `${state.bgmVolume}%`;
  $('volume').oninput = event => { act({ type: 'BGM_VOLUME', value: Number(event.target.value) }); audio.volume = state.bgmVolume / 100; $('volume-value').textContent = `${state.bgmVolume}%`; };
  $('audio-toggle').onclick = () => { const enabled = !state.bgmEnabled || !unlocked; unlocked = true; act({ type: 'BGM', value: enabled }); if (enabled) playMusic(); else audio.pause(); refreshAudio(); };
  $('read-intro').onclick = () => { openInspection('夜の受付', 'この話の序章', (CHAPTERS[state.chapter]?.intro || INTRODUCTION).map(text => `<article class="archive-note"><p>${escape(text)}</p></article>`).join('')); };
});
chapterUI = createChapterUI({ getState: () => state, act, escape, openInspection, closeInspection, toast, isReplay: () => replaying, replayComplete, setViewer: value => { viewer = value; } });
const firstJournal = $('journal').onclick, firstHint = $('hint').onclick;
$('watch').onclick = () => state.chapter > 1 ? chapterUI.openItem() : openWatch();
$('drawer').onclick = () => state.chapter > 1 ? chapterUI.drawer() : (collect('repairLedger'), openInspection('資料の引き出し', 'そっと開けると、修理の記録がある', paper('repairLedger', ['製造番号', '依頼者', '作業'])));
$('timetable').onclick = () => state.chapter > 1 ? chapterUI.board() : (collect('timetable'), openInspection('壁の運行表', '十月三十一日 · 最後の日', paper('timetable', ['便名', '出発時刻', '行き先'])));
$('return-box').onclick = () => state.chapter > 1 ? chapterUI.returnForm() : form();
$('journal').onclick = () => state.chapter > 1 ? chapterUI.journal() : firstJournal();
$('hint').onclick = () => state.chapter > 1 ? chapterUI.hints() : firstHint();
function dismissDialogs() { viewer?.dispose(); viewer = null; inspect.close(); story.close(); document.body.classList.remove('modal-open'); }
function enterGame(replay = false) {
  dismissDialogs(); replaying = replay; state = replay ? session.replay : session.main; menuOpen = false;
  renderRoom(); audio.volume = state.bgmVolume / 100; syncMusic(); playMusic();
  if (['introduction', 'recollection'].includes(state.phase) || (state.chapter > 1 && ['intro', 'recollection', 'epilogue'].includes(state.chapterProgress.stage))) showStory();
  else if (state.chapter === 1 && state.phase === 'complete') showReceipt();
  else if (state.chapter > 1 && state.chapterProgress.stage === 'complete') chapterUI.complete();
}
function showMenu() {
  dismissDialogs(); menuOpen = true; audio.pause();
  const available = session.main.phase !== 'title';
  openInspection('忘れもの預かり所', '月待駅 · 触れて調べる全十話', `<div class="start-menu"><p class="menu-intro">置いていったものも、忘れものになるんだ。</p><button class="primary" id="new-game">はじめから</button><button class="quiet" id="continue-game" ${available ? '' : 'disabled'}>つづきから</button><p class="inspect-help">${available ? `第${session.main.chapter}話「${escape(CHAPTERS[session.main.chapter]?.title || '最後の列車')}」から再開` : 'まだ続きの記録はありません。'}</p><button class="quiet" id="chapter-select" ${session.unlocked ? '' : 'disabled'}>クリアした章を遊ぶ</button><p class="inspect-help">${session.unlocked ? `${session.unlocked}話まで選べます。遊び直しても、本編の続きは残ります。` : '章をクリアすると選べるようになります。'}</p></div>`, () => {
    $('continue-game').onclick = () => enterGame(false);
    $('chapter-select').onclick = showChapters;
    $('new-game').onclick = () => available ? confirmNew() : beginNew();
  });
}
function beginNew() { session = startNew(session); save(); enterGame(false); }
function confirmNew() {
  openInspection('はじめから遊びますか？', '本編の進行について', '<p>「つづきから」の記録を、新しい物語で上書きします。</p><p>クリアした章と音量設定は残ります。</p><div class="menu-actions"><button class="primary" id="confirm-new">はじめから遊ぶ</button><button class="quiet" id="cancel-new">やめる</button></div>', () => { $('confirm-new').onclick = beginNew; $('cancel-new').onclick = showMenu; });
}
function showChapters() {
  dismissDialogs(); menuOpen = true; audio.pause();
  openInspection('クリアした章を遊ぶ', '本編の続きは、そのままに', `<p class="inspect-help">選んだ章を、導入から謎解きまで遊び直せます。</p>${session.replay ? `<button class="quiet" id="resume-replay">第${session.replay.chapter}話の遊び直しを再開</button>` : ''}<div class="chapter-list">${Array.from({ length: 10 }, (_, i) => { const id = i + 1; return `<button class="chapter-choice" data-chapter="${id}" ${id > session.unlocked ? 'disabled' : ''}><span>第${id}話</span><strong>${id <= session.unlocked ? escape(CHAPTERS[id]?.title || '最後の列車') : '未クリア'}</strong></button>`; }).join('')}</div><button class="quiet" id="back-menu">開始画面へ戻る</button>`, () => {
    for (const button of inspect.querySelectorAll('[data-chapter]')) button.onclick = () => {
      const chapter = Number(button.dataset.chapter);
      if (session.replay && !(session.replay.chapter === 1 ? session.replay.phase === 'complete' : session.replay.chapterProgress.stage === 'complete')) {
        openInspection('遊び直す章を変えますか？', '本編の続きは残ります', '<p>遊び直し中の記録を、選んだ章の最初に置き換えます。</p><button class="primary" id="confirm-replay">この章をはじめから遊ぶ</button><button class="quiet" id="cancel-replay">やめる</button>', () => { $('confirm-replay').onclick = () => beginReplay(chapter); $('cancel-replay').onclick = showChapters; });
      } else beginReplay(chapter);
    };
    if ($('resume-replay')) $('resume-replay').onclick = () => enterGame(true);
    $('back-menu').onclick = showMenu;
  });
}
function beginReplay(chapter) { session = startReplay(session, chapter); save(); enterGame(true); }
function replayComplete() {
  openInspection('章の遊び直し · 了', `第${state.chapter}話「${CHAPTERS[state.chapter]?.title || '最後の列車'}」`, '<p>この章の物語を、もう一度胸にしまった。</p><p class="inspect-help">本編の続きは、開始画面の「つづきから」で再開できます。</p><div class="menu-actions"><button class="primary" id="replay-select">別のクリアした章を遊ぶ</button><button class="quiet" id="replay-menu">開始画面へ戻る</button></div>', () => { $('replay-select').onclick = showChapters; $('replay-menu').onclick = showMenu; });
}
$('menu').onclick = showMenu; $('story-menu').onclick = showMenu;
renderRoom(); showMenu();
