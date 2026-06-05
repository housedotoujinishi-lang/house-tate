# CHANGELOG — ハウステイト じゃがいAI会社OS

## packet 2046 — 📋 Claude Desktop 接続前チェックリスト（docs-only） / 2026-06-05
### Added（接続前の確認項目を文書化・接続/設定変更なし）
- `docs/CLAUDE_DESKTOP_CONNECT_PRECHECK_PACKET_2046.md` 新規。実接続前にボスが確認すべき項目をチェックリスト化
- 内容：じゃがいOS側JSON確認／機密(pass/email/token/secret/顧客/Supabaseキー/UUID)が無いことの確認／ローカル保存場所と.gitignore確認／本物JSONをgitに載せない／MCP設定にAPIキーを書かない・書き込みツールを作らない／実接続時のボス承認項目／**赤信号一覧**／ロールバック方針（revert中心・force push/reset不使用）／PoCに進むゲート条件
### 維持・遵守（禁止事項クリア）
- Claude Desktop接続なし・MCP本番接続なし・外部API接続なし・Supabase/SQL/RLS/Auth変更なし・Cloud Run deployなし・index.html無改変
- admin「管理者」維持・冨永「未定」維持・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebaseなし・**通常commit/push**

## packet 2045 — 🎨 Claude連携JSON UI改善（小粒・低リスク） / 2026-06-05
### Changed（カードHTMLの表示・文言のみ／ロジック不変）
- 強調バッジ追加：🔒「このJSONは外部送信されません」・🔌「まだ Claude Desktop とは接続していません」
- 「使い方 3ステップ」追加：1.生成/再生成 → 2.コピー → 3.ローカルファイルに貼付（runtime=git管理外）
- 除外表示を明確化：「出さないもの：pass/password/token/secret/email/顧客情報」を赤系強調・状態行に補足追記
- `docs/CLAUDE_MEMBER_JSON_UI_IMPROVE_PACKET_2045.md` 新規
### 維持・遵守（禁止事項クリア）
- 実JSON自動保存なし・ダウンロード保存実装なし・外部送信なし・fetch追加なし・Claude Desktop設定変更なし・MCP本番接続なし
- `buildClaudeMemberSnapshot`等ロジック不変・出力JSON項目不変・冨永「未定」維持・admin「管理者」維持
- `<script>`11/11・packet2041ブロック`node --check`PASS・fetch24→24・setItem62→62（新規なし）・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebaseなし・**通常commit/push**

## packet 2044 — 📁 Claude連携用メンバーJSON ローカルファイル化テンプレート（runtime/local-only） / 2026-06-05
### Added（ローカル専用・外部送信なし・本物JSONはgit管理外）
- `.gitignore` 新規：`runtime/` / `*.local.json` / `members.snapshot.json` / `incoming.json` / `.claude/` を除外（本物メンバーJSONを git に載せない）
- `scripts/jagai-member-json-template.ps1`：コピーしたメンバーJSONをローカル検証＋整形保存するヘルパー。**外部送信なし**（Invoke-WebRequest/RestMethod 不使用）・出力は `runtime/` のみ
  - 機密漏洩ガード：pass/password/token/secret/email/顧客情報/uuid 等を検出したら**書き出し中止（exit 2）**。許可は9項目ホワイトリスト。`secretary`は「秘書」由来で誤検知回避（除外語に含めない）
  - `-Sample`：ダミーJSON生成（接続前確認用・本物データではない）
- `scripts/sample.member-json.dummy.json`：ダミー値のみの参照用サンプル（git管理OK）
- `docs/CLAUDE_MEMBER_JSON_LOCAL_FILE_TEMPLATE_PACKET_2044.md` 新規（手順・パラメータ・確認結果）
### Verified（本packet実施）
- `Parser::ParseFile` 構文チェック PARSE_OK（UTF-8 BOM保存）／`-Sample` 実行 exit0・runtime出力／漏洩JSON入力は検出して exit2・出力未生成／`git check-ignore` で runtime JSON は ignore 済み
### 維持・遵守（禁止事項クリア）
- Claude Desktop接続なし・MCP本番接続なし・外部API接続なし・Cloud Run deployなし・Supabase/SQL/RLS/Auth変更なし・書き込みAPIなし
- **本物メンバーJSONのgitコミットなし**（runtime/＝gitignore）・localStorage/sessionStorage保存なし・ダミーのみコミット・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebaseなし・**通常commit/push**

## packet 2043 — 🧩 Claude Desktop ローカル read-only MCP PoC 設計（docs-only） / 2026-06-05
### Added（設計docsのみ・接続/実装なし）
- `docs/CLAUDE_DESKTOP_LOCAL_READONLY_MCP_DESIGN_PACKET_2043.md` 新規。Claude Desktop が将来じゃがいOSのメンバーJSONを read-only 参照するためのローカルMCP構想
- データフロー：accounts(正本) → buildClaudeMemberSnapshot(packet2041) → ローカルJSON → ローカルread-only MCP → Claude Desktop（参照のみ・書き戻しなし）
- 方式A（手動コピー→ローカルファイル／推奨起点）／方式B（ローカルMCPがJSONをread-only読込／PoC本命）／方式C（将来Cloud Run/API化・今回未実装）
- read-only MCPツール案：get_members / get_member_by_uid / get_member_by_name / get_roles / get_org_summary（**書き込み系は未定義 writeTools:[]**）
- セキュリティ境界：read-only・pass/token/secret/email/顧客情報非返却・disabled除外・admin「管理者」維持・冨永「未定」維持・外部送信なし・MCP設定にAPIキーを書かない・本物JSONはgit管理しない
### 維持・遵守（禁止事項クリア）
- MCP本番接続なし・Claude Desktop設定変更なし・外部API接続なし・Cloud Run deployなし・Supabase/SQL/RLS/Auth変更なし・書き込みAPIなし
- index.html無改変・本物メンバーJSONのgitコミットなし・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebaseなし・**通常commit/push**

## packet 2042 — ✅ Claude連携用メンバーJSON 実機確認記録＋表示改善 / 2026-06-05
### Verified（公開URL反映確認＋デプロイ済みロジックの決定論的検証）
- 公開URL `https://housedotoujinishi-lang.github.io/house-tate/` に packet2041 カード反映済みを確認（マーカー `ai-org-member-json`/`buildClaudeMemberSnapshot`/`Claude連携用メンバーJSON` 一致・コミット`fea8fa9`相当）
- デプロイ済み実関数（`buildClaudeMemberSnapshot`/`_isDisabledAccount`/`_sortByAccountOrder`/`getPersonalSecretaryMapping`）を抽出しNodeで実行＝決定論的検証
- **漏洩テスト（adversarial）**：seedに`pass`/`email`/`token=tok_LEAKCHECK`/`apiKey=sk-LEAKCHECK`を混入 → 生成JSONに**一切出力されず**（許可外キーNONE・禁止文字列NONE）
- **冨永 `secretaryAiName:"未定"` 維持** ✓／`role:'削除済み'`(disabled)**除外** ✓（input8→active7）／`readOnly:true`・`externalSend:false`／admin(perm=owner)は連携側で「管理者」表記・notesに維持明記
- `docs/CLAUDE_DESKTOP_MEMBER_JSON_VERIFY_PACKET_2042.md` に結果記録
### Changed（軽微UI改善・表示整形のみ）
- 最終生成時刻 `#cmj-time` を日本語ローカル時刻（`toLocaleString('ja-JP')`）表示に変更・`title`にISO保持。`_cmjRegenerate`内1行のみ。**JSON本文の`exportedAt`はISO8601のまま不変**
### 維持・遵守（禁止事項クリア）
- Claude Desktop接続なし・MCP本番接続なし・外部API接続なし・Cloud Run deployなし・Supabase/SQL/RLS/Auth変更なし・書き込みAPIなし
- fetch/XHR **24→24（新規なし）**・localStorage setItem **62→62（新規なし／既存キー読み取りのみ）**・`<script>`11/11・packet2041ブロック`node --check`PASS・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebaseなし
- **commitまで→通常push（Lv5包括承認範囲）。**

## packet 2041 — 🔗 Claude連携用メンバーJSONスナップショットMVP（read-only / 外部送信なし） / 2026-06-05
### Added（AI組織図ページ・秘書マッピング直下に静的MVPカード追加）
- AI組織図ページ（`#page-ai-org`）の担当秘書AIマッピング表（packet319）直下に「🔗 **Claude連携用メンバーJSON**（read-only スナップショット）」カードを追加。HTMLコンテナ`#ai-org-member-json`＋既存`renderAIOrgSecretaryMap`をIIFEラップして`renderClaudeMemberJsonCard`を追加描画（packet319と同方式・既存非破壊）
- 機能：JSON表示欄(textarea readonly)／「🔄生成/再生成」／「📋コピー」／件数表示／最終生成時刻(ISO8601)
- `buildClaudeMemberSnapshot()`＝**正本 accounts** から安全項目のみ抽出した **read-only snapshot** を生成（保存しない）
- 出力項目：uid / name / displayName / role / perm / secretaryAiName / isActive / sortOrder / notesForAi（ホワイトリスト方式）
- 表示順＝既存`jagai_account_order_v1`（uid配列）順を`_sortByAccountOrder`で参照（**読み取りのみ**・新規保存なし）。秘書AI名＝既存`getPersonalSecretaryMapping()`参照（取れなければ「未定」）
- コピー＝`navigator.clipboard.writeText`優先・失敗時`textarea選択+execCommand('copy')`フォールバック（いずれもローカル処理）
- `docs/CLAUDE_DESKTOP_MEMBER_JSON_SNAPSHOT_PACKET_2041.md` 新規
### 除外・セキュリティ（絶対に出さない）
- pass / password / token / secret(値) / email / Supabaseキー / APIキー / access・refresh token / 顧客情報 / 不要なUUID は出力しない（accountsに存在してもsnapshotに載せない）
- disabled / 削除済みは通常除外（`_isDisabledAccount`＝perm==='disabled' OR role==='削除済み'／active のみ・isActive常にtrue）
- **admin表記は「管理者」維持**・**冨永の秘書AI名は「未定」維持**
- 注：`secretaryAiName`は「秘書AI名」由来でAPI secret/tokenではない（機密スキャン誤検知。実機密値の出力なしを確認済）
### 維持・遵守（禁止事項クリア）
- **Supabase/SQL/RLS/Auth 変更なし**・**外部API接続なし**・**Claude Desktop接続なし**・**MCP本番接続なし**・Cloud Run deploy なし・書き込みAPIなし
- **fetch/XMLHttpRequest 新規追加なし**・**localStorage/sessionStorage 本文保存なし**（既存キー読み取りのみ）・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebase なし
- 構文：`<script>`11/11一致・追加ブロック`node --check`PASS・全インラインJS結合`node --check`PASS
- **commitまで→通常push（packet2040と異なりboss事前承認のLv5包括承認範囲）。**

## packet 2040 — 🔗 Claude Desktop ⇄ じゃがいOS メンバー同期 設計（docs-only / read-only MVP） / 2026-06-05
### Added（設計ドキュメントのみ・コード/接続/デプロイ無改変）
- `docs/CLAUDE_DESKTOP_MEMBER_SYNC_DESIGN_PACKET_2040.md` 新規。Claude Desktop から社内メンバー情報を**参照（read-only）**するための実装前提設計。じゃがいOS=正本／Claude=参照先・**一方向同期**
### 調査（正本候補の特定・実コード行番号付き）
- 正本＝`accounts`配列（index.html:3484付近 → Supabase `accounts`）。安全カラム`_DB_ACCOUNT_COLUMNS_SAFE=['uid','pass','name','role','perm']`（3197付近）／シード`_bulkAccounts`（4932付近：芳村・杤岡・安見・佐野・冨永・伴）
- `members`は派生軽量ビュー（3602付近）・`profiles`はAuth紐づき別テーブル（3649付近）・メンバー正本は`state`に無し（stateは予定/タスク）
- 表示順の正本＝localStorage `jagai_account_order_v1`（4729付近・uid配列のみ）
- disabled/削除判定＝`_isDisabledAccount`（perm==='disabled' OR role==='削除済み'／4711付近）
- 役職：査定担当/店長/エージェント/サポート・権限：admin/owner/staff・**admin表記＝「管理者」維持**（3757・3982付近）・秘書AIマッピング（packet319/9928付近）
### 設計内容
- Claude参照用メンバーJSON（uid/name/displayName/role/perm/department/mainDuties/secretaryAiName/isActive/sortOrder/notesForAi）を**出自（正本/派生/手動メタ）付き**で定義＋サンプル＋JSON Schema
- read-only MCP/API ツール5種設計：`get_members`/`get_member_by_uid`/`get_member_by_name`/`get_roles`/`get_org_summary`（write系は意図的に未定義`writeTools:[]`）
- トランスポートMVP＝静的スナップショットJSON方式（本番API/Supabase直結/Cloud Runを使わない）
- セキュリティ方針10項目：read-only／pass・token・secret・UUID・メール非出力（ホワイトリスト方式）／disabled・顧客情報除外／Claudeから役職・権限・削除不可／**冨永の秘書AI名は「未定」維持**／admin表記＝管理者維持
### 維持・遵守（禁止事項クリア）
- SQL/Supabase/RLS/Auth 変更なし・外部API接続なし・Cloud Run deploy なし・OpenAI/Claude API本番接続なし・書き込みAPI実装なし
- パスワード/token/secret 出力なし・顧客タブ復活なし・`.claude add`なし・force push/reset/clean/rebase なし
- index.html 無改変（docs追加とCHANGELOG追記のみ）・**commitまで。push停止（ボス承認後）。**

## packet 2039 — 🗓 タイムライン UX改善 4時間ビュー＋15分グリッド＋現在時刻自動スクロール / 2026-06-04
### Changed（buildTimeline共有＝日表示＋タスクボード両方・Googleカレンダー寄り）
- 幅拡大：`HOURW=180→260`（buildTimeline/board/packet2031/drag/autoscroll 全整合）。全幅16h×260=4160px＝初期約4時間表示＋既存`.stl-scroll`で横スクロール
- 15分ラベル：時間軸ラベルを15分刻み化（毎時=太字#475569/30分=中#94a3b8/15・45分=薄小#cbd5e1）。15分グリッド線はpacket2038実装済、HOURW=260で15分=65px＝視認性UP
- ブロック拡大：`BLOCKH=48→52`・時刻9→10px・タイトル11→12px・予定名2行(line-clamp:2)維持・MINW96→110
### Added
- 現在時刻 自動スクロール（新規IIFE`__ht_tl_autoscroll`）：初期表示で現在の45分前を左端付近へ（当日のみ/当日以外8:00）。スクロール位置はre-render間で保持＝ドラッグ/編集で先頭へ飛ばない・日付変更時のみnow基準へ再設定。renderTaskBoard/renderDay/renderCalを外側ラップ（既存非破壊）
- `docs/TASKBOARD_TIMELINE_4H_VIEW_15MIN_AUTOSCROLL_PACKET_2039.md`
### 維持・遵守
- ✓完了/予定編集/タスク編集/ドラッグ移動/上下担当者変更/横時間変更/リサイズ/タスク保存/予定保存・Sticky(担当者列/時間ヘッダ)・月/週・既存追加/ルーティンD&D 無改変（HOURW定数追従のみ）
- 15分スナップ/グリッド/リサイズはpacket2038実装済。状態 in-memory＋既存persist・新規外部接続なし
- node --check（buildTimeline/board/packet2031/drag/autoscroll）全PASS・`<script>`11/11・HOURW=180残存0・禁止API0件・顧客タブ復活なし
- 補足：タスク保存エラー(packet2038調査・H1/H2)は本packet対象外（表示UXのみ）
- **commitまで。push停止（ボス承認後）。**

## packet 2038 — 🛠 ドラッグ移動が元に戻る問題 hotfix ＋ 15分刻み化 / 2026-06-04
### Fixed（ドロップ後に元の場所へ戻る／✓完了も同根で未更新）
- 根本原因：`findEvByBlk`/`findTaskByBlk`（packet2034/2037）・packet2035✓の`findTask`が`!window.state`ガードを使用。`state`は`const`（index.html:3632）でwindow未bind→`window.state`常にundefined→`!window.state`常にtrue→ヘルパーが必ずnull返却→state更新コードに不到達→再描画で旧位置へ巻き戻り（**packet452が文書化済の既知バグと同型**。packet2031リサイズ/編集はbareword stateのため動作していた）
- 修正：`!window.state`→`typeof state==='undefined'||!state`に置換（3箇所）。ドロップ確定でstate.events/state.tasksを実体更新→移動先に残る。✓完了も復活
### Changed（15分刻み化・30分固定は戻さない）
- ドラッグ移動：`snap30`→`snap15`（/15*15）・最小所要15分
- 右端リサイズ：packet2031 `MIN=15`・`snap15`を/15*15・最小幅`HOURW/4`（15分=45px）
- クリック編集モーダル：時刻option`m+=15`・下限`+15`
- 予定追加(setupEvForm/setupDayEvForm)・予定編集(showEvModal/buildTimeOptions)：`['00','15','30','45']`
- 15分補助線：グリッド3階調（毎時#dbe2ea/30分#eef2f7/15分#f7f9fc最薄）。30分ラベル維持
- トースト「〇〇 9:15へ移動しました」（15分表示）
- `docs/TASKBOARD_TIMELINE_DRAG_PERSIST_15MIN_HOTFIX_PACKET_2038.md`
### 維持・遵守
- 月/週/日間・既存予定追加/タスク追加・ルーティンD&D 無改変・タスク時間DBカラム追加なし（packet2033で保存対象済）
- node --check（drag/buildTimeline/✓/packet2031/showEvModal）全PASS・`<script>`10/10・`!window.state`残存0・snap30残存0・MIN=30残存0・禁止API0件・顧客タブ復活なし
- **commitまで。push停止（ボス承認後）。**

## packet 2037 — 🛠 担当者別タイムライン ドラッグ移動 hotfix / 2026-06-03
### Fixed（ドラッグ移動が効かない問題）
- 原因：packet2034の移動が`.stl-move`限定＋`setPointerCapture`＋常駐pointermove内の`pointerEvents`トグルで、一部ブラウザがポインターキャプチャを解放しmove/upが届かず移動不成立（右端リサイズは動的listener方式のため動作）
- 修正：ドラッグIIFEのpointerdown/move/upを**動作実績のあるリサイズ同方式**へ書換（確定ロジック/ヘルパーは流用）
  - トリガを`.stl-blk`**本体**へ拡張（`⠿`も本体扱いで動く）・`.stl-rsz`/`.stl-chk`は除外し各ハンドラへ委譲・`data-s`無しは対象外
  - `setPointerCapture`撤廃→pointerdownで`document`に`pointermove/up`を動的登録/解除・5px超でdrag判定・pointerdownでpreventDefaultしない＝クリックのみは編集モーダル温存
  - 横=開始時刻(snap30/8-24クランプ)・縦=`elementFromPoint`→`.stl-row[data-mi]`で担当者レーン変更
  - ドラッグ中UI：半透明＋縦ゴースト＋ドロップ先ハイライト＋トースト「〇〇 9:00へ移動しました」
  - クリック競合：実移動時`window.__htDragUntil`を立て、packet2031のクリック編集を直後400ms抑止
- 保存：予定=events sh/sm/eh/em＋配列移動→`_persistEvents`／タスク=tasks sh/sm(＋dur)＋toIdx→`_persistTasks`（taskはpacket2033でDB永続化済）
- `docs/TASKBOARD_TIMELINE_BLOCK_DRAG_MOVE_HOTFIX_PACKET_2037.md`
### 維持・遵守
- 右端リサイズ/完了チェック/クリック編集/月/週/日間カレンダー/既存予定追加/タスク追加/ルーティンD&D 無改変
- node --check（ドラッグ/メイン）PASS・`<script>`10/10・setPointerCapture実呼び出し残存0・禁止APIトークン0件・顧客タブ復活なし
- **commitまで。push停止（ボス承認後）。**

## packet 2036 — 🚀 タスクボード司令塔化フェーズ2 公開反映記録（docsのみ） / 2026-06-03
### Added (docs only)
- `docs/TASKBOARD_COMMAND_CENTER_PHASE2_PUBLIC_PUSH_RECORD_PACKET_2036.md`：packet2034+2035の本番反映記録
  - push記録：`aa13a3d..522eb32 main -> main`・HEAD==origin/main==`522eb32`完全同期・`.claude`未追跡
  - 公開URL配信HTML grep：HTTP200・`HOURW=180`×4・`class="stl-chk"`・✓ハンドラ・packet2034marker・30分グリッド検出・`HOURW=120`残存0＝コードレベル反映確認 ✅
  - ブラウザ手動確認チェックリスト（🟡）／CDN max-age=600 注記
- **index.html編集なし・アプリ実装なし**（docs記録のみ）

## packet 2035 — ✅ 完了チェック＋30分統一＋横幅180px＋時間軸改善 / 2026-06-03
### Added（buildTimeline共有＝日表示＋タスクボード両方）
- 完了チェック：タスク種別ブロックのみ右上に `.stl-chk`（✓）。押下で `t.done` トグル→`_persistTasks`→再描画→トースト。完了は薄く（opacity.5）＋✓緑、取り消しも可。予定ブロックには非表示。クリック編集除外に `.stl-chk` 追加
- 時間軸：30分位置を表示（毎時=濃い太字＋30分=薄い小）・グリッドを30分刻み（毎時#dbe2ea/30分#f1f5f9）。sticky維持
### Changed
- 横幅拡張：`HOURW=120`→**`180`**（buildTimeline/board/packet2031/2034 全整合）・`MINW`80→96・ブロック余白`4px 13px 4px 18px`
- 30分統一（残存15分の総点検・全廃）：予定追加フォーム `setupEvForm`/`setupDayEvForm` を`['00','30']`化・packet2031リサイズ最小`HOURW/4`→`HOURW/2`・編集モーダル下限`+15`→`+30`
### 維持・遵守
- 月/週/日間カレンダー・既存予定追加/タスク追加・packet2031編集リサイズ・packet2034ドラッグ移動/現在時刻ライン・ルーティンD&D 無改変
- リロード後の完了状態維持（saveTasks/loadがdone送受信）・in-memory＋既存persist・新規外部接続なし・localStorage本文保存なし
- node --check（最終ブロック/buildTimeline含むメイン）PASS・`<script>`10/10・CRM無傷・禁止APIトークン0件
- ConnectionRefusedで中断→reset/clean/rebase不使用でworking tree保持→残2点(setupEvForm/✓ハンドラ)補完して完成。**commitまで。push禁止。**

## packet 2034 — 🎛 タスクボード司令塔化 ドラッグ移動＋30分刻み＋現在時刻ライン / 2026-06-02
### Added（buildTimeline共有＝日表示＋タスクボード両方）
- ドラッグ移動：ブロック左の `.stl-move`（⠿）を pointerドラッグ。**横=開始時刻（30分スナップ・8:00〜24:00クランプ）／縦=担当者レーン変更**（elementFromPoint→`.stl-row[data-mi]`）。予定=`state.events`(sh/sm/eh/em＋配列移動)→`_persistEvents`／タスク=`state.tasks`(sh/sm＋toIdx)→`_persistTasks`→再描画＋トースト
- 現在時刻ライン：`nowLineHtml()` で当日（isT(selDate)）に各トラックへ赤縦線（今日列強調）
- `docs/TASKBOARD_COMMAND_CENTER_DRAG_MOVE_PACKET_2034.md`
### Changed
- 刻みを15分→**30分**へ統一：packet2031 `MIN=30`・`snap15`丸めを`/30*30`・編集モーダル`<option>`を`m+=30`
- ブロックに移動グリップ追加（padding-left 6→16px）・packet2031クリック編集除外を `.stl-rsz,.stl-move` に拡張（グリップ操作で編集モーダルが開かない）
### 維持・遵守
- 8-24時/横スクロール/sticky/空き率/件数/ルーティンD&D/担当者フィルター維持・月/週/予定追加/タスク追加/packet2031編集リサイズ 無改変
- 状態は in-memory＋既存persist（新規外部接続なし）。node --check PASS・`<script>`9/9・CRM無傷・禁止APIトークン0件
- **commitまで。push禁止。**

## packet 2033 — 🗄 タスク時間 永続化 アプリ側実装 / 2026-06-02
### Fixed（タスク時間がリロードで消える問題）
- `saveTasks` 送信カラムに `sh/sm/dur` を追加（DBへ保存。packet2032のSQLでカラム追加済み前提）
- 起動時 `sbGet('tasks')` mapping に `sh/sm/dur` を追加（復元）。NULLは時間未設定で後方互換
- これにより：クリック編集（開始/終了）・右端リサイズ（dur）・ルーティンD&D割当 のタスク時間が **リロード後も維持**（packet2031/2027は無改変で自動永続化）
- `docs/TASKS_TIME_PERSIST_APP_IMPL_PACKET_2033.md`
### 遵守
- SQL実行なし・Supabase直接変更なし・RLS/Auth変更なし・新規外部接続なし（既存sbUpsert/sbGet）・顧客タブ復活なし・月週/既存追加/ルーティンD&D無改変
- node --check（メインスクリプト）PASS・<script>8/8・CRM無傷

## packet 2032 — 🗄 tasks時間カラム追加 手動SQL ＋ タスク時間永続化設計（docsのみ・未実装） / 2026-06-02
### Added (docs only)
- `docs/TASKS_TIME_COLUMNS_MANUAL_SQL_PACKET_2032.md`：tasksテーブルに sh/sm/dur を追加する手動SQL設計
  - 現状整理（saveTasks/loadに時間カラムが無く、タスク時間がリロードで消える）
  - 実行前確認SQL／ALTER TABLE（add column if not exists・冪等）／実行後確認SQL／ロールバックSQL（追加3列のみdrop）
  - アプリ側実装計画（saveTasks rows＋load mapping に sh/sm/dur 追加・後方互換）／リスク整理（PostgRESTキャッシュ・RLS無影響・データ無損失）
- **Claude側SQL実行なし・Supabase直接変更なし・index.html編集なし・アプリ実装なし**（docs設計のみ）

## packet 2031 — 🛠 タイムライン クリック編集 + 右端リサイズ15分（実装） / 2026-06-02
### Added（buildTimeline共有＝日表示＋タスクボード両方）
- 表示改善：ブロック高さ38→48・タイトル2行表示（line-clamp2/white-space:normal）・時刻範囲＋種別アイコン・内容が読める
- クリック編集：`.stl-blk`タップで自前15分編集モーダル（タイトル/担当者/日付/開始/終了/カテゴリ）。予定=state.events更新（担当者は配列移動）/タスク=state.tasks更新→ _persistEvents/_persistTasks→再描画
- 右端リサイズ：`.stl-rsz`ハンドルをpointerドラッグ→終了時刻を15分刻み変更（min15/max24:00）。予定eh/em・タスクdur更新→保存→再描画
- 競合防止：リサイズは5px超で判定・`.stl-rsz`はstopPropagation・直後350msはクリック抑止・クリックはcaptureで既存onclick抑止（二重モーダル防止）
- collectRowsにevent元index(eidx)付与・ブロックにdata属性(data-evmi/eidx/taskid/s/e)
- `docs/CALENDAR_TIMELINE_EDIT_RESIZE_15MIN_PACKET_2031.md`
### 維持・遵守
- 8-24時/横スクロール/sticky/空き率/件数/ルーティンD&D/担当者フィルター維持・月/週/予定追加/タスク追加 無改変
- node --check（packet2014/2031）PASS・<script>8/8・CRM無傷・禁止APIトークン0件
- Supabase/外部API/Sheets/CloudRun不使用・localStorage本文保存なし・顧客タブ復活なし

## packet 2030 — 📡 タイムライン8-24時・幅拡張 公開反映記録（記録のみ・実装なし） / 2026-06-02
### Record
- `git push origin main`（通常push・force無し）で `d553ea5..808d215`（packet2029 2コミット）を反映
- push後 origin/main と完全同期（HEAD 808d215）・`.claude` 未追跡維持
- 公開URL curl で `END_H=24, HOURW=120`/`AVAIL_END=18`/`staff-schedule-board` 反映を確認・Last-Modified本日
- `docs/CALENDAR_DAY_TIMELINE_8_TO_24_WIDTH_PUBLIC_PUSH_RECORD_PACKET_2030.md` に検証チェックリスト
- 新規実装なし・コード変更なし。本記録はcommitまで、以降push停止

## packet 2029 — 🕛 スケジュール時間軸 8-24時・幅拡大（実装） / 2026-06-02
### Changed（buildTimeline共有＝日表示＋タスクボード両方）
- 時間軸 8:00〜18:00 → **8:00〜24:00**（END_H 18→24・目盛17）。夜/残業/来客対応まで表示
- 横幅拡大（HOURW 64→**120**＝1時間120px・トラック1920px）→ PC/スマホ横スクロール前提。予定名フォント10→11・MINW 64→80
- 空き率は新定数 **AVAIL_END=18** で就業コア8-18基準を維持（夜の予定で薄まらない・時間軸非依存）
- packet2027ローカル定数（END_H/HOURW）も24/120に整合（D&D時刻計算・24:00割当・割当ピッカー）
- 既存タスク/予定/時間未設定/担当者行/フィルター/件数/採点/D&D は維持。`docs/CALENDAR_DAY_TIMELINE_8_TO_24_WIDTH_PACKET_2029.md`（事前調査結果含む）
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
