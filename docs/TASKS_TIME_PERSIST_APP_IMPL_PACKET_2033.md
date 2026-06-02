# 🗄 タスク時間 永続化 アプリ側実装（packet 2033）

- 実装日: 2026-06-02 ／ 前提: packet2032の手動SQLで `public.tasks` に `sh / sm / dur` 追加済み（ボス実行完了）。
- 目的: タスクの開始/終了（時間・所要）をDBへ保存し、**リロード後も時間付きでタイムラインに復元**する。

## 1. 変更内容（最小・2箇所）
### ① saveTasks（送信カラムに時間追加）
```js
const rows = state.tasks.map(t => ({
  id, title, cat, pri, status, to_idx, deadline, comment, done,
  sh: (t.sh!=null? t.sh : null), sm: (t.sm!=null? t.sm : null), dur: (t.dur!=null? t.dur : null) // packet 2033
}));
await sbUpsert('tasks', rows, 'id');
```
### ② 起動時ロード mapping（復元に時間追加）
```js
tasks.forEach(t => state.tasks.push({
  id, title, cat, pri, status, toIdx: t.to_idx, deadline, comment, done,
  sh: (t.sh!=null? t.sh : undefined), sm: (t.sm!=null? t.sm : undefined), dur: (t.dur!=null? t.dur : undefined) // packet 2033
}));
```
- NULL（時間未設定タスク）は `undefined` で従来どおり「時間未設定」列に表示（後方互換）。

## 2. これで成立する各経路（既存ロジックは無改変で自動永続化）
| 操作 | 時間更新（in-memory） | 保存 | 復元 |
|------|----------------------|------|------|
| クリック編集（開始/終了/カテゴリ/担当者） | packet2031 が `t.sh/t.sm/t.dur` 更新 | `_persistTasks`→`saveTasks`（sh/sm/dur送信） | ロードでsh/sm/dur復元 |
| 右端リサイズ（終了時刻=dur） | packet2031 が `t.dur` 更新 | 同上 | 同上 |
| ルーティンD&D割当 | packet2027 が `t.sh/t.sm/t.dur` 付与 | 同上 | 同上 |
→ packet2031/2027 は変更不要。**保存・復元の経路が通ったことで自動的に永続化**。

## 3. 期待動作（検証項目）
1. 予定リサイズ→リロード→終了時刻維持（※予定はevents側・本packet対象外だが、タスクは維持）。
2. **タスクリサイズ→リロード→終了時刻(dur)維持** ✅
3. **クリック編集→保存→リロード→開始/終了/内容維持** ✅
4. **担当者変更→保存→リロード→担当者移動維持**（to_idx＋時間とも） ✅
5. **ルーティンD&Dで作成したタスク→リロード→時間付きでタイムラインに戻る** ✅
6. 時間未設定タスクは従来どおり「時間未設定」列。

## 4. 非破壊・遵守
- 変更は `saveTasks` rows と起動時 mapping の2行のみ。新規外部接続なし（既存 `sbUpsert`/`sbGet` 経由）。
- SQL実行なし／Supabase直接変更なし／RLS・Auth変更なし／顧客タブ復活なし／月週・予定追加・既存タスク追加・ルーティンD&D 無改変。
- `node --check`（メインスクリプトブロック）PASS・`<script>` 8/8一致・CRM非表示マーカー無傷。

## 5. 既知の補足
- `fromRoutine`/`routineId` はDBカラム未追加のため永続化されない（ルーティン由来タスクはリロード後、種別アイコン/色がルーティン専用色でなく通常カテゴリ色になる。時間・内容・担当者は維持）。必要なら別途カラム追加（SQL）で対応可能。
- 予定（events）側の永続化・重複課題は packet2032 §7 のとおり別対応。
