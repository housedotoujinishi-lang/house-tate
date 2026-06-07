# タスク追加後「どこに入ったか分かる」案内表示の文言強化（TASK_ADD_DESTINATION_TOAST_PACKET_2063）

最終更新：2026-06-08（packet 654A hotfix 反映）
packet：2063（house-tate-source / 対応 OS packet 654・v0.9.654）＋ 654A hotfix
管理：dev / qa
種別：軽めのUI改善（既存トーストの文言強化のみ・低リスク／🟡 MEDIUM）
前提：OS packet 653 の VS Code 司令室 自走モードルールに基づく実戦。packet 644 の ui_check 適用。

> **packet 654A hotfix（2026-06-08）**：Codex read-only レビューで「`.shortcut-toast{white-space:nowrap}`（`index.html` 860）のため長文タスク名で横 overflow するリスク」を指摘され、2段で対応：(1) トースト表示用にタスク名を **24文字で短縮**（`_toastTitleShort`）、(2) ボス指示により `.shortcut-toast` を **折り返し可能**に最小CSS修正（`white-space:normal;max-width:90vw;overflow-wrap:anywhere;text-align:center`）。あわせて本書の「overflow 影響なし／崩れリスク構造上ゼロ」の言い過ぎを実態（折り返しで表示範囲内に収める）に修正（§4）。

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

- `{タスク名}`＝保存ハンドラ内で既に定義済みの `title`（14757）を **packet 654A で短縮した `_toastTitleShort`**（24文字超は `…` 付きで切り詰め）。
- **行き先タブ判定（`_where`/`tbTab`）・自動切替・保存ロジック（`_persistTasks`）・`toIdx` 算出は一切変更なし**。
- diff：`index.html` 文言3本（packet 654）＋ 短縮変数2行＋コメント1行（packet 654A）。

### packet 654A hotfix の実装（`index.html` 14809 付近・トースト try の直前）
```js
// 長文タスク名はトースト用に短縮（.shortcut-toast は white-space:nowrap のため横 overflow を抑制）
const _toastTitle = String(title||'タスク').trim();
const _toastTitleShort = _toastTitle.length > 24 ? _toastTitle.slice(0,24) + '…' : _toastTitle;
```
- 変数は try の**外**で定義し、try 本体・catch fallback の3箇所すべてで `_toastTitleShort` を使用。
- 24文字は目安（`.shortcut-toast` の bottom 中央・nowrap でも PC/スマホで概ね収まる長さ）。CSS は変更していない。

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
  static_check: { node_check: 該当なし(既存showToast文字列＋短縮変数＋.shortcut-toast の折り返しCSS・JSロジック/保存非編集), fetch_count: "24->24", setItem_count: "63->63", showToast_count: "116->116", persistTasks_count: "20->20", existing_cards_intact: true }
  issues_found: 1                        # Codex指摘：長文タスク名の横overflowリスク
  fixed: [ "packet654A: トースト用タスク名を24文字で短縮（_toastTitleShort）", "packet654A(CSS): .shortcut-toast を white-space:normal + max-width:90vw + overflow-wrap:anywhere + text-align:center で折り返し対応" ]
  result: FIXED                         # 文言強化を維持しつつ overflowリスクを2段（短縮＋折り返し）で抑制
```
- 既存の `showToast` 表示機構を流用。**短いタスク名や通常文ではレイアウト不変**。
- 長文 overflow 対策は2段構え：(1) トースト用タスク名を **24文字短縮**（フィルタ警告など長文併記にも効く）、(2) `.shortcut-toast` を **折り返し可能**に変更（`white-space:normal;max-width:90vw;overflow-wrap:anywhere;text-align:center`）。これにより**横 overflow ではなく既存トースト表示範囲（最大90vw）内で折り返す**。
- ⚠️ 「overflow 影響なし／崩れリスク構造上ゼロ」は誤り。正しくは「**折り返しCSSで横 overflow を抑え、表示範囲内に収める**」。複数行になった場合の高さ・他トースト全般への影響（showToast はアプリ全体で共用）はボス実機目視推奨。
- 実機での見え方（タスク追加→トースト、特に長文タスク名・スマホ幅）はボスが目視確認推奨。

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
