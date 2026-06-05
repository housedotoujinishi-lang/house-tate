# Claude Desktop ローカル read-only MCP PoC 設計（packet 2043）

- 種別：**設計ドキュメントのみ（docs-only）**。MCP本番接続・Claude Desktop設定変更・外部API接続は今回行わない。
- 日付：2026-06-05
- 状態：DESIGN DRAFT（ボス承認前）
- 関連：packet 2040（メンバー同期設計）、packet 2041（メンバーJSON生成MVP）、packet 2042（実機確認）

---

## 1. 目的
Claude Desktop が将来、じゃがいOS の**Claude連携用メンバーJSON**を**read-only で参照**するための、**ローカル MCP 構想**を設計する。
今回は **設計docsのみ**。MCP本番接続・Claude Desktop 設定変更・外部API接続は**しない**。

## 2. 参照元（正本→参照のデータフロー）
- 正本：じゃがいOS `accounts`（Supabase `accounts`）。
- 参照用スナップショット：じゃがいOS 画面の「🔗 Claude連携用メンバーJSON」カード（packet 2041）が生成する **read-only snapshot JSON**。
- 出力済み項目（ホワイトリスト9項目）：uid / name / displayName / role / perm / secretaryAiName / isActive / sortOrder / notesForAi。
- 除外済み：pass / password / token / secret(値) / email / Supabaseキー / APIキー / access・refresh token / 顧客情報 / 不要なUUID。

```
[accounts(正本/Supabase)]
   → じゃがいOS画面 buildClaudeMemberSnapshot()（read-only・外部送信なし）
   → 画面に表示＋コピー
   → 【本設計の対象】ローカルJSONファイル
   → ローカルread-only MCP
   → Claude Desktop（参照のみ・書き戻しなし）
```

## 3. 方式案

### 方式A：手動コピー → ローカルファイル（最小・今回の推奨起点）
- じゃがいOS 画面でJSONを生成・コピー → ボスがローカルの所定パスに貼り付け保存。
- Claude Desktop（または将来のMCP）がそのローカルファイルを read-only で読む。
- 長所：実装ほぼ不要・外部送信ゼロ・最も安全。短所：手動更新。
- 本物JSONは **git管理しない**（runtime/local-only。packet 2044 で手順・テンプレ化）。

### 方式B：ローカル MCP サーバーが read-only でJSONファイルを読む（PoC本命）
- ローカルで動く軽量 MCP サーバーが、方式Aで保存したローカルJSONファイルを**読むだけ**。
- ツールは get 系のみ（§4）。ファイル監視で更新反映も可（任意）。
- 長所：Claude から構造化アクセス。短所：MCP実装・Claude Desktop の MCP 設定が必要（**本接続は別packet・要ボス承認**）。
- 本packetでは**設計のみ**。サーバー実装・接続は行わない。

### 方式C：将来 Cloud Run / API 化（今回は未実装）
- ライブ read-only API 化。Supabase / RLS / Auth / Cloud Run を伴うため**別途承認・別packet**。
- 本packetの対象外（赤信号領域）。

## 4. read-only MCP ツール案（get 系のみ）

| ツール | 入力 | 出力 | 備考 |
|--------|------|------|------|
| `get_members` | `{ includeInactive?: false }` | `{ members:[], count }` | 既定 active のみ。inactive 指定時もメタのみ（機密非出力） |
| `get_member_by_uid` | `{ uid }` | `{ member \| null }` | uid 完全一致 |
| `get_member_by_name` | `{ name, fuzzy?: false }` | `{ matches:[] }` | name/displayName 照合。複数返しうる |
| `get_roles` | なし | `{ roles, perms, adminLabel:"管理者", permDisplay }` | admin/owner→「管理者」 |
| `get_org_summary` | なし | `{ totalActive, byRole, byPerm, secretaryAssigned, secretaryUndecided:["冨永"] }` | 冨永「未定」を可視化 |

- **書き込み系ツールは未定義**（create/update/delete/upsert を実装しない＝`writeTools: []`）。
- すべて、方式A/Bで用意したローカルJSONを**読むだけの純関数**。

## 5. セキュリティ境界
1. **read-only**：参照のみ。Claude Desktop から **役職変更・削除・権限変更は不可**（変更経路を設計上設けない）。
2. **機密非出力**：pass / password / token / secret(値) / email / Supabaseキー / APIキー / access・refresh token / 顧客情報 / 不要なUUID を返さない（スナップショット段でホワイトリスト済み・MCP側も再フィルタ）。
3. **disabled / 削除済みは通常返さない**（`isActive:false` は既定で除外）。
4. **admin表記は「管理者」維持**／**冨永の秘書AI名は「未定」維持**。
5. **外部送信なし**：ローカルファイル↔ローカルMCP↔Claude Desktop のローカル経路のみ。外部API・クラウド送信を設計上含めない。
6. **APIキーを設定ファイルに書かない**：MCP 設定にトークン/シークレットを保存しない（読むのはローカルJSONのみ）。
7. **本物JSONはgit管理しない**：runtime/local-only に置く（packet 2044）。

## 6. 今回やらないこと（赤信号含む）
- MCP本番接続／Claude Desktop 本体設定変更／外部API本番接続／Cloud Run deploy。
- Supabase / SQL / RLS / Auth 変更／書き込みAPI。
- 本物メンバーJSONのgitコミット。

## 7. 次packet候補
- packet 2044：メンバーJSON ローカルファイル化テンプレート＋手順（runtime/local-only・本物JSONはgit外）。
- packet 2046：Claude Desktop 接続前チェックリスト（実接続の前提・赤信号一覧・ロールバック）。
- （将来・要承認）ローカル read-only MCP サーバー実装 PoC → Claude Desktop への MCP 接続。

— packet 2043 / DESIGN DRAFT / docs-only。
