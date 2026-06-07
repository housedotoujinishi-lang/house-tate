# タスク追加フォーム 保存ボタン文言改善（TASK_SAVE_BUTTON_LABEL_PACKET_2065）

最終更新：2026-06-08
packet：2065（house-tate-source / 対応 OS packet 655・v0.9.655）
管理：dev / qa
種別：軽めのUI改善（ボタン文言のみ変更・低リスク／🟡 MEDIUM）
前提：packet 653 自走モードルール／packet 649 司令室テンプレ／packet 644 ui_check。packet 2062（フォーム補足）の続き。

## 1. 目的
タスク追加フォームの保存ボタンが「割り当て」だと、**未割当のまま保存できる実装**（`pool→toIdx=null`）と少しズレて見える。
ボタン文言を「**タスクを保存**」に変え、未割当でも押してよいことを直感的に分かるようにする。

## 2. 変更内容（最小差分・文言のみ）
- `index.html` 1830 の保存ボタン `#tf-save` の**表示文言**：`割り当て` → `タスクを保存`
- **id `tf-save`・`title`・`class="bsv"`・JSハンドラ・保存ロジックは変更なし**。
- diff：`index.html` +1/-1（ボタン内テキストのみ）。

### 影響なし確認
- 保存ハンドラ（`index.html` 14744-14790 / packet 452）は `getElementById('tf-save')` で**id 経由バインド**。ボタンの文字列は読まないため挙動非干渉。
- 別箇所の「割り当て」文字列（ドラッグ割当トースト 6877/7263/35880 等）は別文脈で本変更と無関係。
- コメント（12247/12265）に旧称「割り当て」ボタンの記述が残るが**動作非依存**（混乱回避のため将来整理候補・今回は最小差分優先で据え置き）。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63（新規なし）**
- `id="tf-save"` 1（不変）・`getElementById('tf-save')` 2（ハンドラバインド不変）
- タスク保存・タブ切替・各タブのロジック非干渉

## 4. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2065
  target_pages:
    - page-routine (#tb-panel 保存ボタン)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: 不変(ボタン文言のみ), dark_mode: 不変 }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, tap_targets: 不変, dark_mode: 不変 }
  screenshots: []                       # ボタン文言のみ・既存UI構造不変のため実機スクショ任意
  static_check: { node_check: 該当なし(ボタンテキストのみ・JS非編集), fetch_count: "24->24", setItem_count: "63->63", tf_save_id: "1->1", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # ボタン文言のみ・id/ハンドラ/保存ロジック不変
```
- ボタン文言（4文字→「タスクを保存」6文字）への変更でボタン幅がわずかに増えるが、`.tfa` は通常のボタン行で折返し許容。レイアウト崩れリスクは小。見え方はボス実機目視可（任意）。

## 5. 守った安全境界（赤信号クリア）
- id 変更なし・JS 保存ロジック変更なし・タスク保存仕様変更なし
- Supabase/SQL/RLS/Auth/DB・外部API・npm install なし
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `docs/TASK_ADD_GUIDE_HINT_PACKET_2062.md`（保存ボタンに title・補足を追加した回）
- `docs/TASK_ADD_DESTINATION_TOAST_PACKET_2063.md`（追加後トースト）
- OS 側：`housetate-ai-company/docs/VS_CODE_COMMAND_CENTER_AUTONOMY_RULES_PACKET_653.md`
- `CHANGELOG.md` — 本記録は packet 2065 で追加
