# Claude Desktop参照用 メンバーJSONスナップショット生成MVP（packet 2041）

- 種別：**じゃがいOS画面内 静的MVP実装**（外部接続なし）
- 日付：2026-06-05
- 状態：実装済（read-only / 外部送信なし）
- 関連：packet 2040（メンバー同期 設計）、packet 319（担当秘書AIマッピング）、packet 476（accounts並び順 helper）

---

## 1. 目的
じゃがいOS の `accounts` を**正本**として、Claude Desktop や将来の MCP 連携が安全に参照できる**メンバーJSON**を、じゃがいOS 画面上で **生成・表示・コピー**できるようにする。
今回は外部接続・Claude Desktop 設定・MCP 本番接続を一切行わず、**じゃがいOS 側の静的 read-only MVP** として実装する。

## 2. 実装概要
- 配置：AI組織図ページ（`#page-ai-org`）の担当秘書AIマッピング表（packet 319）直下。
  - HTML コンテナ：`<div id="ai-org-member-json"></div>`（`#ai-org-secretary-map` の直後）。
  - 描画：既存 `renderAIOrgSecretaryMap` を IIFE でラップし、`renderClaudeMemberJsonCard('ai-org-member-json')` を追加実行（packet 319 と同方式・既存非破壊）。
- カード「🔗 Claude連携用メンバーJSON（read-only スナップショット）」の構成：
  - 説明文（外部送信せず画面内で生成・コピーのみ）
  - 状態表示：正本=accounts／方式=read-only snapshot／外部送信=なし／pass・token・secret・email・顧客情報=除外／disabled・削除済み=通常除外（active のみ）
  - 件数表示（`#cmj-count`）・最終生成時刻表示（`#cmj-time`、ISO8601）
  - JSON表示欄（`<textarea readonly>`）
  - 「🔄 生成 / 再生成」ボタン（`#cmj-gen`）
  - 「📋 コピー」ボタン（`#cmj-copy`）
- 主要関数（index.html 内 packet 2041 ブロック）：
  - `buildClaudeMemberSnapshot()` … `accounts` から安全項目のみ抽出した snapshot オブジェクトを生成して返す（**保存しない**）。
  - `renderClaudeMemberJsonCard(rootId)` … カード描画＋初期生成。
  - `_cmjRegenerate(root)` … 再生成して textarea・件数・時刻を更新。
  - `_cmjCopy(root)` / `_cmjCopyFallback(root,text,done)` … コピー処理（後述）。
  - `_cmjSecretaryAiNameFor(name)` … 既存 `getPersonalSecretaryMapping()` から秘書AI名取得（取れなければ「未定」）。
  - `_cmjNotesForAi(a)` … 最低限の役割説明のみ（admin=テストアカウント注記／冨永=未定維持）。

## 3. 出力JSON項目（ホワイトリスト）
ルート：
```jsonc
{
  "schemaVersion": "member-sync/1.0",
  "source": "jagai-os",
  "origin": "accounts",
  "readOnly": true,
  "externalSend": false,
  "includesInactive": false,
  "exportedAt": "<ISO8601・生成時刻>",
  "count": <number>,
  "members": [ /* 下記 */ ]
}
```
members[] の各項目：

| フィールド | 出自 | 説明 |
|-----------|------|------|
| `uid` | accounts | 主キー |
| `name` | accounts | 社内表示名 |
| `displayName` | 派生 | 既定は `name` と同値 |
| `role` | accounts | 役職（査定担当/店長/エージェント/サポート） |
| `perm` | accounts | 権限（admin/owner/staff）。連携側で admin/owner は「管理者」表記 |
| `secretaryAiName` | packet319 | 担当秘書AI名。冨永は「未定」 |
| `isActive` | 派生 | active のみ抽出のため常に `true` |
| `sortOrder` | localStorage | `jagai_account_order_v1`（uid配列）順の index |
| `notesForAi` | 手動メタ | 最低限の役割説明。未設定は `null` |

## 4. 除外項目（絶対に出さない）
`pass` / `password` / `token` / `secret`（値）/ `email` / Supabase key / API key / access token / refresh token / 顧客情報（name・phone・email・address・history 等）/ 不要な UUID（`auth.user.id` 等）/ その他個人情報として不要な値。
- 抽出は**ホワイトリスト方式**（§3 の許可項目のみ map する）。accounts に `pass` 等が存在しても、snapshot オブジェクトには載せない。

## 5. disabled / 削除済み 除外方針
- 既存 `_isDisabledAccount(a)`（`perm==='disabled'` または `role==='削除済み'`）で除外。helper が無い環境向けに同条件のフォールバックも実装。
- **通常出力は active のみ**（`includesInactive:false`・`isActive` は常に true）。
- 「削除済みも含める」表示は**今回は実装しない**。将来、管理者限定トグルとして検討（§9）。

## 6. secretaryAiName の誤検知注意（重要）
- `secretaryAiName` / `secretaryAssigned` / `secretaryUndecided` 等は **「秘書（secretary）」由来の既存UI名称**であり、**API secret / token とは無関係**。
- 機密スキャン（`grep -i secret` 等）でヒットするが、**誤検知**として扱う。
- 確認すべきは「実際の API キー・token・secret 値が出力されていないこと」のみ。本実装では `secretaryAiName` の値は人物名（例：ソルティ・加藤鷹）であり機密値ではない。

## 7. セキュリティ方針
1. **read-only**：snapshot を生成・表示・コピーするだけ。accounts への書き戻し・保存なし。
2. **外部送信なし**：`fetch` / `XMLHttpRequest` の新規追加なし。ネットワーク送信経路を設けない。
3. **localStorage/sessionStorage 本文保存なし**：JSON 本文を保存しない。既存 `jagai_account_order_v1`（uid配列）の**読み取りのみ**。
4. **機密非出力**：§4 の項目はホワイトリストにより構造外。
5. **disabled/顧客 除外**：§5・§4 の通り。顧客タブ復活なし。
6. **admin表記は「管理者」維持**／**冨永の秘書AI名は「未定」維持**。
7. コピー処理：`navigator.clipboard.writeText` 優先、失敗時は textarea 選択＋`execCommand('copy')` フォールバック（いずれもローカル処理・外部送信なし）。

## 8. 今回やらないこと
- Claude Desktop 接続／MCP 本番接続／外部API接続／Cloud Run deploy。
- Supabase / SQL / RLS / Auth の変更。
- 書き込みAPI（create/update/delete）。
- 削除済みメンバーを含める出力。
- localStorage への JSON 本文保存・自動エクスポート・ファイル書き出し。

## 9. 次packet候補
- packet 2042（案）：管理者限定「削除済みも含める」トグル（read-only のまま・既定 off）。
- packet 2043（案）：ローカル read-only MCP でこの snapshot を参照する PoC（外部送信なし・ファイル参照のみ）。※要ボス承認・別パケット。
- 将来：ライブ read-only API 化（Supabase/RLS/Auth/Cloud Run を伴うため別途承認）。

— packet 2041 / 実装済（read-only・外部送信なし）/ commit→push。
