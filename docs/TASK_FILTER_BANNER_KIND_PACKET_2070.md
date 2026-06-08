# フィルタ中バナーに絞り込み種別を表示（TASK_FILTER_BANNER_KIND_PACKET_2070）

最終更新：2026-06-08
packet：2070（house-tate-source / 対応 OS packet 659・v0.9.659）
管理：dev / qa
種別：軽めのUI改善（バナー文言の動的化・局所JS追加／🟡 MEDIUM・Lv2）
前提：packet 658C（2069）で今後候補としていた「候補B：フィルタ種別の明示表示」を実装。packet 2066/2068/2069 のバナーの続き。

## 1. 目的
フィルタ中バナーに「何で絞り込んでいるか」（期間／カテゴリ／両方）を表示し、解除前に状況が分かるようにする。

## 2. 変更内容（最小差分・局所）
1. **バナー span**（`index.html` 1848）の「絞り込み中」を `<b id="tfb-kind">絞り込み中</b>` に切り出し（既定文言＝JS未実行時も自然に読める）。
2. **表示切替JS**（`renderTaskBoard()` 内 packet 2066 の try）を拡張：
   - `_pAct`（period≠all）／`_cAct`（cat≠''）を判定し、表示中なら `#tfb-kind` の textContent を出し分け：
     - 両方 → `期間・カテゴリで絞り込み中`
     - 期間のみ → `期間で絞り込み中`
     - カテゴリのみ → `カテゴリで絞り込み中`
- 文表示例：「🔎 **期間・カテゴリで絞り込み中**です。タスクが見えない時は「絞り込み解除」を押してください。」
- 追加 JS は `taskFilter.period`/`taskFilter.cat` の**読み取り（!== 比較）**と `tfb-kind` の **textContent 設定のみ**。`taskFilter` への代入・解除ボタン挙動・保存ロジック・データ構造は**非変更**。
- diff：`index.html` +2/-2（span 1行・JS 1行を差し替え）。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20・`renderTaskBoard(` 37→37（不変）
- `task-filter-banner` 2（不変）／新規 `tfb-kind` 2（b id ＋ getElementById）
- `taskFilter.period=`/`taskFilter.cat=` の**代入箇所は不変**（追加分は `!==` 比較＝読み取りのみ）・renderTaskBoard 呼び出し非追加

## 4. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2070
  target_pages:
    - page-routine (#task-filter-banner)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: 不変(種別語のみ可変), dark_mode: 変数連動(2068) }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, dark_mode: 変数連動 }
  screenshots: []                       # 文言動的化のみ・構造不変。実機はボス目視可
  static_check: { node_check: 該当なし(HTML1+JS1局所・保存非編集), fetch_count: "24->24", setItem_count: "63->63", showToast_count: "116->116", persistTasks_count: "20->20", renderTaskBoard_count: "37->37", banner_count: "2", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 種別語の出し分けのみ・既存ロジック/配色/解除挙動 不変
```
- 種別語が最大「期間・カテゴリで絞り込み中」12文字。バナーは折返し可（packet 2066・幅max-90vw 2068）でスマホでも overflow しない。最終見え方はボス実機目視可。

## 5. 守った安全境界（赤信号クリア）
- `taskFilter` は読み取りのみ追加（代入は既存のまま）・解除挙動/保存仕様/データ構造/`_persistTasks`/`applyTaskFilter` 非変更
- 大規模JS改造なし（既存 try に数式と1代入を追加した局所拡張）・DB/Auth/API/npm install なし
- `.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 関連
- `docs/TASK_FILTER_ACTIVE_BANNER_PACKET_2066.md`（バナー本体）/ `2068`（ダーク配色）/ `2069`（文言短縮・候補B予告）
- `index.html` 1847-1849（バナー）・6617付近（renderTaskBoard 表示切替JS）
- `CHANGELOG.md` — 本記録は packet 2070 で追加
