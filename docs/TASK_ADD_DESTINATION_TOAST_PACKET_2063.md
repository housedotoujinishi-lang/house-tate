# タスク追加後「どこに入ったか分かる」案内表示の文言強化（TASK_ADD_DESTINATION_TOAST_PACKET_2063）

最終更新：2026-06-08
packet：2063（house-tate-source / 対応 OS packet 654・v0.9.654）
管理：dev / qa
種別：軽めのUI改善（既存トーストの文言強化のみ・低リスク／🟡 MEDIUM）
前提：OS packet 653 の VS Code 司令室 自走モードルールに基づく実戦。packet 644 の ui_check 適用。

## 1. 経緯（重要：機能は既存だった）
read-only 調査の結果、「タスク追加後にどこに入ったか案内する」機能は **packet 444 で既に実装済み**だった：
- **行き先タブへ自動切替**（`index.html` 14794-14803）：`toIdx===null→未割当タブ` / `自分→個人タブ` / `他者→担当別タブ`
- **案内トースト**（14809-14818）：`タスクを追加しました（○○タブに表示）`、フィルタ中は警告併記

ゼロから重複実装すると既存挙動と競合・退行リスクがあるため、ボスに確認のうえ
**既存トーストの文言強化のみ**（タスク名を入れて分かりやすく）に方針決定（A案採用）。

## 2. 変更内容（最小差分・文言のみ）
案内トースト3箇所（`index.html` 14816-14818）の **showToast に渡す文字列のみ**を変更：

| 状況 | 変更前 | 変更後 |
|------|--------|--------|
| 通常 | `タスクを追加しました（○○タブに表示）` | `✅「{タスク名}」を○○タブに追加しました` |
| フィルタ中 | `タスクを追加しました（○○タブに表示 / 期間フィルタ中。全期間／全カテゴリをご確認ください）` | `✅「{タスク名}」を○○タブに追加しました / 期間フィルタ中。全期間／全カテゴリでご確認ください` |
| 例外時fallback | `タスクを追加しました` | `✅「{タスク名}」を追加しました` |

- `{タスク名}`＝保存ハンドラ内で既に定義済みの `title`（14757）。スコープ内のため新規変数なし。
- **行き先タブ判定（`_where`/`tbTab`）・自動切替・保存ロジック（`_persistTasks`）・`toIdx` 算出は一切変更なし**。
- diff：`index.html` +3/-3（文字列3本のみ）。

## 3. 既存機能を壊していない（静的実測）
- `<script>` 11/11・`</script>` 11/11
- **fetch 24→24・setItem 63→63（新規なし）**
- `showToast(` 116→116（呼び出し数不変＝既存呼び出しの文字列だけ変更）・`_persistTasks(` 20（不変）
- タブ自動切替・タスク保存・完了チェック・各タブのロジック非干渉

## 4. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2063
  target_pages:
    - page-routine (#tb-panel タスク追加→トースト)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: 不変(トースト文言のみ), dark_mode: 不変 }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, tap_targets: 不変, dark_mode: 不変 }
  screenshots: []                       # トースト文言のみ・既存UI構造不変のため実機スクショ任意（撮る場合 runtime/screenshots/、git管理外）
  static_check: { node_check: 該当なし(既存showToast文字列のみ変更・JSロジック非編集), fetch_count: "24->24", setItem_count: "63->63", showToast_count: "116->116", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 静的PASS（既存トースト文言のみ・レイアウト/挙動不変）
```
- トーストは既存の `showToast` 表示機構を流用。レイアウト/overflow/stacking に影響なし。崩れリスク構造上ゼロ → 静的 PASS。
- 実機での文言の見え方（タスク追加→トースト）はボスが目視確認可（任意）。長いタスク名でもトースト幅は既存 showToast の挙動に従う。

## 5. 守った安全境界（赤信号クリア）
- Supabase/SQL/RLS/Auth/DB 変更なし・DB 直接操作なし・外部 API 接続なし・npm install なし
- **タスク保存仕様・JS ロジック・タブ切替ロジックは非変更**（🟠該当作業をしていない）。既存トーストの文字列のみ＝🟡 MEDIUM
- 既存機能・既存タスクデータ破壊なし・`page-crm` 非関与
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `index.html` 14794-14818（packet 444 の自動タブ切替＋案内トースト＝本改善の母体）
- `docs/TASK_ADD_GUIDE_HINT_PACKET_2062.md` / `TASK_TAB_TOOLTIP_HINT_PACKET_2061.md`（タスク画面の連続UX改善）
- OS 側：`housetate-ai-company/docs/VS_CODE_COMMAND_CENTER_AUTONOMY_RULES_PACKET_653.md`（自走モードルール）/ `UI_SCREENSHOT_CHECK_OPERATION_PACKET_644.md`（ui_check 正本）
- `CHANGELOG.md` — 本記録は packet 2063 で追加
