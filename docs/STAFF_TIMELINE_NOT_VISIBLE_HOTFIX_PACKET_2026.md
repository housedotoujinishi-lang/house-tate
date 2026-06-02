# 🛠 担当者別タイムラインが公開URLで見えない — 調査 & hotfix（packet 2026）

- 調査日: 2026-06-02 ／ 対象: packet 2014（担当者別日間タイムライン）の表示問題

## 1. 調査結果（結論）
**デプロイは成功しており、公開URLのHTMLには packet2014 を含む最新コードが全て載っている。**
タイムラインが「出ない」のは、表示が**カレンダー日表示に限定**されているため。

### 公開HTML 実取得での確認（curl）
| マーカー | 公開HTMLに含まれる |
|---------|:--:|
| packet 2014 / 2015 / 2016 / 2024 | ✅ 全て |
| page-academy / staff-tl / 🎓 アカデミー | ✅ |
| crm-tab-hidden-packet-322（顧客タブ非表示） | ✅ 維持 |
- `Last-Modified: 2026-06-02`（本日のpush）。サイズ差（ローカル2,638,720 vs 配信2,603,159≈35k）は CRLF→LF 正規化で内容は同一。

### 描画条件（根本原因）
- `render()`（cal用ディスパッチャ）は **`layoutMode==='both'` の時だけ `renderCal()` を呼ぶ**。
- `renderCal()` は **`curV==='day'` の時だけ `renderDay()`** を呼ぶ。
- 既定は `layoutMode='both'` だが **`curV='month'`** → 初回は `renderMonth()`。**日表示に切替えるまで `renderDay()` は呼ばれず、packet2014 の inject も発火しない**。
- さらに inject 例外は packet2014 の renderDay ラップの `try/catch` で**握りつぶされる**（無言失敗の可能性）。

### 「何も変わらない」の主因（推定）
1. **ブラウザ/CDNキャッシュ**で旧 index.html を閲覧（`Cache-Control: max-age=600`）→ ハードリロードで解消。
2. **月表示のまま**で、日表示（📅→「日」）に遷移していない（タイムラインは日表示専用）。
3. inject の無言失敗（タイミング/DOM未生成）。

## 2. hotfix（packet 2026・最小・大改修なし）
renderDay ラップ依存をやめ、**公開済 `window.appendStaffTimelineToDayCalendar()` を多経路で再inject**する safety net を追加：
- **setTimeout 複数回**（60/300/900/1800ms）で再inject（タイミング吸収）
- **switchPage('cal') ラップ**：cal 入場時に burst 再inject
- **renderCal ラップ**：月/週/日いずれの再描画後も、日DOMがあれば inject
- **クリック委譲**：`.vp[data-v="day"]`（日切替）/ `#lay-both`（＋カレンダー）/ `.mjump` `.whdn` `.mday` `.mdtn`（日付セル）クリック後に再inject
- **最小 MutationObserver**：`#cal-view` に `.daycol` が現れ `#staff-tl` が無ければ inject（冪等）

### 安全策（壊さない）
- `#cal-view .daycol`（＝日表示DOM）が無ければ**何もしない** → 月/週表示は不変。
- inject は冪等（既存 `#staff-tl` を除去して再構築）。MutationObserver は staff-tl があれば再injectしない（ループなし）。
- packet2014 本体は無改変（公開関数を呼ぶだけ）。

## 3. 検証
- `node --check`（packet2026単体＋index.html埋込抽出）PASS・`<script>` 6/6一致
- 禁止APIトークン 0件・`.daycol` ガードで月/週保護を確認・renderMonth/renderWeek 無傷・CRM非表示マーカー無傷
- 公開HTMLに packet2026 が含まれること（push反映後に確認）
- 期待動作：📅カレンダー→「日」表示、または ＋カレンダー表示で **担当者別タイムラインが確実に表示**／右側ルーティンD&Dも日表示内に表示

## 4. 使い方（ボス向け・確認手順）
1. ブラウザを**ハードリロード**（Ctrl+F5）してキャッシュ更新。
2. 下部ナビ「📅 タスク/カレンダー」→ 上部ビュー切替で**「日」**を選択（または月カレンダーの日付をタップ）。
3. 担当者別タイムライン（芳村/杤岡/安見/佐野/伴/冨永/未担当）が表示される。「🕓 時間軸表示に切替」で従来の縦グリッドへ。

## 5. 禁止事項の遵守
- Supabase/SQL/RLS/Auth・外部API/OpenAI/Claude/Sheets/CloudRun 不使用・localStorage/sessionStorage本文保存なし
- 顧客タブ復活なし・月/週表示破壊なし・force/reset/clean/rebase 未実施・`.claude` 追跡なし
