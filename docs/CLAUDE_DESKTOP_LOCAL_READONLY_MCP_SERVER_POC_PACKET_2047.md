# ローカル read-only MCP サーバー PoC（packet 2047）

- 種別：**ローカル MCP サーバー実装 PoC ＋ 自己テスト**
- 日付：2026-06-06
- 状態：実装済（ローカル・read-only・外部送信なし・Claude Desktop未接続）
- 関連：packet 2043（MCP設計）/ 2044（ローカルファイル化）/ 2046（接続前チェックリスト）

---

## 1. 目的
じゃがいOS の Claude連携用メンバーJSON を **read-only で参照**する、**ローカル MCP サーバー**を実装する PoC。
**外部送信なし／Claude Desktop 本体設定変更なし／本番接続なし／ローカルJSONを読むだけ／書き込みツール禁止**。

## 2. 追加物
- `scripts/mcp/jagai-members-mcp-server.mjs`：MCP サーバー本体（**依存ゼロ**・stdio JSON-RPC 2.0）。
- `scripts/mcp/selftest.mjs`：ローカル自己テスト（Claude Desktop に繋がず子プロセスで検証）。

## 3. 設計と安全方針
- **依存ゼロ**：`npm install` 不要。外部パッケージ取得（＝外部送信）をしない。Node 標準モジュールのみ（`fs`/`path`/`readline`/`child_process`）。
- **トランスポートは stdio のみ**：`http`/`net`/`https`/`fetch`/`dgram` を一切使わない（grep で不使用を確認）。ネットワーク送受信なし。
- **ローカルJSONを読むだけ**：読むファイルは**起動時に固定**（`--file` 引数 / `JAGAI_MEMBER_JSON` 環境変数 / 既定 `runtime/claude-member-json/members.snapshot.json`、無ければダミーへフォールバック）。**ツール引数からパスを受けない**（path traversal 防止）。
- **read-only 5ツールのみ**：`get_members` / `get_member_by_uid` / `get_member_by_name` / `get_roles` / `get_org_summary`。**書き込み系ツールは未定義**。未知/書き込み的ツール名は `isError` で拒否。
- **多層防御の再フィルタ**：返却前に全メンバーを**許可9項目のホワイトリスト**に絞る（uid/name/displayName/role/perm/secretaryAiName/isActive/sortOrder/notesForAi）。入力JSONに pass/email/token 等が混入していても**構造的に出力されない**。
- **disabled/削除済み除外**：`isActive=false` は既定で返さない（`get_members` の `includeInactive` 指定時のみ含むが、その場合もホワイトリスト適用＝機密は出ない）。
- **値の非改変**：admin表記・冨永「未定」は元データのまま（本サーバーは値を書き換えない）。

## 4. MCP プロトコル対応
- JSON-RPC 2.0 / 改行区切り（stdio）。
- 対応メソッド：`initialize`（protocolVersion `2024-11-05`・capabilities.tools）/ `notifications/initialized`（応答なし）/ `ping` / `tools/list` / `tools/call`。
- `tools/call` は `{ content:[{type:'text', text:<JSON>}] }` を返す。失敗時は `isError:true`。

## 5. 自己テスト結果（`node scripts/mcp/selftest.mjs`）
入力＝コミット済みダミー `scripts/sample.member-json.dummy.json`（本物データ不要・外部送信なし）。

```
PASS  initialize protocolVersion  [{"name":"jagai-members-readonly","version":"0.1.0-poc"}]
PASS  tools/list has exactly 5 read-only tools
PASS  tools/list has NO write tools
PASS  get_members returns members  [count=2]
PASS  get_members: only whitelist keys
PASS  get_members: no forbidden substrings
PASS  get_member_by_uid finds member  [dummy01]
PASS  get_member_by_name matches
PASS  get_roles adminLabel=管理者
PASS  get_org_summary totalActive>=1  [totalActive=2]
PASS  write tool rejected (isError)   ← update_member は拒否
===== RESULT: PASS =====
```
- ※`secretaryAiName` は許可項目（「秘書AI名」＝API secret ではない）。スキャンは許可キーを対象外にして誤検知を回避。

### 追加：機密混入JSONでの剥離確認（adversarial）
- 入力メンバーに `pass`/`email`/`token`/`apiKey` を混入（runtime/＝gitignore のローカル一時ファイル）。
- `get_members` の出力は**9項目のみ**。`PLAINTEXT_PW`/`leak@example.com`/`tok_LEAK`/`sk-LEAK` および `"pass"`/`"email"`/`"token"`/`"apiKey"` キーは**一切出力されず**。
- → サーバー層のホワイトリストが、入力が汚れていても機密を構造的に遮断することを確認。

## 6. 使い方（ローカル・接続なし）
```bash
# 自己テスト（推奨・接続不要）
node scripts/mcp/selftest.mjs

# 手動起動（ローカルJSONを指定。stdio で JSON-RPC を受ける）
node scripts/mcp/jagai-members-mcp-server.mjs --file runtime/claude-member-json/members.snapshot.json
```
- 本物データは packet 2044 の手順で `runtime/` にローカル生成（git管理外）。

## 7. Claude Desktop への接続（今回はしない・参考のみ）
> ⚠ 実際の接続＝**Claude Desktop 本体設定変更**であり、本packetの対象外（赤信号）。下記は将来ボス承認後に行う**参考スニペットのみ**。今回は適用しない。
```jsonc
// （参考・未適用）claude_desktop_config.json の mcpServers エントリ例
{
  "mcpServers": {
    "jagai-members-readonly": {
      "command": "node",
      "args": ["<repo>/scripts/mcp/jagai-members-mcp-server.mjs",
               "--file", "<repo>/runtime/claude-member-json/members.snapshot.json"]
    }
  }
}
```
- 接続前提は packet 2046 のチェックリスト（機密なし・本物JSONはローカル/gitignore・read-only・キーを書かない）を**全て満たすこと＋ボス明示承認**。

## 8. 今回やらないこと（赤信号）
- Claude Desktop 本体設定変更／MCP本番接続／外部API本番接続／Cloud Run deploy。
- Supabase / SQL / RLS / Auth 変更／書き込みAPI／本物メンバーJSONのgitコミット。

## 9. 次packet候補（要ボス承認）
- packet 2048：Claude Desktop への MCP 接続手順の実適用（ローカル限定・read-only／**本体設定変更を伴うためボス承認必須**）。
- packet 2049：`members.snapshot.json` の自動再生成運用（ローカル・外部送信なし）。

— packet 2047 / ローカル read-only MCP PoC / 自己テスト PASS / Claude Desktop 未接続。
