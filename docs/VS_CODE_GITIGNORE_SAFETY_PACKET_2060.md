# gitignore非対称解消 + VS Code司令室安全運用仕上げ（VS_CODE_GITIGNORE_SAFETY_PACKET_2060）

最終更新：2026-06-07
packet：2060（house-tate-source / 対応 OS packet 648・v0.9.648）
前提：ノートPC の VS Code 司令室運用開始（OS packet 647）を受け、今後の誤 commit 事故を防ぐ仕上げ。
承認：芳村本人の明示指示により `.gitignore` 編集を実施。

`housetate-ai-company` と `house-tate-source` の `.gitignore` が**非対称**だったため、
両 repo で `.claude/` と `.vscode/` を ignore する状態に対称化しました。
変更は **`.gitignore` と docs / CHANGELOG のみ**。`index.html`・DB・Supabase・Auth・外部 API・顧客系には**一切触れていません**。

---

## 1. 開始前確認（read-only / 2026-06-07）
- `git status -sb`：クリーン（未追跡なし。runtime/・PNG は ignored）
- `origin/main` と同期済み
- `runtime/` ・ `*.local.json` ・ PNG ・ secret 系は ignored で commit 対象外を確認

## 2. 非対称の内容（修正前）
- house-tate-source：`.claude/` ✅ ignored ／ `.vscode/` ❌ rule 無し
- housetate-ai-company：`.vscode/` ✅ ignored ／ `.claude/` ❌ rule 無し

## 3. 実施した最小追記（house-tate-source `.gitignore`）
```
# packet 2060: エディタ/IDE ローカル設定（housetate-ai-company と対称化）
.vscode/
.idea/
```
- 既存ルール（`runtime/`・`*.local.json`・`members.snapshot.json`・`incoming.json`・`.claude/`・PNG 各種）は**1行も削除・変更していない**（純追記）。
- OS 側（housetate-ai-company）には `.claude/` を追記し、両 repo を対称化。

## 4. 変更後確認
- `git status -sb` で `.claude/`・`.vscode/` が commit 対象に出ないことを確認。
- 変更ファイルは `.gitignore`・本 docs・`CHANGELOG.md` のみ。

## 5. Codex レビュー用サマリー
- 変更ファイル：`.gitignore`（追記のみ）/ 本 docs / `CHANGELOG.md`
- 意図：`.claude/`・`.vscode/` の ignore を両 repo で対称化し誤 commit 事故を防止
- 危険性：**なし**（既存 ignore 削除なし・`index.html`/DB/Auth/API 非編集・追記のみ）

## 6. 関連
- OS 側：`housetate-ai-company/docs/VS_CODE_GITIGNORE_SAFETY_PACKET_648.md`（対の記録）
- `CHANGELOG.md` — 本記録は packet 2060 で追加
