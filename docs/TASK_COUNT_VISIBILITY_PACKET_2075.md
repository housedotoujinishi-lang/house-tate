# タスクボード #tf-count 視認性改善（TASK_COUNT_VISIBILITY_PACKET_2075）

最終更新：2026-06-08
packet：2075（house-tate-source / 対応 OS packet 664・v0.9.664）
管理：dev / qa
種別：軽めのUI改善（件数表示の視認性・style のみ・Lv1／🟡 MEDIUM）
前提：packet 663/2074 の Codex 棚卸しで C7「#tf-count 視認性改善」が高優先（小さく安全で効果が出やすい）と判定。注意点：文言/色/見た目に限定、件数算出ロジックは触らない。

## 1. 目的
タスクボードのフィルタバー右端の件数表示 `#tf-count`（例「12件」）が **9px・薄色（--t3）** で見落としやすい。
現場スタッフが件数を把握しやすいよう、**見た目だけ**を強化する（件数の算出は不変）。

## 2. 変更内容（最小差分・style のみ）
`#tf-count`（`index.html` 1844）の inline style を視認性向上に変更：
| 項目 | 変更前 | 変更後 |
|------|--------|--------|
| font-size | 9px | 10.5px |
| font-weight | （なし=400） | 700 |
| color | var(--t3)（薄） | var(--navy)（primary） |
| 背景 | なし | var(--navy-lt)（淡い primary 背景＝ピル） |
| padding | なし | 2px 8px |
| border-radius | なし | 10px |
| white-space | （なし） | nowrap（「123件」が折返さない） |
| margin-left | auto（維持） | auto（維持＝右寄せ不変） |

- **件数算出ロジック（`index.html` 6641・6726 の `tfCount.textContent=...件`）・`applyTaskFilter`・`taskFilter`・`state.tasks`・`_persistTasks` は一切変更なし**。span の表示スタイルのみ。
- color/背景は `body.dark` override 済み変数（navy/navy-lt）でダークも自動対応。
- diff：`index.html` +1/-1（span の style 属性のみ）。

## 3. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20・`renderTaskBoard(` 37→37（不変）
- `applyTaskFilter(` 4（不変＝条件非変更）・`id="tf-count"` 1（不変）・件数表示ロジック（tfCount/tfCount2 textContent）2 箇所 不変
- `taskFilter` 代入の増加なし

## 4. ui_check（packet 644 準拠 / result: PASS）
- 件数チップが少し大きく・primary色・ピル背景で視認性向上。`margin-left:auto` 維持でフィルタバー内の右寄せ・レイアウトは不変。`white-space:nowrap` で件数が折返さない。
- ダークは navy/navy-lt の override で可読。スマホでも 10.5px・小チップで邪魔にならない。最終見え方はボス実機目視可。

## 5. スキップしたこと
- 件数の**内訳表示**（例「未完了 X / 完了 Y」）等のロジック追加は Lv2（件数算出ロジック追加）に当たるため**見送り**（今回は視認性のみ）。必要なら別packet。

## 6. 守った安全境界（赤信号クリア）
- 件数算出ロジック/`applyTaskFilter` 条件/`taskFilter` 代入/`state.tasks`/`_persistTasks`/保存仕様 非変更・既存id非変更
- DB/Auth/API/npm install なし・`.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 7. 関連
- `docs/TASKBOARD_NEXT_CANDIDATES_CODEX_REVIEW_PACKET_2074.md`（C7 の出所）
- `index.html` 1844（#tf-count markup）・6641/6726（件数算出＝非変更）
- `CHANGELOG.md` — 本記録は packet 2075 で追加
