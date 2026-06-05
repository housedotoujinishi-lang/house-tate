# Claude Desktop MCP 本物メンバーJSON 差し替え（packet 2049）

- 種別：**運用手順の実行補助＋結果記録**（本物JSONは git 管理外）
- 日付：2026-06-06
- 関連：packet 2048（MCP接続）/ 2047（MCPサーバー）/ 2044（ローカルファイル化）

> ⚠ 本ドキュメントには**本物メンバーJSONの中身（uid/氏名/秘書AI名の対応）は転記しない**。集計値と検証結果のみ記録する。

---

## 1. 目的
packet 2048 で接続したローカル read-only MCP が読む `runtime/claude-member-json/members.snapshot.json` を、
接続検証用のダミー（サンプル太郎/花子）から、**じゃがいOS 画面でコピーした本物のメンバーJSON**へ差し替える。
- 本物JSONは **git 管理しない**／**外部送信しない**／**書き込みツールは作らない**。

## 2. 実施手順（今回の実績）
1. ボスがじゃがいOS（AI組織図 → Claude連携用メンバーJSON）で生成・コピー。
2. 方法A（チャット貼り付け）で受領 → `runtime/claude-member-json/incoming.json`（**git管理外**）にのみ保存。
3. `scripts/jagai-member-json-template.ps1` で検証・整形保存 → `runtime/claude-member-json/members.snapshot.json`（BOM無しUTF-8）。
4. 機密スキャン・BOM確認・MCPサーバーE2E・self-test を実施（§3）。

> 補足（経緯）：当初の `!` 相対パス案内ではセッション作業ディレクトリ（Desktop）基準で保存先がずれ、保存不成立だった。方法A（チャット貼り付け→絶対パス保存）に切り替えて解消。

## 3. 検証結果（PASS）
- **gitignore**：`incoming.json` / `members.snapshot.json` ともに `git check-ignore` で除外確認。`git status` にも非表示。
- **テンプレ検証**：exit 0（機密漏洩ガード通過）。**active 5 件**。
- **キー検査**：メンバーは許可9項目（uid/name/displayName/role/perm/secretaryAiName/isActive/sortOrder/notesForAi）のみ。禁止キーなし。
- **機密スキャン**：pass/password/token/secret(値)/email/apiKey/access・refresh token/service_role/顧客/customer/phone/address は**検出ゼロ**。
- **BOM確認**：先頭バイト `7b 0d 0a`（`{`）＝**BOM無しUTF-8**（`EF BB BF` ではない）。
- **MCPサーバー E2E（実スナップショット）**：`initialize` / `get_members`（**count=5**）/ `get_org_summary` が正常。`isError` ゼロ・機密出力ゼロ。
  - 集計：active 5／役職内訳=査定担当・店長・エージェント×2・サポート／権限内訳=admin×3・staff×2／秘書AI割当=5・**未割当（未定）=0**。
- **self-test**：`node scripts/mcp/selftest.mjs` = **RESULT: PASS**（書込ツールなし・`update_member` 拒否・出力9項目のみ・機密なし）。

## 4. 冨永「未定」についての観察（重要・正直記録）
- 本スナップショットは **active 5 名**で、設計（packet 2040/2041）に挙げた **冨永（tominaga）は含まれていない**（エクスポート時点の accounts 由来）。
- そのため `secretaryUndecided` は空（5名は全員秘書AI割当済み）。
- 「冨永の秘書AI名は『未定』維持」ルールは、**対象行が存在しないため改変は発生していない**（本サーバー/手順は値を一切書き換えない）。
- もし冨永を含めたい場合は、じゃがいOS 側（正本 accounts）で対応 → 再エクスポート → 本手順で再差し替え。**Claude 側からは変更しない（read-only）**。

## 5. Claude Desktop への反映（ボス操作）
1. **Claude Desktop を再起動**（MCPサーバーは起動時＋呼び出し毎に最新 `members.snapshot.json` を読む）。
2. `jagai-members-readonly` の `get_org_summary` を実行 → **totalActive=5**・本物の役職/権限内訳が返ることを確認（ダミーの「サンプル花子」が消えていればOK）。
3. `get_members` で5名が表示されることを確認。

## 6. 今後の更新運用
- 本物JSONは常に `runtime/`（git管理外）に置く。更新は §2 の手順を再実行するだけ。
- `members.snapshot.json` は BOM無しUTF-8（テンプレが保証）。
- **git にコミットするのは docs/CHANGELOG のみ**。`incoming.json` / `members.snapshot.json` は永続的に git 管理外。

## 7. 守った禁止事項
- **本物メンバーJSONを git add しない**（gitignore＋コミット対象は docs/CHANGELOG のみ）。
- Claude Desktop 設定変更なし（packet 2048 の設定をそのまま使用）・MCP 追加変更なし・外部API なし・Supabase/SQL/RLS/Auth 変更なし。
- pass/token/secret 出力なし・顧客情報出力なし・`.claude add` なし・force push/reset/clean/rebase なし。

## 8. 次packet候補
- packet 2050：`members.snapshot.json` のローカル自動再生成運用（外部送信なし）。
- packet 2051：MCP応答に件数/スキーマメタを足す小改善（read-only のまま）。

— packet 2049 / 本物データ差し替え・検証 PASS / 本物JSONは git 管理外。
