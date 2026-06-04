# 🗓 担当者別タイムライン UX改善 — 4時間ビュー＋15分グリッド＋自動スクロール（packet 2039）

- 実装日: 2026-06-04 ／ 対象: packet2014(buildTimeline・日表示/ボード共有)・packet2027(ボード埋込)・packet2031(リサイズ/編集)・packet2034〜2038(ドラッグ/✓)＋新規packet2039(自動スクロール)
- 目的: 8:00〜24:00を全部見せる思想をやめ、**Googleカレンダー/Outlook風の時間軸重視UI**へ。「今から数時間先」を大きく見せる。

## 1. 変更内容（ゴール対応）
| # | ゴール | 対応 |
|---|--------|------|
| ① | 約4時間ビュー（初期8:00〜12:00程度・以降横スクロール） | `HOURW=180→260` で全幅 16h×260=4160px。標準ビューポートで約4時間分が見え、残りは既存`.stl-scroll`で横スクロール。＋⑦の自動スクロール |
| ② | 15分グリッド | packet2038で15分グリッド線(g4・3階調)実装済。**HOURW=260で15分=65px**となり視認性UP。さらに**時間軸ラベルを15分刻み**化（毎時=太字/30分=中/15・45分=薄小） |
| ③ | ドラッグ移動15分スナップ | packet2038で`snap15`実装済（本packetはHOURW追従のみ） |
| ④ | リサイズ15分 | packet2038で`MIN=15`/`snap15`/最小幅`HOURW/4`実装済（HOURW=260で15分=65px） |
| ⑤ | ブロック拡大 | 高さ`BLOCKH=48→52`、時刻フォント`9→10px`、タイトル`11→12px`、予定名2行(line-clamp:2)維持 |
| ⑥ | タイムライン幅 | `HOURW=260`（推奨値）。buildTimeline/board/packet2031/drag/autoscroll 全整合 |
| ⑦ | 自動スクロール | 新規IIFE。初期表示で**現在時刻の45分前**を左端付近へ（当日のみ／当日以外は8:00）。**スクロール位置はre-render間で保持**＝ドラッグ/編集で毎回先頭へ飛ばない。**日付変更時のみ**now基準へ再設定 |
| ⑧ | Sticky維持 | 担当者列(sticky left)・時間ヘッダ(sticky top) 既存のまま無改変 |

## 2. 自動スクロールの設計（packet2039 IIFE）
- 容器：`.stl-scroll`（日表示`#staff-tl`／ボード`#staff-tl-board`）をキー分離。
- `nowScrollLeft()`：当日なら `UNSETW + (max(8:00, now-45分)-8:00)/60*HOURW`、当日以外は0。`.stl-scroll`の`scrollLeft`へ設定。
- 位置保持：`scroll`イベントでユーザー位置を記憶し、再描画時に復元。`apply()`内で**日付キーが変わったらリセット**してnow基準へ。
- フック：`window.renderTaskBoard`/`renderDay`/`renderCal` を**さらに外側でラップ**（既存ラップ非破壊）して遅延apply。packet2026/2027の遅延injectに合わせ複数回apply。
- 定数（HOURW=260/START_H=8/UNSETW=92）は buildTimeline と整合（変更時は追従要）。

## 3. 既存機能の維持（絶対条件）
- ✓完了・予定編集・タスク編集・ドラッグ移動・上下担当者変更・横時間変更・リサイズ・タスク保存・予定保存 すべて無改変（HOURW定数追従のみ）。
- 月表示/週表示・既存予定追加/タスク追加・ルーティンD&D 無改変。Sticky維持。状態は in-memory＋既存persist。新規外部接続なし。

## 4. 検証
- `node --check`：buildTimeline / board(packet2027) / packet2031 / drag(packet2037) / autoscroll の各ブロック **全OK**。`<script>` 11/11。
- `HOURW=260` 全整合・`HOURW=180`残存0・`BLOCKH=52`・15分ラベルループ(q*15)・autoscroll IIFE・`MIN=15`・`snap15` 検出。
- 禁止APIトークン0件・renderMonth/renderWeek健在・`page-customers`参照0（顧客タブ復活なし）。
- 期待（要ブラウザ手動確認 🟡）：
  1. 画面表示時に約4時間だけ表示・**現在時刻付近**にスクロール（例：10:20なら9:00台が左に）
  2. 15分グリッド/ラベル表示・ブロックが大きく予定名2行
  3. ドラッグ移動15分刻み・上下で担当者変更・ドロップ後その場に残る（packet2038修正済）
  4. リサイズ15分刻み・✓完了・予定/タスク編集 維持
  5. リロード後も位置維持・スマホ横スクロール維持・既存エラー無し

## 5. 補足（既知）
- タスク保存エラー（packet2038調査）の根本（H1: sh/sm/dur カラム or H2: ルーティンid=Date.now()）は**本packet対象外**。Console `[packet 466 sbUpsert] tasks FAILED body:` の確認待ち。本packetは表示UXのみ。

## 6. 禁止事項の遵守
- force push/reset/clean/rebase なし・.claude add なし・SQL/Supabase/RLS/Auth なし・外部API/Sheets/OpenAI/Claude/CloudRun なし・localStorage本文保存なし・顧客タブ復活なし・月/週/✓/編集/ドラッグ/リサイズ/保存 破壊なし。
- 本packetは **commitまで。pushはボス承認後（push停止）。**
