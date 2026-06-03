# 🛠 担当者別タイムライン ドラッグ移動 hotfix（packet 2037）

- 実装日: 2026-06-03 ／ 対象: packet2034 ドラッグ移動IIFE（buildTimeline共有＝日表示＋タスクボード）＋packet2031クリック編集
- 症状: 公開URLで、担当者別タイムラインのブロックをドラッグしても**移動できない**（横幅180px・30分目盛り・⠿ハンドルは表示。右端リサイズは動く）。

## 1. 原因調査（12項目）
| # | 項目 | 結論 |
|---|------|------|
| 1 | packet2034ドラッグ実装の存在 | ✅ 存在（index.html内IIFE） |
| 2 | `.stl-move` pointerdown登録 | ✅ 登録あり。ただし**`.stl-move`(幅12px)限定** |
| 3 | `.stl-blk`本体を掴むと無視か | **YES＝本体は対象外**。使いにくさの一因 |
| 4 | 2035でHTML変更→`.stl-move`/data属性/data-mi/evmi/taskid破損か | **破損なし**（grep確認：`stl-move`/`stl-chk`各1・data属性健在） |
| 5 | `elementFromPoint`で`.stl-row[data-mi]`取得 | ロジックは正。ただし⑥の影響下 |
| 6 | 横スクロールコンテナがpointermoveを阻害 | document委譲のため本来は無関係。ただし下記**主因**あり |
| 7 | `.stl-rsz`リサイズとの競合 | なし（別セレクタ） |
| 8 | `.stl-chk`完了チェックとの競合 | なし |
| 9 | 予定/タスク両方が対象 | ✅ 両対応 |
| 10 | 確定でstate更新 | ロジック正 |
| 11 | `_persistEvents`/`_persistTasks` | 呼ばれる実装 |
| 12 | `renderTaskBoard`/`renderDay`再描画 | 呼ばれる実装 |

### 主因（確定）
- **動く右端リサイズ**＝`.stl-rsz`で pointerdown→**動的に**`pointermove/up`をその場で登録、`setPointerCapture`不使用。
- **動かない移動**＝`.stl-move`限定＋**`setPointerCapture(blk)`**＋常駐pointermove内で**捕捉中要素の`pointerEvents='none'`トグル**。この組み合わせは一部ブラウザで**暗黙のポインターキャプチャを解放**し、以降のmove/upが意図通り届かず移動が成立しない。
- 加えて、トリガが12pxのハンドル限定で**本体を掴んでも動かない**＝体感的に「効かない」。

## 2. 修正（最小・実績方式へ統一）
packet2034のドラッグIIFEの **pointerdown/move/up 部分のみ** を、動作実績のあるリサイズと同方式へ書き換え（確定ロジック・ヘルパー`findEvByBlk`/`findTaskByBlk`/`persist`/`refresh`/`snap30`は流用）。

- **トリガ拡張**：`.stl-blk`**本体**でドラッグ開始（`⠿`を掴んでも本体扱いで動く）。`.stl-rsz`（右端リサイズ）・`.stl-chk`（完了チェック）は `closest` で**除外**し各ハンドラに委譲。`data-s`無し（未担当チップ）は対象外。
- **方式変更**：`setPointerCapture`を**撤廃**。pointerdownで`document`に`pointermove/pointerup`を**動的登録**→pointerupで解除。
- **ドラッグ判定**：5px超で`dragging`。pointerdownでは`preventDefault/stopPropagation`を**呼ばない**＝クリックのみなら従来どおり編集モーダルが開く。
- **移動量**：横＝開始時刻（`snap30`で30分丸め、`[8:00, 24:00−所要]`にクランプ）／縦＝`elementFromPoint`→`.stl-row[data-mi]`で担当者レーン判定（`data-mi>=0`のみ）。
- **ドラッグ中UI**：ブロック半透明（opacity .6）＋縦`translateY`ゴースト＋ドロップ先レーンを薄くハイライト（`rgba(37,99,235,.08)`）＋トースト「〇〇 9:00へ移動しました」。
- **クリック競合**：実移動時に`window.__htDragUntil=Date.now()+400`を立て、packet2031のクリック編集が直後400msは`stopPropagation`で抑止（既存`b.onclick`も同時に抑止）。

## 3. 保存
- **予定**：`state.events`の`sh/sm/eh/em`更新。担当者変更時は該当メンバー配列へ`splice`→`push`。`_persistEvents()`。
- **タスク**：`state.tasks`の`sh/sm`（＋未設定なら`dur`）更新。担当者変更時は`toIdx`更新。`_persistTasks()`。
  - 注：タスクの`sh/sm/dur`はpacket2033のDBカラム追加で**永続化済み**。本hotfixでも在メモリ更新＋既存persistで保存される。

## 4. 検証
- `node --check`：ドラッグブロック OK・buildTimeline含むメインブロック OK。`<script>` 10/10。
- `setPointerCapture`実呼び出し残存0（コメントの説明文のみ）・旧`.stl-move`限定トリガ残存0。
- 禁止APIトークン0件・renderMonth/renderWeek健在・`page-customers`参照0（顧客タブ復活なし）。
- 期待（要ブラウザ手動確認 🟡）：
  - ブロック本体ドラッグで移動／`⠿`を掴んでも移動／右端リサイズは従来どおり／✓完了は従来どおり／クリックのみで編集モーダル。
  - 左右で開始時刻変更・上下で担当者変更・30分刻み・8:00未満/24:00超に行かない・タスク/予定とも移動・移動後すぐ再描画。

## 5. 維持・非改変
- 月/週/日間カレンダー・既存予定追加/タスク追加・ルーティンD&D・右端リサイズ・完了チェック・クリック編集 無改変。
- 状態は in-memory＋既存persist。新規外部接続なし・localStorage本文保存なし。

## 6. 禁止事項の遵守
- force push/reset/clean/rebase なし・.claude add なし・Supabase/SQL/RLS/Auth なし・外部API/Sheets/OpenAI/Claude/CloudRun なし・localStorage本文保存なし・顧客タブ復活なし・月/週/右端リサイズ/完了チェック/クリック編集 破壊なし。
- 本packetは **commitまで。pushはボス承認後（push停止）。**
