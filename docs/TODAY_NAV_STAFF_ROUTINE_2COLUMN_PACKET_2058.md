# 担当者別カードビュー＋本日のルーティン 横並び2カラムMVP（packet 2058）

- 種別：**UI改善（2カラムダッシュボード）。既存ルーティン完了(tb-body)・ドラッグ・保存は非編集**
- 日付：2026-06-07
- 対象：`buildTimeline()`（`#staff-tl` 内）
- 参考：ボス提供UI画像（git管理外）

---

## 1. 課題
担当者別カードビュー（packet2054）の下に本日のルーティンが縦に長く並び、画面が長く・ルーティンが主役を奪っていた。担当者の今日の動きと毎日の型は横に並べた方が比較しやすい。

## 2. 配置の確認と方針
- 担当者カードビュー `.stlc-wrap` は `#staff-tl`（カレンダー日表示）内。本日のルーティン完了リスト `.tb-routine-section`/`.tb-routine-d` は `#tb-body`（タスクパネル）内＝**別DOM親**。
- 別親のためCSSのみの横並びは不可。DOM移動は高リスク（黄色信号）。
- → **最も安全かつ理想に合う案**：`#staff-tl` 内に**カードビュー（左）＋本日のルーティン（右）の2カラム**を新設。ルーティンは既存グローバル関数で生成し、**tb-body側ルーティン（折りたたみ・packet2057）と `data-tbraction` は一切触らない**。

## 3. 実装内容（buildTimeline 内・追加のみ）
- `routineColHtml`（右カラム）を `getTodayRoutinesForUser()`＋`getRoutineDoneIds()` から生成（read：既存グローバル）。
  - 各ルーティン：名前＋メタ（対象/⏰時刻/⏱所要）＋**完了/戻すボタン**。
  - 完了は `onclick="tynRoutineToggle(id, true/false)"`（**`data-tbraction` 非依存**）。
  - ヘッダに「📋 本日のルーティン（done/total）」＋「編集 →」（`switchPage('routine')`）。
- 注入：`#staff-tl` のカードビューを `<div class="tyn-dash"><div class="tyn-dash-left">…カードビュー…</div>…ルーティン右…</div>` の**2カラム**に。
- `tynRoutineToggle(id, makeDone)`（新規グローバル）：既存 `markRoutineDone`/`unmarkRoutineDone`（＝既存のルーティン完了localStorage管理）を呼び、`renderDay()`（無ければ`render()`）で `#staff-tl` を再描画して状態反映。**新規保存ロジック・新規localStorageキーなし**。
- 時間軸グリッドは引き続き折りたたみ（packet2055 `.stl-axis-d`）内に維持。

## 4. レイアウト
- **PC**：左＝担当者カードビュー（横スクロール）／右＝本日のルーティン（幅244px・**内部縦スクロール** `max-height:440px`）。横並びで一画面で比較。
- **スマホ**（`max-width:700px`）：`flex-direction:column` で**縦積み**（1.カードビュー → 2.ルーティン）。横はみ出しなし・ルーティンは `max-height:300px` 内スクロール。

## 5. 既存機能を壊していない（実測）
- `<script>`11/11・`<style>`3/3・**全インラインJS `node --check` PASS**。
- **fetch 24→24・localStorage setItem 62→62（新規なし）**（`markRoutineDone` の既存ルーティン完了保存のみ・新規追加なし）。
- **tb-body 側ルーティン完了は非編集**：`appendRoutineToTaskBoard`（×1）・`data-tbraction` 実使用3箇所（10066/10067/10073）unchanged・`.tb-routine-d` 折りたたみ維持。
- 担当者カードビュー（`.stlc-wrap`×5）・時間軸（`.stl-axis-d`）・ドラッグ（`stl-blk`×9）・保存（`_persistTasks`）・完了（`bindChk`）・横スクロール（`minmax(0,1fr)`×6）維持。
- 差分：index.html **+44 / -1**（`+cardViewHtml` を2カラムラッパーに置換）。

## 6. スマホ・動作確認項目（ボス目視）
- [ ] PCで担当者カードビュー（左）と本日のルーティン（右）が**横並び**。
- [ ] 右ルーティンが**内部スクロール**し、画面が縦に伸びすぎない。
- [ ] 右ルーティンの**✓完了/↩戻す**が動き、状態が反映される（編集 → でルーティン編集へ）。
- [ ] スマホでは縦積み（カードビュー→ルーティン）で横はみ出しなし。
- [ ] カードビュー横スクロール・時間軸折りたたみ・タスク追加・完了・ドラッグが従来どおり。

## 7. 補足（正直記録）
- tb-body 側の折りたたみルーティン（packet2057）は安全のため残置＝右カラムと内容が重複するが、左パネルでは折りたたみ済みで邪魔しない。将来、片方に一本化を検討（次packet）。
- 右カラム完了時は `renderDay()` で `#staff-tl` 全体を再描画（スクロール位置がリセットされる場合あり）。実害小のためMVPでは許容。

## 8. 次packet候補
- packet 2059：ルーティン表示を右カラムに一本化（tb-body側の重複整理・安全に）。
- packet 2060：右カラム完了時の部分更新（全体再描画を避けスクロール維持）。

— packet 2058 / 担当者カードビュー＋ルーティン 2カラムMVP / tb-bodyルーティン・ドラッグ・保存 非編集。
