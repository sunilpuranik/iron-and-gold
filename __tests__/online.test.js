// The online client: anonymous sessions, RPC calls and how server refusals reach the game.
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

const mockDb = {
  session: null,
  signIns: 0,
  rpc: jest.fn(),
  invoke: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: async () => ({ data: { session: mockDb.session } }),
      signInAnonymously: async () => {
        mockDb.signIns += 1;
        mockDb.session = { user: { id: 'uid-1' } };
        return { data: { user: mockDb.session.user }, error: null };
      },
    },
    rpc: mockDb.rpc,
    functions: { invoke: mockDb.invoke },
  })),
}));

function load() {
  let mod;
  jest.isolateModules(() => {
    mod = require('../src/net/online');
  });
  return mod;
}

beforeEach(() => {
  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon';
  mockDb.session = null;
  mockDb.signIns = 0;
  mockDb.rpc.mockReset();
  mockDb.invoke.mockReset();
});

test('offline when the env vars are missing', () => {
  delete process.env.EXPO_PUBLIC_SUPABASE_URL;
  const online = load();
  expect(online.onlineEnabled).toBe(false);
  expect(() => online.db()).toThrow('not configured');
});

test('signs in anonymously once, even when asked twice at the same time', async () => {
  const online = load();
  const [a, b] = await Promise.all([online.ensureSession(), online.ensureSession()]);
  expect(a).toBe('uid-1');
  expect(b).toBe('uid-1');
  expect(mockDb.signIns).toBe(1);
});

test('reuses a saved session instead of creating a new tycoon', async () => {
  mockDb.session = { user: { id: 'uid-saved' } };
  const online = load();
  expect(await online.ensureSession()).toBe('uid-saved');
  expect(mockDb.signIns).toBe(0);
});

test('joining upper-cases and trims the code and sends name and portrait', async () => {
  const online = load();
  mockDb.rpc.mockResolvedValue({ data: { code: 'ABCD' }, error: null });
  await online.joinRoom(' abcd ', { name: 'Ada', avatar: 3 });
  expect(mockDb.rpc).toHaveBeenCalledWith('join_room', { p_code: 'ABCD', p_name: 'Ada', p_avatar: 3 });
});

test('hosting sends the room name, trimmed, or null when blank', async () => {
  const online = load();
  mockDb.rpc.mockResolvedValue({ data: { code: 'ABCD' }, error: null });
  await online.createRoom({ name: 'Ada', avatar: 2 }, '  Friday rails ');
  expect(mockDb.rpc).toHaveBeenLastCalledWith('create_room', {
    p_name: 'Ada', p_avatar: 2, p_title: 'Friday rails',
  });
  await online.createRoom({ name: 'Ada', avatar: 2 }, '   ');
  expect(mockDb.rpc).toHaveBeenLastCalledWith('create_room', { p_name: 'Ada', p_avatar: 2, p_title: null });
});

test('renaming a room goes through rename_room', async () => {
  const online = load();
  mockDb.rpc.mockResolvedValue({ data: { code: 'ABCD', title: 'Rails' }, error: null });
  await online.renameRoom('ABCD', ' Rails ');
  expect(mockDb.rpc).toHaveBeenCalledWith('rename_room', { p_code: 'ABCD', p_title: 'Rails' });
});

test('closing a table goes through delete_room', async () => {
  const online = load();
  mockDb.rpc.mockResolvedValue({ data: null, error: null });
  await online.deleteRoom('ABCD');
  expect(mockDb.rpc).toHaveBeenCalledWith('delete_room', { p_code: 'ABCD' });
});

test('RPC errors surface their message', async () => {
  const online = load();
  mockDb.rpc.mockResolvedValue({ data: null, error: { message: 'That table is full' } });
  await expect(online.createRoom({ name: 'Ada', avatar: 0 })).rejects.toThrow('That table is full');
});

test('a successful move resolves to the new room row', async () => {
  const online = load();
  mockDb.invoke.mockResolvedValue({ data: { code: 'ABCD', seq: 8 }, error: null });
  await expect(online.gameOp('ABCD', 'move', 7, { type: 'buy', cart: {} })).resolves.toEqual({ code: 'ABCD', seq: 8 });
  expect(mockDb.invoke).toHaveBeenCalledWith('game', {
    body: {
      code: 'ABCD', op: 'move', seq: 7, action: { type: 'buy', cart: {} },
    },
  });
});

test('a 409 carries the latest row so the table can refresh', async () => {
  const online = load();
  const latest = { code: 'ABCD', seq: 9 };
  mockDb.invoke.mockResolvedValue({
    data: null,
    error: { message: 'non-2xx', context: { status: 409, json: async () => ({ error: 'The table moved on', row: latest }) } },
  });
  const err = await online.gameOp('ABCD', 'move', 7, {}).catch((e) => e);
  expect(err).toBeInstanceOf(online.GameOpError);
  expect(err.status).toBe(409);
  expect(err.message).toBe('The table moved on');
  expect(err.row).toEqual(latest);
});

test('a network failure still rejects with a readable message', async () => {
  const online = load();
  mockDb.invoke.mockResolvedValue({ data: null, error: { message: 'Failed to send a request to the Edge Function' } });
  const err = await online.gameOp('ABCD', 'bot', 7).catch((e) => e);
  expect(err.message).toMatch(/Failed to send/);
  expect(err.row).toBeNull();
});

test('myTurnAt only lights up for my move in a running game', () => {
  const { myTurnAt } = load();
  expect(myTurnAt({ status: 'playing', turn_of: 'me' }, 'me')).toBe(true);
  expect(myTurnAt({ status: 'playing', turn_of: 'you' }, 'me')).toBe(false);
  expect(myTurnAt({ status: 'lobby', turn_of: null }, 'me')).toBe(false);
  expect(myTurnAt({ status: 'over', turn_of: 'me' }, 'me')).toBe(false);
});
