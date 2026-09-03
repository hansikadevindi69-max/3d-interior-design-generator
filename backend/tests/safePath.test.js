const path = require('path');
const { resolveSafePath } = require('../src/utils/safePath');

describe('resolveSafePath', () => {
  const baseDir = '/tmp/uploads-test-base';

  it('resolves a plain filename inside the base directory', () => {
    const resolved = resolveSafePath(baseDir, 'abc123.png');
    expect(resolved).toBe(path.resolve(baseDir, 'abc123.png'));
  });

  it('strips directory traversal segments before resolving', () => {
    const resolved = resolveSafePath(baseDir, '../../etc/passwd');
    expect(resolved).toBe(path.resolve(baseDir, 'passwd'));
    expect(resolved.startsWith(path.resolve(baseDir))).toBe(true);
  });
});
