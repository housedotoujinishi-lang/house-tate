# フィルタ中バナー ダークモード配色改善（TASK_FILTER_BANNER_DARKMODE_PACKET_2068）

最終更新：2026-06-08
packet：2068（house-tate-source / 対応 OS packet 658B・v0.9.658B）
管理：dev / qa
種別：軽めのUI改善（inline style の色をCSS変数へ寄せるのみ・低リスク／🟡 MEDIUM）
前提：packet 2066（フィルタ中バナー）の配色が固定オレンジでダークモード未対応だった点の改善。

## 1. 目的
packet 2066 の `#task-filter-banner` は固定色（`#fff7ed`/`#fed7aa`/`#9a3412`、ボタン `#ea580c`）で、
**ダークモード（`body.dark`）で浮く/読みにくい**懸念があった。
**既存CSS変数（dark override 済み）に寄せて**、PC/スマホ/ダークで自然に見えるようにする。大改造はしない。

## 2. ダークモード機構（確認結果）
- `:root` で全色変数を定義、`body.dark` が同名変数を上書き（`index.html` 4-5 行）。
- 例：`--am-lt` light `#fff3e0` → dark `#2d1f0a`／`--t1` light `#0d1b2a` → dark `#e2e8f0`／`--navy` light `#0a3d7c` → dark `#3b82f6`／`--bo` light `#d0d8e8` → dark `#2d3f55`。
- → これらの変数を使えば、`body.dark` 切替で**自動的に**ダーク配色になる。

## 3. 採用配色と理由
| 部位 | 変更前(固定) | 変更後(変数) | 理由 |
|------|--------------|--------------|------|
| 背景 | `#fff7ed` | `var(--am-lt)` | バナーは「フィルタ中の注意喚起」＝amber系が意味的に適切。dark override 有り |
| 下線 | `1px solid #fed7aa` | `1px solid var(--bo)` | 既存の境界色に統一。dark で自然 |
| 文字 | `#9a3412` | `var(--t1)` | light/dark とも本文色として高コントラスト |
| ボタン枠/背景 | `#ea580c` | `var(--navy)` | ボス指示の「primary系に寄せる」。light/dark とも白文字で可読 |
| ボタン文字 | `#fff` | `#fff`（不変） | navy/blue 背景に白で両モード可読 |

- light：amber-tint 背景＋濃紺文字＋紺ボタン。dark：濃amber背景＋淡色文字＋青ボタン。いずれも dark override 済み変数のため自動でコントラスト確保。
- 🔎 アイコン・文言・解除ボタンの挙動（`taskFilter.period='all';taskFilter.cat='';renderTaskBoard()`）・構造・`display:none` は**変更なし**。**色プロパティのみ**の最小修正（inline style のまま）。

## 4. 静的検証（実測）
- `<script>` 11/11・**fetch 24→24・setItem 63→63**・`showToast(` 116→116・`_persistTasks(` 20→20（不変）
- `renderTaskBoard(` 37→37（不変）・`task-filter-banner` 2（不変）
- `taskFilter` 代入（onclick）は不変・renderTaskBoard 呼び出し構造も不変
- diff：`index.html` の2 style属性の色のみ（+2/-2）

## 5. ui_check（packet 644 準拠）
```yaml
ui_check:
  packet: 2068
  target_pages:
    - page-routine (#task-filter-banner)
  roles_checked: [admin, 店長, staff]
  pc:  { width: ">=1280px", overflow_x: none, layout: 不変(色のみ), light: OK, dark: 変数連動で改善 }
  sp:  { width: "375/390/414px (breakpoint 700px)", overflow_x: none, stacking: 不変, dark: 変数連動 }
  screenshots: []                       # 色のみ・構造不変。実機(特にdark)はボス目視推奨
  static_check: { node_check: 該当なし(inline色のみ・JS非編集), fetch_count: "24->24", setItem_count: "63->63", showToast_count: "116->116", persistTasks_count: "20->20", renderTaskBoard_count: "37->37", banner_count: "2", existing_cards_intact: true }
  issues_found: 0
  fixed: []
  result: PASS                          # 色をCSS変数へ寄せただけ・構造/挙動不変
```
- 既存 dark override 済み変数を使うため、ダークでの可読性は構造上改善。最終的な見え方（light/dark・スマよ幅）はボス実機目視推奨。

## 6. 守った安全境界（赤信号クリア）
- 文言・解除挙動・`taskFilter`・`renderTaskBoard`・保存仕様・データ構造は非変更（色プロパティのみ）
- 大規模CSS再設計なし・新規class追加なし（inline最小修正）・DB/Auth/API/npm install なし
- `.claude`/`.vscode`/`runtime`/PNG/xlsx add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 7. 関連
- `docs/TASK_FILTER_ACTIVE_BANNER_PACKET_2066.md`（バナー本体）
- `index.html` 4-5（CSS変数 :root / body.dark）
- `CHANGELOG.md` — 本記録は packet 2068 で追加
