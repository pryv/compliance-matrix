import { describe, it, expect } from 'vitest';
import {
  renderTemplate, coverageHistogram, renderScopeDoc, renderGapReport, renderIndex
} from './generate';
import type { Scope, Requirement, RequirementLinks } from './db';

const scope: Scope = {
  id: 'gdpr',
  title: 'General Data Protection Regulation',
  short: 'GDPR',
  type: 'regulation',
  jurisdiction: 'EU',
  version: '2016/679',
  version_date: '2016-04-27',
  canonical_url: 'https://example.org',
  curated: false,
  layered_on: [],
  requirement_count: 2
};

const reqs: Requirement[] = [
  {
    scope_id: 'gdpr',
    ref: 'Art.5',
    title: 'Principles',
    text: null,
    text_url: null,
    coverage: 'implemented',
    pryv_effort_saved: 'high',
    facilitation_mode: null,
    overview: 'Pryv carries this.',
    detail: null,
    technical: null,
    draft: true,
    reviewed_by: null,
    reviewed_at: null,
    applies_to_versions: '*',
    planned: []
  },
  {
    scope_id: 'gdpr',
    ref: 'Art.30',
    title: 'Records',
    text: null,
    text_url: null,
    coverage: 'documented',
    pryv_effort_saved: 'low',
    facilitation_mode: null,
    overview: 'You keep records.',
    detail: null,
    technical: null,
    draft: true,
    reviewed_by: null,
    reviewed_at: null,
    applies_to_versions: '*',
    planned: []
  }
];

const noLinks: RequirementLinks = { tests: [], docs: [], qms: [], configs: [], specs: [], derives: [] };
const linksByRef: Record<string, RequirementLinks> = {
  'Art.5': { ...noLinks, tests: ['GLHP'] },
  'Art.30': { ...noLinks, qms: ['qms/pryv/02-procedures/document-control.md'] }
};

describe('renderTemplate', () => {
  it('substitutes and respects {{#if}}', () => {
    expect(renderTemplate('Hi {{org}}{{#if x}} on{{/if}}', { org: 'A', x: true })).toBe('Hi A on');
    expect(renderTemplate('Hi {{org}}{{#if x}} on{{/if}}', { org: 'A', x: false })).toBe('Hi A');
  });
  it('leaves unknown placeholders visible', () => {
    expect(renderTemplate('{{nope}}', {})).toBe('{{nope}}');
  });
});

describe('coverageHistogram', () => {
  it('counts by coverage tier', () => {
    const h = coverageHistogram(reqs);
    expect(h.implemented).toBe(1);
    expect(h.documented).toBe(1);
    expect(h.facilitated).toBe(0);
  });
});

describe('renderScopeDoc', () => {
  const doc = renderScopeDoc(scope, reqs, linksByRef, { organization: 'Acme', 'deployment-name': 'Vault' }, '2026-06-18');
  it('has a cover heading and evidence pointers', () => {
    expect(doc).toContain('# Acme — General Data Protection Regulation');
    expect(doc).toContain('`[GLHP]`');
    expect(doc).toContain('qms: qms/pryv/02-procedures/document-control.md');
  });
  it('lists only operator-work rows in the to-do list', () => {
    const todo = doc.split('## Your to-do list')[1];
    expect(todo).toContain('Art.30');
    expect(todo).not.toContain('Art.5 —'); // implemented is carried by Pryv
  });
});

describe('renderGapReport / renderIndex', () => {
  it('gap report lists documented + out-of-scope', () => {
    const g = renderGapReport([scope], { gdpr: reqs }, { organization: 'Acme', 'deployment-name': 'V' }, '2026-06-18');
    expect(g).toContain('Art.30');
    expect(g).not.toContain('Art.5');
  });
  it('index lists scope docs', () => {
    const i = renderIndex([scope], { organization: 'Acme', 'deployment-name': 'V' }, '2026-06-18');
    expect(i).toContain('`gdpr.md`');
  });
});
