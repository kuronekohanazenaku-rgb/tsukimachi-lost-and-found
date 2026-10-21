import { CHAPTERS, LAST_WORDS, chapterCanSubmit } from './chapters.js';
import { EVIDENCE, RECOLLECTION } from './game.js';
import { createItemViewer } from './item-viewer.js?v=detail-1';
import { itemImage, imageTools, bindImageTools } from './inspection-art.js';
import { visibleChapterDocuments, dropAction, pieceLabel } from './chapter-presentation.js';

const numbers = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export function createChapterUI(api) {
  const { getState, act, escape: esc, openInspection: open, closeInspection: close, setViewer, toast } = api;
  const $ = id => document.getElementById(id);
  const current = () => { const s = getState(); return { s, id: s.chapter, c: CHAPTERS[s.chapter], p: s.chapterProgress }; };
  function docPaper(key) { const { c } = current(), doc = c.docs[key]; return `<article class="paper"><h3>${esc(doc.title)}</h3><p>${esc(doc.text)}</p></article>`; }
  function openDoc(key) {
    const { c, p } = current(); if (!p.received) act({ type: 'CH_RECEIVE' });
    if (key === 'reveal' && !p.solved) return;
    act({ type: 'CH_VIEW', id: key });
    open(c.docs[key].title, '手に取った記録', docPaper(key));
  }
  function renderRoom() {
    const { id, c, p } = current();
    $('chapter-label').textContent = `CHAPTER ${String(id).padStart(2, '0')} · 月待駅`;
    $('chapter-title').textContent = c.title;
    $('clue-count').textContent = `${c.required.filter(key => p.viewed.includes(key)).length} / ${c.required.length}`;
    $('room').classList.toggle('finished', p.returned); $('room').classList.add('later-chapter');
    const dawn = id === 10 && (['epilogue', 'complete'].includes(p.stage) || (p.stage === 'recollection' && p.index === 2));
    const nextBackground = new URL(`./assets/${dawn ? 'station-morning' : 'station'}.png`, import.meta.url).href;
    if ($('room-image').src !== nextBackground) $('room-image').src = nextBackground;
    document.body.classList.toggle('morning', dawn);
    $('objective').textContent = p.stage === 'complete' ? id === 10 ? '父への返事を、胸にしまう。' : `第${numbers[id]}話を終えた。` : p.returned ? '品物に残った記憶に、耳を澄ます。' : '気になるものに、触れてみよう。';
    $('scene-note').textContent = p.returned ? id === 10 ? '夜の窓口に、朝の光が届いた。' : '品物は消え、記憶が残っている。' : p.received ? '品物と、残された記録を照らし合わせよう。' : '棚のベルが、もう一度鳴った。';
    $('watch').classList.add('chapter-item'); $('watch').setAttribute('aria-label', `棚の${c.item}を手に取る`);
    $('watch-image').src = `./assets/${c.art}.png`;
    $('ticket').hidden = true;
    const keys = visibleChapterDocuments(id, p), boardKey = keys[0];
    $('timetable').hidden = !boardKey;
    if (boardKey) { $('board-caption').textContent = c.docs[boardKey].title; $('timetable').setAttribute('aria-label', `${c.docs[boardKey].title}を調べる`); }
    $('drawer').setAttribute('aria-label', '引き出しの資料を調べる'); $('drawer-tag').textContent = '記録';
    $('return-box').setAttribute('aria-label', p.stage === 'complete' ? 'この話の控えを読む' : c.mode === 'receive' ? '手紙の受取人を確かめる' : c.mode === 'open' ? '父の箱を開く準備をする' : '右の返却箱を調べる');
    $('box-caption').textContent = c.mode === 'receive' ? '受取票' : c.mode === 'open' ? '確認票' : '返却箱';
    const positions = [[34, 65, -7], [68, 66, 8], [21, 66, 2]];
    $('chapter-docs').innerHTML = keys.slice(1).map((key, index) => { const [x, y, rotate] = positions[index]; return `<button class="hotspot document-prop" data-document="${esc(key)}" aria-label="${esc(c.docs[key].title)}を調べる" style="left:${x}%;top:${y}%;transform:rotate(${rotate}deg)"><span aria-hidden="true">${esc(c.docs[key].title)}</span><i aria-hidden="true">────<br>── ──</i></button>`; }).join('');
    for (const button of $('chapter-docs').querySelectorAll('[data-document]')) button.onclick = () => openDoc(button.dataset.document);
  }
  function openItem() {
    const { c, p } = current(); if (!p.received) act({ type: 'CH_RECEIVE' }); act({ type: 'CH_VIEW', id: 'item' });
    open(c.item, '手に取って、角度を変える', `${imageTools()}${itemImage(c.art, c.item)}<div id="item-stage" hidden><canvas id="item-canvas" class="inspection-canvas" tabindex="0" role="img" aria-label="${esc(c.item)}。ドラッグか矢印キーで回して調べる。"></canvas><p class="inspect-help">指でドラッグして回す · 二本指で拡大と縮小</p><div class="rotation-tools"><button class="quiet" id="item-zoom-in">＋ 拡大</button><button class="quiet" id="item-zoom-out">− 縮小</button><button class="quiet" id="item-reset">正面へ戻す</button></div></div>${docPaper('item')}${c.puzzle ? `<button class="primary" id="item-puzzle">${esc(c.puzzle.title)}</button>` : ''}${p.solved && c.docs.reveal ? '<button class="quiet" id="item-reveal">開いた記録を読む</button>' : ''}`, () => {
      bindImageTools($('inspect-content'), $('item-stage'));
      let fallback = false;
      const objectViewer = createItemViewer($('item-canvas'), c.art, { solved: p.solved, onUnavailable: () => { fallback = true; $('item-stage').innerHTML = `<div class="fallback-photos"><p class="inspect-help">この環境では3Dを使えないため、写真で品物を調べます。</p><img src="./assets/${c.art}.png" alt="${esc(c.item)}"></div>`; } });
      setViewer(objectViewer);
      if (!fallback) { $('item-zoom-in').onclick = () => objectViewer.zoom(-0.4); $('item-zoom-out').onclick = () => objectViewer.zoom(0.4); $('item-reset').onclick = objectViewer.reset; }
      if ($('item-puzzle')) $('item-puzzle').onclick = () => puzzle();
      if ($('item-reveal')) $('item-reveal').onclick = () => openDoc('reveal');
    });
  }
  function drawer() {
    const { id, c, p } = current(); if (!p.received) act({ type: 'CH_RECEIVE' });
    const keys = visibleChapterDocuments(id, p);
    open('資料の引き出し', '取り出した紙を、手に取る', `<div class="document-pile">${keys.map(key => `<button class="paper-sheet" data-paper="${esc(key)}"><span>${esc(c.docs[key].title)}</span><i aria-hidden="true">──────<br>── ───<br>── ───</i></button>`).join('')}</div>`, () => { for (const button of $('inspect-content').querySelectorAll('[data-paper]')) button.onclick = () => openDoc(button.dataset.paper); });
  }
  function board() { const { id, p } = current(); const key = visibleChapterDocuments(id, p)[0]; if (key) openDoc(key); }
  function puzzle(message = '', back = false, selected = '') {
    const { id, c, p } = current(), q = c.puzzle; if (!q) return;
    if (!p.received) { act({ type: 'CH_RECEIVE' }); act({ type: 'CH_VIEW', id: 'item' }); }
    const fragment = value => {
      if (!q.grid || !value || back) return '';
      const quadrant = q.answer.indexOf(value), x = quadrant % 2 ? '100%' : '0%', y = quadrant > 1 ? '100%' : '0%';
      return `<span class="photo-piece" style="background-position:${x} ${y}" aria-hidden="true"></span>`;
    };
    open(q.title, '品物を動かして、記録をつなぐ', `<p>${esc(q.instruction)}</p><p class="inspect-help">部品を枠までドラッグ。タップで品物を選び、枠を押して置くこともできます。</p>${q.grid ? `<button class="quiet" id="photo-side">写真の${back ? '表' : '裏'}を見る</button>` : ''}<div class="puzzle-pieces ${q.grid ? 'photo-pieces' : ''}">${q.choices.map(value => `<button class="puzzle-token ${selected === value ? 'selected' : ''}" data-piece="${esc(value)}" aria-label="${esc(pieceLabel(q, value, back))}" aria-pressed="${selected === value}" ${p.solved ? 'disabled' : ''}>${fragment(value)}<span>${esc(pieceLabel(q, value, back))}</span></button>`).join('')}</div><div class="puzzle-slots ${q.grid ? 'photo-slots' : ''}">${p.slots.map((value, slot) => `<button class="puzzle-slot" data-slot="${slot}" aria-label="${slot + 1}番目の枠：${esc(pieceLabel(q, value, back))}" ${p.solved ? 'disabled' : ''}>${fragment(value)}<span>${q.grid ? ['左上', '右上', '左下', '右下'][slot] : `${slot + 1}番目`}：${esc(pieceLabel(q, value, back))}</span></button>`).join('')}</div><p role="status" class="discovery">${esc(message || (p.solved ? '記録と一致した。奥の記録を確認しよう。' : selected ? `${pieceLabel(q, selected, back)}を置く枠を選ぶ。` : '置いた品物は、あとから交換できます。'))}</p>${p.solved ? '<button class="primary" id="read-reveal">開いた記録を読む</button>' : `<button class="primary" id="solve-puzzle" ${p.slots.some(value => !value) ? 'disabled' : ''}>配置を確かめる</button>`}`, () => {
      if ($('photo-side')) $('photo-side').onclick = () => puzzle('', !back, selected);
      const controller = new AbortController(); let ghost = null;
      setViewer({ dispose() { controller.abort(); ghost?.remove(); } });
      const place = (value, slot) => { const action = dropAction(id, getState().chapterProgress, value, slot); if (action) { act(action); puzzle('', back); } };
      for (const token of $('inspect-content').querySelectorAll('[data-piece]')) {
        let start = null, moved = false;
        token.addEventListener('pointerdown', e => { if (p.solved) return; start = { x: e.clientX, y: e.clientY, id: e.pointerId }; moved = false; token.setPointerCapture(e.pointerId); }, { signal: controller.signal });
        token.addEventListener('pointermove', e => { if (!start) return; if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 6) moved = true; if (!moved) return; e.preventDefault(); if (!ghost) { ghost = token.cloneNode(true); ghost.removeAttribute('id'); ghost.removeAttribute('data-piece'); ghost.classList.add('puzzle-ghost'); ghost.style.width = `${Math.min(token.clientWidth, 130)}px`; $('inspect-dialog').append(ghost); } ghost.style.left = `${e.clientX + 12}px`; ghost.style.top = `${e.clientY - 30}px`; }, { signal: controller.signal });
        token.addEventListener('pointerup', e => { if (!start) return; const value = token.dataset.piece; start = null; ghost?.remove(); ghost = null; if (moved) { const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-slot]'); if (target) place(value, Number(target.dataset.slot)); } else puzzle('', back, selected === value ? '' : value); }, { signal: controller.signal });
        for (const event of ['pointercancel', 'lostpointercapture']) token.addEventListener(event, () => { start = null; ghost?.remove(); ghost = null; }, { signal: controller.signal });
        token.addEventListener('click', e => { if (e.detail === 0) puzzle('', back, selected === token.dataset.piece ? '' : token.dataset.piece); }, { signal: controller.signal });
      }
      for (const slot of $('inspect-content').querySelectorAll('[data-slot]')) slot.onclick = () => { if (selected) place(selected, Number(slot.dataset.slot)); };
      if ($('solve-puzzle')) $('solve-puzzle').onclick = () => { const error = act({ type: 'CH_SOLVE' }); puzzle(error || '', back); };
      if ($('read-reveal')) $('read-reveal').onclick = () => openDoc('reveal');
    });
  }
  function returnForm(message = '') {
    const { id, c, p } = current(); if (p.stage === 'complete') return complete();
    if (p.returned) { close(); showStory(); return; }
    const options = (values, chosen) => '<option value="">選んでください</option>' + values.map(value => `<option ${chosen === value ? 'selected' : ''}>${esc(value)}</option>`).join('');
    const heading = c.mode === 'receive' ? '受取票' : c.mode === 'open' ? '箱の確認票' : '返却票';
    open(heading, c.mode === 'open' ? '記録のそろった留め具に触れる' : '記録に残る名前を、確かめる', `<article class="paper"><h3>${heading}</h3><div class="fields">${c.owners.length ? `<label>${c.mode === 'receive' ? '受取人' : '持ち主'}<select id="owner" aria-label="${c.mode === 'receive' ? '受取人' : '持ち主'}">${options(c.owners, p.owner)}</select></label>` : ''}${c.destinations.length ? `<label>届け先<select id="destination" aria-label="届け先">${options(c.destinations, p.destination)}</select></label>` : ''}</div><button class="primary" id="submit-return">${c.mode === 'open' ? '箱を開く' : c.mode === 'receive' ? '手紙を受け取る' : '品物を返却箱に入れる'}</button></article><ul class="checklist">${c.required.map(key => `<li class="${p.viewed.includes(key) ? 'seen' : ''}">${p.viewed.includes(key) ? '✓' : '○'} ${esc(c.docs[key].title)}</li>`).join('')}</ul>${c.puzzle && !p.solved ? `<p class="missing">品物を手に取って、${esc(c.puzzle.title)}を確かめよう。</p>` : ''}<p role="status" class="discovery">${esc(message)}</p>`, () => {
      const refresh = () => { const progress = getState().chapterProgress; $('submit-return').disabled = !chapterCanSubmit(id, progress) || (c.owners.length > 0 && !progress.owner) || (c.destinations.length > 0 && !progress.destination); };
      if ($('owner')) $('owner').onchange = e => { act({ type: 'CH_OWNER', value: e.target.value }); refresh(); };
      if ($('destination')) $('destination').onchange = e => { act({ type: 'CH_DESTINATION', value: e.target.value }); refresh(); };
      refresh(); $('submit-return').onclick = () => { const error = act({ type: 'CH_SUBMIT' }); if (error) returnForm(error); else { close(); showStory(); } };
    });
  }
  function showStory() {
    const { id, c, p } = current();
    if (p.stage === 'epilogue') return epilogue();
    if (!['intro', 'recollection'].includes(p.stage)) return;
    const recalling = p.stage === 'recollection', pages = recalling ? c.recollection : c.intro;
    $('story-label').textContent = `第${numbers[id]}話 · ${recalling ? '品物に残った記憶' : c.title}　${p.index + 1} / ${pages.length}`;
    $('story-text').textContent = pages[p.index];
    $('story-next').textContent = p.index === pages.length - 1 ? recalling ? id === 10 ? '画面に触れて、父への返事を書く →' : '画面に触れて、記憶を胸にしまう →' : '画面に触れて、窓口を調べる →' : '画面に触れて、つづきを読む →';
    document.body.classList.add('modal-open'); if (!$('story-dialog').open) $('story-dialog').showModal();
  }
  function advanceStory() {
    act({ type: 'CH_ADVANCE' }); const { p } = current();
    if (['intro', 'recollection'].includes(p.stage)) showStory();
    else { $('story-dialog').close(); document.body.classList.remove('modal-open'); if (p.stage === 'epilogue') epilogue(); else if (p.stage === 'complete') complete(); }
  }
  function epilogue() {
    open('父への返事', '朝の資料室', '<article class="paper"><p>父へ。\n\nうまく言えないことが、私にもあります。\nそれでも、今日は続きを書いてみます。</p><p class="ink-note">最後の一文を、自分の言葉で選ぶ。</p>' + LAST_WORDS.map(value => `<button class="reply-card" data-last-words="${esc(value)}">${esc(value)}</button>`).join('') + '</article><p class="inspect-help">どの言葉でも、気持ちのままに選んでください。</p>', () => { for (const button of $('inspect-content').querySelectorAll('[data-last-words]')) button.onclick = () => { act({ type: 'CH_LAST_WORDS', value: button.dataset.lastWords }); complete(); }; });
  }
  function complete() {
    if (api.isReplay?.()) return api.replayComplete();
    const { id, c, p } = current();
    const text = id === 10 ? `父へ。\n\n${p.lastWords}。\n\n返事を届ける場所は、もうない。けれど、書きたいことはあった。` : c.time ? `品物：${c.item}\n持ち主：${c.owner}\n届け先：${c.destination}\n受付時刻：10月31日 ${c.time}` : '品物に残った記憶を、胸にしまった。';
    open(id === 10 ? '忘れもの預かり所 · 完' : '窓口に残った記録', `第${numbers[id]}話 · 了 / 全十話`, `<article class="paper"><h3>${esc(c.title)}</h3><p>${esc(text)}</p></article>${id < 10 ? `<button class="primary" id="next-chapter">第${numbers[id + 1]}話「${esc(CHAPTERS[id + 1].title)}」へ</button>` : ''}<button class="quiet" id="chapter-replay">回想を読み返す</button> <button class="quiet" id="chapter-archive">返却控えと過去の記録</button> <button class="quiet" id="chapter-reinspect">品物をもう一度手に取る</button>`, () => {
      if ($('next-chapter')) $('next-chapter').onclick = () => { act({ type: 'NEXT_CHAPTER' }); close(); showStory(); };
      $('chapter-replay').onclick = () => { act({ type: 'CH_REPLAY' }); close(); showStory(); };
      $('chapter-archive').onclick = journal; $('chapter-reinspect').onclick = openItem;
    });
  }
  function journal() {
    const { s, id, c, p } = current();
    const currentNotes = Object.entries(c.docs).filter(([key]) => p.viewed.includes(key)).map(([, doc]) => `<article class="archive-note"><h3>${esc(doc.title)}</h3><p>${esc(doc.text)}</p></article>`).join('');
    const prior = s.completed.map(chapter => { const old = CHAPTERS[chapter]; return `<details class="archive-note"><summary>第${numbers[chapter]}話 · ${esc(old?.title || '最後の列車')}</summary><p>${esc(old ? old.time ? `品物：${old.item}\n持ち主：${old.owner}\n届け先：${old.destination}\n受付時刻：10月31日 ${old.time}` : `${old.item}の記録` : EVIDENCE.receipt.text)}</p>${Object.values(old?.docs || EVIDENCE).map(doc => `<h4>${esc(doc.title)}</h4><p>${esc(doc.text || doc.rows.map(row => row.join(' ／ ')).join('\n'))}</p>`).join('')}<h4>品物に残った記憶</h4><p>${esc((old?.recollection || RECOLLECTION).join('\n\n'))}</p></details>`; }).join('');
    open('手がかりの手帳', `第${numbers[id]}話 · 確認した記録`, currentNotes + (c.required.some(key => !p.viewed.includes(key)) ? '<p class="inspect-help">まだ読んでいない記録がある。窓口を調べてみよう。</p>' : '') + '<h3 class="archive-heading">返却控えと過去の記録</h3>' + prior);
  }
  function hints() {
    const { c, p } = current();
    open('小さな手がかり', '必要なときだけ、少しずつ', c.hints.slice(0, p.hintLevel).map((text, index) => `<div class="hint-answer"><p class="eyebrow">${index + 1}段階目</p><p>${esc(text)}</p></div>`).join('') + (p.hintLevel < 3 ? `<button class="quiet" id="chapter-hint">${p.hintLevel === 2 ? '答えを含む最後のヒントを開く' : '次のヒントを開く'}</button>` : ''), () => { if ($('chapter-hint')) $('chapter-hint').onclick = () => { act({ type: 'CH_HINT' }); hints(); }; });
  }
  return { renderRoom, openItem, drawer, board, returnForm, showStory, advanceStory, complete, journal, hints };
}
