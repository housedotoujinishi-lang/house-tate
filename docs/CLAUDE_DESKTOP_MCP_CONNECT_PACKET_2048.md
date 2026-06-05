# Claude Desktop への MCP 実接続（ローカル read-only）（packet 2048）

- 種別：**Claude Desktop 設定変更（このpacketに限りボス承認済み）＋ローカル接続設定**
- 日付：2026-06-06
- 状態：設定書き込み済（ローカル・read-only）。Claude Desktop 再起動で読み込み（ボス操作）。
- 関連：packet 2047（MCPサーバーPoC）/ 2046（接続前チェックリスト）/ 2044（ローカルファイル化）

---

## 1. 目的・承認範囲
じゃがいOS のメンバーJSON を参照する **ローカル read-only MCP サーバー**（packet 2047）を、Claude Desktop に登録する。
- ボス承認：**「Claude Desktop 設定変更はこのpacketに限り承認」**。
- 制約（厳守）：**ローカル read-only のみ／外部APIなし／書き込みツールなし／本物JSONは `runtime/` 配下で git 管理外**。

## 2. 変更したもの（リポジトリ外・git管理しない）
- ファイル：`%APPDATA%\Claude\claude_desktop_config.json`
  （= `C:\Users\user\AppData\Roaming\Claude\claude_desktop_config.json`）
- **バックアップ**：同ディレクトリに `claude_desktop_config.json.bak-packet2048`（完全可逆）。
- 方法：既存バイトに触れない**テキスト挿入マージ**で `mcpServers` を追加（既存 `coworkUserFilesPath` / `preferences` は保全。検証で確認済）。
- 追加した MCP サーバーエントリ：
  ```jsonc
  "mcpServers": {
    "jagai-members-readonly": {
      "command": "C:\\Program Files\\nodejs\\node.exe",
      "args": [
        "C:\\Users\\user\\Downloads\\housetate-ai-company-handoff-20260510\\house-tate-source\\scripts\\mcp\\jagai-members-mcp-server.mjs",
        "--file",
        "C:\\Users\\user\\Downloads\\housetate-ai-company-handoff-20260510\\house-tate-source\\runtime\\claude-member-json\\members.snapshot.json"
      ]
    }
  }
  ```
- ※ この config ファイルはリポジトリ外（`%APPDATA%`）。**git にはコミットしない**。

## 3. リポジトリ側の変更（git管理）
- `scripts/mcp/jagai-members-mcp-server.mjs`：**UTF-8 BOM 除去**を追加（`raw.charCodeAt(0)===0xFEFF` を除去）。
  - 理由：エンドツーエンド検証で、PowerShell 生成の runtime JSON に BOM が付き Node の `JSON.parse` が先頭で失敗する不具合を発見。サーバー側で吸収（あらゆる入力に堅牢化）。
- `scripts/jagai-member-json-template.ps1`：出力を **UTF-8 BOM無し**に変更（`[IO.File]::WriteAllText` + 絶対パス化）。BOM付き出力を根本回避。

## 4. 検証結果（本packet実施）
- **config 妥当性**：`JSON.parse` OK。`coworkUserFilesPath` / `preferences` 保全、`mcpServers.jagai-members-readonly` 追加を確認。
- **エンドツーエンド（config と同一コマンド）**：
  `node.exe scripts/mcp/jagai-members-mcp-server.mjs --file runtime/.../members.snapshot.json` を stdio 起動し、
  `initialize` / `tools/list`（5 read-onlyツール）/ `tools/call get_org_summary` が正常応答（`totalActive:2`・`secretaryUndecided:["サンプル花子"]`）。`isError` ゼロ。
- **自己テスト**：`node scripts/mcp/selftest.mjs` = **RESULT: PASS**（書込ツールなし・`update_member` 拒否・出力9項目のみ・機密なし）。
- ※ 現在 runtime のデータは**ダミー**（接続検証用）。本物は §6 手順で差し替え。

## 5. ボスが行う最終ステップ（実接続の反映）
1. **Claude Desktop を再起動**（MCP サーバーは起動時に読み込まれるため）。
2. Claude Desktop のツール一覧に `jagai-members-readonly` の 5ツール（get_members 等）が出ることを確認。
3. 例：「get_org_summary を実行して」と頼み、組織サマリが返ることを確認。

## 6. 本物データへの差し替え（ダミー→実データ）
1. じゃがいOS 画面の「🔗 Claude連携用メンバーJSON」で生成 →「📋 コピー」。
2. `runtime/claude-member-json/incoming.json` に貼り付け保存。
3. `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/jagai-member-json-template.ps1`
   → 検証OKで `runtime/claude-member-json/members.snapshot.json`（BOM無し）に保存。
4. Claude Desktop 再起動で最新が反映（サーバーは呼び出し毎に再読込）。
- 本物JSONは `runtime/`（**git管理外**）。git にはコミットしない。

## 7. ロールバック
- MCP を外す：`%APPDATA%\Claude\claude_desktop_config.json` を
  `claude_desktop_config.json.bak-packet2048` で**上書き復元** → Claude Desktop 再起動。
- リポジトリ側 BOM 修正を戻す場合：該当コミットを `git revert`（force push/reset は使わない）。
- runtime のローカルJSONは削除するだけで原状復帰（リポジトリ非影響）。

## 8. 守った赤信号（このpacketで触れていない）
- 外部API本番接続なし・Cloud Run deploy なし・Supabase/SQL/RLS/Auth 変更なし・**書き込みツールなし**・service_role 不使用・`.env` 未作成・APIキー作成/保存/読込なし。
- 本物メンバーJSONの git コミットなし・顧客情報の保存/出力なし・顧客タブ復活なし・`.claude add` なし・force push/reset/clean/rebase なし・admin「管理者」維持・冨永「未定」維持。
- ※ Claude Desktop 設定変更は**本packetに限るボス承認**に基づく（恒久承認ではない）。

## 9. 次packet候補
- packet 2049：`members.snapshot.json` のローカル自動再生成運用（外部送信なし）。
- packet 2050：MCP ツールの応答にスキーマ/件数メタを足す小改善（read-only のまま）。

— packet 2048 / ローカル read-only MCP 接続設定・検証 PASS / Claude Desktop 再起動で反映。
