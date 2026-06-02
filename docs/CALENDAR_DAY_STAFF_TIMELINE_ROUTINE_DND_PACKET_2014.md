# 📅 担当者別 日間タイムライン + ルーティンD&D割当（packet 2014）

- 実装日: 2026-06-02 ／ 対象: `index.html` 日表示のみ（月/週は無改変）
- 方式: `renderDay` を**非破壊ラップ**（既存コード未変更）。`index.html`末尾に1つの`<script>`を追記。

## 概要
カレンダー日表示に **担当者別の横タイムライン** を追加し、右の「本日のルーティン」を**ドラッグ&ドロップ（またはスマホ用「割当」ボタン）で担当者の時間帯に割当**できるようにした。割当は既存 `state.tasks` にタスクとして追加し、既存 `_persistTasks` で保存。ルーティン本体（日課の正本）は消さない。

## 担当者別タイムライン
- 左列＝担当者名＋本日件数（sticky）／上部＝時間目盛 8:00〜18:00／本体＝担当者ごとの行
- 行に予定（`state.events`）＋タスク（`state.tasks`, `toIdx`一致）を時間配置。重なりは自動レーン分け。
- 時間未設定タスクは各行の「時間未設定」列に表示。完了タスクは薄表示（✓）。
- 担当者フィルター（既存 `visMis()`）連動：表示中メンバーのみ行表示。全員表示時は「未担当」行も表示（表示専用）。
- ブロック表示：時間・内容・種別・担当者（tooltip）。クリックで既存導線（予定=`showEvModal`／タスク=`showTaskDetail`）。
- 「🕓 時間軸表示に切替」で既存の縦時間グリッド（`.daytg`）に戻せる（既存表示は破棄せず display 切替）。

### 色分け（凡例を画面下部に表示）
架電=青／追客=ピンク／査定・訪問=緑／物件・資料作成=紫／内見対応=オレンジ／MTG・打合せ=水色／**ルーティン=赤系**／その他・休憩=グレー。

## ルーティンD&D割当
- 日表示内に「📋 本日のルーティン」ストリップを追加（`getTodayRoutinesForUser` から取得・読み取り）。未完了のみドラッグ可、完了はドラッグ不可＆`割当`ボタン非表示。
- **ドロップ**：担当者行（`data-droprow`）にドロップ→ `getStaffFromDropTarget`(担当者) ＋ `getTimeFromDropPosition`(X座標→1時間単位)→ `createTaskFromRoutine`。
- **スマホ/フォールバック**：各ルーティンカードの「割当」ボタン→ 担当者・開始時刻を選ぶ簡易ポップアップ→ 割当。
- ドロップ中：カード半透明＋対象行ハイライト。
- `createTaskFromRoutine`：`state.tasks` に `{id,title,cat,pri,status,toIdx,deadline,comment,done, sh,sm,dur,fromRoutine:true,routineId}` を追加→ `_persistTasks()`（既存）→ `renderDay()` 再描画→ トースト「〇〇を〇〇の15:00に割り当てました」。
- **重複防止**：同タイトル・同担当・同日・同時刻・fromRoutine の二重追加を抑止（トースト通知）。
- ルーティン本体は不変（タスク化のみ・完了状態とは別概念）。

## 公開関数（仕様準拠）
`appendStaffTimelineToDayCalendar` / `renderStaffTimelineDay` / `createTaskFromRoutine` / `getStaffFromDropTarget` / `getTimeFromDropPosition`（＋内部 `makeRoutineDraggable` / `handleRoutineDropToStaffTimeline`）。

## 非破壊・データ方針
- `renderDay` はラップのみ・月/週（`renderMonth`/`renderWeek`）未変更・予定追加/タスク追加/ルーティン完了処理は未改変。
- 保存は既存 `state.tasks` ＋ `_persistTasks`。**新規 localStorage キー追加なし／本文・個人情報の localStorage・sessionStorage 保存なし**。
- Supabase/SQL/RLS/Auth 変更なし・外部API/Sheets/AI/CloudRun 接続なし・顧客タブ復活なし。

## MVPの割り切り
- ドロップ時刻は**1時間単位**に丸め（8〜18）。
- ドロップ先は実在メンバー行のみ（「未担当」「店舗全体」は表示専用。割当先は実メンバー／割当ボタンの選択肢も実メンバー）。
- クリックの既存導線復元はタイトル一致で再バインド（同名同時刻の重複時は先頭一致）。

## 検証
- `node --check`（単体＋埋込抽出）PASS／`<script>`5/5一致
- 月/週/renderDay・CRM非表示マーカー無傷／禁止APIトークン0件（保存は既存`_persistTasks`）
- 実機クリック/ドラッグ確認は公開URLでの操作を推奨（自動ツールはD&D再現不可）
