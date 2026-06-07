# タスク画面 追加導線わかりやすさ改善（TASK_ADD_GUIDE_HINT_PACKET_2062）

最終更新：2026-06-07
packet：2062（house-tate-source / 対応 OS packet 652・v0.9.652）
管理：dev / qa
種別：軽めのUI改善（補足文・title属性の純追加・低リスク）
前提：OS packet 649 の VS Code 司令室テンプレ §1→§2 を使った実戦2回目。packet 644 の ui_check ルールを適用。packet 2061（タブ title 追加）の続き。

## 1. 目的
タスク追加フォームで「割当先をどうすればいいか」「未割当とは何か」が新しいスタッフに伝わりにくい。
前回 packet 2061 はフィルタタブに title を付けた。今回は **追加導線（タスク追加フォーム）** に絞り、
「割当先を未割当のまま保存してよい／あとで割り当てできる」ことを**短い補足とtitleで純追加**する。

## 2. 変更内容（最小差分・追加フォーム内のみ）
`index.html` のタスク追加フォーム `#tb-form`（既定 `display:none`＝開いたときだけ表示）に3点を純追加：

| # | 箇所 | 追加内容 |
|---|------|----------|
| 1 | 割当先セレクト `#tf-to` | `title="「未割当」のままでも保存できます。あとで担当者へ割り当て可能"` |
| 2 | フォーム内（割当先行と保存ボタンの間） | 補足1行：`💡 割当先は「未割当」のまま保存してOK。あとで未割当タブから担当者へ割り当てできます。`（`.tf-hint`・10px・muted色） |
| 3 | 保存ボタン `#tf-save`（「割り当て」） | `title="このタスクを保存（割当先を選べば担当割当、未割当のままなら一旦プールへ）"` |

- 補足は **追加フォーム内**にあり、フォームは既定で `display:none`。**通常のタスク画面の高さ・レイアウトは不変**（開いたときだけ1行増える）。
- **ボタンID・`data-tt`・`data-*`・ラベル文言・JSハンドラ・保存ロジックは一切変更なし**。
- diff：`index.html` +3/-2（title2点＋補足div1行）。

### 文言の根拠（保存挙動と一致）
- 割当先セレクトは `popTfTo()`（`index.html` 6587）で先頭に `<option value="pool">未割当</option>` を出力。
- 保存ハンドラ（`index.html` 14761-14767）は `toVal==='pool'` のとき `toIdx=null`＝**未割当として登録**。
- → 「未割当のまま保存→あとで割当」は実装どおり。補足文言は挙動と一致している。

## 3. 既存機能を壊していない（静的実測）
- `<script>` 11/11・`</script>` 11/11（タグ増減なし）
- **fetch 24→24・setItem 63→63（新規なし）**
- `data-tt` 5（不変）／`id="tf-to"` 1・`id="tf-save"` 1・`value="pool"` 2（不変）＝保存系トークン不変
- タスク追加・完了チェック・担当者別/個人/未割当/完了済みタブのロジック非干渉（ID・data・ハンドラ未編集）

## 4. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2062
  target_pages:
    - page-routine (#tb-panel タスク追加フォーム #tb-form)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: 既定不変(補足はフォーム内display:none), dark_mode: 不変 }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, tap_targets: 不変, dark_mode: 不変 }
  screenshots: []                       # 補足文/title中心・既定レイアウト不変のため実機スクショ任意（撮る場合 runtime/screenshots/、git管理外）
  static_check: { node_check: 該当なし(HTML属性+補足div・JS非編集), fetch_count: "24->24", setItem_count: "63->63", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 静的PASS（補足文/titleのみ・既定レイアウト不変）
```
- 補足は `display:none` の追加フォーム内のため、**通常画面の overflow/stacking/高さに影響なし**。崩れリスクは構造上小。静的検証で PASS。
- フォームを開いたときの補足1行の見え方（PC/スマホ）はボスが実機で目視確認可（任意）。スマホでも10px・1〜2行で邪魔にならない設計。

## 5. 守った安全境界（赤信号クリア）
- Supabase/SQL/RLS/Auth/DB 変更なし・DB 直接 INSERT/UPDATE/DELETE なし・外部 API 接続なし・npm install なし
- タスク保存仕様の変更なし・JS ロジック大改造なし・`index.html` 全体整形なし（追加フォーム内3点の最小差分）
- 既存タブ/タスクデータ破壊なし・`page-crm` 非関与
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `docs/TASK_TAB_TOOLTIP_HINT_PACKET_2061.md`（前回・タブ title 追加）
- OS 側：`housetate-ai-company/docs/UI_SCREENSHOT_CHECK_OPERATION_PACKET_644.md`（ui_check 正本）
- OS 側：`housetate-ai-company/docs/VS_CODE_COMMAND_CENTER_TEMPLATES_PACKET_649.md`（司令室テンプレ）
- `CHANGELOG.md` — 本記録は packet 2062 で追加
