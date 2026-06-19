import { test } from 'node:test';
import assert from 'node:assert/strict';
import { render, deriveFromConfig } from '../generate-template.js';

test('render substitutes known placeholders', () => {
  const out = render('Hello {{organization}} / {{deployment-name}}', {
    organization: 'Acme', 'deployment-name': 'Vault'
  });
  assert.equal(out, 'Hello Acme / Vault');
});

test('render leaves unknown placeholders visible', () => {
  const out = render('keep {{unknown}}', { organization: 'Acme' });
  assert.equal(out, 'keep {{unknown}}');
});

test('render keeps {{#if}} block when flag truthy', () => {
  const out = render('a{{#if mfa-enabled}} MFA{{/if}} b', { 'mfa-enabled': true });
  assert.equal(out, 'a MFA b');
});

test('render drops {{#if}} block when flag falsy', () => {
  assert.equal(render('a{{#if mfa-enabled}} MFA{{/if}} b', { 'mfa-enabled': false }), 'a b');
  assert.equal(render('a{{#if mfa-enabled}} MFA{{/if}} b', {}), 'a b');
  // string 'false' (e.g. from a stringified var) is treated as falsy
  assert.equal(render('a{{#if x}} y{{/if}} b', { x: 'false' }), 'a b');
});

test('deriveFromConfig maps open-pryv.io config to answer keys', () => {
  const d = deriveFromConfig({
    storages: { baseStorage: { engine: 'sqlite' } },
    services: { mfa: { mode: 'disabled' } },
    audit: { active: true },
    cluster: { apiWorkers: 3 }
  });
  assert.equal(d['storage-engine'], 'SQLite');
  assert.equal(d['mfa-enabled'], false);
  assert.equal(d['audit-enabled'], true);
  assert.equal(d['multi-core'], true);
});

test('deriveFromConfig returns empty for an unrecognized config', () => {
  assert.deepEqual(deriveFromConfig({ unrelated: true }), {});
});

test('deriveFromConfig recognizes PostgreSQL + single core', () => {
  const d = deriveFromConfig({
    storages: { baseStorage: { engine: 'postgresql' } },
    cluster: { apiWorkers: 1 }
  });
  assert.equal(d['storage-engine'], 'PostgreSQL');
  assert.equal(d['multi-core'], false);
});
