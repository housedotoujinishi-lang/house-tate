# ✅ タスクボード司令塔化2 — 完了チェック＋30分統一＋横幅拡張＋時間軸改善（packet 2035）

- 実装日: 2026-06-02〜03（ConnectionRefusedで中断→復旧完成）／ 対象: `buildTimeline`（packet2014・日表示＋タスクボード共有）＋packet2031/2034＋予定追加フォーム＋新規packet2035
- 目的: タスクボードを「見やすく・操作しやすく・完了管理できる司令塔」へ。

## 1. 必須対応と実装
### ① タスクブロックに完了チェック（✓トグル）
- **タスク種別のブロックのみ** 右上に `.stl-chk`（✓ボタン）を表示（予定ブロックには出さない）。
- 押下で `t.done` を true/false トグル → `_persistTasks()` → 再描画（`renderTaskBoard`＋`renderDay`）→ トースト。
- 完了済みはブロックを薄く（opacity .5）＋✓を緑表示。**取り消し（未完了化）も同じボタンで可能**。
- 競合防止：packet2031のクリック編集除外に `.stl-chk` を追加（`.stl-rsz,.stl-move,.stl-chk`）。ハンドラはcapture phaseで、packet2031の`stopPropagation`は同一documentの他リスナを止めないため確実に発火。
- リロード後の完了状態：`saveTasks`/load が `done` を送受信（既存）＝**維持される**。

### ② 時間刻みを30分基準に統一（残存15分の総点検）
- packet2034で一部30分化済み。本packetで残存15分処理を全廃：
  - 予定追加フォーム `setupEvForm`（ef-s/ef-e）／`setupDayEvForm`（day-ef-s/day-ef-e）：`['00','15','30','45']`→**`['00','30']`**。
  - packet2031 リサイズ最小幅 `HOURW/4`→**`HOURW/2`**（=30分）、編集モーダル下限 `sMin+15`→**`sMin+30`**。
  - 既存30分：`MIN=30`／`snap`丸め`/30*30`／編集モーダル`option m+=30`／ドラッグ移動snap30／showEvModal(00/30)。
- 検証：`HOURW/4`残存0・`['00','15','30','45']`残存0・`eMin=sMin+15`残存0。

### ③ 横幅拡張
- `HOURW=120`→**`HOURW=180`**（4箇所＝buildTimeline定数／board／packet2031／packet2034 全整合、残存120=0）。
- `MINW` 80→96、ブロック内余白 `padding 3px 11px 3px 16px`→**`4px 13px 4px 18px`**（タイトル・時刻・担当が見やすく）。8-24時の横スクロール前提。

### ④ 時間軸を見やすく（30分位置）
- 時刻ラベル：毎時（8:00…）＝濃い太字（#475569）＋30分（8:30…）＝薄い小（#94a3b8）。
- グリッド線：30分刻みで描画。**毎時=濃い（#dbe2ea）／30分=薄い（#f1f5f9）**。
- sticky時間軸ヘッダは維持。

### ⑤ スマホ横スクロール維持
- 縮小せず横スクロール（担当者列sticky・時間軸sticky維持）。
- ドラッグが難しい場合も **クリック編集（30分刻みモーダル）で変更可能** な状態を維持。

## 2. 維持・非改変
- 月表示/週表示（renderMonth/renderWeek）・既存の予定追加/タスク追加・日間カレンダー 無改変。
- packet2031編集/リサイズ・packet2034ドラッグ移動/現在時刻ライン・ルーティンD&D・担当者フィルター・空き率 維持。
- 状態は in-memory＋既存persist（`_persistTasks`/`_persistEvents`）。**新規外部接続なし・localStorage本文保存なし**。

## 3. 検証
- `node --check`：最終ブロック OK・buildTimeline含むメインブロック OK。`<script>` 10/10一致。
- 禁止APIトークン0件（openai/anthropic/googleapis/run.app）。renderMonth/renderWeek 健在。
- 完了チェックON/OFF→`done`トグル＋`_persistTasks`＋再描画／リロード後 `done` 維持（saveTasks/loadがdone送受信）。
- 予定追加・編集・ドラッグ移動・リサイズ 全て30分刻み。横幅180pxで視認性向上。
- ⚠️ ドラッグ等インタラクション・スマホ横スクロールは実ブラウザでの手動確認推奨（🟡）。

## 4. 復旧記録
- ConnectionRefusedで `setupEvForm`の30分化 と ✓トグルハンドラ追加 の直前で中断。working treeに既存編集は保持されており、reset/clean/rebaseは不使用。残2点を補完して完成。

## 5. 禁止事項の遵守
- force push/reset/clean/rebase なし・.claude add なし・Supabase SQL/RLS/Auth なし・外部API なし・顧客タブ復活なし・localStorage本文保存なし・既存予定追加/タスク追加/日間/月間/週間カレンダー破壊なし。
- 本packetは **commitまで。push禁止。**
