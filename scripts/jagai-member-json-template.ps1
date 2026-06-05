<#
  jagai-member-json-template.ps1  (packet 2044)
  ------------------------------------------------------------------
  目的:
    じゃがいOS画面「Claude連携用メンバーJSON」カードでコピーしたJSONを、
    安全にローカルファイル化するための read-only テンプレート/検証ヘルパー。

  安全方針 (重要):
    - 外部送信なし。Invoke-WebRequest / Invoke-RestMethod / fetch 等のネットワーク呼び出しは一切しない。
    - 外部API・Claude Desktop・MCP本番接続はしない。
    - 出力は runtime/ 配下のみ（.gitignore 対象＝git管理しない）。
    - 本物のメンバーJSONは git にコミットしない。サンプルはダミー値のみ。
    - localStorage/sessionStorage は使わない（ブラウザ外スクリプト）。
    - 機密漏洩ガード: pass/password/token/secret(値)/email/顧客情報 等が含まれていたら書き出しを中止。

  使い方:
    1) じゃがいOS画面でJSONを生成→コピー
    2) コピー内容を runtime/claude-member-json/incoming.json に貼り付け保存
    3) このスクリプトを実行:  powershell -ExecutionPolicy Bypass -File scripts/jagai-member-json-template.ps1
       - 検証OKなら runtime/claude-member-json/members.snapshot.json へ整形保存
    -Sample を付けるとダミーJSONを runtime に生成（接続前の動作確認用・本物データではない）

  パラメータ:
    -In   入力JSONファイル (既定: runtime/claude-member-json/incoming.json)
    -Out  出力JSONファイル (既定: runtime/claude-member-json/members.snapshot.json)
    -Sample  入力の代わりにダミーJSONを生成して検証→出力
#>
[CmdletBinding()]
param(
  [string]$In  = "runtime/claude-member-json/incoming.json",
  [string]$Out = "runtime/claude-member-json/members.snapshot.json",
  [switch]$Sample
)

$ErrorActionPreference = "Stop"

# 出力先 runtime ディレクトリを用意（.gitignore 対象）
$outDir = Split-Path -Parent $Out
if ($outDir -and -not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

# 許可項目（ホワイトリスト）
$Allowed = @('uid','name','displayName','role','perm','secretaryAiName','isActive','sortOrder','notesForAi')
# 出力してはいけないキー（部分一致で検知）。secretary は「秘書」由来のため除外語に含めない。
$ForbiddenKeyPatterns = @('pass','password','token','secret','apikey','api_key','accesstoken','refreshtoken','email','mail','phone','tel','address','顧客','customer','supabasekey','service_role','uuid')

function Get-MemberJsonText {
  if ($Sample) {
    # ダミー値のみ（本物データではない）。接続前の動作確認用サンプル。
    return @'
{
  "schemaVersion": "member-sync/1.0",
  "source": "jagai-os",
  "origin": "accounts",
  "readOnly": true,
  "externalSend": false,
  "includesInactive": false,
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "count": 2,
  "members": [
    { "uid": "dummy01", "name": "サンプル太郎", "displayName": "サンプル太郎", "role": "エージェント", "perm": "staff", "secretaryAiName": "ダミー秘書A", "isActive": true, "sortOrder": 0, "notesForAi": null },
    { "uid": "dummy02", "name": "サンプル花子", "displayName": "サンプル花子", "role": "店長", "perm": "admin", "secretaryAiName": "未定", "isActive": true, "sortOrder": 1, "notesForAi": null }
  ]
}
'@
  }
  if (-not (Test-Path $In)) {
    throw "入力ファイルが見つかりません: $In `n  → じゃがいOS画面でコピーしたJSONを $In に保存するか、-Sample を指定してください。"
  }
  return (Get-Content -Raw -Encoding UTF8 $In)
}

# 1) 取得
$raw = Get-MemberJsonText

# 2) JSON として妥当か
try { $obj = $raw | ConvertFrom-Json -ErrorAction Stop }
catch { throw "JSON 解析に失敗しました: $($_.Exception.Message)" }

# 3) 機密漏洩ガード（メンバー各要素のキー名を検査）
$leaks = New-Object System.Collections.Generic.List[string]
if ($obj.members) {
  foreach ($m in $obj.members) {
    foreach ($p in $m.PSObject.Properties) {
      $kn = $p.Name
      if ($Allowed -notcontains $kn) {
        $lower = $kn.ToLower()
        foreach ($pat in $ForbiddenKeyPatterns) {
          if ($lower -like "*$pat*") { $leaks.Add("members[].$kn (禁止パターン: $pat)"); break }
        }
        # 許可外だが禁止語にも一致しない未知キーも警告として記録（安全側）
        if ($lower -notmatch ($ForbiddenKeyPatterns -join '|')) { $leaks.Add("members[].$kn (許可外キー)") }
      }
    }
  }
}
if ($leaks.Count -gt 0) {
  Write-Host "❌ 機密/許可外フィールドを検出したため書き出しを中止します:" -ForegroundColor Red
  $leaks | Sort-Object -Unique | ForEach-Object { Write-Host "   - $_" }
  Write-Host "   じゃがいOS側の生成JSONはホワイトリスト済みです。許可9項目のみのJSONを入力してください。"
  exit 2
}

# 4) 整形して runtime/ に出力（git管理外）。外部送信は一切しない。
# UTF-8 BOM無しで書き出す（BOMがあると Node の JSON.parse が先頭でエラーになるため）
# .NET の WriteAllText は相対パスをプロセスCWD基準で解決するため絶対パス化する
$normalized = $obj | ConvertTo-Json -Depth 12
$OutAbs = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path (Get-Location).Path $Out }
[System.IO.File]::WriteAllText($OutAbs, $normalized, (New-Object System.Text.UTF8Encoding($false)))

$count = if ($obj.count) { $obj.count } elseif ($obj.members) { $obj.members.Count } else { 0 }
Write-Host "✅ ローカル保存しました (git管理外 / 外部送信なし)" -ForegroundColor Green
Write-Host "   出力 : $Out"
Write-Host "   件数 : $count (active のみ想定)"
Write-Host "   注意 : このファイルは runtime/ 配下＝.gitignore 対象です。git にコミットしないでください。"
