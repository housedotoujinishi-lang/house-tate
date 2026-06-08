# タスクボード フィルタ中バナー＋絞り込み解除ボタン（TASK_FILTER_ACTIVE_BANNER_PACKET_2066）

最終更新：2026-06-08
packet：2066（house-tate-source / 対応 OS packet 657・v0.9.657）
管理：dev / qa
種別：軽めのUI改善（局所HTML/CSS/JS追加・低リスク／🟡 MEDIUM）
前提：packet 653/656 自走ルール／packet 649 司令室テンプレ／packet 644 ui_check。packet 444・2063 の「フィルタ中は追加タスクが見えにくい」課題への恒久導線。

## 1. 目的
タスクボードで期間/カテゴリのフィルタ中だと「追加したタスクが消えた／どこに入ったか分からない」と感じやすい。
**フィルタ中だけ表示される小さなバナー**と**ワンクリックの「絞り込み解除」ボタン**を追加し、全件表示に戻せるようにする。

## 2. 採用方針と理由（安全・最小・非破壊）
- `#task-filter-bar` の**直後に静的バナー**を `display:none` で配置し、`renderTaskBoard()` の **select 同期直後**でフィルタ有効時のみ `display:flex` に切替。
- 解除ボタンは既存 select と**同じ inline パターン**（`taskFilter.period='all';taskFilter.cat='';renderTaskBoard()`）。`renderTaskBoard()`（6610付近）が select 値を taskFilter に同期するため、**select 表示も自動で全期間/全カテゴリに戻る**＝大きな再設計不要。
- 理由：既存 `taskFilter` 構造・保存仕様・データ構造・`renderTaskBoard` 本体ロジックを一切変えずに、HTML 1ブロック＋JS 1行（表示切替）の局所追加で完結するため。

## 3. 変更内容（最小差分）
1. **バナー HTML**（`index.html` `#task-filter-bar` の `</div>` 直後）：
   - `#task-filter-banner`（既定 `display:none`）：文言「🔎 現在、絞り込み中です。追加したタスクが見えない場合は絞り込みを解除してください。」＋「絞り込み解除」ボタン
   - ボタン onclick：`taskFilter.period='all';taskFilter.cat='';renderTaskBoard()`（既存 select と同パターン）
2. **表示切替 JS**（`renderTaskBoard()` 内・select 同期の直後）：
   ```js
   try{const _fb=document.getElementById('task-filter-banner');
       if(_fb){const _act=(taskFilter.period&&taskFilter.period!=='all')||(taskFilter.cat&&taskFilter.cat!=='');
       _fb.style.display=_act?'flex':'none';}}catch(e){}
   ```
- `taskFilter` は**読み取り**＋解除時の**最小代入**のみ。保存ロジック（`_persistTasks`）・タスクデータ構造・`applyTaskFilter()` のフィルタ条件は非変更。
- バナーは `#tb-body` の**外**にあり renderTaskBoard の再描画で消えない（既存の filter-bar/select と同じ持続）。毎描画で表示/非表示だけ更新。

## 4. バナーの仕様
| 項目 | 内容 |
|------|------|
| 表示条件 | `taskFilter.period !== 'all'` または `taskFilter.cat !== ''` のときのみ（renderTaskBoard で判定） |
| 既定 | `display:none`（フィルタなし時は出ない） |
| 文言 | 🔎 現在、絞り込み中です。追加したタスクが見えない場合は絞り込みを解除してください。 |
| ボタン | 「絞り込み解除」→ period='all' / cat='' にして renderTaskBoard 再描画 |
| select 同期 | renderTaskBoard（6610付近）が `pSel.value=taskFilter.period` / `cSel.value=taskFilter.cat` を実行＝**自動同期** |
| 見た目 | オレンジ系（#fff7ed 背景/#9a3412 文字）・10.5px・flex 1行・スマホは折返しで2行許容 |

## 5. 静的検証（実測）
- `<script>` 11/11・`</script>` 11/11
- **fetch 24→24・setItem 63→63（新規なし）**・`showToast(` 116→116・`_persistTasks(` 20→20（不変）
- `renderTaskBoard(` 36→37（**解除ボタンの onclick 1件のみ増**。切替JSは呼び出しを増やさない）
- `task-filter-banner` 2（div id + getElementById）／既存 `task-filter-bar` 3（不変＝既存id/構造非破壊）
- `taskFilter` は読み取り＋解除代入のみ・`applyTaskFilter()` のフィルタ条件は不変

## 6. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2066
  target_pages:
    - page-routine (#tb-panel タスクボード・フィルタバー直下)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: フィルタ中のみバナー1行表示, dark_mode: 要目視(薄オレンジ背景) }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: flexで文＋ボタン・狭いと折返し, tap_targets: 解除ボタン padding4px10px, dark_mode: 要目視 }
  screenshots: []                       # 局所追加・フィルタ中のみ表示。実機スクショはボス任意（runtime/screenshots/、git管理外）
  static_check: { node_check: 該当なし(HTML＋JS1行局所追加), fetch_count: "24->24", setItem_count: "63->63", showToast_count: "116->116", persistTasks_count: "20->20", renderTaskBoard_count: "36->37(解除ボタンonclick)", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 局所追加・フィルタ中のみ表示・既存ロジック非変更
```
- 既定 `display:none` のためフィルタなし時はレイアウト不変。フィルタ中のみ1行（スマホは折返し2行）表示で overflow なし。
- ダークモードでの薄オレンジ背景/文字コントラストはボス実機目視推奨（CSS変数未使用の固定色のため）。

## 7. スキップ・今後課題（docs 記録）
- ダークモード専用色の最適化（現状は固定オレンジ）。崩れはしないが配色は要目視 → 必要なら別packetで `var(--*)` 化。
- バナー文言・配色のブランド整合（brand 部署レビュー）は任意。
- フィルタの種類（期間/カテゴリのどちらが有効か）をバナーに明示する案は、文言が長くなるため今回は見送り（最小実装優先）。

## 8. 守った安全境界（赤信号クリア）
- DB/Supabase/RLS/Auth/API 変更なし・保存仕様/タスクデータ構造/`_persistTasks` 仕様変更なし・大規模 renderTaskBoard 改造なし
- `taskFilter` は読み取り＋既存仕様どおりの解除代入のみ・外部API/npm install なし
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 9. 関連
- `index.html` 1834-1845（#task-filter-bar / tf-period / tf-cat）・6597-6611（renderTaskBoard の select 同期）・6589-6596（applyTaskFilter）
- `docs/TASK_ADD_DESTINATION_TOAST_PACKET_2063.md`（追加後トーストのフィルタ警告）
- OS 側：`housetate-ai-company/docs/UI_SCREENSHOT_CHECK_OPERATION_PACKET_644.md`（ui_check 正本）
- `CHANGELOG.md` — 本記録は packet 2066 で追加
