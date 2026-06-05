# Claude連携用メンバーJSON 実機確認結果記録 + 表示改善（packet 2042）

- 種別：**実機確認（ライブURL）+ 決定論的ロジック検証 + 軽微UI改善**
- 日付：2026-06-05
- 対象：packet 2041「Claude連携用メンバーJSONスナップショットMVP」
- 公開URL：**https://housedotoujinishi-lang.github.io/house-tate/**（GitHub Pages）
- 検証時コミット：`fea8fa9`（packet 2041）

---

## 1. 確認サマリ（結論）

| 確認項目 | 結果 | 方法 |
|---------|------|------|
| ライブURLにカード反映 | ✅ 反映済み | 公開URLを取得しマーカー一致確認 |
| JSON生成ロジック動作 | ✅ PASS | デプロイ済み関数を抽出しNodeで実行 |
| pass/email/token/secret 実値の出力 | ✅ なし（剥離確認） | 機密値を混入したseedで漏洩テスト |
| 冨永「未定」維持 | ✅ 維持 | 生成JSONで `secretaryAiName:"未定"` |
| disabled/削除済み 除外 | ✅ 除外 | `role:'削除済み'` を入れて除外確認 |
| active件数 | ✅ 一致（input 8 → active 7） | count フィールド検証 |
| admin表記「管理者」維持 | ✅ 維持 | perm=owner、notesに維持明記 |

総合判定：**PASS ✅**

---

## 2. ライブURL カード反映確認
- 取得：`https://housedotoujinishi-lang.github.io/house-tate/index.html?cb=fea8fa9`（キャッシュバスター付き）
- マーカー一致（live HTML 内出現数）：
  - `ai-org-member-json` … 2
  - `buildClaudeMemberSnapshot` … 2
  - `Claude連携用メンバーJSON` … 4
  - `packet 2041` … 2
- → AI組織図ページ（秘書マッピング直下）に packet 2041 カードが**公開反映済み**。

> 補足：GitHub Pages はリポジトリの `index.html`（LF版）をそのまま配信。ローカル作業コピーはCRLFのためバイト数は差異が出るが、コミット済み内容と一致。

---

## 3. JSON生成・除外・除外の決定論的検証（Node）

### 方法
公開ファイルから **デプロイ済みの実関数**を抽出し、Node で `buildClaudeMemberSnapshot()` を実行：
- 抽出元：`live_index.html`
  - `_isDisabledAccount` / `_getAccountOrder` / `_saveAccountOrder` / `_sortByAccountOrder`
  - `getPersonalSecretaryMapping`
  - packet 2041 ブロック（`_cmj*` / `buildClaudeMemberSnapshot` 他）
- 入力 seed（**adversarial**：剥離を証明するため `pass` に加え `email` / `token` / `apiKey` を意図的に混入し、`削除済み/disabled` も投入）：
  - 芳村(admin) / 杤岡(admin) / 安見(staff) / 佐野(staff) / 冨永(staff) / 伴(admin) … 実務6名
  - admin（perm=owner, `pass=admin_secret_PLAINTEXT`, `email`, `token=tok_LEAKCHECK`, `apiKey=sk-LEAKCHECK`）… テストアカウント
  - 幽霊（role=削除済み, perm=disabled）… 除外対象

### 結果（assertions）
```
disallowed_keys_in_members : NONE        ← members は許可9項目のみ
banned_substrings_in_json  : NONE        ← pass/email/token/apiKey の値も "pass"/"email" 等のキーも一切出力なし
active_count (count field) : 7 / members.length 7   ← input 8 - 削除済み1 = 7
ghost(削除済み) excluded    : YES
tominaga secretaryAiName   : 未定
admin perm value           : owner（連携側で「管理者」表記）
admin notesForAi           : 管理者用テストアカウント（実務担当者ではない）。admin表記は「管理者」として維持。
readOnly / externalSend    : true / false
member uids (order)        : yoshimura > tochioka > yasumi > sano > tominaga > ban > admin
===== RESULT: PASS =====
```
- **混入した `admin_secret_PLAINTEXT` / `admin@example.com` / `tok_LEAKCHECK` / `sk-LEAKCHECK` は生成JSONに一切現れない** → ホワイトリスト抽出が機能。
- 冨永の `secretaryAiName` は **"未定"** のまま。
- `role:'削除済み'`（disabled）は **除外**。
- 出力9項目：uid / name / displayName / role / perm / secretaryAiName / isActive / sortOrder / notesForAi。

### active件数についての注記
- 上記は検証用 seed（実務6名＋admin＝7）。**実運用の active 件数は、その時点で Supabase からロードされ非 disabled な accounts 数**に一致する（実務メンバーのみなら 6、adminテストアカウントを含めれば 7）。
- 件数は本番ログイン状態のブラウザで `件数：N 件（active のみ）` 表示として確認可能（§6）。

---

## 4. 軽微UI改善（packet 2042）
- 最終生成時刻 `#cmj-time` の表示を **日本語ローカル時刻**（`toLocaleString('ja-JP')`）に変更。`title` 属性に ISO 値を保持。
  - 変更箇所：`_cmjRegenerate` 内 1 行のみ。
  - **JSON 本文の `exportedAt` は ISO8601 のまま不変**（連携用の機械可読値は維持）。
  - 外部送信・fetch・localStorage 書き込みは追加なし（表示整形のみ）。

---

## 5. セキュリティ確認（再掲・実測）
- fetch / XMLHttpRequest：index.html 全体で **24 → 24（新規なし）**。
- localStorage/sessionStorage setItem：**62 → 62（新規なし）**。既存 `jagai_account_order_v1` の読み取りのみ。
- `<script>` タグ：**11/11 一致**。packet 2041 ブロック `node --check` PASS。
- 顧客情報・顧客タブ：本パケットで変更なし（復活なし）。

---

## 6. ユーザー実機（ブラウザ）確認チェックリスト（任意）
ログイン状態の実データ表示・クリップボードコピーは、ボスのログイン済みブラウザでの確認を推奨（本記録はデプロイ反映＋ロジックを決定論的に検証済み。視覚表示と実クリップボード書き込みはブラウザ実行が必要）。
- [ ] 公開URLにログイン → AI組織図ページを開く
- [ ] 「🔗 Claude連携用メンバーJSON」カードが秘書マッピング表の下に表示される
- [ ] 「🔄 生成 / 再生成」でJSONが表示され、`件数：N 件（active のみ）` が出る
- [ ] 冨永の行が `"secretaryAiName": "未定"`
- [ ] 「📋 コピー」で「✓ コピーしました」表示 → 任意のエディタに貼り付けできる
- [ ] JSON に pass/password/email/token/secret値/顧客情報が**無い**こと

---

## 7. 今回やらないこと（維持）
- Claude Desktop 接続／MCP 本番接続／外部API接続／Cloud Run deploy。
- Supabase / SQL / RLS / Auth の変更。
- 書き込みAPI／削除済みを含める出力／localStorage への JSON 本文保存。

## 8. 次packet候補
- packet 2043（案）：管理者限定「削除済みも含める」read-only トグル（既定 off）。
- packet 2044（案）：ローカル read-only MCP でこの snapshot を参照する PoC（外部送信なし・ファイル参照のみ／要ボス承認）。

— packet 2042 / 実機確認 PASS・軽微UI改善 / commit→push。
