#!/usr/bin/env node
/*
 * jagai-members-mcp-server.mjs  (packet 2047)
 * -----------------------------------------------------------------------------
 * じゃがいOS Claude連携用メンバーJSON を read-only で参照する、ローカル MCP サーバー PoC。
 *
 * 安全方針 (重要):
 *   - 依存ゼロ実装（npm install 不要 = 外部ダウンロード/外部送信なし）。
 *   - トランスポートは stdio (JSON-RPC 2.0) のみ。ネットワーク (http/net/fetch) は一切使わない。
 *   - ローカルJSONファイルを「読むだけ」。書き込みツールは未定義 (read-only)。
 *   - 読むファイルは起動時に固定。ツール引数からのパス指定は受けない (path traversal 防止)。
 *   - 返却前に 9項目ホワイトリストで再フィルタ (多層防御)。pass/token/secret/email/顧客情報等は返さない。
 *   - disabled/削除済み (isActive=false) は既定で返さない。
 *   - admin表記は「管理者」、冨永の秘書AI名「未定」は元データのまま (本サーバーは値を改変しない)。
 *
 * 起動:
 *   node scripts/mcp/jagai-members-mcp-server.mjs [--file <path>]
 *   環境変数 JAGAI_MEMBER_JSON でもファイル指定可。
 *   既定: runtime/claude-member-json/members.snapshot.json
 *   見つからない場合は scripts/sample.member-json.dummy.json (ダミー) にフォールバック。
 *
 * 注意: 本PoCは Claude Desktop へは接続しない。接続はボス承認後の別packet。
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'jagai-members-readonly', version: '0.1.0-poc' };

// --- 出力してよい項目 (ホワイトリスト) ---
const ALLOWED = ['uid', 'name', 'displayName', 'role', 'perm', 'secretaryAiName', 'isActive', 'sortOrder', 'notesForAi'];

// --- 読み込みファイルの解決 (起動時に固定) ---
function resolveDataFile() {
  const argIdx = process.argv.indexOf('--file');
  if (argIdx !== -1 && process.argv[argIdx + 1]) return path.resolve(process.argv[argIdx + 1]);
  if (process.env.JAGAI_MEMBER_JSON) return path.resolve(process.env.JAGAI_MEMBER_JSON);
  const def = path.resolve('runtime/claude-member-json/members.snapshot.json');
  if (fs.existsSync(def)) return def;
  return path.resolve('scripts/sample.member-json.dummy.json'); // ダミーへフォールバック
}
const DATA_FILE = resolveDataFile();

function logErr(...a) { process.stderr.write('[jagai-mcp] ' + a.join(' ') + '\n'); }

// --- スナップショット読込 (呼び出しごとに再読込して最新反映。ローカル読取のみ) ---
function loadSnapshot() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const obj = JSON.parse(raw);
  if (!obj || !Array.isArray(obj.members)) throw new Error('members 配列が見つかりません: ' + DATA_FILE);
  return obj;
}

// --- メンバーを許可9項目だけに絞る (多層防御。機密キーは構造的に通さない) ---
function sanitizeMember(m) {
  const out = {};
  for (const k of ALLOWED) if (k in m) out[k] = m[k];
  return out;
}
function permLabel(perm) {
  if (perm === 'admin' || perm === 'owner') return '管理者';
  if (perm === 'staff') return 'スタッフ';
  return perm || '';
}

// --- read-only ツール実装 ---
function tool_get_members(args) {
  const snap = loadSnapshot();
  const includeInactive = !!(args && args.includeInactive);
  let list = snap.members.filter(m => includeInactive ? true : m.isActive !== false);
  list = list.map(sanitizeMember).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  return { count: list.length, includeInactive, members: list };
}
function tool_get_member_by_uid(args) {
  const uid = args && args.uid;
  if (!uid) return { error: 'uid is required' };
  const snap = loadSnapshot();
  const m = snap.members.find(x => x.uid === uid && x.isActive !== false);
  return { member: m ? sanitizeMember(m) : null };
}
function tool_get_member_by_name(args) {
  const name = args && args.name;
  if (!name) return { error: 'name is required' };
  const fuzzy = !!(args && args.fuzzy);
  const snap = loadSnapshot();
  const matches = snap.members
    .filter(m => m.isActive !== false)
    .filter(m => {
      const n = m.name || '', d = m.displayName || '';
      return fuzzy ? (n.includes(name) || d.includes(name)) : (n === name || d === name);
    })
    .map(sanitizeMember);
  return { matches };
}
function tool_get_roles() {
  const snap = loadSnapshot();
  const active = snap.members.filter(m => m.isActive !== false);
  const roles = [...new Set(active.map(m => m.role).filter(Boolean))];
  const perms = [...new Set(active.map(m => m.perm).filter(Boolean))];
  const permDisplay = {};
  perms.forEach(p => { permDisplay[p] = permLabel(p); });
  return { roles, perms, adminLabel: '管理者', permDisplay };
}
function tool_get_org_summary() {
  const snap = loadSnapshot();
  const active = snap.members.filter(m => m.isActive !== false);
  const byRole = {}, byPerm = {};
  active.forEach(m => {
    if (m.role) byRole[m.role] = (byRole[m.role] || 0) + 1;
    if (m.perm) byPerm[m.perm] = (byPerm[m.perm] || 0) + 1;
  });
  const secretaryUndecided = active.filter(m => !m.secretaryAiName || m.secretaryAiName === '未定').map(m => m.name);
  const secretaryAssigned = active.filter(m => m.secretaryAiName && m.secretaryAiName !== '未定').length;
  return { totalActive: active.length, byRole, byPerm, secretaryAssigned, secretaryUndecided };
}

// --- ツール定義 (read-only のみ。書き込み系は存在しない) ---
const TOOLS = [
  { name: 'get_members', description: 'メンバー一覧 (既定 active のみ) を返す read-only ツール。', handler: tool_get_members,
    inputSchema: { type: 'object', properties: { includeInactive: { type: 'boolean', description: '無効/削除済みも含めるか (既定 false)' } } } },
  { name: 'get_member_by_uid', description: 'uid 完全一致でメンバー1件を返す。', handler: tool_get_member_by_uid,
    inputSchema: { type: 'object', properties: { uid: { type: 'string' } }, required: ['uid'] } },
  { name: 'get_member_by_name', description: 'name/displayName でメンバーを検索 (複数返しうる)。', handler: tool_get_member_by_name,
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, fuzzy: { type: 'boolean' } }, required: ['name'] } },
  { name: 'get_roles', description: '役職・権限の語彙 (admin/owner→「管理者」表記) を返す。', handler: tool_get_roles,
    inputSchema: { type: 'object', properties: {} } },
  { name: 'get_org_summary', description: '組織サマリ (active件数/役職別/権限別/秘書未定一覧)。', handler: tool_get_org_summary,
    inputSchema: { type: 'object', properties: {} } },
];
const TOOL_MAP = Object.fromEntries(TOOLS.map(t => [t.name, t]));

// --- JSON-RPC 2.0 over stdio ---
function send(msg) { process.stdout.write(JSON.stringify(msg) + '\n'); }
function reply(id, result) { send({ jsonrpc: '2.0', id, result }); }
function replyErr(id, code, message) { send({ jsonrpc: '2.0', id, error: { code, message } }); }

function handle(req) {
  const { id, method, params } = req;
  if (method === 'initialize') {
    return reply(id, { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {} }, serverInfo: SERVER_INFO });
  }
  if (method === 'notifications/initialized' || method === 'initialized') return; // notification: 応答なし
  if (method === 'ping') return reply(id, {});
  if (method === 'tools/list') {
    return reply(id, { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
  }
  if (method === 'tools/call') {
    const name = params && params.name;
    const args = (params && params.arguments) || {};
    const tool = TOOL_MAP[name];
    if (!tool) {
      return reply(id, { content: [{ type: 'text', text: 'unknown or non-read-only tool: ' + name }], isError: true });
    }
    try {
      const data = tool.handler(args);
      return reply(id, { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
    } catch (e) {
      return reply(id, { content: [{ type: 'text', text: 'error: ' + e.message }], isError: true });
    }
  }
  if (id !== undefined) replyErr(id, -32601, 'Method not found: ' + method);
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  const s = line.trim();
  if (!s) return;
  let req;
  try { req = JSON.parse(s); } catch (e) { logErr('JSON parse error:', e.message); return; }
  try { handle(req); } catch (e) { logErr('handle error:', e.message); if (req && req.id !== undefined) replyErr(req.id, -32603, e.message); }
});
logErr('started. read-only. data file =', DATA_FILE);
