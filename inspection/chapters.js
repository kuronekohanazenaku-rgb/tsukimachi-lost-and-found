const doc = (title, text) => ({ title, text });
const arrange = (title, instruction, choices, answer, grid = false) => ({ title, instruction, choices, answer, grid });
export const LAST_WORDS = ['ありがとう', '寂しかったよ', 'もう少し話したかった'];
export const CHAPTERS = {
  2: {
    title: '鳴らなかった音楽箱', item: '手回しの音楽箱', art: 'musicbox', time: '17:50',
    intro: ['棚のベルが、もう一度鳴った。\n\n届いたのは、手のひらほどの音楽箱。小さなクランクは、途中で引っかかっている。', 'ふたの内側に説明カードが挟まっていた。\n\n仕組みを戻せば、奥の小さな引き出しも開きそうだ。'],
    docs: {
      item: doc('音楽箱の中', '外れた三つの部品には「月」「鳥」「花」の模様がある。\n色ではなく、文字と模様で見分けられる。'),
      card: doc('説明カード', '左から三つの枠へ。\n\n月は鳥より前。\n花は鳥のすぐあと。'),
      record: doc('修理記録', '10月31日\n音楽箱の軸を調整。外した部品をカードの順に戻す。\n担当：榊 修一'),
      postcard: doc('父の絵葉書', 'ハルへ\n\n父・修一\n\n遺品の中にあった、月待駅の絵葉書。署名は父の名前を示している。'),
      reveal: doc('発表会の受付票', '出演者：川瀬 灯\n会場：花浜文化館\n持込品：手回し音楽箱\n\n本人に届ける品物は、会場の受付へ。'),
    }, required: ['item', 'card', 'record', 'postcard', 'reveal'],
    puzzle: arrange('部品を戻す', '部品を選んで、左から三つの枠へ置こう。', ['花', '月', '鳥'], ['月', '鳥', '花']),
    owners: ['森田 澄', '川瀬 灯', '榊 修一'], destinations: ['雨野診療所', '月待資料室', '花浜文化館'], owner: '川瀬 灯', destination: '花浜文化館',
    hints: ['説明カードの二つの条件を、一緒に満たす順を考えよう。', '鳥のすぐあとには花。月は、その鳥より前に置く。', '左から「月→鳥→花」。受付票の宛名は「川瀬 灯／花浜文化館」。'],
    recollection: ['発表会の朝、灯は改札まで来て、引き返した。\n\n自分で作った音楽箱の音が、急に頼りなく思えた。', '修一は、窓口に残った箱を直した。\n\n「途中で止まっても、続きからやればいい」\n\n翌日来た灯に、そう言ってクランクを回した。', '修理記録の「榊 修一」。絵葉書の「父・修一」。\n\n同じ名前。あの駅員は、父だった。\n\n知らなかった父の声が、音楽箱の短い旋律に重なった。'],
  },
  3: {
    title: '写真の外側', item: '閉駅の日の集合写真', art: 'photo', time: '19:10',
    intro: ['四つに分かれた写真が届いた。\n\n古い駅舎の前に、何人かの駅員が立っている。父は、この中にいたのだろうか。', '顔は小さく、はっきりしない。\n\n写真の枠と裏の管理番号なら、きちんとつなげられそうだ。'],
    docs: {
      item: doc('四つの写真片', '写真片は回転しない。角の位置と、裏の文字を合わせよう。\n\n左上の断片には「B-」、右上には「2」、左下には「0」、右下には「4」。'),
      card: doc('写真整理の規則', '外周の角を四隅へ合わせる。\n裏の管理番号は、上段を左から、次に下段を左から読む。\n\n人物の顔や人数は、照合に使わない。'),
      ledger: doc('写真保管台帳', 'B-204／榊 修一／職員私物棚B\nB-240／森田 澄／売店保管棚\nA-204／川瀬 灯／花浜文化館'),
      reveal: doc('復元した管理番号', '管理番号：B-204\n\n職員私物棚Bの資料に、閉駅後の「移送」印が残っている。移送先の欄は、別の伝票を参照するよう書かれている。'),
    }, required: ['item', 'card', 'ledger', 'reveal'],
    puzzle: arrange('写真を復元する', '写真片を選んで、2×2の枠へ置こう。表・裏を切り替えて確認できる。', ['右下 · 4', '左上 · B-', '左下 · 0', '右上 · 2'], ['左上 · B-', '右上 · 2', '左下 · 0', '右下 · 4'], true),
    owners: ['川瀬 灯', '榊 修一', '森田 澄'], destinations: ['売店保管棚', '花浜文化館', '職員私物棚B'], owner: '榊 修一', destination: '職員私物棚B',
    hints: ['写真の角と裏面の文字を、整理の規則どおりにつなごう。', '上段は「B-」「2」。下段は「0」「4」。', '管理番号はB-204。台帳の持ち主は「榊 修一」、保管先は「職員私物棚B」。'],
    recollection: ['最後の列車が出たあと、職員たちは駅舎の前に並んだ。\n\n修一は、写真の端に立った。', '「一枚、分けてもらえますか。子どもに見せたくて」\n\n家で待つ六歳のハルに、この駅の話をするつもりだった。', '父が遅く帰る夜、私は窓の外を見ていた。\n\n父も私を思い出していた。そのことを知っても、あの夜の寂しさは消えない。\n\nそれでも、この写真は受け取っておきたい。'],
  },
  4: {
    title: '雨を待つ傘', item: '青い傘', art: 'umbrella', time: '16:15',
    intro: ['棚に、雨の匂いが残った傘が届いた。\n\n乾いた窓口なのに、布の先から一滴だけ、水が落ちた。', '木の持ち手に、小さな貸出タグ。\n\n傘と一緒に、返送先を書いたカードも挟まっている。'],
    docs: {
      item: doc('傘の貸出タグ', '青い布の傘。持ち手の貸出番号：U-12'),
      ledger: doc('傘の貸出台帳', 'U-08／伊藤 和\nU-12／水野 千代\nU-21／青木 葉'),
      card: doc('返送カード', '借りた傘は勤務先へお願いします。\n\n水野 千代\n勤務先：雨野診療所'),
    }, required: ['item', 'ledger', 'card'], puzzle: null,
    owners: ['伊藤 和', '青木 葉', '水野 千代'], destinations: ['月待資料室', '雨野診療所', '花浜文化館'], owner: '水野 千代', destination: '雨野診療所',
    hints: ['貸出タグの番号を、台帳で探そう。届け先はカードにある。', 'タグはU-12。台帳のU-12と、返送カードの署名は同じ名前。', '「水野 千代／雨野診療所」。タグ・台帳・返送カードを確認して返却しよう。'],
    recollection: ['千代は、迎えの来ない駅で待っていた。\n\n何度も時計を見て、そのたびに傘を握り直した。', '修一は、窓口の奥から椅子をもう一脚出した。\n\n「ここなら、風が当たりません」\n\n急かす言葉も、元気を出せという言葉もなかった。', '誰かを待つ時間は、長い。\n\n父は、その長さを知っていたのだろうか。\n\n椅子を出す手つきだけが、静かに残っていた。'],
  },
  5: {
    title: '届かなかった絵葉書', item: '書きかけの絵葉書', art: 'postcard', time: '16:45',
    intro: ['灯台の描かれた絵葉書が届いた。\n\n裏の文章は途中で止まり、切手もまだ貼られていない。', '「海の灯台がある町へ」\n\n宛先の町を、路線図と案内から確かめてみよう。'],
    docs: {
      item: doc('絵葉書の裏', '岬の郵便局で受け取るあなたへ。\n\nあの日は、うまく言えませんでした。\n\n佐伯 文\n\n追記：送る前に、もう一度書き直したい。'),
      card: doc('路線図と町案内', '月待→花浜\n花浜→岬\n花浜→雨野\n\n町案内：岬は海の灯台の町。雨野は山の診療所の町。\n\n月待から、海の灯台がある町へ。'),
      reveal: doc('岬局の局留め登録', 'P-05／佐伯 文／岬郵便局留め\n\n書き直すために差出人へ返す。投函は本人に委ねる。'),
    }, required: ['item', 'card', 'reveal'],
    puzzle: arrange('道筋をたどる', '月待の次の町、終点の順に置こう。', ['雨野', '岬', '花浜'], ['花浜', '岬']),
    owners: ['川瀬 灯', '佐伯 文', '水野 千代'], destinations: ['花浜文化館', '雨野診療所', '岬郵便局留め'], owner: '佐伯 文', destination: '岬郵便局留め',
    hints: ['月待から出る線は花浜へ。灯台の町は案内に書かれている。', '最初は花浜、終点は岬。書き直したい葉書は差出人へ戻す。', '道筋は「花浜→岬」。返却票は「佐伯 文／岬郵便局留め」。'],
    recollection: ['文は、書きかけの葉書を窓口に差し出した。\n\n「これ、まだ送らないでください」', '修一は、宛名のない葉書を裏返した。\n\n「では、決まるまで預かっておきます」\n\n続きを代わりに書くことも、勝手に投函することもしなかった。', '誰かの言葉を、誰かが完成させることはできない。\n\nもし父に返事を書くなら、私の言葉を選びたい。\n\nまだ何を書くのかは、分からなかった。'],
  },
  6: {
    title: '預けられた鍵', item: '小さな真鍮の鍵', art: 'key', time: '17:10',
    intro: ['小さな鍵が、受け取り棚に載っている。\n\n握られてきたところだけ、真鍮が明るく光っていた。', '似た鍵が、台帳にはいくつもある。\n\n文字と番号と形。三つとも合うものを探そう。'],
    docs: {
      item: doc('鍵の刻印', '文字：K\n番号：7\n形の印：丸\n\n三つすべてを照合する。'),
      ledger: doc('鍵の管理台帳', 'K・7・丸／小野 誠／花浜工房\nK・7・四角／小野 紬／雨野倉庫\nM・7・丸／市田 清／月待資料室'),
      reveal: doc('貸出確認票', '一致：K・7・丸\n持ち主：小野 誠\n届け先：花浜工房'),
    }, required: ['item', 'ledger', 'reveal'],
    puzzle: arrange('一致する鍵を選ぶ', '刻印の三条件がすべて合う行を、一つ置こう。', ['K・7・四角', 'M・7・丸', 'K・7・丸'], ['K・7・丸']),
    owners: ['市田 清', '小野 誠', '小野 紬'], destinations: ['雨野倉庫', '花浜工房', '月待資料室'], owner: '小野 誠', destination: '花浜工房',
    hints: ['Kだけで選ばず、番号と形の印も確認しよう。', '刻印は「K・7・丸」。似た行の違いは四角、またはM。', '選ぶ行は「K・7・丸」。返却は「小野 誠／花浜工房」。'],
    recollection: ['工房を閉めた誠は、鍵を預けに来た。\n\nまた開けるつもりも、捨てるつもりも、まだなかった。', '修一が持っていた壊れた留め具を、誠が見つけた。\n\n「それ、私なら直せますよ」\n\n修一は少し迷ってから、手渡した。', '父も、誰かに頼ることがあった。\n\n何でも直せる人ではなかった。\n\n窓口には、預ける側と預かる側が、交互に座っていたのかもしれない。'],
  },
  7: {
    title: '空白の一日', item: '古い予定帳', art: 'notebook', time: '18:55',
    intro: ['開いた予定帳に、三枚のメモが挟まっていた。\n\n日にちだけ書かれた枠には、まだ何も入っていない。', '空欄に、理由を想像して書き込む必要はない。\n\n残っている日付だけを、正しいところへ戻そう。'],
    docs: {
      item: doc('予定帳の三つの欄', '10月29日／10月30日／10月31日\n\n日付の順に、対応するメモを入れる。'),
      card: doc('挟まっていたメモ', '10月31日・休日申請\n10月29日・見積り\n10月30日・引継ぎ'),
      reveal: doc('受取委任票', '高瀬 直の予定帳\n保管先：月待資料室\n\n本人の希望により、仕事の記録として保管する。'),
    }, required: ['item', 'card', 'reveal'],
    puzzle: arrange('日付を戻す', '29日、30日、31日の順にメモを置こう。', ['31日 · 休日申請', '30日 · 引継ぎ', '29日 · 見積り'], ['29日 · 見積り', '30日 · 引継ぎ', '31日 · 休日申請']),
    owners: ['高瀬 直', '小野 誠', '榊 修一'], destinations: ['花浜工房', '雨野診療所', '月待資料室'], owner: '高瀬 直', destination: '月待資料室',
    hints: ['仕事内容を推測せず、メモの日付を予定欄へ合わせよう。', '29日は見積り、30日は引継ぎ。31日に休日申請が入る。', '「29日・見積り→30日・引継ぎ→31日・休日申請」。委任票は「高瀬 直／月待資料室」。'],
    recollection: ['直の休暇を、修一が代わった。\n\n「家のこと、行ってきてください」\n\nそう言って、自分の帰る時刻を遅らせた。', '窓口の電話の前で、修一はしばらく立っていた。\n\n家にかけるつもりだった。けれど、呼ばれた拍子に、そのまま仕事へ戻ってしまった。', '誰かを助けた日が、私には待つ日だった。\n\nそれも、消えない。\n\n父のことを知るのは、何もかも許すこととは違うのだと思った。'],
  },
  8: {
    title: '水のあとの記録', item: '防水書類袋', art: 'bag', time: null,
    intro: ['防水袋には、泥の跡が残っていた。\n\n中の紙は無事だった。写真で見た管理番号、B-204が並んでいる。', '閉駅の翌日、駅舎は浸水した。\n\n父の箱がどこへ運ばれたのか。伝票を、順につなげてみよう。'],
    docs: {
      item: doc('書類袋のタグ', '職員私物・B-204\n\n浸水から救出した箱に関する移送伝票。'),
      flood: doc('浸水記録', '閉駅の翌日、11月1日。\n職員私物棚Bを含む資料を救出し、順次別施設へ移送。\n元の棚番号を、移送先でも保持する。'),
      card: doc('移送伝票', '11月2日：B-204／職員私物棚B→旧倉庫A\n11月5日：B-204／旧倉庫A→花浜保管庫\n翌年4月12日：B-204／花浜保管庫→月待資料室・未整理棚C\n\n別件：B-240／旧倉庫A→雨野倉庫'),
      reveal: doc('現在の管理票', '書類の管理元：月待駅務室\n保管先：月待資料室・未整理棚C\n\nB-204の私物箱は、未整理棚Cに残っている。持ち主の転居後、連絡先の更新はなかった。'),
    }, required: ['item', 'flood', 'card', 'reveal'],
    puzzle: arrange('箱の道筋をつなぐ', '棚Bのあとに通った場所を、順に三つ置こう。箱番号B-204を追う。', ['雨野倉庫', '未整理棚C', '旧倉庫A', '花浜保管庫'], ['旧倉庫A', '花浜保管庫', '未整理棚C']),
    owners: ['花浜工房', '月待駅務室', '雨野診療所'], destinations: ['雨野倉庫', '花浜保管庫', '月待資料室・未整理棚C'], owner: '月待駅務室', destination: '月待資料室・未整理棚C',
    hints: ['出発元と、前の伝票の到着先をつなごう。番号B-204を保つ。', '棚Bから旧倉庫Aへ、その後に花浜保管庫へ。B-240は別の箱。', '「旧倉庫A→花浜保管庫→未整理棚C」。管理元「月待駅務室」、保管先「月待資料室・未整理棚C」。'],
    recollection: ['水の引いた駅で、職員たちは箱を運び出した。\n\n失くさないように番号を写し、新しい棚へ入れた。', '修一は、そのころ町を離れた。\n\n箱は移り、連絡先も変わった。取りに戻るつもりは、何度も後回しになった。\n\nそのまま、二十年が過ぎた。', 'なくなったと思っていたものが、別の場所で残っている。\n\n父の言葉も、どこかに残っているのだろうか。\n\n窓口の奥で、棚のベルが鳴った。'],
  },
  9: {
    title: 'その日、預かった順に', item: '父の私物箱', art: 'box', mode: 'open', time: null,
    intro: ['届いた箱には、「榊 修一」と書かれていた。\n\n留め具の上に、見覚えのある三つの印が並んでいる。', '時計。音楽箱。写真。\n\n箱の指示は「この三つを、10月31日に預かった順に」。\n\n今夜調べた順番とは、違う。'],
    docs: {
      item: doc('箱の指示', '時計・音楽箱・写真。\nこの三つを、10月31日に預かった順に。\n\n三つの返却控えを参照する。'),
      receipts: doc('三つの返却控え', '音楽箱／10月31日 17:50\n懐中時計／10月31日 18:25\n集合写真／10月31日 19:10\n\nこれらは持ち主が当時預けた受付時刻。今夜の返却順ではない。'),
      reveal: doc('留め具の確認', '三つの記録が、時刻順につながった。\n箱の留め具が、静かに外れた。'),
    }, required: ['item', 'receipts', 'reveal'],
    puzzle: arrange('預かった順に', '控えの時刻が早い品物から置こう。', ['時計', '写真', '音楽箱'], ['音楽箱', '時計', '写真']),
    owners: [], destinations: [], owner: '', destination: '',
    hints: ['箱の指示は、その日の受付時刻順。今夜の話数順ではない。', '一番早いのは17:50の音楽箱。次は18:25。', '「音楽箱→時計→写真」。三つの控えと指示を確認し、箱を開こう。'],
    recollection: ['箱の中には、封筒が一枚あった。\n\n角は少し丸くなっていたが、雨にも水にも濡れていない。', '「はるちゃんへ」\n\n父の字だった。\n\n幼いころ、そう呼ばれていたことを思い出した。', '封筒を持つ手を、机の上に置いた。\n\n今すぐ読みたい気持ちと、少し怖い気持ちが、同じ重さであった。\n\n窓口の灯りは、まだ消えていなかった。'],
  },
  10: {
    title: '返せなかった手紙', item: '父からの手紙', art: 'letter', mode: 'receive', time: null,
    intro: ['最後の品物は、手紙だった。\n\n箱の中に残った誕生日カードと、最初の絵葉書を並べてみる。', '誰に届ける手紙なのか。\n\n今度は、知らない誰かの宛名を書くのではない。'],
    docs: {
      item: doc('手紙の宛名', 'はるちゃんへ。\n\n父さんより。'),
      birthday: doc('同封の誕生日カード', 'ハル、六歳の誕生日おめでとう。\n\n父さんより。'),
      postcard: doc('最初の絵葉書', 'ハルへ\n\n父・修一\n\nハルは現在26歳。閉駅は20年前。六歳の誕生日カードの名前と、宛名が一致する。'),
      letter: doc('父の手紙', 'はるちゃんへ。\n\n六歳の誕生日、おめでとう。\n\n今日、駅に音楽箱を忘れた子がいました。直していたら、お前が歌いながら靴を履いていた朝を思い出しました。\n\n駅のみんなで写真も撮りました。お前に見せたくて、一枚もらいました。父さんは、写真の端にいます。\n\n家に帰ったら話そうと思うことが、毎日あります。でも帰ると、うまく話せないまま一日が終わります。\n\n寂しい思いをさせて、ごめん。\n\n今度の休みは、お前の話を聞かせてください。うまく話せなくても、途中まででも、聞きたいです。\n\n父さんより。'),
    }, required: ['item', 'birthday', 'postcard', 'letter'], puzzle: null,
    owners: ['ハル'], destinations: [], owner: 'ハル', destination: '',
    hints: ['封筒だけでなく、誕生日カードと最初の絵葉書も読もう。', 'カードには「ハル、六歳」。絵葉書の宛名も「ハル」。父の手紙の続きも読んでみよう。', 'この手紙の受取人はハル。四つの資料を確認し、「ハル」を選んで「受け取る」。'],
    recollection: ['手紙を返却箱へ入れようとして、手を止めた。\n\nこの手紙を、どこかへ送る必要はない。\n\n受け取るのは、私だった。', '受取人の欄に、ハルと書いた。\n\n封筒を胸に寄せると、窓口の灯りが、ゆっくり消えた。', '朝の資料室。\n\n壁の時計は、変わらず18時40分で止まっている。机には、受け取った手紙が残っていた。\n\n私は絵葉書を裏返して、父への返事を書き始めた。'],
  },
};

export function chapterInitial(id) {
  const c = CHAPTERS[id];
  return { stage: 'intro', received: false, viewed: [], slots: Array(c.puzzle?.answer.length || 0).fill(''), solved: !c.puzzle,
    owner: '', destination: '', hintLevel: 0, index: 0, returned: false, read: false, lastWords: '' };
}
export function chapterCanSubmit(id, p) {
  const c = CHAPTERS[id];
  return p.stage === 'investigation' && p.received && p.solved && c.required.every(key => p.viewed.includes(key)) && !p.returned;
}
export function chapterTransition(id, p, a) {
  const c = CHAPTERS[id]; let next = p, message = null;
  switch (a.type) {
    case 'CH_ADVANCE': {
      if (!['intro', 'recollection'].includes(p.stage)) break;
      const pages = p.stage === 'intro' ? c.intro : c.recollection;
      next = p.index + 1 < pages.length ? { ...p, index: p.index + 1 }
        : { ...p, index: 0, stage: p.stage === 'intro' ? 'investigation' : id === 10 ? 'epilogue' : 'complete', read: p.read || p.stage === 'recollection' };
      break;
    }
    case 'CH_RECEIVE': if (p.stage === 'investigation') next = { ...p, received: true }; break;
    case 'CH_VIEW': if (Object.hasOwn(c.docs, a.id) && p.received && (a.id !== 'reveal' || p.solved) && !p.viewed.includes(a.id)) next = { ...p, viewed: [...p.viewed, a.id] }; break;
    case 'CH_PLACE': {
      if (p.stage !== 'investigation' || !p.received || p.solved || !c.puzzle || !c.puzzle.choices.includes(a.value) || !Number.isInteger(a.slot) || a.slot < 0 || a.slot >= p.slots.length) break;
      const slots = [...p.slots], prior = slots.indexOf(a.value), replaced = slots[a.slot];
      if (prior >= 0) slots[prior] = replaced;
      slots[a.slot] = a.value; next = { ...p, slots }; break;
    }
    case 'CH_SOLVE': {
      if (!c.puzzle || p.solved || !p.received || p.stage !== 'investigation') break;
      const clues = c.required.filter(key => key !== 'reveal');
      if (!clues.every(key => p.viewed.includes(key))) { message = '先に品物と資料を確認しよう。'; break; }
      if (c.puzzle.cipher && p.cipherInput !== c.puzzle.cipher.answer) { message = '確認番号が記録と合っていない。集めた資料の読み順と変換の決まりを、もう一度照らし合わせよう。'; break; }
      if (p.slots.every((value, i) => value === c.puzzle.answer[i])) next = { ...p, solved: true };
      else message = 'まだ記録と合っていないようだ。置いたものは残しておくので、資料を見ながら確かめよう。';
      break;
    }
    case 'CH_CODE': if (c.puzzle?.cipher && p.stage === 'investigation' && p.received && !p.solved && typeof a.value === 'string' && /^\d{0,4}$/.test(a.value)) next = { ...p, cipherInput: a.value }; break;
    case 'CH_OWNER': if (p.stage === 'investigation' && c.owners.includes(a.value)) next = { ...p, owner: a.value }; break;
    case 'CH_DESTINATION': if (p.stage === 'investigation' && c.destinations.includes(a.value)) next = { ...p, destination: a.value }; break;
    case 'CH_SUBMIT': {
      if (!chapterCanSubmit(id, p)) { message = '品物と必須資料を確認し、謎がある場合は解いてから宛名を確かめよう。'; break; }
      if (p.owner !== c.owner || p.destination !== c.destination) {
        next = { ...p, owner: p.owner === c.owner ? p.owner : '', destination: p.destination === c.destination ? p.destination : '' };
        message = '宛名が記録と合っていない。合っている欄は残しておくので、資料を照らし合わせよう。';
      } else next = { ...p, returned: true, stage: 'recollection', index: 0 };
      break;
    }
    case 'CH_HINT': if (p.hintLevel < 3) next = { ...p, hintLevel: p.hintLevel + 1 }; break;
    case 'CH_REPLAY': if (p.stage === 'complete' && p.read) next = { ...p, stage: 'recollection', index: 0 }; break;
    case 'CH_SKIP': if (p.stage === 'recollection' && p.read) next = { ...p, stage: id === 10 ? 'epilogue' : 'complete', index: 0 }; break;
    case 'CH_LAST_WORDS': if (id === 10 && p.stage === 'epilogue' && LAST_WORDS.includes(a.value)) next = { ...p, lastWords: a.value, stage: 'complete' }; break;
  }
  return { state: next, message };
}
export function validChapterProgress(id, p) {
  const c = CHAPTERS[id];
  if (!c || !p || !['intro', 'investigation', 'recollection', 'epilogue', 'complete'].includes(p.stage) ||
    !['received','solved','returned','read'].every(key => typeof p[key] === 'boolean') ||
    !Array.isArray(p.viewed) || new Set(p.viewed).size !== p.viewed.length || !p.viewed.every(key => Object.hasOwn(c.docs, key)) ||
    !Array.isArray(p.slots) || p.slots.length !== (c.puzzle?.answer.length || 0) || !p.slots.every(value => value === '' || c.puzzle?.choices.includes(value)) ||
    new Set(p.slots.filter(Boolean)).size !== p.slots.filter(Boolean).length ||
    !['', ...c.owners].includes(p.owner) || !['', ...c.destinations].includes(p.destination) ||
    !Number.isInteger(p.hintLevel) || p.hintLevel < 0 || p.hintLevel > 3 ||
    !Number.isInteger(p.index) || p.index < 0 || p.index >= (p.stage === 'intro' ? c.intro.length : c.recollection.length) ||
    (!['intro','recollection'].includes(p.stage) && p.index !== 0) ||
    typeof p.lastWords !== 'string' || (p.lastWords !== '' && (id !== 10 || !LAST_WORDS.includes(p.lastWords))) ||
    (p.stage === 'epilogue' && id !== 10)) return false;
  if (!p.received && (p.viewed.length || p.returned || p.slots.some(Boolean))) return false;
  if (p.cipherInput !== undefined && (typeof p.cipherInput !== 'string' || !/^\d{0,4}$/.test(p.cipherInput))) return false;
  if (!c.puzzle && !p.solved) return false;
  if (c.puzzle && p.solved && (!p.received || !p.slots.every((v,i) => v === c.puzzle.answer[i]) || !c.required.filter(k => k !== 'reveal').every(k => p.viewed.includes(k)))) return false;
  if (p.viewed.includes('reveal') && !p.solved) return false;
  if (p.returned !== ['recollection','epilogue','complete'].includes(p.stage)) return false;
  if (p.returned && (!p.received || !p.solved || !c.required.every(k => p.viewed.includes(k)) || p.owner !== c.owner || p.destination !== c.destination)) return false;
  if (['complete','epilogue'].includes(p.stage) && !p.read) return false;
  if (id === 10 && p.stage === 'complete' && !LAST_WORDS.includes(p.lastWords)) return false;
  return true;
}

import { applyCipherContent } from "./cipher-content.js?v=cipher-1";
applyCipherContent(CHAPTERS);
