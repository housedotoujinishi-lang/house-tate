# CHANGELOG — ハウステイト じゃがいAI会社OS

## packet 2029 — 🕛 スケジュール時間軸 8-24時・幅拡大（実装） / 2026-06-02
### Changed（buildTimeline共有＝日表示＋タスクボード両方）
- 時間軸 8:00〜18:00 → **8:00〜24:00**（END_H 18→24・目盛17）。夜/残業/来客対応まで表示
- 横幅拡大（HOURW 64→92・トラック1472px）→ PC/スマホ横スクロール前提。予定名フォント10→11
- 空き率は新定数 **AVAIL_END=18** で就業コア8-18基準を維持（夜の予定で薄まらない）
- packet2027ローカル定数（END_H/HOURW）も24/92に整合（D&D時刻計算・割当ピッカー）
- 既存タスク/予定/担当者行/件数/採点/D&D は維持。`docs/STAFF_SCHEDULE_TIMEAXIS_8_24_PACKET_2029.md`
### 検証・遵守
- node --check（packet2014/2027）PASS・<script>7/7・CRM無傷・禁止APIトークン0件・目盛17/幅1472/空き率コア維持
- Supabase/外部API/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし・月/週/既存無改変

## packet 2028 — 🔎 スケジュールブロック可読性強化（実装） / 2026-06-02
### Improved（buildTimeline共有改修＝日表示＋タスクボード両方に反映）
- 【S】2段ブロック化（1段目=種別アイコン＋開始時刻/2段目=予定名ellipsis）・高さ24→38・最小幅18→64px・ルーティン名称表示
- 【A】hover詳細（title強化：開始〜終了/予定名/種別/担当者）・種別アイコン色強化（📞🤝🔍📄🏠👥📋）・担当者ごと空き率バッジ＋稼働バー（緑/橙/赤）
- 可読性優先（最小幅64px・重なりは縦レーン）。色/データ/D&D/採点/件数は不変
- `docs/STAFF_SCHEDULE_BLOCK_READABILITY_PACKET_2028.md`
### 検証・遵守
- node --check（packet2014ブロック）PASS・<script>7/7・禁止APIトークン0件・CRM無傷・月/週/日/既存D&D無改変
- 空き率単体：3h→60%/0→100%/満→0%。Supabase/外部API/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2027 — 👥 タスクボード常設・担当者別スケジュールボード（静的MVP・実装） / 2026-06-02
### Added
- タスクボードに**常設**の担当者別スケジュール（`renderTaskBoard`非破壊ラップ→`#tb-body`直前に`#staff-schedule-board`挿入）
- 予定（state.events）＋タスク（state.tasks）を同一時間軸8-18で表示・担当者フィルタ連動・PC横並び/スマホ横スクロール（氏名列sticky）
- packet2014の`renderStaffTimelineDay()`流用（id衝突回避・トグル除去）＋本日ルーティンD&D/割当ボタン（自前`assignRoutine`→state.tasks→`_persistTasks`→`renderTaskBoard`再描画）
- カレンダー日表示タイムライン（packet2014）は維持（両方で表示）・`docs/TASKBOARD_STAFF_SCHEDULE_BOARD_PACKET_2027.md`
### 検証・遵守
- node --check（単体＋埋込）PASS・<script>7/7・禁止APIトークン0件・月/週/日/CRM無傷
- Supabase/SQL/RLS/Auth/外部API/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし・既存破壊なし

## packet 2026 — 🛠 担当者別タイムライン re-inject safety net（hotfix） / 2026-06-02
### 調査結論
- 公開HTMLに packet2014 含む最新コードは全て載っている（curl確認・Last-Modified=本日）。タイムラインは**カレンダー日表示専用**で、`render()`は`layoutMode==='both'`かつ`renderCal()`は`curV==='day'`の時だけ`renderDay()`→inject。既定は月表示のため未遷移だと出ない＋inject例外が握りつぶされる可能性
### Fixed（最小・packet2014非改変）
- 公開済 `appendStaffTimelineToDayCalendar()` を多経路で再inject：setTimeout複数回/switchPage('cal')ラップ/renderCalラップ/クリック委譲（.vp[data-v=day]・#lay-both・日付セル）/最小MutationObserver
- `#cal-view .daycol` が無ければ何もしない（月/週不変）・inject冪等・ループなし
- `docs/STAFF_TIMELINE_NOT_VISIBLE_HOTFIX_PACKET_2026.md`（調査+手順）
### 検証・遵守
- node --check（単体＋埋込）PASS・<script>6/6・禁止APIトークン0件・月/週/CRM無傷
- Supabase/SQL/RLS/Auth/外部API/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2025 — 📡 アカデミー/ロープレ/タイムライン 公開反映記録（記録のみ・実装なし） / 2026-06-02
### Record
- `git push origin main`（通常push・force無し）で `7b3f19d..f5f3609` を反映（9コミット：packet 2013記録〜2024）
- push後 origin/main と完全同期（HEAD f5f3609）・`.claude` 未追跡維持
- 公開URL: https://housedotoujinishi-lang.github.io/house-tate/ （GitHub Pages・ライブ確認・404なし）
- `docs/HOUSE_TATE_SOURCE_ACADEMY_ROLEPLAY_TIMELINE_PUBLIC_PUSH_RECORD_PACKET_2025.md` に検証チェックリスト（ログイン/ホーム/顧客タブ非復活=✅、タイムライン/ルーティンD&D/ロープレ各モード=🟡コード確認済・実機確認推奨）
- 新規実装なし・コード変更なし。本記録はcommitまでで以降push停止

## packet 2024 — 🏠 訪問査定ロープレ 特化モード（実装） / 2026-06-02
### Added
- ホームに「🏠 訪問査定ロープレ（→媒介取得）」を追加（選択式/自由入力とは別枠）。売主35テンプレを会話型で（20+ケース全網羅）
- 流れ：信頼構築→売却理由→権利→期限→価格期待値・競合→不安解消→媒介提案→結果。会話5〜8ターン
- **媒介取得判定**：❌媒介失敗／△一般媒介／⭕専任媒介／🏆専属専任媒介 を理由付きで表示（クロージング到達＋総合点で判定）
- 採点軸（信頼/売却理由/期限/競合/価格期待値/不安解消/次アクション/媒介取得）、地雷（必ず売れます/他社より高い/今すぐ専任/告知不要 等）
- 感情8状態（2022）・店長リアルタイム指導（2023：競合確認/価格調整/理由深掘り/媒介提案が早い）と連動
- `docs/VISIT_APPRAISAL_ROLEPLAY_PACKET_2024.md`（AI会議結果含む）
### 検証・遵守
- 売主35ケース（≥20）・会話5〜8ターン・媒介判定 単体テスト（90→🏆/74→⭕/58→△/40→❌/未CL→❌）
- packet2021-2023維持・<script>5/5・academy node --check PASS・CRM無傷
- Supabase/SQL/RLS/Auth/外部API/OpenAI/Claude/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2021–2023 — 💬 会話型ロープレ / 😊 感情8状態 / 👑 店長リアルタイム指導（実装） / 2026-06-02
### packet 2021 会話型ロープレ
- 一問一答→3〜5ターンの会話へ。チャットログ蓄積（🧑お客様/🙋あなた＋採点バッジ/💬反応）、「次へ」廃止で会話継続
- 動的反応 reactionFlavor：性格×メーターで反応が変化（警戒型に強引クロージング→反応悪化、共感→本音開示）
### packet 2022 感情エンジン強化
- 感情を4→8状態（🛡警戒/🤨半信半疑/👂興味あり/🙂好印象/🤝信頼/🔥前向き/🏷売却意欲高/🏠購入意欲高）。メーター＋側＋クロージングから自動判定・常時表示
### packet 2023 杤岡AI店長 リアルタイム指導
- プレイ中に店長ヒントを介入表示（現ターンdim×性格×メーター）。頻度トグル OFF/少/普通/多（既定=普通）
- 例「警戒型にクロージングが早い」「今は共感優先」「競合確認を」「理由の深掘りを」「次アクション提案を」
- `docs/ROLEPLAY_CONVERSATION_ENGINE_PACKET_2021.md` / `..._EMOTION_ENGINE_PACKET_2022.md` / `..._MANAGER_COACH_PACKET_2023.md`（AI会議結果含む）
### 検証・遵守
- 会話5〜6ターン継続・性格で反応変化・感情8状態（単体テスト：警戒70→🛡/信頼68→🤝/クロージング→🏷）・店長介入表示
- packet2016/2017/2018-2020 維持・<script>5/5・academy node --check PASS・CRM無傷
- Supabase/SQL/RLS/Auth/外部API/OpenAI/Claude/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2019–2020 — ✍️ 自由入力ロープレ + ホームUI分離（実装） / 2026-06-02
### Added（自由入力ルールベース採点・外部API不使用）
- 自由入力モード：お客様の発言→textarea→ローカル採点（共感/深掘り質問/次アクション/法務配慮/不安を拾う/断定回避/性格適合）
- NGワード地雷（必ず売れます/絶対大丈夫/黙っておきましょう/すぐ契約/他社より必ず高く/ローンは絶対通る/問題ありません/違法ではない/告知しなくていい 等）＝各-25
- 結果カード：採点・良かった点・危険な点・改善例（最適choice＝模範解答）・👑杤岡AI店長レビュー（性格/法務連動）・再回答/次へ
- ホームを「📝選択式ロープレ」「✍️自由入力ロープレ」に分離。free画面にも sticky🎓TOP。スマホ向け大きめtextarea
- `docs/ROLEPLAY_SCENARIO_70_AND_FREE_INPUT_PACKET_2018.md`（AI会議結果＋70シナリオ＋自由入力 設計/検証）
### 検証・遵守
- 自由入力 単体テスト：良い回答+50 / NG2語-50（NGワード・法務リスク減点が機能）
- A/B/C選択式・性格/動的採点/メーター（2016）・ホーム復帰（2017）維持・<script>5/5・academy node --check PASS・CRM無傷
- OpenAI/Claude/外部API/Sheets/CloudRun不使用（完全ローカル）・localStorage本文保存なし・顧客タブ復活なし

## packet 2018 — 🎭 ロープレ シナリオ70+（実装） / 2026-06-02
### Added（20+20 → 35+35＝70テンプレ）
- 売主+15：離婚調停中/相続人4人以上/共有名義/空き家10年放置/ゴミ屋敷/再建築不可/連棟/市街化調整区域/任意売却/事故物件/境界未確定/検査済証なし/越境あり/解体前提/農地
- 買主+15：子供出生予定/ローン否決歴/法人購入/セカンドハウス/フルローン/頭金ゼロ/投資初心者/利回り重視/駅距離重視/夫婦ペアローン/現金購入/注文住宅/マンション派/高齢ダウンサイジング/単身購入
- 事故物件/告知/検査済証/越境/任意売却など法務重め。隠蔽・断定choiceを地雷化（九条AI反映）
- A/B/C選択式・顧客性格/動的採点/メーター（2016）・ホーム復帰（2017）維持。生成時シャッフルでB偏重なし
### 遵守
- node --check（academy block）PASS・<script>5/5・シナリオ削除なし・外部/DB変更なし・顧客タブ復活なし

## packet 2017 — 🎭 ロープレ シナリオ増量 + ホーム復帰バグ修正（実装） / 2026-06-02
### Fixed（トップへ戻れないバグ）
- 全サブ画面（play/result/quiz/rank）に sticky「🎓 アカデミーTOPへ」を前置（プレイ中も中断可）
- `render()` を try/catch 化しホームへフォールバック・未知viewをhome正規化・タブ再入場でhomeリセット・`.ac-home`を`goHome()`に統一
### Added（シナリオ増量 10+10→20+20＝40）
- 売主+10：高値売却希望/買取希望/ローン残債/急ぎ売却/収益物件/借地権/オーナーチェンジ/税金・特例/高齢ダウンサイジング/告知事項あり
- 買主+10：予算不足/エリア迷い/親同居/投資目的/リフォーム前提/内覧後クロージング/買付判断/ペット可/共働き時短/転勤族
- 各テンプレ別論点（水増しなし）。高値/買取/告知ケースは断定・隠蔽を地雷化（誇大表現・告知義務＝九条AI反映）
- B正解固定に戻さず（生成時シャッフル維持）。顧客性格/動的採点/メーター/感情（packet 2016）維持
- 実装前にAI会議（杤岡/安見/九条/諭吉/労基/UI）を実施し方針へ反映。`docs/ROLEPLAY_SCENARIO_EXPANSION_AND_HOME_FIX_PACKET_2017.md` に記録
### 遵守
- node --check（academy block）PASS・<script>5/5・月/週/CRM無傷・禁止APIトークン0件
- シナリオ削除なし・Supabase/SQL/RLS/Auth/外部API/Sheets/AI/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2016 — 🧠 顧客性格システム + 動的採点（実装） / 2026-06-02
### Added（アカデミー packet 2012 を非破壊拡張）
- 顧客性格8類型（論理派/感情派/慎重派/即決派/警戒型/優柔不断型/プライド高い型/忙しい型）を生成時にランダム付与・★難易度補正
- **動的採点**：同じ回答でも性格で点が変動（likes dim +5 / dislikes -5 / 早期クロージングは慎重・警戒型に -10）。base は packet 2015 の5段階
- **顧客メーター5種**（信頼度/警戒心/緊急度/温度感/競合影響）を回答ごとに増減しプレイ画面に常時表示
- **感情表示**（🙂好印象/😐普通/😟不安/😠不信感）をメーターから判定し回答ごとに更新
- **杤岡AI店長レビュー強化**：性格に紐づく具体助言（例「論理派に共感重視で説得力不足」「警戒型に早期クロージングで警戒心上昇」）
- **顧客タイプ別成績**を結果画面に表示（今セッションの平均点・in-memory）
- `docs/ROLEPLAY_CUSTOMER_PERSONALITY_PACKET_2016.md`（性格別評価テーブル設計＋Lv4ループ）
### 設計・非破壊・遵守
- 既存シナリオ/テンプレ本文は不変。性格は dim×grade に薄い補正レイヤーを乗せる方式（保守はテーブル1枚）
- 状態は in-memory（localStorage/sessionStorage保存なし）・Supabase/SQL/RLS/Auth/外部API/Sheets/AI/CloudRun 不使用・顧客タブ復活なし
- node --check（academy block）PASS・<script>5/5・CRM非表示マーカー無傷・禁止APIトークン0件

## packet 2015 — 🎯 営業トレーニング 採点ロジック是正 / 2026-06-02
### Fixed
- **B偏重の是正**：packet 2001 は最適解が全60問でB（100%）に固定だった → 設問ごとに選択肢を Fisher-Yates シャッフルし、A/B/C を毎プレイ一様化（暗記ゲーム化を解消）。packet 2012 は生成時シャッフル済
- **5段階採点へ**：好手+20/及第+8/地雷-10 → 最適+15 / 良い+10 / 普通+5 / 微妙0 / 地雷-10（PT を両packetで更新）
- 及第選択肢をキーワード再評価（先送り・受け流す・楽観等＝微妙0／確認・整理・伺う等＝普通+5）、一部に「良い+10（最適ではない）」を付与
- 全60問に地雷1つ確保（全11シナリオで最低1）、history good/mid フラグを5段階対応に更新
- `docs/ROLEPLAY_SCORING_BALANCE_PACKET_2015.md`（修正前B=100%→修正後≈33%×3・グレード分布・地雷数・シナリオ別）
### 遵守
- シナリオ/顧客データ削除なし（採点トークンと順序の是正のみ・テキスト保持）
- API/DB/Supabase/SQL/Auth変更なし・外部接続なし・localStorage本文保存なし・顧客タブ復活なし
- node --check（2001/2012ブロック）PASS・<script>5/5・月/週/renderDay/CRM 無傷

## packet 2014 — 📅 担当者別 日間タイムライン + ルーティンD&D割当（実装） / 2026-06-02
### Added（日表示のみ・renderDay 非破壊ラップ）
- 担当者別 横タイムライン（左=担当者名/件数 sticky・上=時間目盛8〜18・行=予定/タスクを時間配置・自動レーン分け）
- 時間未設定タスク列・完了薄表示・担当者フィルター連動・未担当行（表示専用）・合計件数・色分け凡例
- 「🕓 時間軸表示に切替」で既存縦グリッドへ復帰（既存表示は破棄せず display 切替）
- 本日のルーティンをD&Dで担当者の時間帯へ割当（PC）＋スマホ用「割当」ボタンfallback（担当者/時刻ピッカー）
- `createTaskFromRoutine`：state.tasks へ追加→既存`_persistTasks`保存→再描画→トースト。重複防止・ルーティン本体は不変
- 公開関数: appendStaffTimelineToDayCalendar / renderStaffTimelineDay / createTaskFromRoutine / getStaffFromDropTarget / getTimeFromDropPosition
- `docs/CALENDAR_DAY_STAFF_TIMELINE_ROUTINE_DND_PACKET_2014.md`
### 非破壊・遵守
- 月/週（renderMonth/renderWeek）・予定追加/タスク追加/ルーティン完了 未改変。新規localStorageキーなし・本文保存なし
- Supabase/SQL/RLS/Auth/外部API/Sheets/AI/CloudRun 不使用・顧客タブ復活なし
- node --check PASS（単体＋埋込）、<script>5/5、CRM非表示マーカー無傷、禁止APIトークン0件

## packet 2013 — 📡 アカデミー公開反映記録（記録のみ・実装なし） / 2026-06-02
### Record
- `git push origin main`（通常push・force無し）で `2edc444..7b3f19d` を反映（13コミット：packet 2001〜2012）
- push後 origin/main と完全同期（HEAD 7b3f19d）・`.claude` 未追跡維持
- 公開URL: https://housedotoujinishi-lang.github.io/house-tate/ （GitHub Pages・ライブ確認・404なし）
- `docs/HOUSE_TATE_SOURCE_ACADEMY_PUBLIC_PUSH_RECORD_PACKET_2013.md` に検証チェックリスト（13項目）を記録
  - ログイン/ホーム/顧客タブ非復活=✅、ロープレ/アカデミー/今日の3本/3択/スコア/結果/杤岡レビュー/スマホ=🟡(コード確認済・実機クリック確認推奨)
- 新規実装なし・コード変更なし。本記録はcommitまでで以降push停止

## packet 2012 — 🎓 生成型ロープレエンジンMVP（実装） / 2026-06-02
### Added
- `index.html` 末尾に packet 2012 を非破壊追記（既存 packet 2001 無改変・顧客タブ無改変）
- 新タブ「🎓 アカデミー」＋新ページ `#page-academy`（switchPage/showMainApp はラップのみ）
- 生成型ロープレ：売却10テンプレ・購入10テンプレ × 変数（性格/温度感/競合/家族/予算/相続人数/期限）
- `generateScenario(tpl,seed,diffIdx)`（packet 2001と同形式を出力・選択肢シャッフル）／`window.generateScenario` 公開
- 難易度6段（新人〜地獄級・★動的算出）、今日の3本（売却1/購入1/実務クイズ1・当日seedで固定）
- 採点（隠し回収/地雷回避/クロージング/着地判定）＋👑杤岡AI店長レビュー（定型・AI不使用）＋🏆ランキング（デモ）＋実務クイズ12問プール
- `docs/ACADEMY_2012_GENERATIVE_ENGINE_IMPL.md`
### 非破壊・遵守
- 状態は in-memory のみ（localStorage/sessionStorage不使用）・外部API/Supabase/Sheets/AI/fetch/XHR不使用
- `node --check` PASS（単体＋埋込抽出）、`<script>`タグ4/4一致、CRM非表示マーカー無傷

## packet 2011 — 🎭 営業トレーニング 生成型シナリオ設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2011_GENERATIVE_ROLEPLAY_DESIGN.md`：テンプレ×変数×難易度×本音×地雷で実質1000+パターンを生成する設計
- 売却50テンプレ（15カテゴリ）・購入50テンプレ（18カテゴリ）一覧、共通/売却/購入の変数設計、動的難易度
- 日次(3本)/週次(金)/月次/店長試験 の運用、売却8軸・購入8軸・共通5軸の採点設計
- packet 2001 への非破壊接続方法（generateScenario→同形式で描画/採点を流用）、将来実装案・優先順位・リスク・次packet候補
- Lv4 100点化ループ（初期案→自己採点→改善→最終採用→教育/売上/運用/実装順）
- 実装なし・index.html非編集・外部接続なし

## packet 2010 — 🎯 ロードマップ作成（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2010_ROADMAP.md`：Phase1-4 の実装順・優先順位・工数・教育効果・売上効果
- Phase1(実技+ハブ)→2(知識×連動+学習ループ)→3(店長+軽量ランキング)→4(昇格+AI)、各Phaseに中間指標と成約KPIを接続
- ゲート制の効果測定・リスク回避・Lv4プロセス。実装なし・外部接続なし

## packet 2009 — 🤖 AI会議レビュー（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2009_AI_COUNCIL_REVIEW.md`：2003-2008を信長/家康/秀吉/ドラッカー/デミング/エジソンの観点で擬似議論
- 反対意見・改善案・ROI・売上効果・教育効果を統合、最終推奨（売上直結セット優先・学習指標は成約KPIへ接続・昇格は後段・静的MVPで反復）
- AI接続なしの机上シミュレーション・実装なし

## packet 2008 — 🎖 昇格試験設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2008_PROMOTION_EXAM.md`：一般→主任→店長→管理者→ボス候補 の等級別要件（宅建×営業×実務×行動）
- 達成度チェックリスト＋"推薦可"フラグ（最終判断は人／Auth・RLS不変）、各機能連動、Lv4プロセス
- 実装なし・権限/DB/外部接続変更なし

## packet 2007 — 🏆 ランキング設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2007_RANKING.md`：社員/店舗/連続学習/連続正解/媒介取得力/買付取得力/伸び率 ランキング、XP・バッジ・シーズン制
- 健全性ガード（質重み付け・新人配慮・晒し上げ回避）、Lv4プロセス＋効果/負担/優先順位
- 実装なし・DB/外部接続なし

## packet 2006 — 👑 店長モード設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2006_MANAGER_MODE.md`：杤岡店長向け 社員別 得意/苦手・営業/宅建/実務 分析、週次/月次レビュー、指導コメント、AI店長(将来)
- Lv4プロセス（初期案→自己採点→改善→最終採用→次改善）＋教育効果/売上貢献/運用負担/実装優先順位
- 指導コメントは第1弾＝定型テンプレ方式（AI不要）。実装なし・外部接続なし

## packet 2005 — 🏠 実務クイズ設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2005_PRACTICE_QUIZ.md`：ハウステイト専用実務クイズ 15テーマ・100問構想
- カテゴリ設計・難易度設計(★1-3)・配分・問題フォーマット・ロープレ連動キー
- 案A/B/C 比較、最終推奨＝案B（100問・媒介/契約実務厚め・全問にロープレ連動）
- 全問オリジナル作問方針（過去問本文転載なし）・実装なし

## packet 2004 — 📚 宅建大学ブラッシュアップ設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2004_TAKKEN_BRUSHUP.md`：苦手分析/間違いノート/模試/分野別/年度別/AI解説/店長レビュー/昇格連動を追加設計
- 案A/B/C 比較、最終推奨＝案B（苦手分析×間違いノートの学習ループを核）
- 実装なし・過去問本文転載なし・外部接続なし

## packet 2003 — 🎓 ハウステイトアカデミー統合設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/ACADEMY_2003_INTEGRATION_DESIGN.md`：営業トレーニング/宅建大学/実務クイズ/店長レビュー/昇格試験/ランキングの統合設計
- 統合案A/B/C/D を 教育効果・開発コスト・運用コスト・継続率・売上貢献 で採点（A16/B19/C18/D18）
- Lv4自己採点ループ記録、最終推奨＝段階統合（A+B→C→D）
- 実装なし・コード変更なし・DB/外部接続なし

## packet 2002 — 📚 宅建大学 設計分析パケット（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/TAKKEN_UNIVERSITY_DESIGN_PACKET_20260602.md` を起票
  - 著作権・出典整理／公開過去問の利用可否／データ管理方式（手入力・CSV・JSON・Sheets比較）
  - 分野別構成（権利関係/宅建業法/法令上の制限/税その他/免除科目）
  - 出題形式（10問チャレンジ/分野別/年度別/模試50/間違い直し）
  - 店長モード（正答率/苦手分野/学習時間/今週の課題）
  - 営業トレーニング連動（相続→相続登記、媒介→専任/専属専任、購入→重説/ローン特約）
  - ハウステイト実務クイズ（レインズ/専任/専属専任/インスペクション/相続登記/空き家特例/再建築不可/市街化調整区域/連棟/住宅ローン特約）
  - MVP案A/B/C と 推奨案（案B：分野別100問・オリジナル作問）・実装順
- **実装なし／コード変更なし／DB・外部接続なし**（設計docsのみ）

## packet 2001 — 🎭 営業トレーニング（ロープレ）標準版MVP / 2026-06-02
### Added
- 新タブ「🎭 ロープレ」をPCトップナビ・モバイル下部ナビに追加
- 新規ページ `#page-roleplay`（既存 `switchPage` のルーティングに非破壊で追加）
- 購入ロープレ 6シナリオ（スプレッドシート「ロープレ」購入データ由来）
- 売却ロープレ 5シナリオ（実データ無し→ハウステイト実務に即して新規設計：相続/離婚/空き家/住み替え/査定だけ・他社競合）
- 3択×5〜6問、顧客反応・スコア変動・隠し情報開示・地雷判定・最終結果・フィードバック画面
- 売却ゴール判定（専任媒介取得／訪問査定アポ取得／再追客／店長同行・相談／失注）
- 売却スキル別評価（売却理由深掘り／所有者・相続人確認／売却期限確認／価格期待値調整・競合／訪問査定・媒介取得力）
- 店長フィードバック（店長コメント）表示
- 店長モード（社員別スコア）静的MVP・社員別スコア静的MVP（デモ集計）
- ドキュメント: `docs/SALES_TRAINING_packet2001.md`
- 設計案起票: `docs/TAKKEN_UNIVERSITY_proposal.md`（📚宅建大学・次期候補）

### 実装方針 / 非破壊
- 既存コードは変更せず `index.html` 末尾（最後の `</body>` 直前）へ1つの `<script>` を追記
- `switchPage` / `showMainApp` はラップのみ（上書き破壊なし）
- 状態はメモリ内のみ（リロードで消える）

### 禁止事項の遵守（違反0件）
- Supabase / SQL / RLS / Auth 変更なし
- 外部API / Google Sheets / OpenAI / Claude 接続なし
- localStorage・sessionStorage への本文・個人情報保存なし
- 顧客タブ（CRM, packet 322 非表示）復活なし（無傷を確認）
- 既存機能の破壊なし／ force push・reset・clean・rebase 未実施／ `.claude` 追跡なし

### 検証
- `node --check`（packet単体＋index.html埋め込み抽出）PASS
- `<script>`/`</script>` タグ数一致・禁止APIトークンgrep 0件
