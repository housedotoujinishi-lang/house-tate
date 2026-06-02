# 📡 担当者別タイムライン 8-24時・幅拡張 公開反映記録（packet 2030 / RECORD ONLY）

- 記録日: 2026-06-02 ／ ステータス: **公開反映記録のみ・新規実装なし**
- 公開URL: **https://housedotoujinishi-lang.github.io/house-tate/**

> ⚠️ 本パケットはコード変更なし。通常 `git push origin main` の記録と検証結果のみ。

## 1. push 実行内容（通常push・force無し）
- コマンド: `git push origin main`（force/reset/clean/rebase **不使用**）
- 反映レンジ: `d553ea5..808d215  main -> main`（2コミット）
  - `6992101` packet 2029：8-24時・幅拡大（END_H24/HOURW92→…）
  - `808d215` packet 2029 調整：1時間120px（HOURW=120/MINW80）＋doc名統一
- push後同期: `local HEAD == origin/main == 808d2155d40d0fe8ca4162b33063372cc9c9139d`（✅ 完全同期）
- `.claude`: 未追跡のまま

## 2. 公開URL 反映確認（実HTML curl）
公開HTMLに新コードが反映済みを確認：
| マーカー | 公開HTML |
|---------|:--:|
| `END_H=24, HOURW=120`（packet2014） | ✅ |
| `var START_H=8,END_H=24,HOURW=120`（packet2027） | ✅ |
| `AVAIL_END=18`（空き率コア維持） | ✅ |
| `staff-schedule-board`（ボード常設） | ✅ |
| `crm-tab-hidden-packet-322`（顧客タブ非表示維持） | ✅ |
- `Last-Modified: 2026-06-02`（本push）。

## 3. 検証チェックリスト
> ✅=公開URL/gitで確認済 ／ 🟡=コード・配線・単体で確認済（自動ツールはJS非実行のため実機ログイン確認推奨）

| 項目 | 状態 | 根拠 |
|------|:--:|------|
| 公開反映（最新コード配信） | ✅ | curlで `HOURW=120`/`END_H=24` 等を確認・Last-Modified本日 |
| 顧客タブ非復活 | ✅ | packet 322 マーカー無傷 |
| タスクボード上部スケジュールボード | 🟡 | `staff-schedule-board` 常設・要ログイン確認 |
| カレンダー日表示 | 🟡 | buildTimeline共有・要確認 |
| 時間軸 8:00〜24:00 / 24:00終端 | 🟡 | 目盛17（定数駆動）・要表示確認 |
| 横スクロール / 担当者列sticky | 🟡 | `.stl-scroll overflow-x:auto`・`sticky`・要確認 |
| 予定名/タスク名の可読性向上 | 🟡 | 2段ブロック・MINW80・font11・要確認 |
| 夜予定表示 | 🟡 | 18:00以降も配置・要確認 |
| 空き率維持 | 🟡 | `AVAIL_END=18`（コア8-18）・単体70%確認 |
| ルーティンD&D（24:00割当含む） | 🟡 | getTimeFromDropPosition clamp 24・要操作確認 |
| 月表示/週表示 維持 | 🟡 | renderMonth/Week 無改変 |
| タスク追加/予定追加 維持 | 🟡 | 保存・追加ロジック不変 |

### 実機確認を推奨する理由
WebFetch/curl は JS非実行・ログイン後UIを再現できないため、表示・D&D・横スクロールの最終確認は公開URLにログインして実機で（Ctrl+F5でキャッシュ更新、CDN max-age=600）。

## 4. 禁止事項の遵守（違反0件）
- force push/reset/clean/rebase: 未実施（通常push のみ）／ `.claude` 追跡: なし
- Supabase/SQL/RLS/Auth 変更: なし／ 外部API/OpenAI/Claude/Sheets/Cloud Run: なし
- localStorage/sessionStorage 本文保存: なし／ 顧客タブ復活: なし／ 新規実装: なし（本記録のみ）

## 5. 現在の状態
- 公開URL: packet 2001〜2029 反映済（Pagesビルド反映後に最新化）。
- 本記録（packet 2030）は **commit までで停止**・以降 **pushしない**（ローカル ahead 1 で待機）。
