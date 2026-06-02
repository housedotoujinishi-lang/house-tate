# 🗄 tasks 時間カラム追加 手動SQL ＋ タスク時間永続化設計（packet 2032 / DESIGN ONLY）

- 起票日: 2026-06-02 ／ ステータス: **docs設計のみ。SQL実行・Supabase変更・アプリ実装は行わない。**
- 関連: packet2031（タイムライン クリック編集＋右端リサイズ）の永続化課題への対応設計。

> ⚠️ 本パケットは **設計docsのみ**。Claude側でのSQL実行・Supabase直接変更・index.html編集・アプリ実装は **一切行わない**。手動SQLはボスが Supabase SQL Editor で実行する想定。

## 1. 現状整理
- `state.tasks` の項目：`id, title, cat, pri, status, toIdx, deadline, comment, done`（＋アプリ内のみ `sh, sm, dur, fromRoutine, routineId`）。
- **保存**：`saveTasks()` が送るカラム＝`id, title, cat, pri, status, to_idx, deadline, comment, done` のみ。**`sh / sm / dur` を送っていない**。
- **復元**：起動時 `sbGet('tasks')` のマッピングも `id,title,cat,pri,status,toIdx,deadline,comment,done` のみ。**時間項目を読まない**。
- **結果**：タイムライン上のタスク時間（リサイズ/開始終了）は **in-memory のみ＝リロードで消える（時間未設定に戻る）**。担当者(to_idx)・タイトル・カテゴリは永続化される。
- 対象テーブル：`public.tasks`（Supabase / PostgreSQL）。

## 2. 実行前 確認SQL（現状カラム確認）
```sql
-- tasks テーブルの現カラム一覧（sh/sm/dur が無いことを確認）
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'tasks'
order by ordinal_position;
```

## 3. ALTER TABLE SQL（カラム追加・冪等）
```sql
-- 時間カラムを追加（NULL許容・既存行はNULL=時間未設定）
alter table public.tasks
  add column if not exists sh  smallint,   -- 開始 時 (0-24)
  add column if not exists sm  smallint,   -- 開始 分 (0-59)
  add column if not exists dur integer;    -- 所要分 (>=15想定)

-- PostgREST にスキーマ変更を反映（Supabaseは自動反映の場合あり。必要時のみ）
notify pgrst, 'reload schema';
```
- `if not exists` で**冪等**（二重実行しても安全）。
- 既定 NULL（既存タスクは「時間未設定」のまま＝後方互換）。
- RLS/権限/Auth には**影響しない**（列追加のみ・ポリシー不変）。

## 4. 実行後 確認SQL
```sql
-- 追加カラムの存在確認
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name='tasks'
  and column_name in ('sh','sm','dur')
order by column_name;

-- 値の入り具合を確認（実装反映後）
select id, title, to_idx, deadline, sh, sm, dur
from public.tasks
order by id desc
limit 10;
```

## 5. ロールバックSQL（追加カラム削除のみ）
```sql
-- 追加した3カラムだけを削除（他データは不変）
alter table public.tasks
  drop column if exists sh,
  drop column if exists sm,
  drop column if exists dur;

notify pgrst, 'reload schema';
```
- 削除対象は今回追加した3列のみ＝**既存データ無損失**。

## 6. アプリ側 実装計画（SQL適用後・別packetで実装）
> 本docsでは実装しない。SQL適用後に packet2033 等で index.html を最小修正する想定。
1. `saveTasks()` の rows に時間項目を追加：
   ```js
   // 例（実装は別packet）
   sh: (t.sh!=null? t.sh : null),
   sm: (t.sm!=null? t.sm : null),
   dur:(t.dur!=null? t.dur: null)
   ```
2. 起動時 `sbGet('tasks')` のマッピングに `sh: t.sh, sm: t.sm, dur: t.dur` を追加（NULLはそのまま＝時間未設定）。
3. 後方互換：時間が NULL のタスクは従来どおり「時間未設定」列に表示。
4. packet2031 のリサイズ/編集（`t.dur`・`t.sh/t.sm` 更新→`_persistTasks`）は変更不要（保存カラムが増えるだけで自然に永続化）。
5. 検証：タスクをリサイズ→リロード→終了時刻維持／クリック編集の開始終了→リロード維持。

## 7. リスク整理
| リスク | 対策 |
|--------|------|
| PostgREST スキーマキャッシュ未更新で新カラムが 400 | `notify pgrst, 'reload schema';` 実行／Supabaseは数十秒で自動反映 |
| 既存行が NULL | 仕様（時間未設定）。後方互換で問題なし |
| 型不一致（アプリが文字列送信） | 実装時に数値で送る（Math.floor等）。本docsの実装計画に明記 |
| RLS/Auth への影響 | 列追加のみ＝**影響なし**（ポリシー不変） |
| データ損失 | 追加・削除とも既存列に触れない＝**無し**。ロールバックは追加3列のみ削除 |
| 予定(events)側の重複保存 | 本packet対象外（別途 client_key + upsert を設計） |

## 8. 作業手順（ボス向け・まとめ）
1. §2 で現状確認 → 2. §3 ALTER 実行 → 3. §4 で確認 → 4. 別packetでアプリ側 saveTasks/load を修正 → 5. リロード検証。問題時は §5 ロールバック。

## 禁止事項の遵守
- Claude側 SQL実行：なし／ Supabase直接変更：なし／ index.html編集：なし／ アプリ実装：なし
- 本パケットは **docs＋CHANGELOG のみ**・commitまで・**push禁止**。
