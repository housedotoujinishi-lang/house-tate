# タスク画面 フィルタタブに説明ツールチップ追加（TASK_TAB_TOOLTIP_HINT_PACKET_2061）

最終更新：2026-06-07
packet：2061（house-tate-source / 対応 OS packet 651・v0.9.651）
管理：dev / qa
種別：軽めのUI改善（説明文の純追加・低リスク）
前提：OS packet 649 の VS Code 司令室テンプレ §1→§2 を使った初の実戦。packet 644 の ui_check ルールを適用。

## 1. 目的
タスク画面（`🧭 今日やことナビ` 配下）のフィルタタブ「未割当 / 担当別 / 個人 / 完了済み」は
ラベルが短く、新しいスタッフには各タブの意味が伝わりにくい。
**`title` 属性（ホバー説明）を純追加**して、レイアウト・挙動を一切変えずに分かりやすさだけ上げる。

## 2. 変更内容（最小差分）
- `index.html` のタスクボードタブ（`.tbtab` 4個・line 1831）に `title` を追加：

| タブ（`data-tt`） | 追加した title |
|---|---|
| 未割当（unassigned） | まだ担当者が決まっていないタスク。ここから割り当てます |
| 担当別（all） | 担当者ごとにまとめて表示 |
| 個人（mine） | 自分に割り当てられたタスク |
| 完了済み（done） | 完了したタスクの履歴 |

- **`data-tt` 値・ラベル文言・CSS・JS は一切変更なし**（`title` 属性の純追加のみ）。
- diff：`index.html` +1/-1（1行内の属性追加）。

## 3. 既存機能を壊していない（静的実測）
- `<script>` 11/11・`</script>` 11/11（タグ増減なし）
- **fetch 24→24（新規なし）・setItem 63→63（新規なし）**
- タブ切替ハンドラ（`index.html` 6612-6620）は `b.dataset.tt` のみ参照。`title`/`textContent` は読まないため**挙動非干渉**を確認
- `data-tt`（unassigned/all/mine/done）不変＝フィルタロジック不変
- レイアウト非変更（`.tbtab` の CSS 未編集・`title` は表示に影響しない）

## 4. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2061
  target_pages:
    - page-routine (#tb-panel タスクボード タブ)
  roles_checked: [admin, 店長, staff]   # タブ自体は全roleで表示
  pc:  { width: ">=1280px", overflow_x: none, layout: 不変(title属性のみ), dark_mode: 不変 }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, tap_targets: 不変, dark_mode: 不変 }
  screenshots: []                       # title属性のみ＝レイアウト不変のため実機スクショ任意（撮る場合 runtime/screenshots/、git管理外）
  static_check: { node_check: 該当なし(HTML属性のみ・JS非編集), fetch_count: "24->24", setItem_count: "63->63", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 静的PASS（title属性のみ・レイアウト/挙動不変）
```
- `title` 属性は**レイアウト・overflow・stacking・tap対象に影響しない**ため、PC幅/スマホ幅の崩れリスクは構造上ゼロ。静的検証で PASS。
- ホバー文言の最終的な見え方（PC ツールチップ表示）はボスが実機で目視確認可（任意）。スマホはツールチップ非表示のため影響なし。

## 5. 守った安全境界（赤信号クリア）
- Supabase/SQL/RLS/Auth/DB 変更なし・DB 直接操作なし・外部 API 接続なし・npm install なし
- `index.html` は属性1点の最小差分（JS ロジック・geometry・保存方式 非変更）
- 既存タブ・既存タスクデータ破壊なし・`page-crm` 非関与
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- OS 側：`housetate-ai-company/docs/UI_SCREENSHOT_CHECK_OPERATION_PACKET_644.md`（ui_check 正本）
- OS 側：`housetate-ai-company/docs/VS_CODE_COMMAND_CENTER_TEMPLATES_PACKET_649.md`（司令室テンプレ）
- `CHANGELOG.md` — 本記録は packet 2061 で追加
