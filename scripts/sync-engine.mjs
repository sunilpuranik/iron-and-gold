// Copies the game engine into the Edge Function bundle so the server plays by exactly the
// same rules as the app. Run before `supabase functions deploy` (npm run deploy:functions does).
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'supabase/functions/_shared');
const files = ['game/engine.js', 'game/rules.js', 'game/bot.js', 'game/data.js', 'net/gameOps.js'];

rmSync(out, { recursive: true, force: true });
for (const f of files) {
  mkdirSync(dirname(join(out, f)), { recursive: true });
  cpSync(join(root, 'src', f), join(out, f));
}
console.log(`Copied ${files.length} engine files into supabase/functions/_shared`);
