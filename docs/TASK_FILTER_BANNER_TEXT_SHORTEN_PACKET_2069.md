# フィルタ中バナー 文言短縮（TASK_FILTER_BANNER_TEXT_SHORTEN_PACKET_2069）

最終更新：2026-06-08
packet：2069（house-tate-source / 対応 OS packet 658C・v0.9.658C）
管理：dev / qa
種別：軽めのUI改善（バナー文言の短縮のみ・Lv1／🟡 MEDIUM）
前提：packet 658C 候補A を選択（安全・最小・スマホ可読性）。packet 2066/2068 のバナーの続き。

## 1. 目的・選択理由
packet 2066 のフィルタ中バナー文言がスマホで長く折返しやすいため、短縮して邪魔になりにくくする。
packet 658C の候補（A:文言短縮 / B:フィルタ種別表示 / C:docs化）のうち、**A を選択**：
- A は Lv1（文言のみ・JS追加なし）で最も安全・最小差分。
- B はフィルタ種別を出すため JS（種別判定→textContent 構築）が必要で局所とはいえ複雑化するため見送り（今後候補）。

## 2. 変更内容（最小差分・文言のみ）
- `#task-filter-banner` の span 文言：
  - 変更前：`🔎 現在、絞り込み中です。追加したタスクが見えない場合は絞り込みを解除してください。`
  - 変更後：`🔎 絞り込み中です。タスクが見えない時は「絞り込み解除」を押してください。`
- ボタン名「絞り込み解除」を文中に明示し、操作先を直結。色・構造・挙動・`display:none`・解除処理は不変。diff +1/-1。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20・`renderTaskBoard(` 37→37・`task-filter-banner` 2（全不変）
- `taskFilter`・`renderTaskBoard` 呼び出し・既存id 非変更

## 4. ui_check（result: PASS）
- 文言短縮のみ・構造/挙動/配色不変。スマホでの折返し行数が減り可読性向上。最終見え方はボス実機目視可（任意）。

## 5. 今後候補（docs 記録）
- 候補B：バナーにフィルタ種別を明示（「期間で絞り込み中」「カテゴリで絞り込み中」「期間・カテゴリで絞り込み中」）。renderTaskBoard の表示切替JSで span.textContent を種別に応じて出し分け（局所だが JS 追加）。効果はあるが Lv2 のため別packetで検討。

## 6. 守った安全境界（赤信号クリア）
- 文言のみ。taskFilter/renderTaskBoard/保存仕様/データ構造/配色 非変更・DB/Auth/API/npm install なし
- `.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 7. 関連
- `docs/TASK_FILTER_ACTIVE_BANNER_PACKET_2066.md` / `docs/TASK_FILTER_BANNER_DARKMODE_PACKET_2068.md`
- `CHANGELOG.md` — 本記録は packet 2069 で追加
