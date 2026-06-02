# 👥 タスクボード常設・担当者別スケジュールボード（packet 2027 / 静的MVP）

- 実装日: 2026-06-02 ／ 対象: タスクボード（`renderTaskBoard` を非破壊ラップ）
- 参考: `ChatGPT Image 2026年6月2日 15_20_01.png` のUIモックを反映。

## 1. 目的（要件）
- **タスクボードを開いた時に常設表示**（カレンダー日表示専用ではない）
- 担当者別に**予定（state.events）＋タスク（state.tasks）を同一時間軸**で表示
- 誰が空いている/詰まっているか一目（時間目盛 8:00〜18:00・空き=予定なし）
- 担当者フィルタ維持（visMis 連動・未担当行）
- PC=横並び表形式、スマホ=横スクロール（氏名列 sticky）
- 既存タスクボード・既存カレンダーは残す

## 2. 実装（非破壊・流用）
- `renderTaskBoard()` を**非破壊ラップ**し、毎回 `#tb-body` の直前に `#staff-schedule-board` を挿入（冪等：既存を除去して再構築）。
- タイムラインHTMLは packet2014 の `window.renderStaffTimelineDay()`（buildTimeline）を**流用**。id衝突回避のため `staff-tl→staff-tl-board` 等にリネーム、縦グリッド切替トグルは除去（ボードに縦グリッドは無い）。
- ルーティンは `getTodayRoutinesForUser`/`getRoutineDoneIds`（既存グローバル）から右側カードを生成。
- **ルーティンD&D/割当は自前実装**：ドロップ/「割当」ボタン→ `assignRoutine()` が `state.tasks` に追加→ `_persistTasks()`（既存）→ `renderTaskBoard()` で即再描画→トースト。重複防止。
  - packet2014 の `createTaskFromRoutine` は内部で `renderDay()` を呼ぶため、ボード文脈では副作用回避のため自前 `assignRoutine`（`renderTaskBoard` 更新）を使用。

## 3. レイアウト
- PC：左=担当者（氏名＋件数, sticky）／上=時間目盛8-18／行=色付きブロック（時刻＋内容）。横長表形式。
- スマホ：`overflow-x:auto` で横スクロール、氏名列 `position:sticky;left:0`。
- 凡例（架電/追客/査定・訪問/物件・資料作成/内見対応/MTG/ルーティン/その他）・合計件数は buildTimeline 由来をそのまま表示。

## 4. 非破壊・安全
- 月/週/日カレンダー（renderMonth/Week/Day）・予定追加/タスク追加/ルーティン完了は**無改変**。
- packet2014 の「カレンダー日表示タイムライン」も**残す**（両方で見れる）。idは分離（`#staff-tl` vs `#staff-tl-board`）。
- `#tb-body` が無ければ何もしない。状態は in-memory／保存は既存 `_persistTasks` のみ。

## 5. 検証
- `node --check`（単体＋埋込）PASS・`<script>` 7/7一致・禁止APIトークン0件
- renderMonth/Week/Day・CRM非表示マーカー無傷
- 期待：タスクボードを開くと（カレンダー日表示に行かずとも）担当者別スケジュールが常設表示／ルーティンD&D・割当でタスク化→即ボード反映

## 6. 既知の制限（静的MVP）
- ボード上のブロック・クリック編集は省略（編集は従来のカレンダー日表示/タスク詳細に委譲）。
- 対象日は `selDate`（既定=本日）。日付ナビ連動は次段で拡張可能。
- アバター写真はデータが無ければ氏名頭文字＋色ドット（buildTimeline 既存仕様）。

## 7. 禁止事項の遵守
- Supabase/SQL/RLS/Auth・外部API/OpenAI/Claude/Sheets/CloudRun 不使用・localStorage/sessionStorage本文保存なし・顧客タブ復活なし・既存破壊なし。
