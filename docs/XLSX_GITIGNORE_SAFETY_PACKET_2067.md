# Excel(xlsx)・Excel一時ファイル 誤commit防止 .gitignore hotfix（XLSX_GITIGNORE_SAFETY_PACKET_2067）

最終更新：2026-06-08
packet：2067（house-tate-source / 対応 OS packet 658A・v0.9.658A）
管理：dev / qa / ガード
種別：誤commit防止の安全hotfix（.gitignore 追記のみ・低リスク／🟡 MEDIUM）
前提：packet 657 の Codex/作業中に、house-tate-source 直下へ未追跡の Excel ファイル（顧客・業者情報を含む可能性）と Excel 一時ファイルが複数あることを検出。

## 1. 背景・目的
house-tate-source 直下に**未追跡の `.xlsx` が 6 件**、**Excel 一時ファイル `~$...` が 2 件**存在。
ファイル名に「電話・住所」等の語を含むものがあり、**顧客・業者情報を含む可能性が高い**。
現状は個別 add 運用で守れているが、将来の `git add -A` 等での誤 commit／情報流出を防ぐため、
`.gitignore` に Excel 系を追加して**恒久的に追跡対象外**にする。

> 本書ではファイル名そのものは記載しない（顧客・業者情報の可能性のため件数のみ）。

## 2. 開始前確認（read-only）
- `git status -sb`：作業ツリーはクリーン（未追跡 xlsx/~$ のみ）
- **追跡済み `.xlsx`：なし**（`git ls-files "*.xlsx"` 空）→ untrack 不要・削除リスクなし
- **追跡済み `~$*`：なし**（`git ls-files '~$*'` 空）
- → 安全に `.gitignore` 追加のみで対応可能（既存ファイルの削除・untrack は行わない）

## 3. 追加した ignore ルール（既存非削除・末尾追記）
```
# packet 2067: Excel ファイル / Excel 一時ファイル（顧客・業者情報を含む可能性。誤commit防止のため git 管理しない）
*.xlsx
*.xls
*.xlsm
~$*
```
- `*.xls` / `*.xlsm` も将来の取り込みに備えて同時に除外。
- `~$*` は Excel/Word の編集中ロック一時ファイル全般を除外。
- 既存ルール（`runtime/`・`*.local.json`・`.claude/`・`.vscode/`・`.idea/`・PNG 各種）は**1行も削除・変更せず純追記**。

## 4. 反映確認（実測）
- 追記後 `git status -sb`：**未追跡 .xlsx 0 件・~$ 0 件**（commit 対象に出なくなった）。変更は `.gitignore` のみ
- `git check-ignore`：実在 xlsx 代表・`test.xlsx`・`~$tmp.xlsx` いずれも ignore 対象と確認
- staged はこの packet の対象（`.gitignore`/docs/CHANGELOG）のみ。xlsx は1件も stage されない

## 5. 守った安全境界（赤信号クリア）
- 顧客系 xlsx の **add はしない**（赤信号）。既存ファイルの**削除・untrack もしない**
- DB/Supabase/Auth/API・保存仕様・データ構造 変更なし・外部API/npm install なし
- `.claude`/`.vscode`/`runtime`/PNG add なし・`git add -A` なし・force/reset/clean/rebase なし・**通常 commit/push**

## 6. 残課題・ボス判断事項
- 直下の未追跡 xlsx 6 件・~$ 2 件は **ignore で追跡対象外にしただけ**。ファイル自体はローカルに残存。
  - 顧客・業者情報を含むなら、**リポジトリ外（OneDrive 非同期の安全な場所）へ退避**するのが望ましい（ボス判断）。
  - 削除・移動は Claude では行わない（顧客データ操作のため）。

## 7. 関連
- `housetate-ai-company/docs/VS_CODE_GITIGNORE_SAFETY_PACKET_648.md`（gitignore 対称化の前例）
- `.gitignore`（本変更）
- `CHANGELOG.md` — 本記録は packet 2067 で追加
