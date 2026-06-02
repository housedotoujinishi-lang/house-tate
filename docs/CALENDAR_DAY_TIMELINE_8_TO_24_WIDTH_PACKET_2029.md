# 🕛 担当者別タイムライン 8:00〜24:00・横幅拡張（packet 2029）

- 実装日: 2026-06-02 ／ 対象: `buildTimeline`（packet2014・日表示＋タスクボード共有）＋ packet2027 ローカル定数
- 目的: 夜の予定・残業・来客対応・遅い追客・日報対応まで見える。横長でも見やすさ優先。

## 1. 事前調査結果
| # | 調査項目 | 実コード所在/結論 |
|---|---------|------------------|
| ① | 実装位置 | packet2014（35254, buildTimeline）＋ packet2027（35610, board）。共有関数 |
| ② | 時間軸定数 | `START_H/END_H/HOURW/MINW/AVAIL_END`（packet2014）／packet2027にローカル `START_H/END_H/HOURW` |
| ③ | 目盛生成 | `for(hh=START_H;hh<=END_H;hh++)`（定数駆動） |
| ④ | left/width | `left=(s-START_H*60)/60*HOURW, w=max((e-s)/60*HOURW-2, MINW)` |
| ⑤ | 横スクロールCSS | `.stl-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}` |
| ⑥ | スマホ/氏名列 | 氏名列 `position:sticky;left:0`（横スクロールでも固定） |
| ⑦ | 予定名表示幅/省略 | 2段ブロック＋`text-overflow:ellipsis`、フォント10/11px |
| ⑧ | 空き率の時間軸依存 | **非依存**（`AVAIL_END=18` 固定の就業コア基準） |

### 報告
- **変更する定数**：`END_H 18→24`、`HOURW 64→120`（16時間×120px=1920px）、`MINW 64→80`、新規 `AVAIL_END=18`。
- **影響する関数**：`buildTimeline`（目盛/ブロック/行）、`getTimeFromDropPosition`（packet2014/2027・定数駆動で自動24:00対応）。
- **影響するCSS**：トラック総幅 (24-8)×120 = **1920px**（横スクロール）。stl-scroll/sticky は既存維持。
- **空き率計算への影響**：なし（時間軸非依存・就業コア8-18で維持）。
- **月表示/週表示への影響**：なし（renderMonth/renderWeek 独立・無改変）。
- **予定追加/タスク追加への影響**：なし（保存・追加ロジック不変）。

## 2. 実装（最小修正）
1. **時間軸 8:00〜24:00**：`END_H=24`（目盛 8,9,…,24＝17個・24:00を終端表示）。
2. **横幅拡張**：`HOURW=120`（1時間120px・余白増）。合計 16h×120=1920px。PC/スマホとも横スクロール。
3. **横スクロール**：`.stl-scroll{overflow-x:auto}`・左担当者列 `sticky` 維持。
4. **予定名/タスク名の可読性**：2段ブロック（1段目=種別アイコン＋時刻、2段目=名称ellipsis）・`MINW=80`・名称フォント11px。優先順位＝時間→名称→種別→担当者（種別/担当者はhover title）。
5. **既存データ維持**：state.events／state.tasks／時間未設定タスク／担当者行／担当者フィルター／空き率 すべて維持。
6. **ドロップ位置計算**：`getTimeFromDropPosition` は `START_H/HOURW` から時刻算出し `clamp(START_H..END_H=24)`。24:00より右は24:00手前へ丸め。1時間単位。20:00/22:00への割当可。

## 3. 反映先
`buildTimeline` 共有のため **日表示タイムライン＋タスクボード常設ボード両方**が 8-24・1時間120pxに。

## 4. 検証
- `node --check`（packet2014/2027ブロック）PASS・`<script>` 7/7一致・CRM無傷・禁止APIトークン0件
- 目盛17(8-24)・トラック1920px・18:00以降の余白あり・空き率コア8-18維持・D&D 24:00対応・24:00終端のはみ出しなし
- 月/週/予定追加/タスク追加/ルーティンD&D 無改変

## 5. 禁止事項の遵守
- force push/reset/clean/rebase・.claude追跡・Supabase/SQL/RLS/Auth・外部API/OpenAI/Claude/Sheets/CloudRun・localStorage本文保存・顧客タブ復活・月/週破壊・既存追加破壊：**いずれも無し**。
