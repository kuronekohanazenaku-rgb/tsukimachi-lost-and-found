const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const captions = {
  musicbox: ['手回し音楽箱', '部品の模様：花・月・鳥'], umbrella: ['青い傘', '貸出番号 U-12'],
  key: ['鍵の刻印', 'K ・ 7 ・ 丸'], notebook: ['予定帳', '10月29日 — 31日'],
  bag: ['職員私物', 'B-204'], box: ['榊 修一の私物箱', '時計・音楽箱・写真'],
  letter: ['はるちゃんへ', '父さんより'], postcard: ['岬の郵便局で受け取るあなたへ', '佐伯 文'],
};
export function watchFace(back = false) {
  const ticks = Array.from({ length: 60 }, (_, i) => `<path d="M500 ${i % 5 ? 287 : 298}V275" transform="rotate(${i * 6} 500 585)"/>`).join('');
  const numbers = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<text x="${500 + Math.sin(a) * 246}" y="${585 - Math.cos(a) * 246}">${i || 12}</text>`; }).join('');
  return `<svg viewBox="0 0 1000 1000" aria-hidden="true" class="watch-face-overlay">${back ? '<g text-anchor="middle" fill="#302719"><text x="500" y="530" font-size="46">製造番号</text><text x="500" y="630" font-size="112" font-weight="700">417</text></g>' : `<g stroke="#302c24" stroke-width="5">${ticks}</g><g text-anchor="middle" dominant-baseline="central" fill="#302c24" font-family="Georgia,serif" font-size="43">${numbers}</g><g stroke="#262923" stroke-linecap="round"><path d="M500 605V430" stroke-width="17" transform="rotate(200 500 585)"/><path d="M500 607V355" stroke-width="10" transform="rotate(240 500 585)"/></g><circle cx="500" cy="585" r="15" fill="#302c24"/>`}</svg>`;
}
export function itemImage(kind, title, { back = false } = {}) {
  const watch = kind === 'watch', caption = watch ? [back ? '製造番号 417' : '18時40分で止まっている', back ? '懐中時計の裏' : '懐中時計の表'] : captions[kind];
  return `<figure class="item-illustration" data-item-image><div class="item-image-frame"><img src="./assets/${watch ? back ? 'watch-back' : 'watch-front' : esc(kind)}.png" alt="${esc(watch ? back ? '懐中時計の裏。製造番号417' : '18時40分を示したまま止まった懐中時計' : title)}" draggable="false">${watch ? watchFace(back) : ''}</div>${caption ? `<figcaption class="item-image-caption"><strong>${esc(caption[0])}</strong><span>${esc(caption[1])}</span></figcaption>` : ''}</figure>`;
}
export function imageTools() {
  return '<div class="image-tools" role="group" aria-label="品物の表示方法"><button class="quiet" data-art-mode="image" aria-pressed="true">品物の画像</button><button class="quiet" data-art-mode="rotate" aria-pressed="false">回して調べる</button></div>';
}
export function stationClockImage() {
  const dial = watchFace().replace('class="watch-face-overlay">', 'class="watch-face-overlay"><circle cx="500" cy="585" r="345" fill="#dccda8" stroke="#9a794b" stroke-width="35"/>');
  return `<figure class="item-illustration"><div class="item-image-frame">${dial}</div><figcaption class="item-image-caption"><strong>18時40分</strong><span>止まった駅の壁時計</span></figcaption></figure>`;
}
export function bindImageTools(root, stage) {
  for (const button of root.querySelectorAll('[data-art-mode]')) button.onclick = () => {
    const image = button.dataset.artMode === 'image'; root.querySelector('[data-item-image]').hidden = !image; stage.hidden = image;
    for (const sibling of root.querySelectorAll('[data-art-mode]')) sibling.setAttribute('aria-pressed', String(sibling === button));
  };
}
