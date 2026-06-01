# CHANGELOG — ハウステイト じゃがいAI会社OS

## packet 2001 — 🎭 営業トレーニング（ロープレ）標準版MVP / 2026-06-02
### Added
- 新タブ「🎭 ロープレ」をPCトップナビ・モバイル下部ナビに追加
- 新規ページ `#page-roleplay`（既存 `switchPage` のルーティングに非破壊で追加）
- 購入ロープレ 6シナリオ（スプレッドシート「ロープレ」購入データ由来）
- 売却ロープレ 5シナリオ（実データ無し→ハウステイト実務に即して新規設計：相続/離婚/空き家/住み替え/査定だけ・他社競合）
- 3択×5〜6問、顧客反応・スコア変動・隠し情報開示・地雷判定・最終結果・フィードバック画面
- 売却ゴール判定（専任媒介取得／訪問査定アポ取得／再追客／店長同行・相談／失注）
- 売却スキル別評価（売却理由深掘り／所有者・相続人確認／売却期限確認／価格期待値調整・競合／訪問査定・媒介取得力）
- 店長フィードバック（店長コメント）表示
- 店長モード（社員別スコア）静的MVP・社員別スコア静的MVP（デモ集計）
- ドキュメント: `docs/SALES_TRAINING_packet2001.md`
- 設計案起票: `docs/TAKKEN_UNIVERSITY_proposal.md`（📚宅建大学・次期候補）

### 実装方針 / 非破壊
- 既存コードは変更せず `index.html` 末尾（最後の `</body>` 直前）へ1つの `<script>` を追記
- `switchPage` / `showMainApp` はラップのみ（上書き破壊なし）
- 状態はメモリ内のみ（リロードで消える）

### 禁止事項の遵守（違反0件）
- Supabase / SQL / RLS / Auth 変更なし
- 外部API / Google Sheets / OpenAI / Claude 接続なし
- localStorage・sessionStorage への本文・個人情報保存なし
- 顧客タブ（CRM, packet 322 非表示）復活なし（無傷を確認）
- 既存機能の破壊なし／ force push・reset・clean・rebase 未実施／ `.claude` 追跡なし

### 検証
- `node --check`（packet単体＋index.html埋め込み抽出）PASS
- `<script>`/`</script>` タグ数一致・禁止APIトークンgrep 0件
