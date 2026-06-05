# Claude Desktop 接続前チェックリスト（packet 2046）

- 種別：**チェックリスト docs のみ**（接続・設定変更はしない）
- 日付：2026-06-05
- 関連：packet 2041（生成MVP）/ 2042（実機確認）/ 2043（ローカルMCP設計）/ 2044（ローカルファイル化）/ 2045（UI改善）
- 位置づけ：**実際に Claude Desktop へつなぐ前にボスが確認する項目**。本packetでは接続しない。

---

## 0. 大原則
- ここに書くのは「**接続の前提条件**」。条件が全て満たされるまで **MCP本番接続・Claude Desktop 設定変更には進まない**（＝赤信号）。
- 現状（2026-06-05 時点）：じゃがいOS 側の read-only メンバーJSON 生成・表示・コピー・ローカルファイル化テンプレートまで完了。**Claude Desktop / MCP 接続は未実施**。

## 1. じゃがいOS 側 JSON 確認（接続前）
- [ ] AI組織図ページの「🔗 Claude連携用メンバーJSON」カードで生成できる。
- [ ] 件数（active のみ）が想定どおり。
- [ ] 冨永の `secretaryAiName` が **"未定"**。
- [ ] admin 系が連携側で「管理者」表記（perm=admin/owner）。
- [ ] JSON項目が許可9項目のみ：uid / name / displayName / role / perm / secretaryAiName / isActive / sortOrder / notesForAi。

## 2. 機密が無いことの確認（最重要）
- [ ] JSON に **pass / password が無い**。
- [ ] **token / secret(値) / access token / refresh token が無い**。
- [ ] **email / 電話 / 住所 が無い**。
- [ ] **顧客情報が無い**（customer/顧客/phone/address 等）。
- [ ] **Supabaseキー / APIキー / service_role が無い**。
- [ ] 不要な **UUID（auth.user.id 等）が無い**。
- 補足：`secretaryAiName` は「秘書AI名」であり API secret/token ではない（機密スキャンの誤検知。実値が無いことだけ確認）。

## 3. ローカル保存場所の確認
- [ ] 本物JSONは **`runtime/` 配下のローカルファイル**にのみ置く（例：`runtime/claude-member-json/members.snapshot.json`）。
- [ ] その場所が **`.gitignore` 対象**である（`git check-ignore <path>` で確認）。
- [ ] **本物JSONを git にコミットしていない**（`git status` に出ない）。
- [ ] コミットしてよいのは **ダミー（`scripts/sample.member-json.dummy.json`）のみ**。

## 4. MCP 設定の安全条件（接続段階で適用）
- [ ] MCP 設定ファイルに **APIキー / token / secret を書かない**。
- [ ] MCP は **read-only**（get 系のみ）。**書き込みツールを作らない**（create/update/delete/upsert なし）。
- [ ] MCP が読むのは **ローカルJSONファイルのみ**（外部送信・外部API・クラウド送信なし）。
- [ ] Claude Desktop から **役職変更・削除・権限変更ができない**（参照のみ）。

## 5. 実接続時に必要なボス承認項目（事前合意）
- [ ] どの方式で接続するか（packet 2043 の方式A=手動ファイル / 方式B=ローカルMCP）。
- [ ] ローカルMCPサーバーをどこで動かすか（ローカルのみ）。
- [ ] 更新運用（誰が・いつ JSON を再生成してローカル保存するか）。
- [ ] 接続は **ローカル read-only に限定**し、Cloud Run/API化は別承認とすること。

## 6. 赤信号一覧（これらは接続作業でも絶対にしない）
- SQL実行 / Supabase・RLS・Auth 設定変更 / DB UPDATE・DELETE・UPSERT / service_role 使用。
- 外部API本番接続 / Cloud Run deploy / GitHub Actions Secrets 変更。
- OpenAI・Claude APIキー作成・保存・読込 / `.env` 作成 / Google Sheets API / LINE 送信。
- 顧客情報の保存・出力 / pass・password・token・secret・APIキーの実値出力。
- 本物メンバーJSONを git にコミット / localStorage・sessionStorage への本文・機密保存。
- 顧客タブ復活 / `.claude add` / force push / git reset・clean・rebase / 物理DELETE。
- 既存アカウントの権限変更 / admin「管理者」表記変更 / 冨永「未定」変更。
- **Claude Desktop 本体設定変更 / MCP 本番接続**（＝本ラインの最終ゲート。ボス承認必須）。

## 7. ロールバック方針
- UI/ロジックに問題が出たら、該当 packet コミットを **revert で取り消す**（force push・reset は使わない）。
  - 例：`git revert <commit>` → 通常 push。
- ローカルJSON/runtime は git 管理外のため、**ローカルファイルを削除するだけ**で原状復帰（リポジトリに影響なし）。
- MCP 設定を入れていた場合は **その設定ファイルを外す / 無効化**（Claude Desktop 側のローカル設定のみ）。本リポジトリには波及しない。

## 8. 次packet で初めて PoC に進む条件（ゲート）
すべて満たしたら、次の PoC（ローカル read-only MCP 実装）に進んでよい：
1. §1〜§3 のチェックが全て ✅（JSONが安全・本物JSONはローカル/gitignore）。
2. §4 の MCP 安全条件に合意（read-only・書き込みなし・キーを書かない）。
3. §5 のボス承認項目が決定済み。
4. ボスが明示的に「PoC接続に進んでよい」と承認。
- それまでは **docs / ローカル設計まで**で停止（MCP本番接続は赤信号）。

## 9. 次packet候補
- packet 2047（案・要承認）：ローカル read-only MCP サーバー PoC（ローカルJSONを読むだけ・外部送信なし）。
- packet 2048（案・要承認）：Claude Desktop への MCP 接続手順（ローカル限定・read-only）。

— packet 2046 / チェックリスト docs のみ / 接続・設定変更なし。
