# 追加トースト経路Aにタスク名表示（content parity）（TASK_ADD_TOAST_PATHA_TITLE_PACKET_2077）

最終更新：2026-06-08
packet：2077（house-tate-source / 対応 OS packet 666・v0.9.666）
管理：dev / qa
種別：軽めのUI改善（トースト文言の content parity・局所JS／🟡 MEDIUM）
前提：packet 2076 で「経路Aにタスク名がない（経路Bと不一致）」として送付された content parity 課題（candidate C2）。

## 1. 目的
タスク追加トーストは2経路ある：
- 経路B（左フォーム保存 14826）：`✅「タスク名」を○○タブに追加しました`（タスク名あり）
- 経路A（`showKAddModal` カンバン追加 7123）：`✅ タスクを追加しました（○○タブに表示）`（**タスク名なし**）
→ 経路Aも経路Bと同形にし、どのタスクが入ったか分かるよう統一する。

## 2. 変更内容（最小差分・局所）
`showKAddModal` の `ka-save` onclick（`index.html` 7088-7126）で：
1. トースト直前（renderTaskBoard 後）に短縮変数を追加（経路B `_toastTitleShort` と同方式・24文字超は `…`）：
   ```js
   const _tTitle=String(title||'タスク').trim();
   const _tShort=_tTitle.length>24?_tTitle.slice(0,24)+'…':_tTitle;
   ```
   - `title` は同 onclick 内の既存 const（7089）。`_tTitle`/`_tShort` は try の外で定義＝try本体・catch fallback の3箇所で使用可。
2. トースト3文言を経路Bと同形に：
   - フィルタ中：`✅「{_tShort}」を{○○タブ}に追加しました{警告}。「絞り込み解除」で全件表示に戻せます`
   - 通常：`✅「{_tShort}」を{○○タブ}に追加しました`
   - 例外fallback：`✅「{_tShort}」を追加しました`
- **タスク保存ロジック・`state.tasks.push`・`toIdx`・タブ判定・`_persistTasks`・`taskFilter` は非変更**。トースト文言と短縮変数のみ。diff +5/-3。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20・`renderTaskBoard(` 37→37（全不変）
- 追加は表示用ローカル const（`_tTitle`/`_tShort`）と文言のみ。保存系トークン非変更

## 4. ui_check（packet 644 準拠 / result: PASS）
- 経路A/B のトーストが同形になり一貫。長文は24文字短縮＋トースト折り返し（packet 2064）で overflow なし。実機（カンバン「追加する」経由）での見え方はボス目視可。

## 5. 守った安全境界（赤信号クリア）
- 保存ロジック/データ構造/`_persistTasks`/`toIdx`/タブ判定/`taskFilter` 非変更・大規模JS改造なし
- DB/Auth/API/npm install なし・`.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `docs/TASK_ADD_DESTINATION_TOAST_PACKET_2063.md`（経路Bのタスク名＋短縮の前例）/ `TASK_TOAST_BANNER_TONE_PACKET_2072.md`（用語統一）/ `TASKBOARD_WORDING_TONE_REVIEW_PACKET_2076.md`（C2送付元）
- `index.html` 7088-7126（showKAddModal ka-save）
- `CHANGELOG.md` — 本記録は packet 2077 で追加
