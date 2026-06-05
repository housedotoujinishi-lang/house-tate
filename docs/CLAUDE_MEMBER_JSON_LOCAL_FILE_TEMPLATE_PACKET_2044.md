# Claude連携用メンバーJSON ローカルファイル化テンプレート（packet 2044）

- 種別：**ローカル専用テンプレート＋手順 docs**（外部送信なし・runtime/local-only）
- 日付：2026-06-05
- 状態：実装済（ローカルスクリプト・本物JSONはgit管理外）
- 関連：packet 2041（生成MVP）、packet 2043（ローカルMCP設計）

---

## 1. 目的
じゃがいOS 画面でコピーした **Claude連携用メンバーJSON** を、安全に**ローカルファイル化**するためのテンプレートと手順を用意する。
まだ Claude Desktop には接続しない。外部送信・外部API・MCP本番接続はしない。

## 2. 重要な取り扱い（安全境界）
- **本物のメンバーJSONは git 管理しない**（`runtime/` 配下＝`.gitignore` 対象）。
- **サンプルはダミー値のみ**（`scripts/sample.member-json.dummy.json` / スクリプトの `-Sample`）。
- **外部送信なし**：スクリプトはネットワーク呼び出し（Invoke-WebRequest / Invoke-RestMethod 等）を一切しない。
- **localStorage/sessionStorage 保存なし**（ブラウザ外スクリプト）。
- **機密漏洩ガード**：pass/password/token/secret(値)/email/顧客情報 等を検出したら**書き出しを中止**。

## 3. 追加物
- `.gitignore`（新規）：`runtime/` / `*.local.json` / `members.snapshot.json` / `incoming.json` / `.claude/` を除外。
- `scripts/jagai-member-json-template.ps1`：ローカル検証＋整形保存ヘルパー（外部送信なし）。
- `scripts/sample.member-json.dummy.json`：ダミー値のみの参照用サンプル（git管理OK）。
- `runtime/claude-member-json/`：本物JSONの置き場（**git管理外**・自動生成）。

## 4. 手順（ボス向け）
1. じゃがいOS 画面（AI組織図 → Claude連携用メンバーJSONカード）で「🔄 生成 / 再生成」→「📋 コピー」。
2. コピー内容を `runtime/claude-member-json/incoming.json` に貼り付けて保存（このフォルダは git 管理外）。
3. スクリプト実行：
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/jagai-member-json-template.ps1
   ```
   - 検証OKなら `runtime/claude-member-json/members.snapshot.json` に整形保存。
   - 機密/許可外フィールドを検出した場合は**中止**（exit 2）。
4. 接続前の動作確認だけしたい場合：
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/jagai-member-json-template.ps1 -Sample
   ```
   → ダミーJSONを runtime に生成（本物データではない）。

## 5. パラメータ
| パラメータ | 既定 | 説明 |
|-----------|------|------|
| `-In`  | `runtime/claude-member-json/incoming.json` | 入力JSONファイル |
| `-Out` | `runtime/claude-member-json/members.snapshot.json` | 出力（git管理外） |
| `-Sample` | （なし） | 入力の代わりにダミーJSONを生成して検証→出力 |

## 6. 許可項目 / 禁止項目（スクリプトのガード基準）
- **許可（ホワイトリスト9項目）**：uid / name / displayName / role / perm / secretaryAiName / isActive / sortOrder / notesForAi。
- **禁止検出パターン**：pass / password / token / secret / apikey / api_key / accesstoken / refreshtoken / email / mail / phone / tel / address / 顧客 / customer / supabasekey / service_role / uuid。
  - ※`secretary` は「秘書」由来のため禁止語に含めない（誤検知回避）。`secretaryAiName` は許可項目。

## 7. 動作確認結果（本packet実施）
- `Parser::ParseFile` 構文チェック：**PARSE_OK**（UTF-8 BOM で保存）。
- `-Sample` 実行：runtime に `members.snapshot.json`（ダミー2件）生成・**exit 0**。
- 漏洩JSON（pass/email/token 混入）入力：**検出して中止・exit 2・出力ファイル未生成**。
- `git check-ignore`：`runtime/.../members.snapshot.json` は**ignore 済み**（本物JSONはコミットされない）。

## 8. 今回やらないこと
- Claude Desktop 接続／MCP本番接続／外部API接続／Cloud Run deploy。
- ダウンロード機能で本物JSONを保存する実装／本物JSONのgitコミット。
- Supabase / SQL / RLS / Auth 変更。

## 9. 次packet候補
- packet 2046：Claude Desktop 接続前チェックリスト（実接続の前提・赤信号・ロールバック）。
- （将来・要承認）ローカル read-only MCP がこの `members.snapshot.json` を読む PoC。

— packet 2044 / ローカル専用・外部送信なし / 本物JSONはgit管理外。
