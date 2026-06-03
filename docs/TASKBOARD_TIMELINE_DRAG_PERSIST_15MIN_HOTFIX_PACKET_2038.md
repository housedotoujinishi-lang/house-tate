# 🛠 担当者別タイムライン ドラッグ移動が元に戻る問題 ＋ 15分刻み化（packet 2038）

- 実装日: 2026-06-04 ／ 対象: packet2034/2037 ドラッグ確定ヘルパー・packet2035 ✓・packet2031 リサイズ/編集モーダル・予定追加/編集フォーム・buildTimeline グリッド
- 症状: 公開URLでブロックはドラッグできるが、**ドロップ後に元の場所へ戻る**。あわせて時間刻みを **30分→15分** に変更要望。

## 1. 原因調査（12項目）と結論
| # | 項目 | 結論 |
|---|------|------|
| 1 | packet2037 確定処理 | onUpで`f.ev.sh/sm/eh/em`・`ft.task.sh/sm/dur/toIdx`を更新する実装はある |
| 2 | pointerup時のstate更新関数 | `findEvByBlk`/`findTaskByBlk` で対象を取得して更新 |
| 3 | タスク t.sh/sm/dur/toIdx 更新 | コードは正。ただし④の真因でそこに到達せず |
| 4 | 予定 ev.sh/sm/eh/em＋配列移動 | コードは正。同上 |
| 5 | 移動後 renderTaskBoard/renderDay | 両経路ともbuildTimelineでstate再読込（正） |
| 6 | 再描画で旧位置に戻る | **state未更新のため旧位置で再構築されていた** |
| 7 | _persistTasks/_persistEvents | saveTasks=sbUpsertのみ・saveEvents=POSTのみ＝**即時リロード上書きなし**（巻き戻し要因でない） |
| 8 | tasks時間カラム sh/sm/dur | packet2033で保存対象済（本件と無関係） |
| 9 | load mapping | sh/sm/dur 復元済（本件と無関係） |
| 10 | 移動前後の値 | コード解析で特定（下記） |

### 🎯 根本原因（確定）
`findEvByBlk`/`findTaskByBlk`（packet2034/2037）と packet2035 ✓ の `findTask` が **`if(!window.state…)return null;`** というガードを使用。
本アプリの `state` は **`const state={…}`（index.html:3632）＝スクリプトスコープの lexical 束縛で `window` に乗らない**ため、`window.state` は常に `undefined` → `!window.state` が常に true → **ヘルパーが必ず null を返し、state更新コードに到達しない** → ドロップ後の再描画で旧stateのまま＝元の位置へ戻る。

- これは **packet452 が既に文書化した既知の致命バグと同型**（コメント: 「const state がスクリプトスコープで window に bind しないため常に true → return で不到達」）。
- packet2031 のリサイズ/クリック編集は **bareword `state`**（`window.`なし）を使うため正常動作 ＝ なぜ「リサイズ/編集は動くが移動だけ戻る」かの説明がつく。
- 同根で packet2035 ✓完了も実は未更新だった（本packetで併せて修正）。

## 2. 修正
### ① 根本原因（最小・packet452実績パターン）
`!window.state` → **`typeof state==='undefined'||!state`** に置換（3箇所）：
- `findEvByBlk`（予定移動）
- `findTaskByBlk`（タスク移動）
- packet2035 ✓ `findTask`（完了トグル）

→ ドロップ確定時に **state.events / state.tasks が実体更新**され、再描画で移動先に残る。✓完了も復活。

### ② 15分刻み化（30分固定は戻さない）
- ドラッグ移動：`snap30`→**`snap15`**（`Math.round(m/15)*15`）・最小所要15分
- 右端リサイズ：packet2031 `MIN=30`→**15**・`snap15`を`/15*15`へ・最小幅`HOURW/2`→**`HOURW/4`**（=15分=45px）
- クリック編集モーダル：時刻`<option>`を`m+=30`→**`m+=15`**・下限`+30`→`+15`
- 予定追加フォーム（setupEvForm/setupDayEvForm）・予定編集モーダル（showEvModal/buildTimeOptions）：`['00','30']`→**`['00','15','30','45']`**
- 15分補助線：グリッドを3階調化（毎時`#dbe2ea`／30分`#eef2f7`／**15分`#f7f9fc`＝最薄**）。30分ラベルは維持。
- 仕様：1時間=180px・15分=45px・8:00〜24:00内に丸め・24:00超え禁止。

### ③ 使いやすさ
- ドロップ後トースト「〇〇 9:15へ移動しました」（packet2037の`fmtHM2`が15分表示に対応）。ドラッグ中は半透明＋移動先レーンハイライト（既存）。

## 3. 検証
- `node --check`：drag / buildTimeline / ✓完了 / packet2031 / showEvModal の各ブロック **全OK**。`<script>` 10/10。
- `!window.state` 残存（drag/✓ヘルパー）0・`snap30`残存0・`MIN=30`残存0・`['00','30']`残存0。
- 禁止APIトークン0件・renderMonth/renderWeek健在・`page-customers`参照0（顧客タブ復活なし）。
- 期待（要ブラウザ手動確認 🟡）：
  1. 右ドラッグで 9:00→9:15→9:30→10:15 と**15分刻みで移動**、**ドロップ後に残る**
  2. 上下ドラッグで担当者変更（安見→佐野）、その場に残る
  3. タスク：t.sh/sm/toIdx更新・再描画後も移動先
  4. 予定：ev.sh/sm/eh/em更新・担当者変更で旧配列から消え新配列へ
  5. 右端リサイズ15分・戻らない／クリック編集15分・保存反映／✓完了 維持／月週 無改変

## 4. 維持・非改変
- 月/週/日間カレンダー・既存予定追加/タスク追加・ルーティンD&D 無改変。
- 状態は in-memory＋既存persist。新規外部接続なし・localStorage本文保存なし。
- タスク時間DBカラム追加は**今回行わない**（packet2033で sh/sm/dur は既に保存対象。`fromRoutine`/`routineId` の永続化は別途）。

## 5. 禁止事項の遵守
- force push/reset/clean/rebase なし・.claude add なし・SQL/Supabase/RLS/Auth なし・外部API/Sheets/OpenAI/Claude/CloudRun なし・localStorage本文保存なし・顧客タブ復活なし・月/週/右端リサイズ/完了チェック/クリック編集 破壊なし。
- 本packetは **commitまで。pushはボス承認後（push停止）。**
