# Claude Desktop ⇄ じゃがいAI会社OS メンバー同期 設計パケット（packet 2040）

- 種別：**設計ドキュメントのみ（docs-only）**。本パケットでは実装・接続・デプロイは一切行わない。
- 日付：2026-06-05
- 状態：DESIGN DRAFT（ボス承認前）
- 関連：packet 319（担当秘書AIマッピング）、accounts/_bulkAccounts（index.html 正本）

---

## 0. 目的・スコープ

### 目的
Claude Desktop から、じゃがいOS の**社内メンバー情報を参照（read-only）**できるようにする。
じゃがいOS の業務（タスク・予定・査定・ロープレ）を Claude 側から把握・補助するための土台。

### 正本（Source of Truth）と向き
- **正本：じゃがいOS 側**（`accounts` 配列 → Supabase `accounts` テーブル）。
- **参照先：Claude Desktop 側**。
- 同期は **一方向（じゃがいOS → Claude）** のみ。

### 初期MVPの境界（重要）
- Claude 側からの **書き込み・変更・削除は行わない（read-only）**。
- 役職変更／権限変更／削除／追加は **すべてじゃがいOS 側でのみ**実施。
- 本パケットは **設計のみ**。MCP本番接続・外部API・Cloud Run・Supabase変更・書き込みAPIは**今回実装しない**。

### 今回やらないこと（禁止事項の再掲）
SQL/Supabase/RLS/Auth 変更なし／外部API接続なし／Cloud Run deploy なし／OpenAI・Claude API 本番接続なし／パスワード出力なし／token・secret 出力なし／顧客タブ復活なし／`.claude add` なし／force push・reset・clean・rebase 禁止。

---

## 1. 現在のメンバー情報 正本候補 調査結果

`index.html`（単一ファイルアプリ、約2.6MB）を調査した結果、メンバー情報は **3層構造**で保持されている。

### 1-1. accounts（★正本）
- 宣言：`let accounts=[];`（index.html: 3484 付近）
- 永続化：Supabase `accounts` テーブルへ `sbUpsert('accounts', rows, 'uid')`。
- **DBへ書き出す安全カラム**：`const _DB_ACCOUNT_COLUMNS_SAFE = ['uid','pass','name','role','perm'];`（3197 付近）
- DB読み出しマッピング（3686 付近）：
  ```js
  dbArr=r.map(a=>({uid:a.uid,pass:a.pass,name:a.name,role:a.role,perm:a.perm,
                   c:a.color,inc:a.inc,cut:a.cut,personal:a.personal}))
  ```
- **結論：メンバーの正本は `accounts`。**`uid` が主キー。

#### シードデータ `_bulkAccounts`（4932–4938 付近、初期メンバー定義）
| uid | name | role | perm |
|-----|------|------|------|
| yoshimura | 芳村 | 査定担当 | admin |
| tochioka  | 杤岡 | 店長     | admin |
| yasumi    | 安見 | エージェント | staff |
| sano      | 佐野 | エージェント | staff |
| tominaga  | 冨永 | エージェント | staff |
| ban       | 伴   | サポート | admin |

（別に `admin` = 管理者／テストアカウントが存在。実務担当者ではない。下記 §1-7 参照）

### 1-2. members（派生・軽量）
- 宣言：`let members=staffAccs().map(a=>({n:a.name,c:a.c,role:a.role,uid:a.uid}));`（3602 付近）
- **無効アカウントを除外**して生成（3351 付近）：
  ```js
  accounts.forEach(a => { if(!_isDisabledAccount(a)) members.push({n:a.name,c:a.c,role:a.role,uid:a.uid}); });
  ```
- カレンダー／タスク割当UI用の縮小版。**正本ではない**（accounts の派生ビュー）。

### 1-3. profiles（Supabase 別テーブル）
- `await sb.from('profiles').select('*').eq('id',authData.user.id).maybeSingle();`（3649 付近）
- 認証ユーザー（`auth.user.id`）に紐づくプロフィール。カラム：`id,name,role,perm,c,inc,cut,personal`。
- **本MVPでは参照対象外**（Auth に触れないため）。正本は `accounts` 側で確定とする。

### 1-4. state 内のメンバー定義
- `state` は `const`（3632 付近）。`state.events` / `state.tasks` 等を保持。
- メンバーの**正本定義は state には無い**（メンバーは `accounts`、stateは予定・タスク）。
- 既知の注意点：`!window.state` ガードのバグ履歴（packet 2038）。本同期は state に依存しない。

### 1-5. localStorage 表示順キー
- キー：`const _ACCOUNT_ORDER_LS_KEY='jagai_account_order_v1';`（4729 付近）
- 格納内容：**uid 文字列の配列のみ**（名前・パスワード・役職は含まない）。
  ```js
  function _getAccountOrder(){ const s=localStorage.getItem('jagai_account_order_v1'); ... } // 4730 付近
  function _saveAccountOrder(uids){ localStorage.setItem('jagai_account_order_v1', JSON.stringify(...)); } // 4738 付近
  ```
- 読み込み時に accounts をこの順序でソート（3335–3346 付近）。
- **結論：表示順（sortOrder）の正本は localStorage `jagai_account_order_v1`。** ブラウザ／端末ローカルである点に留意（端末間で異なりうる）。

### 1-6. 削除済み／disabled 判定
- 判定関数（4711–4715 付近）：
  ```js
  function _isDisabledAccount(a){
    if(!a)return false;
    if(a.perm==='disabled')return true;   // ① perm 無効化
    if(a.role==='削除済み')return true;   // ② role ベース削除マーカー
    return false;
  }
  ```
- ソフトデリート実装（4693–4694 付近）：`a.perm='disabled';` ＋ `a.pass='disabled_'+a.uid+'_'+Date.now();`（ダミーパス化）。
- ログイン拒否（3710 付近）：無効アカウントは「このアカウントは無効化されています」。
- **結論：deleted/disabled の判定基準は `_isDisabledAccount`（perm==='disabled' OR role==='削除済み'）。**

### 1-7. 役職・権限の列挙
- **role 値**：`査定担当` / `店長` / `エージェント` / `サポート` / `削除済み`（削除マーカー）
- **perm 値**：`admin` / `staff` / `owner` / `disabled`
- **admin表記**：`perm` が `admin`・`owner` のとき UI 表示は **「管理者」**（3757・3982–3998 付近）。役職に「店長」を含めば「店長」表示。→ **admin表記は管理者として維持する。**

### 1-8. 担当秘書AIマッピング（packet 319、9928 付近 `getPersonalSecretaryMapping()`）
| ownerName | ownerRole | secretary | icon | note |
|-----------|-----------|-----------|------|------|
| admin | 管理者／テストアカウント | 土方歳三 | 🗡 | 管理者用テスト（実務担当者ではない） |
| 芳村 | 査定担当 / admin同等 | ソルティ | 🧂 | ボス専属・秘書室トップ・統括秘書AI |
| 杤岡 | 店長 | 加藤鷹 | 🎩 | 店長担当秘書AI |
| 安見 | エージェント | 三上悠亜 | 💼 | エージェント担当秘書AI |
| 佐野 | エージェント | 紅音ほたる | 🌹 | エージェント担当秘書AI |
| **冨永** | エージェント | **未定** | ❓ | **ボス未指定（未定のまま）** |
| 伴 | サポート／事務 | 木村拓哉 | ⭐ | サポート・事務担当秘書AI |

→ **冨永の秘書AI名は「未定」を維持。** 本同期で勝手に埋めない。

### 1-9. 顧客情報（参照対象外＝除外対象）
- `let customers=[];`（3528 付近）。Supabase `customers`：`id,type,name,phone,email,address,status,staff_uid,source,note,history,ts`。
- アプリ方針注記（2082 付近）：「顧客情報・社員実名は保存しません。担当は役職ベースです。」
- **本同期では顧客情報は一切エクスポートしない。** 顧客タブ復活もしない。

### 1-10. その他メンバー紐づきデータ（本MVPでは除外）
`personalSalesGoals` / `personalCountGoals` / `incAdjustments` / `cutAdjustments` / `kintaiDB`（勤怠）/ `shiftData`（シフト）。いずれも uid 紐づきだが**初期エクスポート対象外**。

---

## 2. Claude 参照用 メンバーJSON 設計

### 2-1. 設計方針
- 1メンバー = 1オブジェクト。フィールドは **「正本由来」** と **「派生・手動メタ」** に分けて出自を明示する。
- **機微情報（pass / token / secret / メール / UUID / 顧客）は構造に含めない。**
- 派生・手動メタ（department / mainDuties / notesForAi 等）は正本に専用カラムが無いため、`null` 許容＋将来手動メタで補完する。**推測で埋めない。**

### 2-2. フィールド定義

| フィールド | 型 | 出自 | 説明 / 生成元 |
|-----------|----|------|--------------|
| `uid` | string | 正本 | `accounts[].uid`。主キー。 |
| `name` | string | 正本 | `accounts[].name`（社内表示名・日本語姓）。 |
| `displayName` | string | 派生 | 既定は `name` と同値。将来別表示名が必要なら手動メタ。 |
| `role` | string | 正本 | `accounts[].role`（査定担当／店長／エージェント／サポート）。 |
| `perm` | string | 正本 | `accounts[].perm`（admin／staff／owner）。**admin表記は管理者維持。** disabled は §isActive で表現。 |
| `department` | string \| null | 派生/手動 | 正本に専用カラム無し。role からの論理導出 or 手動メタ。未確定は `null`。 |
| `mainDuties` | string \| null | 手動メタ | 主担当業務。正本に無し。未確定は `null`。 |
| `secretaryAiName` | string \| null | 正本(packet319) | `getPersonalSecretaryMapping()` を `name` で突合。**冨永は "未定" を維持。** |
| `isActive` | boolean | 正本 | `!_isDisabledAccount(account)`。disabled/削除済みは `false`。 |
| `sortOrder` | number | 正本(localStorage) | `jagai_account_order_v1` 内の index。未登録は末尾（大きい値）。 |
| `notesForAi` | string \| null | 手動メタ | Claude への補足（呼称・配慮事項等）。未設定は `null`。 |

> 補足：`secretaryAiName` は「未定」を文字列としてそのまま保持する（`null` ではなく `"未定"`）。「秘書未割当」と「メタ未記入」を区別するため。

### 2-3. ルート構造（スナップショット）
```json
{
  "schemaVersion": "member-sync/1.0",
  "source": "jagai-os",
  "exportedAt": "2026-06-05T00:00:00+09:00",
  "readOnly": true,
  "includesInactive": false,
  "members": [ /* MemberObject[] */ ],
  "roles": [ /* §3 get_roles の結果と同形 */ ],
  "orgSummary": { /* §3 get_org_summary の結果と同形 */ }
}
```

### 2-4. メンバーJSON サンプル（現行メンバーに基づく設計例）
> ※あくまで設計サンプル。実値は将来エクスポート時に正本から生成する。
```json
{
  "schemaVersion": "member-sync/1.0",
  "source": "jagai-os",
  "exportedAt": "2026-06-05T00:00:00+09:00",
  "readOnly": true,
  "includesInactive": false,
  "members": [
    {
      "uid": "yoshimura", "name": "芳村", "displayName": "芳村",
      "role": "査定担当", "perm": "admin",
      "department": null, "mainDuties": null,
      "secretaryAiName": "ソルティ",
      "isActive": true, "sortOrder": 0, "notesForAi": null
    },
    {
      "uid": "tochioka", "name": "杤岡", "displayName": "杤岡",
      "role": "店長", "perm": "admin",
      "department": null, "mainDuties": null,
      "secretaryAiName": "加藤鷹",
      "isActive": true, "sortOrder": 1, "notesForAi": null
    },
    {
      "uid": "tominaga", "name": "冨永", "displayName": "冨永",
      "role": "エージェント", "perm": "staff",
      "department": null, "mainDuties": null,
      "secretaryAiName": "未定",
      "isActive": true, "sortOrder": 4,
      "notesForAi": "秘書AI名はボス未指定（未定のまま維持）"
    }
  ],
  "roles": [],
  "orgSummary": {}
}
```

### 2-5. JSON Schema（バリデーション用・抜粋）
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "MemberObject",
  "type": "object",
  "required": ["uid","name","displayName","role","perm","isActive","sortOrder"],
  "additionalProperties": false,
  "properties": {
    "uid": {"type":"string","minLength":1},
    "name": {"type":"string","minLength":1},
    "displayName": {"type":"string"},
    "role": {"type":"string"},
    "perm": {"type":"string","enum":["admin","owner","staff"]},
    "department": {"type":["string","null"]},
    "mainDuties": {"type":["string","null"]},
    "secretaryAiName": {"type":["string","null"]},
    "isActive": {"type":"boolean"},
    "sortOrder": {"type":"integer","minimum":0},
    "notesForAi": {"type":["string","null"]}
  }
}
```
> `perm` の enum に `disabled` を含めない。disabled は `isActive:false` で表現し、既定エクスポートから除外する（§4）。

---

## 3. 読み取り専用 MCP / API 設計（初期ツール）

### 3-1. トランスポート方針（MVP）
本MVPは **静的スナップショットJSON方式**とする（本番API・Supabase直結・Cloud Run を使わないため）。
- じゃがいOS 側で **手動エクスポート**した `members.snapshot.json`（§2-3 形式）を1ファイル生成。
- Claude Desktop は **ローカルの read-only MCP（ファイル参照）** でそのJSONを読むだけ。
- すべてのツールは **このスナップショットを読むだけの純関数**。書き込み系メソッドは定義しない。
- 将来拡張：ライブ read-only API 化（§5 ロードマップ）。本パケットでは設計のみ。

```
[じゃがいOS accounts(正本)] --手動export--> [members.snapshot.json] --read-only--> [Claude Desktop / MCP tools]
        ↑ 変更はここだけ                                                  ↓ 参照のみ・書き戻し無し
```

### 3-2. ツール一覧（read-only）

#### `get_members`
- 説明：メンバー一覧を sortOrder 昇順で返す。
- 入力：`{ "includeInactive": boolean = false }`
- 出力：`{ "members": MemberObject[], "count": number }`
- 既定では `isActive:true` のみ。`includeInactive:true` でも **pass/secret は決して含まない**（無効でもメタのみ）。

#### `get_member_by_uid`
- 入力：`{ "uid": string }`
- 出力：`{ "member": MemberObject | null }`
- uid 完全一致。無効メンバーは既定で `null`（`includeInactive:true` 指定時のみ返す）。

#### `get_member_by_name`
- 入力：`{ "name": string, "fuzzy": boolean = false }`
- 出力：`{ "matches": MemberObject[] }`
- `name`/`displayName` で照合。同名対策のため配列で返す（呼び出し側は uid で確定推奨）。

#### `get_roles`
- 入力：なし
- 出力：
  ```json
  {
    "roles": ["査定担当","店長","エージェント","サポート"],
    "perms": ["admin","owner","staff"],
    "adminLabel": "管理者",
    "permDisplay": { "admin": "管理者", "owner": "管理者", "staff": "スタッフ" }
  }
  ```
- 用途：役職・権限の語彙を Claude に提示。**admin表記＝管理者**を明示。

#### `get_org_summary`
- 入力：なし
- 出力（例）：
  ```json
  {
    "totalActive": 6,
    "byRole": {"査定担当":1,"店長":1,"エージェント":3,"サポート":1},
    "byPerm": {"admin":3,"staff":3},
    "secretaryAssigned": 5,
    "secretaryUndecided": ["冨永"],
    "notes": "admin(テストアカウント)は集計から除外可。冨永の秘書AIは未定。"
  }
  ```
- 用途：組織の俯瞰。`secretaryUndecided` に冨永が残ることで「未定維持」を可視化。

### 3-3. 共通仕様
- **メソッドは GET 相当のみ**。create/update/delete/upsert は**定義しない**。
- エラー形：`{ "error": { "code": string, "message": string } }`（例 `NOT_FOUND` / `SNAPSHOT_MISSING`）。
- スナップショット鮮度：ルートの `exportedAt` を全レスポンスにエコー可。Claude には「これは○○時点のスナップショット」と分かるようにする。
- 出力フィルタは**ホワイトリスト方式**（§2-2 の許可フィールドのみ通す）。未知フィールドは落とす。

### 3-4. MCP マニフェスト（設計イメージ・未登録/未実装）
```jsonc
// 設計イメージのみ。今回 .claude / MCP への実登録は行わない（禁止事項）。
{
  "name": "jagai-member-sync",
  "version": "1.0.0-design",
  "readOnly": true,
  "tools": ["get_members","get_member_by_uid","get_member_by_name","get_roles","get_org_summary"],
  "writeTools": []   // 空：書き込み系は意図的に未定義
}
```

---

## 4. セキュリティ方針

1. **初期MVPは read-only。** Claude 側からの書き込み・変更・削除メソッドは設計上**存在させない**（`writeTools: []`）。
2. **パスワードは絶対に返さない。** `accounts[].pass`・`disabled_*` ダミーパスを出力構造に含めない。`_DB_ACCOUNT_COLUMNS_SAFE` に `pass` が含まれる点に注意し、エクスポート段でホワイトリスト除外する。
3. **token / secret / APIキー / UUID / メールアドレスは返さない。** Auth・Supabase key・`auth.user.id`（profiles.id）等は構造外。
4. **deleted / disabled メンバーは通常返さない。** `_isDisabledAccount`（perm==='disabled' OR role==='削除済み'）で除外。`includeInactive:true` 指定時もメタのみ・機微情報は依然非出力。
5. **顧客情報は返さない。** `customers` 由来データ（name/phone/email/address/history 等）はエクスポート対象外。顧客タブ復活もしない。
6. **Claude 側から役職変更・削除・権限変更は不可。** role/perm/isActive は読み取りのみ。変更はじゃがいOS 側でのみ。
7. **冨永の秘書AI名は「未定」を維持。** 同期処理で自動補完・推測しない。
8. **admin表記は管理者を維持。** `perm:admin/owner` → 表示「管理者」。`admin` アカウントはテストアカウントである旨を `notesForAi` 等で明示可。
9. **出力はホワイトリスト方式。** §2-2 の許可フィールド以外は通さない（フェイルクローズ）。
10. **一方向同期。** Claude → じゃがいOS への書き戻し経路を設計上設けない。

---

## 5. 実装ロードマップ（参考・本パケット対象外）

今回は **docs設計のみ**。以下は将来段階（**今回は実装しない**）。
- Phase A（本パケット）：設計確定 ＋ スナップショットJSON仕様確定。
- Phase B：じゃがいOS 側に **手動エクスポート（ホワイトリスト適用）** ボタン/関数を追加 → `members.snapshot.json` 生成。※ボス承認後・別パケット。
- Phase C：ローカル read-only MCP でスナップショットを参照（§3 ツール実装）。
- Phase D（将来）：ライブ read-only API 化。※Supabase/RLS/Auth/Cloud Run を伴うため、別途承認・別パケット。

### 今回スコープ外（禁止事項の再掲）
MCP本番接続／外部API／Cloud Run deploy／Supabase SQL・RLS・Auth 変更／書き込みAPI／OpenAI・Claude API 本番接続／パスワード・token・secret 出力／顧客タブ復活／`.claude add`／force push・reset・clean・rebase。

---

## 6. 受け入れ基準（本設計パケットの完了条件）
- [x] 正本候補（accounts / members / profiles / state / localStorage表示順 / disabled判定）を実コード行番号付きで特定。
- [x] Claude参照用メンバーJSON（11項目）を出自付きで定義し、サンプル＋JSON Schema を提示。
- [x] read-only MCP/API ツール5種（get_members / get_member_by_uid / get_member_by_name / get_roles / get_org_summary）の入出力を定義。
- [x] セキュリティ方針10項目を明記（read-only／pass・token非出力／disabled・顧客除外／冨永未定維持／admin=管理者維持）。
- [x] 実装（SQL/MCP接続/API/deploy/書き込み）は行わず、docs のみで完結。

— packet 2040 / DESIGN DRAFT / commit まで。push 停止（ボス承認後）。
