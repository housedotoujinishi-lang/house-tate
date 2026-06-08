# フィルタ中バナーに具体値を表示（TASK_FILTER_BANNER_VALUE_PACKET_2073）

最終更新：2026-06-08
packet：2073（house-tate-source / 対応 OS packet 662・v0.9.662）
管理：dev / qa
種別：軽めのUI改善（バナー文言の動的値化・局所JS／🟡 MEDIUM）
前提：packet 2070（種別表示）の発展。種別の総称ではなく**実際の値**（今週・架電 等）を出す。

## 1. 目的
packet 2070 は「期間で絞り込み中／カテゴリで絞り込み中」と総称だった。
何で絞っているかを具体的に分かるよう、**実際の選択値**を表示する（例：「今週で絞り込み中」「架電で絞り込み中」「今週・架電で絞り込み中」）。

## 2. 変更内容（最小差分・切替JS 1行）
`renderTaskBoard()` 内のバナー表示切替JS（packet 2066/2070）の `tfb-kind` 設定を、実値ベースに拡張：
```js
const _pLbl={today:'今日',week:'今週',overdue:'期限切れ'}[taskFilter.period]||'期間';
const _parts=[];if(_pAct)_parts.push(_pLbl);if(_cAct)_parts.push(taskFilter.cat);
_k.textContent=_parts.join('・')+'で絞り込み中';
```
- 期間値→ラベル変換（`today→今日` 等、不明値は `期間` にフォールバック）。
- カテゴリは `taskFilter.cat`（select の値＝日本語ラベル：架電/追客/査定/訪問/契約/事務）を直接使用。
- 表示例：期間のみ→「今週で絞り込み中」／カテゴリのみ→「架電で絞り込み中」／両方→「今週・架電で絞り込み中」。
- `textContent` で設定＝XSS安全（select の固定値のみだが原則 textContent）。`taskFilter` は**読み取りのみ**、代入・保存・タブ判定は非変更。diff +1/-1。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20・`renderTaskBoard(` 37→37・`tfb-kind` 2（不変）
- `taskFilter.period=`/`cat=` の代入箇所 7（不変＝追加分は読み取り/オブジェクト参照のみ）

## 4. ui_check（result: PASS）
- 文言の値が可変になるのみ・構造/配色/挙動不変。最長例「今週・架電で絞り込み中」でもバナーは折返し可（2064/2066）でスマホ overflow なし。実機目視可。

## 5. 守った安全境界（赤信号クリア）
- taskFilter 読み取りのみ・保存仕様/データ構造/タブ判定/`renderTaskBoard` 呼び出し 非変更・大規模JS改造なし
- DB/Auth/API/npm install なし・`.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `docs/TASK_FILTER_BANNER_KIND_PACKET_2070.md`（総称表示の前段）
- `index.html` 1834-1843（select 値）・6617付近（切替JS）
- `CHANGELOG.md` — 本記録は packet 2073 で追加
