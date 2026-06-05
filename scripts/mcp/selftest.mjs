#!/usr/bin/env node
/*
 * selftest.mjs (packet 2047)
 * ローカル read-only MCP サーバーPoC の自己テスト。
 * Claude Desktop へは接続せず、子プロセスとして起動して stdio JSON-RPC を検証する。
 * 検証内容:
 *   - initialize / tools/list / tools/call が動く
 *   - 5つの read-only ツールが応答する
 *   - 返却JSONに pass/password/token/secret/email/顧客情報 等の許可外キーが無い
 *   - 書き込み的なツール名 (update_member 等) は拒否される (isError)
 * 入力データはコミット済みダミー (scripts/sample.member-json.dummy.json)。本物データ不要・外部送信なし。
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

const SERVER = path.resolve('scripts/mcp/jagai-members-mcp-server.mjs');
const DUMMY = path.resolve('scripts/sample.member-json.dummy.json');
const FORBIDDEN = ['pass', 'password', 'token', 'secret', 'apikey', 'api_key', 'accesstoken', 'refreshtoken', 'email', 'mail', 'phone', 'tel', 'address', 'customer', '顧客', 'service_role', 'uuid'];
const ALLOWED = new Set(['uid', 'name', 'displayName', 'role', 'perm', 'secretaryAiName', 'isActive', 'sortOrder', 'notesForAi']);

const child = spawn(process.execPath, [SERVER, '--file', DUMMY], { stdio: ['pipe', 'pipe', 'inherit'] });

let buf = '';
const pending = new Map();
child.stdout.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
    if (!line) continue;
    let msg; try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id !== undefined && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  }
});

let nextId = 1;
function rpc(method, params) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });
}

const results = [];
function check(name, cond, detail) { results.push({ name, ok: !!cond, detail: detail || '' }); }

function scanForbidden(label, obj) {
  const leaks = [];
  (function walk(o) {
    if (Array.isArray(o)) return o.forEach(walk);
    if (o && typeof o === 'object') {
      for (const k of Object.keys(o)) {
        const lk = k.toLowerCase();
        // 許可済みキーは検査対象外 (secretaryAiName は「秘書AI名」であり API secret ではない＝誤検知回避)
        if (!ALLOWED.has(k) && FORBIDDEN.some(f => lk.includes(f))) leaks.push(k);
        walk(o[k]);
      }
    }
  })(obj);
  return leaks;
}
function parseToolResult(resp) {
  const txt = resp && resp.result && resp.result.content && resp.result.content[0] && resp.result.content[0].text;
  try { return JSON.parse(txt); } catch { return null; }
}

async function main() {
  const init = await rpc('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'selftest', version: '0' } });
  check('initialize protocolVersion', init.result && init.result.protocolVersion === '2024-11-05', JSON.stringify(init.result && init.result.serverInfo));

  const list = await rpc('tools/list', {});
  const toolNames = (list.result && list.result.tools || []).map(t => t.name);
  const expected = ['get_members', 'get_member_by_uid', 'get_member_by_name', 'get_roles', 'get_org_summary'];
  check('tools/list has exactly 5 read-only tools', toolNames.length === 5 && expected.every(n => toolNames.includes(n)), toolNames.join(','));
  check('tools/list has NO write tools', !toolNames.some(n => /create|update|delete|upsert|set_|write|remove/i.test(n)), toolNames.join(','));

  const gm = await rpc('tools/call', { name: 'get_members', arguments: {} });
  const gmData = parseToolResult(gm);
  check('get_members returns members', gmData && Array.isArray(gmData.members) && gmData.members.length >= 1, 'count=' + (gmData && gmData.count));
  // 許可外キーが無い
  let keyViolations = [];
  (gmData ? gmData.members : []).forEach(m => Object.keys(m).forEach(k => { if (!ALLOWED.has(k)) keyViolations.push(k); }));
  check('get_members: only whitelist keys', keyViolations.length === 0, keyViolations.join(','));
  check('get_members: no forbidden substrings', scanForbidden('get_members', gmData).length === 0, scanForbidden('x', gmData).join(','));

  const uid0 = gmData.members[0].uid;
  const byUid = parseToolResult(await rpc('tools/call', { name: 'get_member_by_uid', arguments: { uid: uid0 } }));
  check('get_member_by_uid finds member', byUid && byUid.member && byUid.member.uid === uid0, uid0);

  const byName = parseToolResult(await rpc('tools/call', { name: 'get_member_by_name', arguments: { name: gmData.members[0].name } }));
  check('get_member_by_name matches', byName && Array.isArray(byName.matches) && byName.matches.length >= 1, '');

  const roles = parseToolResult(await rpc('tools/call', { name: 'get_roles', arguments: {} }));
  check('get_roles adminLabel=管理者', roles && roles.adminLabel === '管理者', JSON.stringify(roles && roles.roles));

  const org = parseToolResult(await rpc('tools/call', { name: 'get_org_summary', arguments: {} }));
  check('get_org_summary totalActive>=1', org && org.totalActive >= 1, 'totalActive=' + (org && org.totalActive));

  // 書き込み的ツールは拒否される
  const writeAttempt = await rpc('tools/call', { name: 'update_member', arguments: { uid: uid0, role: 'hacked' } });
  check('write tool rejected (isError)', writeAttempt.result && writeAttempt.result.isError === true, JSON.stringify(writeAttempt.result && writeAttempt.result.content));

  // 出力
  console.log('===== MCP PoC SELF-TEST =====');
  let allOk = true;
  for (const r of results) { console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name + (r.detail ? '  [' + r.detail + ']' : '')); if (!r.ok) allOk = false; }
  console.log('===== RESULT: ' + (allOk ? 'PASS' : 'FAIL') + ' =====');
  child.kill();
  process.exit(allOk ? 0 : 1);
}
main().catch(e => { console.error('selftest error:', e); child.kill(); process.exit(1); });
