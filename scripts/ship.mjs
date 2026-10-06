// One entry point for running, deploying and rolling back Iron & Gold. The Claude commands in
// .claude/skills wrap it; it also runs on its own: npm run ship -- <command> [target] [flags]
//
//   local web | local app          run on this machine against the DEV backend (or offline)
//   dev web | dev app | dev all    deploy to the cloud dev environment (never touches testers)
//       [--functions] [--db]       ...also deploy the game function / migrations to the dev Supabase
//   prod [web|app|all]             release to beta testers from `main` (prints a plan; add --yes to run)
//   rollback prod [web|app|functions|all] [--to <tag>]   put an earlier beta release back
//   status                         what is live where
//   smoke <url>                    open a URL in Safari (WebKit) and Chrome and check it renders
//
// Environments
//   dev   .env.dev  (EXPO_PUBLIC_SUPABASE_URL/ANON_KEY of the dev Supabase project). Without it,
//         dev and local builds run offline (bots only), so they can never reach the testers' data.
//   prod  .env      (the beta Supabase project, the one testers use)
//
// Every prod release is an annotated git tag (beta-YYYY-MM-DD[-n]) that records the web deployment
// id, the app update group and the Supabase project. Rollback reads them back from the tag.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT = 'iron-and-gold';
const URLS = {
  prod: `https://${PROJECT}.expo.app`,
  dev: `https://${PROJECT}--dev.expo.app`,
};
const UPDATES = 'https://expo.dev/accounts/puranik-co/projects/iron-and-gold/updates';

// ---------------------------------------------------------------------------------------------
// helpers

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--') && !a.includes('=')));
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1];
  const eq = argv.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : null;
};
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--to', '--message'].includes(argv[i - 1])));

const say = (msg) => console.log(`\n▸ ${msg}`);
const die = (msg) => { console.error(`\n✗ ${msg}`); process.exit(1); };

function run(cmd, args, { env = {}, capture = false, allowFail = false, cwd = root } = {}) {
  if (!capture) console.log(`  $ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, {
    cwd, env: { ...process.env, ...env }, encoding: 'utf8', stdio: capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  });
  if (r.status !== 0 && !allowFail) {
    if (capture) process.stderr.write(r.stderr || '');
    die(`${cmd} ${args.join(' ')} failed (exit ${r.status})`);
  }
  return capture ? (r.stdout || '').trim() : r.status;
}
const git = (...a) => run('git', a, { capture: true, allowFail: true });

function readEnvFile(file) {
  const p = join(root, file);
  if (!existsSync(p)) return null;
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const refOf = (url) => (url || '').match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] || null;

// The EXPO_PUBLIC_* values a build gets. Passed as process env, which Expo prefers over .env, so a
// dev build can't pick up the beta keys from .env by accident.
function envFor(target) {
  if (target === 'prod') {
    const e = readEnvFile('.env');
    if (!e || !refOf(e.EXPO_PUBLIC_SUPABASE_URL)) die('.env has no Supabase keys; prod needs the beta project (see .env.example)');
    return {
      vars: {
        EXPO_PUBLIC_SUPABASE_URL: e.EXPO_PUBLIC_SUPABASE_URL,
        EXPO_PUBLIC_SUPABASE_ANON_KEY: e.EXPO_PUBLIC_SUPABASE_ANON_KEY,
        EXPO_PUBLIC_WEB_URL: e.EXPO_PUBLIC_WEB_URL || URLS.prod,
        EXPO_PUBLIC_APP_ENV: 'beta',
      },
      ref: refOf(e.EXPO_PUBLIC_SUPABASE_URL),
    };
  }
  const d = readEnvFile('.env.dev');
  const prodRef = refOf(readEnvFile('.env')?.EXPO_PUBLIC_SUPABASE_URL);
  const ref = refOf(d?.EXPO_PUBLIC_SUPABASE_URL);
  if (ref && ref === prodRef) die('.env.dev points at the BETA Supabase project. Give dev its own project.');
  return {
    vars: {
      EXPO_PUBLIC_SUPABASE_URL: ref ? d.EXPO_PUBLIC_SUPABASE_URL : '',
      EXPO_PUBLIC_SUPABASE_ANON_KEY: ref ? d.EXPO_PUBLIC_SUPABASE_ANON_KEY : '',
      EXPO_PUBLIC_WEB_URL: target === 'local' ? '' : URLS.dev,
      EXPO_PUBLIC_APP_ENV: target,
    },
    ref,
  };
}
const describeEnv = ({ ref }) => (ref ? `online, dev Supabase ${ref}` : 'OFFLINE (no .env.dev yet: bots and pass-and-play only)');

// ---------------------------------------------------------------------------------------------
// building blocks

function exportWeb(env) {
  run('npx', ['expo', 'export', '--platform', 'web', '--clear'], { env: env.vars });
}

// eas deploy; returns { id, url }.
function easDeploy(args) {
  const out = run('npx', ['eas-cli', 'deploy', '--non-interactive', '--json', ...args], { capture: true });
  const text = out.slice(out.indexOf('{'));
  let json = {};
  try { json = JSON.parse(text); } catch { /* fall back to scraping */ }
  const all = JSON.stringify(json) + out;
  const id = json?.deployment?.id || json?.id || all.match(/--([a-z0-9]{6,})\.expo\.app/)?.[1];
  const url = json?.deployment?.url || all.match(/https:\/\/[a-z0-9-]+--[a-z0-9]+\.expo\.app/)?.[0];
  if (!id) die(`couldn't read the deployment id from eas deploy:\n${out.slice(0, 800)}`);
  return { id, url: url || `https://${PROJECT}--${id}.expo.app` };
}

function smoke(url) {
  say(`Smoke test ${url} (Safari/WebKit + Chrome)`);
  const status = run('node', [join(root, 'scripts/smoke-web.mjs'), url], { allowFail: true });
  if (status !== 0) die(`smoke test failed on ${url} - nothing was promoted`);
}

// eas update; returns the update group id.
function easUpdate(branch, environment, message, env) {
  const out = run('npx', ['eas-cli', 'update', '--branch', branch, '--environment', environment,
    '--message', message, '--non-interactive', '--json'], { capture: true, env: env.vars });
  const group = out.match(/"group"\s*:\s*"([0-9a-f-]{36})"/)?.[1];
  if (!group) die(`couldn't read the update group from eas update:\n${out.slice(0, 800)}`);
  return group;
}

function supabaseLinkedRef() {
  const p = join(root, 'supabase/.temp/project-ref');
  return existsSync(p) ? readFileSync(p, 'utf8').trim() : null;
}
function deployFunctions(ref, cwd = root) {
  run('node', ['scripts/sync-engine.mjs'], { cwd });
  run('npx', ['supabase', 'functions', 'deploy', 'game', '--project-ref', ref], { cwd });
}
function pushMigrations(ref) {
  if (supabaseLinkedRef() !== ref) run('npx', ['supabase', 'link', '--project-ref', ref]);
  run('npx', ['supabase', 'db', 'push', '--dry-run']);
  run('npx', ['supabase', 'db', 'push']);
}

// ---------------------------------------------------------------------------------------------
// releases (annotated tags)

function releases() {
  return git('tag', '--list', 'beta-*', '--sort=-creatordate').split('\n').filter(Boolean);
}
function releaseInfo(tag) {
  const body = git('tag', '-l', '--format=%(contents)', tag);
  const field = (k) => body.match(new RegExp(`^${k}:\\s*(\\S+)`, 'm'))?.[1] || null;
  return {
    tag, commit: git('rev-list', '-n', '1', tag), date: git('log', '-1', '--format=%cs', tag),
    web: field('web-deployment'), group: field('update-group'), ref: field('supabase-ref'), title: body.split('\n')[0],
  };
}
function nextTagName() {
  const base = `beta-${new Date().toISOString().slice(0, 10)}`;
  const taken = new Set(releases());
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}
const changedSince = (tag, paths) => git('diff', '--name-only', tag, 'HEAD', '--', ...paths).split('\n').filter(Boolean);

// ---------------------------------------------------------------------------------------------
// commands

function local(what = 'web') {
  const env = envFor('local');
  say(`Local ${what}: ${describeEnv(env)}`);
  if (what === 'web') run('npx', ['expo', 'start', '--web'], { env: env.vars });
  else if (what === 'app') run('npx', ['expo', 'start', ...(flags.has('--tunnel') ? ['--tunnel'] : [])], { env: env.vars });
  else die(`local ${what}? use: local web | local app`);
}

function dev(what = 'all') {
  if (!['web', 'app', 'all'].includes(what)) die(`dev ${what}? use: dev web | dev app | dev all`);
  const env = envFor('dev');
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const message = opt('message') || `${branch} @ ${git('rev-parse', '--short', 'HEAD')}${git('status', '--porcelain') ? ' (uncommitted changes)' : ''}`;
  say(`Deploy to DEV from ${branch}: ${describeEnv(env)}`);
  if (flags.has('--db') || flags.has('--functions')) {
    if (!env.ref) die('--db/--functions need a dev Supabase project in .env.dev');
    if (flags.has('--db')) pushMigrations(env.ref);
    if (flags.has('--functions')) deployFunctions(env.ref);
  }
  if (what !== 'app') {
    exportWeb(env);
    const d = easDeploy(['--alias', 'dev', '--environment', 'development']);
    smoke(URLS.dev);
    say(`Dev web is live: ${URLS.dev}  (this deployment: ${d.url})`);
  }
  if (what !== 'web') {
    const group = easUpdate('dev', 'development', message, env);
    say(`Dev app update published to branch "dev" (group ${group}).\n  Open it in Expo Go from ${UPDATES}/${group}`);
  }
}

function prod(what = 'all') {
  if (!['web', 'app', 'all'].includes(what)) die(`prod ${what}? use: prod | prod web | prod app`);
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  if (branch !== 'main') die(`prod releases go out from main (you're on ${branch}). Merge first: git checkout main && git merge ${branch}`);
  if (git('status', '--porcelain')) die('working tree has uncommitted changes; commit or stash them first');
  run('git', ['fetch', '-q', 'origin', 'main', '--tags']);
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/main')) die('main differs from origin/main; pull or push first');

  const env = envFor('prod');
  const last = releases()[0];
  const prev = last ? releaseInfo(last) : null;
  const tag = nextTagName();
  const functions = last ? changedSince(last, ['src/game', 'src/net/gameOps.js', 'supabase/functions']) : ['(first release)'];
  const migrations = last ? changedSince(last, ['supabase/migrations']) : [];
  const native = last ? git('diff', last, 'HEAD', '--', 'package.json').split('\n').filter((l) => /^[+-]\s+"(expo-|react-native|@react-native)/.test(l)) : [];
  const commits = last ? git('log', '--oneline', `${last}..HEAD`) : git('log', '--oneline', '-10');

  console.log(`\nRELEASE PLAN  ${tag}  (${git('rev-parse', '--short', 'HEAD')} on main, beta Supabase ${env.ref})`);
  console.log(`  since ${last || 'the beginning'}:\n${(commits || '  (no new commits)').split('\n').map((l) => `    ${l}`).join('\n')}`);
  console.log('  steps:');
  console.log('    1. npm test');
  if (migrations.length) console.log(`    2. database migrations -> beta: ${migrations.join(', ')}`);
  if (functions.length) console.log(`    3. game Edge Function -> beta (rules changed: ${functions.join(', ')})`);
  if (what !== 'app') console.log(`    4. web: export, deploy a preview, smoke-test it in Safari + Chrome, then promote to ${URLS.prod}`);
  if (what !== 'web') console.log('    5. app: eas update to the "beta" branch (Expo Go + APK testers)');
  console.log(`    6. tag ${tag} with the deployment ids, push the tag`);
  if (native.length) console.log(`  ! native packages changed since ${last}; the beta APK needs a rebuild:\n${native.map((l) => `      ${l}`).join('\n')}\n    (eas build -p android --profile preview)`);
  if (!commits && last) console.log('  ! nothing new since the last release');
  if (!flags.has('--yes')) { console.log('\nDry run. Re-run with --yes to release.'); return; }

  say('Tests');
  run('npx', ['jest', '--silent']);
  if (migrations.length) { say('Migrations -> beta'); pushMigrations(env.ref); }
  if (functions.length) { say('Game function -> beta'); deployFunctions(env.ref); }

  let web = prev?.web || null;
  let group = prev?.group || null;
  if (what !== 'app') {
    say('Web');
    exportWeb(env);
    const d = easDeploy(['--environment', 'preview']);
    smoke(d.url);
    run('npx', ['eas-cli', 'deploy:alias', '--prod', '--id', d.id, '--non-interactive']);
    web = d.id;
    say(`Web promoted: ${URLS.prod} (deployment ${d.id})`);
  }
  if (what !== 'web') {
    say('App');
    group = easUpdate('beta', 'preview', `${tag}: ${opt('message') || git('log', '-1', '--format=%s')}`, env);
    say(`App update published to "beta" (group ${group})`);
  }
  const notes = `${opt('message') || `Beta release ${tag}`}\n\nweb-deployment: ${web}\nupdate-group: ${group}\nsupabase-ref: ${env.ref}\n`;
  run('git', ['tag', '-a', tag, '-m', notes]);
  run('git', ['push', '-q', 'origin', tag]);
  say(`Released ${tag}. Roll back with: npm run ship -- rollback prod`);
}

function rollback(where = 'prod', what = 'all') {
  if (where !== 'prod') die('rollback dev: just redeploy the commit you want (git checkout <commit> && npm run ship -- dev). Local: see README "Rolling back".');
  const tags = releases();
  if (tags.length < 1) die('no releases tagged yet');
  const to = opt('to') || tags[1];
  if (!to || !tags.includes(to)) die(`no earlier release to roll back to (releases: ${tags.join(', ')})`);
  const target = releaseInfo(to);
  const current = releaseInfo(tags[0]);
  const env = envFor('prod');
  console.log(`\nROLLBACK PLAN  ${current.tag} -> ${target.tag} (${target.title})`);
  if (['web', 'all'].includes(what)) console.log(`  web: re-promote deployment ${target.web} at ${URLS.prod}`);
  if (['app', 'all'].includes(what)) console.log(`  app: republish update group ${target.group} to "beta"`);
  const rules = git('diff', '--name-only', target.tag, current.tag, '--', 'src/game', 'src/net/gameOps.js', 'supabase/functions');
  if (rules && ['functions', 'all'].includes(what)) console.log(`  functions: redeploy the game function from ${target.tag} (rules differ)`);
  const mig = git('diff', '--name-only', target.tag, current.tag, '--', 'supabase/migrations');
  if (mig) console.log(`  ! database migrations differ (${mig.replace(/\n/g, ', ')}); they are NOT rolled back automatically`);
  if (!flags.has('--yes')) { console.log('\nDry run. Re-run with --yes to roll back.'); return; }

  if (['web', 'all'].includes(what)) {
    if (!target.web) die(`${target.tag} has no web deployment recorded`);
    run('npx', ['eas-cli', 'deploy:alias', '--prod', '--id', target.web, '--non-interactive']);
  }
  if (['app', 'all'].includes(what)) {
    if (!target.group) die(`${target.tag} has no update group recorded`);
    run('npx', ['eas-cli', 'update:republish', '--group', target.group, '--destination-branch', 'beta',
      '--message', `rollback to ${target.tag}`, '--non-interactive']);
  }
  if (rules && ['functions', 'all'].includes(what)) {
    const dir = join(root, '.rollback-worktree');
    run('git', ['worktree', 'add', '--force', dir, target.tag]);
    try { deployFunctions(env.ref, dir); } finally { run('git', ['worktree', 'remove', '--force', dir]); }
  }
  say(`Testers are back on ${target.tag}. The bad code is still on main: revert it (git revert <commits>) before the next release.`);
}

function status() {
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  run('git', ['fetch', '-q', 'origin', '--tags'], { allowFail: true });
  const tags = releases();
  const last = tags[0] ? releaseInfo(tags[0]) : null;
  const dirty = git('status', '--porcelain').split('\n').filter(Boolean).length;
  console.log(`\nbranch      ${branch}${dirty ? ` (${dirty} uncommitted change(s))` : ''}`);
  if (last) {
    const behind = git('rev-list', '--count', `${last.tag}..origin/main`);
    console.log(`beta        ${last.tag} (${last.date}, ${last.commit.slice(0, 7)}) ${last.title}`);
    console.log(`            web ${URLS.prod} -> deployment ${last.web} · app group ${last.group}`);
    console.log(`            main is ${behind} commit(s) ahead of what testers have`);
    if (tags[1]) console.log(`            rollback target: ${tags[1]}`);
  }
  console.log(`dev         web ${URLS.dev} · app branch "dev" · ${describeEnv(envFor('dev'))}`);
  console.log(`supabase    CLI linked to ${supabaseLinkedRef() || 'nothing'}; beta = ${envFor('prod').ref}`);
}

// ---------------------------------------------------------------------------------------------

const [cmd, a, b] = positional;
switch (cmd) {
  case 'local': local(a); break;
  case 'dev': dev(a); break;
  case 'prod': prod(a); break;
  case 'rollback': rollback(a, b); break;
  case 'status': status(); break;
  case 'smoke': if (!a) die('smoke <url>'); smoke(a); break;
  default:
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 20).map((l) => l.replace(/^\/\/ ?/, '')).join('\n'));
}
