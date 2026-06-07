# タスク画面 本日のルーティン×担当者別タイムライン 横並びの見やすさ改善（PACKET_2059）

日付：2026-06-07
対象：`house-tate-source/index.html`（タスク画面 `#staff-tl`）
OS側packet：645（housetate-ai-company v0.9.645）
種別：CSS追加のみ（geometry/JS/DOM 非変更）

---

## 1. 背景・目的

タスク画面（カレンダー日表示の `#staff-tl`）を実運用で見やすくする。
特に **「本日のルーティン」と「担当者別タイムライン」をPCでは横並びで読みやすく、スマホでは縦積みで破綻させない**。

調査の結果、主要な要素は既に実装済みだった：

| 要望 | 現状 | 対応 |
|------|------|------|
| ルーティンとタイムラインの横並び（PC）/ 縦積み（スマホ） | packet 2058 で `.tyn-dash`（担当者カードビュー左＋本日のルーティン右）＝**実装済み**。700pxで縦積み | **CSSで見やすさを強化**（本packet） |
| タイムライン4時間程度を基準 | packet 2039 で `HOURW=260`（1時間260px＝初期約4時間表示）＝**実装済み** | 非変更（壊さない） |
| 15分刻みの予定・タスク表示 | packet 2039 で15分ticks/gridlines＝**実装済み** | 非変更 |
| 現在時刻付近を表示 | packet 2039 で現在の45分前を左端へ auto-scroll＝**実装済み** | 非変更 |

→ **動いている geometry/JS は触らず**（再実装は破壊リスク）、CSSの見やすさ改善のみを純追加した。

## 2. 変更内容（index.html `line192-195`／CSS追加のみ）

```css
/* packet 2059: タスク画面 本日のルーティン×担当者別タイムライン 横並びの見やすさ改善（CSS追加のみ） */
@media(min-width:1101px){.tyn-dash{gap:12px}.tyn-dash-right{flex:0 0 304px;width:304px;max-height:520px}}
@media(max-width:1100px) and (min-width:701px){.tyn-dash-right{flex:0 0 224px;width:224px}}
```

- **PC幅(≥1101px・1440想定)**：本日のルーティン右カラムを 244px→**304px** に拡幅（`max-height` 440→520）。
  `.tynr-name`/`.tynr-meta` の省略（ellipsis）を減らし、左の担当者別カードビューと横並びで読みやすく。
- **中間幅(701–1100px)**：右カラムを **224px** にクランプし、左カードビューを圧迫しない。
- **スマホ(≤700px)**：新規ルールなし。**既存(packet2058 `line191`)の縦積みをそのまま維持**（横スクロール破綻なしを優先）。
- 既存 `.tyn-dash`/`.tyn-dash-left`/`.tyn-dash-right`（line177-191）は **1行も変更していない**（純追加）。

## 3. 既存機能を壊していない（静的実測）

| 観点 | baseline | 変更後 |
|------|----------|--------|
| `<script>` open/close | 11/11 | 11/11 |
| `<style>` open/close | 3/3 | 3/3（既存style内に追記） |
| `fetch(` | 24 | 24 |
| `.setItem(` | 63 | 63 |
| `HOURW=260` / `START_H=8` | 7 / 7 | 7 / 7（geometry不変） |
| `buildTimeline`/`_persistTasks`/`makeRoutineDraggable`/`tynRoutineToggle`/`stl-toggle` | 6/45/2/3/3 | 6/45/2/3/3 |
| 差分 | — | +4 / -0（CSS媒体クエリ2本＋コメント） |

- タスク追加・完了チェック(`.stl-chk`)・担当者別表示・横スクロール(`.stlc-wrap`/`.stl-scroll`)・ドラッグ移動(`.stl-blk`)・保存(`_persistTasks`)：**いずれもコード非変更＝従来動作**。
- JS差分0（CSSのみ）のため、インラインJSの構文影響なし。

## 4. UI確認（v0.9.644 ui_check）

```yaml
ui_check:
  packet: 2059   # OS packet 645
  target_pages: [ "#staff-tl（カレンダー日表示）" ]
  static_check:
    script: "11/11"
    style: "3/3"
    fetch_count: "24 -> 24"
    setItem_count: "63 -> 63"
    geometry_unchanged: true        # HOURW=260 / START_H=8 / 15分grid / auto-scroll 非変更
    existing_js_tokens_intact: true
    css_added_only: "2 media queries (line192-195)"
    result: PASS
  visual_check:                      # 実機ログイン状態での目視
    by: ボス（Claudeは認証付き本番アプリの実機操作不可・外部API/顧客DB接続禁止）
    pc_1440: 要確認
    sp_390: 要確認（横スクロール無し・縦積み）
    dark: 要確認
    screenshots_dir: runtime/screenshots/   # gitignore＝ローカル限定
    files: [ packet645-task-pc-after.png, packet645-task-mobile-after.png, packet645-task-dark-after.png ]
    guide: runtime/screenshots/_CAPTURE_GUIDE_packet645.txt
  result: PASS(static) / PENDING(visual=ボスQA)
```

## 5. push条件・崩れ時

- 静的検証PASS＝push可（本packet）。**実機で崩れが見つかった場合は追って `line192-195` のCSSのみ調整**（geometry/JSは触らない）。
- スマホで横スクロールが出る等の破綻があれば push 済み分を revert ではなく **追加CSSで修正**（force/reset禁止）。

## 6. 関連

- 上位運用：`housetate-ai-company/docs/UI_SCREENSHOT_CHECK_OPERATION_PACKET_644.md`（UI確認スクショ運用MVP）
- 既存：packet 2058（2カラム化）・packet 2039（1時間260px・15分・auto-scroll）
