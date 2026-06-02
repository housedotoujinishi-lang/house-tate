# 🎛 タスクボード司令塔化 — ドラッグ移動＋30分刻み＋現在時刻ライン（packet 2034）

- 実装日: 2026-06-02 ／ 対象: `buildTimeline`（packet2014・日表示＋タスクボード共有）＋packet2031＋新規packet2034
- 目的: 「見る／その場で時刻変更」から **「営業・店長が1日中使う司令塔」** へ。ブロックをドラッグして時刻も担当者も動かせる日間ボードにする。

## 1. 要件と対応状況
| 要件 | 対応 | 実装箇所 |
|------|------|----------|
| 表示時間 8:00〜24:00 | ✅ 既存（START_H=8 / END_H=24） | packet2029/2014 |
| 横幅拡張 | ✅ 既存（HOURW=120・横スクロール） | packet2029 |
| 30分刻み | ✅ 本packetで15分→**30分**へ統一（移動・リサイズ・編集モーダル） | packet2031改＋2034 |
| 時間軸固定 | ✅ 既存（時刻ヘッダ＋gridlines） | packet2014 |
| ドラッグ移動 | ✅ **新規**（横=開始時刻／縦=担当者レーン変更） | packet2034 |
| ドラッグリサイズ | ✅ 既存（右端 `.stl-rsz`、30分刻みへ） | packet2031 |
| 担当者レーン固定 | ✅ 既存（担当者列sticky） | packet2014 |
| 今日列強調 | ✅ **新規 現在時刻ライン**（当日のみ赤縦線） | packet2034(nowLineHtml) |
| スマホ対応 | 🟡 グリップドラッグ対応（touchmoveでスクロール誤爆抑止）。細かな操作は編集モーダルで補完 | packet2034 |

## 2. 実装内容
### ① 30分刻みへ統一（packet2031の最小改修）
- `MIN=15`→**`MIN=30`**、`snap15(min)` の丸めを `Math.round(min/30)*30` に変更（関数名は据え置き）。
- 編集モーダルの時刻 `<option>` ステップ `m+=15`→**`m+=30`**。
- → クリック編集・右端リサイズ・ドラッグ移動すべて 30分グリッド。

### ② ブロックに移動グリップ（buildTimeline・両画面反映）
- ブロック左に `.stl-move`（⠿ハンドル・`cursor:grab`・幅12px）。`padding-left` を 6→16px にしてグリップと文字の干渉回避。
- packet2031 のクリック編集除外条件を `.stl-rsz` → `.stl-rsz,.stl-move` に拡張（グリップ操作で編集モーダルが開かない）。

### ③ ドラッグ移動（新規 packet2034）
- `.stl-move` の pointerdown→move→up で移動。**横移動＝開始時刻**（30分スナップ、`[8:00, 24:00−所要]` でクランプ）、**縦移動＝担当者レーン**（`elementFromPoint`→`.stl-row[data-mi]` で対象担当者を判定、`data-mi>=0` のみ）。
- 確定時：
  - 予定 → `state.events[mi][eidx]` の `sh/sm/eh/em` 更新。担当者変更時は配列間で `splice`→`push`。→ `_persistEvents()`。
  - タスク → `state.tasks` の `sh/sm`（＋未設定なら`dur`）更新。担当者変更時は `toIdx` 更新。→ `_persistTasks()`。
  - 再描画（`renderTaskBoard`＋`renderDay`）＋トースト。
- 競合防止：移動後の `click` がブロックに当たらないよう、確定時に `pointer-events:none`（再描画で破棄）。移動なし（純クリック）はグリップ除外で無反応。

### ④ 現在時刻ライン（今日列強調）
- `nowLineHtml()`：表示日が当日（`isT(selDate)`）かつ現在時刻が8:00〜24:00内のとき、各トラックに赤縦線（2px・`pointer-events:none`）。

## 3. 維持・非改変
- 8-24時／横スクロール／担当者列sticky／空き率（AVAIL_END=18）／件数／ルーティンD&D／担当者フィルター 維持。
- 月表示/週表示（renderMonth/renderWeek）・既存の予定追加/タスク追加・packet2031編集/リサイズ 無改変。
- 状態は in-memory＋既存 persist（`_persistEvents`/`_persistTasks`→packet2033で時間カラム永続化済み）。**新規外部接続なし**。

## 4. 検証
- `node --check`（packet2034ブロック）PASS・`<script>` 9/9一致・CRM非表示マーカー無傷・renderMonth/renderWeek 健在・禁止APIトークン0件（openai/anthropic/googleapis/run.app）。
- localStorage/sessionStorage の本文保存は **本packetで新規追加なし**（移動はメモリ＋既存persist経路のみ）。
- 期待動作（要ブラウザ手動確認 🟡）：ブロック左⠿をドラッグ→横で開始時刻が30分刻み移動／縦で担当者レーン変更／離すと保存・再描画・トースト／当日は赤い現在時刻ライン表示。

## 5. 既知の制限
- スマホは「グリップを掴んでドラッグ」。細かい時刻指定は編集モーダル（30分刻み）が確実。
- 移動先が「未担当」レーン（data-mi=-1）の場合はレーン変更せず時刻のみ変更（未割当化は対象外）。
- `fromRoutine/routineId` はDB未永続（packet2033既知事項）。

## 6. 禁止事項の遵守
- Supabase/SQL/RLS/Auth 変更なし・外部API/OpenAI/Claude/Sheets/CloudRun 不使用・localStorage本文保存なし・顧客タブ復活なし・月/週破壊なし・既存予定追加/タスク追加/ルーティンD&D破壊なし。
- 本packetは **実装＋docs＋CHANGELOG・commitまで。push禁止。**
