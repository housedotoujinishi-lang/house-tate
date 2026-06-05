# Claude連携用メンバーJSON UI改善（小粒）（packet 2045）

- 種別：**低リスクUI改善のみ**（表示整形・文言追加）
- 日付：2026-06-05
- 対象：packet 2041/2042 のカード（AI組織図ページ `#ai-org-member-json`）
- 関連：packet 2044（ローカルファイル化テンプレート）

---

## 1. 目的
packet 2041/2042 で実装したカードの**実機利用を分かりやすく**する。挙動・安全性は変えず、説明と見た目だけ改善する。

## 2. 変更内容（`renderClaudeMemberJsonCard` のHTMLのみ）
1. **強調バッジ**を追加：
   - 🔒「このJSONは外部送信されません」（緑）
   - 🔌「まだ Claude Desktop とは接続していません」（橙）
2. **「使い方 3ステップ」**ボックスを追加：
   1. 生成 / 再生成
   2. コピー（外部送信なし）
   3. ローカルファイルに貼付（runtime のローカルJSON＝git管理外）
3. 除外表示を明確化：「<b>出さないもの</b>：pass / password / token / secret / email / 顧客情報」を赤系で強調。
4. 状態行に補足（正本=accounts／read-only=参照のみ書き戻しなし／外部送信なし=fetch追加なし・localStorage本文保存なし）。

## 3. やっていないこと（安全境界）
- 実JSONの自動保存／ダウンロード機能での本物JSON保存：**実装しない**。
- 外部送信／`fetch` 追加：**なし**。
- Claude Desktop 設定変更／MCP本番接続：**なし**。
- ロジック（`buildClaudeMemberSnapshot` 等）・出力JSON項目：**不変**。
- 冨永「未定」維持・admin「管理者」維持：**不変**。

## 4. 確認結果
- `<script>` タグ：**11/11 一致**。
- packet 2041 ブロック `node --check`：**PASS**。
- fetch/XHR：**24 → 24（新規なし）**／localStorage setItem：**62 → 62（新規なし）**。
- index.html 差分：14 insertions / 4 deletions（カードHTMLのみ）。

## 5. 次packet候補
- packet 2046：Claude Desktop 接続前チェックリスト。

— packet 2045 / 低リスクUI改善のみ。
