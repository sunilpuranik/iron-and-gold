// Compiles the app's design surface (.design-sync/web/index.js) for the browser so the
// Claude Design converter has a real ESM dist + .d.ts to bundle.
//   react-native        -> react-native-web (installed in .ds-sync/node_modules)
//   *.web.js variants    preferred, the way Expo web resolves them
//   expo-haptics        -> no-op (haptics don't exist in a browser; feel.js already swallows failures)
//   @react-native/assets-registry/registry -> empty registry (react-native-svg still imports it; RN 0.88
//                          dropped the package, and no DS component renders a bundled image asset)
//   @supabase/supabase-js, @react-native-async-storage/async-storage, react-native-url-polyfill/auto -> empty
//                          (src/net/online.js requires them lazily inside db(); the splash's SaloonPanel imports
//                          online.js only for myTurnAt, and designs never open a connection)
//   react / react-dom    left external - the converter maps them to window.React / window.ReactDOM
// Output: .design-sync/.cache/web/{index.mjs,index.d.ts,package.json}
// Usage (repo root): node .design-sync/build-web.mjs
import { build } from '../.ds-sync/node_modules/esbuild/lib/main.js';
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const out = join(here, '.cache', 'web');
const rnw = join(root, '.ds-sync', 'node_modules', 'react-native-web');

mkdirSync(out, { recursive: true });

const stubs = {
  name: 'web-stubs',
  setup(b) {
    const STUBS = {
      'expo-haptics': 'const n = () => Promise.resolve();'
        + 'export const selectionAsync = n, impactAsync = n, notificationAsync = n;'
        + 'export const ImpactFeedbackStyle = {}, NotificationFeedbackType = {};',
      '@react-native/assets-registry/registry': 'export const getAssetByID = () => undefined;'
        + 'export const registerAsset = () => 0;',
      '@supabase/supabase-js': 'export const createClient = () => { throw new Error("Online play is not available in designs"); };',
      '@react-native-async-storage/async-storage': 'export default {};',
      'react-native-url-polyfill/auto': '',
    };
    b.onResolve({ filter: /^(expo-haptics|@react-native\/assets-registry\/registry|@supabase\/supabase-js|@react-native-async-storage\/async-storage|react-native-url-polyfill\/auto)$/ }, (args) => ({ path: args.path, namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({ contents: STUBS[args.path], loader: 'js' }));
    // react-native (and deep imports) -> react-native-web
    b.onResolve({ filter: /^react-native(\/.*)?$/ }, (args) => (
      args.path === 'react-native' ? { path: join(rnw, 'dist', 'index.js') } : undefined
    ));
  },
};

await build({
  entryPoints: [join(here, 'web', 'index.js')],
  outfile: join(out, 'index.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.js': 'jsx' },
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.mjs', '.jsx', '.json'],
  mainFields: ['browser', 'module', 'main'],
  conditions: ['browser', 'import', 'default'],
  nodePaths: [join(root, 'node_modules'), join(root, '.ds-sync', 'node_modules')],
  external: ['react', 'react/*', 'react-dom', 'react-dom/*'],
  plugins: [stubs],
  define: {
    __DEV__: 'false',
    'process.env.NODE_ENV': '"production"',
    // src/net/online.js: no Supabase project in designs, so onlineEnabled is false
    'process.env.EXPO_PUBLIC_SUPABASE_URL': '""',
    'process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY': '""',
    global: 'globalThis',
  },
  logLevel: 'warning',
});

copyFileSync(join(here, 'web', 'index.d.ts'), join(out, 'index.d.ts'));
const app = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
writeFileSync(join(out, 'package.json'), JSON.stringify({
  name: app.name,
  version: app.version,
  private: true,
  module: 'index.mjs',
  types: 'index.d.ts',
}, null, 2) + '\n');
// Lets the converter's .d.ts extractor resolve @types/react from the staged package.
if (!existsSync(join(out, 'node_modules'))) symlinkSync(join(root, '.ds-sync', 'node_modules'), join(out, 'node_modules'), 'dir');
console.log(`built ${join(out, 'index.mjs')}`);
