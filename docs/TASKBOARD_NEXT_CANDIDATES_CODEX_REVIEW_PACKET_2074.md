# タスクボード 次改善候補 再棚卸し（Codex read-onlyレビュー用）（TASKBOARD_NEXT_CANDIDATES_CODEX_REVIEW_PACKET_2074）

最終更新：2026-06-08
packet：2074（house-tate-source / 対応 OS packet 663・v0.9.663）
管理：dev / qa / secretary
種別：候補棚卸し docs（Codex read-onlyレビュー用・🟢 LOW）

このファイルは、タスクボード UX 改善シリーズ（packet 2061〜2073）で各 packet が残した「今後候補／残課題」を**1か所に再集約**し、Codex に read-only でレビュー・優先度づけしてもらうための棚卸し表です。
実装は含みません（docs のみ）。

---

## 1. 候補一覧（直近packetの「今後候補/残課題」から集約）

| # | 候補 | 出所 | 想定リスク | 想定スコープ | 触る箇所 |
|---|------|------|-----------|--------------|----------|
| C1 | **顧客/業者系 xlsx のリポジトリ外退避**（ignore 済みだが本体ローカル残存） | 2067 | 🔴 ボス専決（顧客データ移動・削除） | Claude実行不可・ボス手作業 | リポジトリ直下ファイル |
| C2 | 追加トースト経路A（`showKAddModal` 7123）に**タスク名表示**（経路Bと content parity） | 2072 | 🟡 Lv2 | 局所JS（`newTask.title`＋長文短縮要否） | index.html 7117-7125 |
| C3 | フィルタ中バナーのダーク配色 **実機目視後の微調整** | 2068 | 🟢 Lv1（必要時のみ） | inline色のみ | index.html 1847 |
| C4 | バナー/トースト文言の**ブランド・トーン最終レビュー** | 2071/2072 | 🟢 Lv1 | 文言のみ | index.html・docs |
| C5 | タスクボード操作の**ショートカット/キーボード対応**棚卸し | 新規 | 🟡 Lv2 | 要調査（既存 showToast/keydown 構造） | 要 read-only 調査 |
| C6 | 完了済みタブの**簡易サマリ**（件数/当日完了数 等の表示） | 新規 | 🟡 Lv2 | renderTaskBoard 表示のみ（保存非変更） | index.html renderTaskBoard |
| C7 | フィルタ `#tf-count`（件数表示）の**文言/視認性**改善 | 新規 | 🟢 Lv1 | 文言/inline色 | index.html 1844 |

> C1 は赤信号（顧客データ操作）。Claude は実行せず、ボス手作業前提として掲載。

## 2. 推奨着手順（自己案・safe/最小/効果のバランス）
1. **C1（ボス手作業）**：情報保護の観点で最優先。Claude は ignore 済みであることの確認まで。
2. **C2**：トースト体験の一貫性（経路Aにもタスク名）。局所だが長文短縮の要否を packet 2064/2063A に合わせる。
3. **C7 / C4**：Lv1 で安全・即効。文言/視認性の小改善。
4. **C6**：完了タブの達成感。renderTaskBoard 表示追加のみ・保存非変更で 🟡 Lv2。
5. **C5 / C3**：調査・実機目視が前提のため後段。

## 3. 共通ガードレール（全候補に適用）
- 保存仕様・タスクデータ構造・`_persistTasks`・`applyTaskFilter` 条件・既存 id/data 属性は**変更しない**。
- DB/Supabase/RLS/Auth/API 非接続・npm install なし・index.html 最小差分・個別 add・通常 commit/push。
- UI 変更は packet 644 ui_check ＋静的検証（script/fetch/setItem/showToast/_persistTasks/renderTaskBoard 不変）。
- 🔴 赤信号（C1 の顧客データ移動・削除等）は Claude 実行不可。

## 4. Codex への依頼（read-only）
```
【Codex read-only / packet 663（house-tate-source packet 2074）】read-only・コード変更なし・棚卸しレビュー
依頼：本docsの候補一覧（C1-C7）について、(a)リスク評価が妥当か (b)着手順の助言 (c)抜けている改善候補 (d)各候補で壊しやすい既存挙動（保存/タブ/フィルタ/タイムライン）への注意点 を指摘してください。
制約：実装はしない。index.html/保存仕様/DB は変更しない。顧客データ(C1)は移動・削除しない。
期待：候補ごとに「優先度（高/中/低）＋一言根拠＋注意点」。追加候補があれば列挙。
```

## 5. 関連
- 改善総括：`docs/TASKBOARD_UX_IMPROVEMENTS_SUMMARY_PACKET_2071.md`
- 各候補出所：`..._PACKET_2067/2068/2071/2072.md`
- 運用ルール（OS）：`VS_CODE_COMMAND_CENTER_AUTONOMY_RULES_PACKET_653.md` / `..._AUTO_CONTINUE_PACKET_656.md`
- `CHANGELOG.md` — 本棚卸しは packet 2074 で追加
