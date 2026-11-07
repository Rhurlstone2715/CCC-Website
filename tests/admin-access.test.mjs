import '../dist/test-env.js';
import assert from 'node:assert/strict';
import { after, mock, test } from 'node:test';
import { Hono } from 'hono';
import { admin } from '../dist/routes/admin.js';
import { prisma } from '../dist/db.js';

function stub(delegate, name, implementation) {
  const original = delegate[name];
  const fn = mock.fn(implementation);
  delegate[name] = fn;
  return { mock: { callCount: () => fn.mock.callCount(), get calls() { return fn.mock.calls; }, restore: () => { delegate[name] = original; } } };
}
const app = new Hono();
app.use('*', async (c, next) => { c.set('user', { id: 1, role: 'ADMIN' }); await next(); });
app.route('/admin', admin);
after(() => prisma.$disconnect());

test('admin promotion requests are forbidden without changing a customer', async () => {
  const find = stub(prisma.user, 'findUnique', async () => ({ id: 2, role: 'CUSTOMER' }));
  const update = stub(prisma.user, 'update', async () => { throw new Error('Must not update role'); });
  try {
    for (const role of ['ADMIN', '', 'unexpected']) {
      const response = await app.request('/admin/customers/2/role', { method: 'POST', body: new URLSearchParams({ role }) });
      assert.equal(response.status, 403);
    }
    assert.equal(update.mock.callCount(), 0);
  } finally { find.mock.restore(); update.mock.restore(); }
});

test('existing admins can still revoke another admin, but cannot revoke themselves', async () => {
  const find = stub(prisma.user, 'findUnique', async ({ where }) => ({ id: where.id, role: 'ADMIN' }));
  const count = stub(prisma.user, 'count', async () => 2);
  const update = stub(prisma.user, 'update', async () => ({}));
  try {
    const self = await app.request('/admin/customers/1/role', { method: 'POST', body: new URLSearchParams({ role: 'CUSTOMER' }) });
    assert.match(self.headers.get('location'), /cant-change-self$/);
    assert.equal(update.mock.callCount(), 0);
    const other = await app.request('/admin/customers/2/role', { method: 'POST', body: new URLSearchParams({ role: 'CUSTOMER' }) });
    assert.match(other.headers.get('location'), /removed-admin$/);
    assert.deepEqual(update.mock.calls[0].arguments[0], { where: { id: 2 }, data: { role: 'CUSTOMER' } });
  } finally { find.mock.restore(); count.mock.restore(); update.mock.restore(); }
});
