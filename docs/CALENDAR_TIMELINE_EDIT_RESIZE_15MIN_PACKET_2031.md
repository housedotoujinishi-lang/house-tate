# 🛠 担当者別タイムライン クリック編集 + 右端リサイズ15分（packet 2031）

- 実装日: 2026-06-02 ／ 対象: `buildTimeline`（packet2014・日表示＋タスクボード共有）＋ 新規 packet2031
- 目的: 「見るだけ」から「その場で編集できる日間ボード」へ。

## 1. 事前調査結果
| # | 項目 | 結論 |
|---|------|------|
| 1 | 実装位置 | packet2014(buildTimeline)/packet2027(board)/packet2029(8-24,HOURW120) |
| 2 | ブロックHTML | position:absolute・2段・BLOCKH38・参照/手なし → 改修 |
| 3 | state.events 時間 | `sh,sm,eh,em`（終了あり）→ リサイズはeh/em |
| 4 | state.tasks 時間 | `sh,sm,dur`＋`id` → リサイズはdur |
| 5/6 | 編集モーダル | showEvModal(30分)/showTaskDetail 既存。**15分要件のため自前15分モーダルを新設**（共有モーダル非改変） |
| 7/8 | 保存 | `_persistEvents()`/`_persistTasks()` 使用 |
| 9 | HOURW=120 | 15分 = 30px |
| 10 | 15分変換 | モーダル＆リサイズで新規実装 |

## 2. 実装
### 表示改善（buildTimeline・両画面反映）
- ブロック高さ 38→**48**（2行）。1段目=種別アイコン＋時刻範囲（9px）、2段目=タイトル（11px・`-webkit-line-clamp:2`で2行・`white-space:normal`）。右paddingを11pxにしリサイズ手と干渉回避。
- min-width 80・8-24時・横スクロールは維持。タイトルが切れすぎない。

### クリック編集（15分モーダル）
- `.stl-blk` クリックで自前モーダル（タイトル／担当者／日付／開始／終了／カテゴリ／保存／キャンセル）。**開始・終了は15分刻み**（8:00〜24:00、既存値は近い15分へ丸め）。
- 予定：`state.events` 更新（担当者変更は配列移動）→ `_persistEvents`。タスク：`state.tasks` 更新（toIdx変更可）→ `_persistTasks`。保存後に再描画＋トースト。
- 既存 `showEvModal`/`showTaskDetail` は無改変（共有モーダル）。timeline専用に独立モーダルを使用。

### 右端リサイズ（15分刻み・PCマウスMVP）
- ブロック右端に `.stl-rsz` ハンドル。pointerdown→move→upで終了時刻変更。
- 15分刻み（`HOURW/4=30px`単位に丸め）、**最小15分・最大24:00**。予定=eh/em、タスク=dur を更新→保存→再描画→トースト。
- 左端リサイズ・開始移動・全体移動は対象外（仕様どおり）。

### クリック/リサイズ競合防止
- リサイズは pointer イベント、5px超で「リサイズ扱い」。`.stl-rsz` の pointerdown/click は `stopPropagation`。
- リサイズ直後350ms はクリック編集を抑止（`lastResizeAt`）。
- クリック編集は **capture phase＋stopPropagation** で既存ブロックonclickを抑止し、二重モーダルを防止。

## 3. 維持・非改変
- 8-24時・横スクロール・担当者列sticky・空き率（AVAIL_END=18）・件数・ルーティンD&D・担当者フィルター 維持。
- 月表示/週表示（renderMonth/renderWeek）・既存予定追加/タスク追加 無改変。状態は in-memory＋既存persist。

## 4. 検証
- `node --check`（packet2014/2031ブロック）PASS・`<script>` 8/8一致・CRM無傷・禁止APIトークン0件・月/週無改変
- 期待：ブロック2行で内容が読める／クリックで15分編集モーダル／右端ドラッグで終了時刻が15分刻み変更（min15・max24:00）／変更後即再描画

## 5. 既知の制限（MVP）
- リサイズはPCマウス（pointer）。スマホは編集モーダルで時間変更（要望どおり後回し）。
- HOURW/START_H/END_H は packet2029(120/8/24)と整合の固定値（変更時はpacket2031も追従要）。

## 6. 禁止事項の遵守
- Supabase/SQL/RLS/Auth・外部API/OpenAI/Claude/Sheets/CloudRun 不使用・localStorage本文保存なし・顧客タブ復活なし・月/週破壊なし・既存追加/ルーティンD&D破壊なし。
