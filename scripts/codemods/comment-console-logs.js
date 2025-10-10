/**
 * Codemod: Comment out all standalone `console.*` statements.
 *
 * For statements that are top-level expression statements (e.g. `console.log('x');`),
 * we replace the statement with an empty statement and attach a trailing comment
 * that contains the original code, effectively turning it into a commented-out line.
 *
 * Inline usages of `console.*` inside larger expressions are left unchanged to avoid
 * altering runtime semantics, since those cannot be turned into a commented statement
 * in-place without replacing the expression.
 */

/** @type {import('jscodeshift').Transform} */
module.exports = function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const consoleMethods = new Set([
    'log',
    'warn',
    'error',
    'debug',
    'info',
    'trace',
    'dir',
    'dirxml',
    'group',
    'groupCollapsed',
    'groupEnd',
    'time',
    'timeEnd',
    'timeStamp',
    'profile',
    'profileEnd',
    'assert',
    'clear',
    'count',
    'countReset',
    'table'
  ]);

  function getPropertyName(property) {
    if (!property) return null;
    if (property.type === 'Identifier') return property.name;
    if (property.type === 'Literal') return String(property.value);
    return null;
  }

  function createCommentedOutStatementFrom(exprStatement) {
    const original = j(exprStatement).toSource({ quote: 'single', trailingComma: true }).trim();

    const empty = j.emptyStatement();
    // Prefer a line comment when single-line; block comment otherwise
    const isMultiLine = /\r|\n/.test(original);
    const comment = isMultiLine
      ? j.commentBlock(`\n${original}\n`, false, true)
      : j.commentLine(` ${original}`, false, true);

    empty.comments = (empty.comments || []).concat(comment);
    return empty;
  }

  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'console' }
      }
    })
    .forEach(path => {
      const member = path.node.callee;
      const methodName = getPropertyName(member.property);

      // Only target known console methods; skip others just in case
      if (methodName && !consoleMethods.has(methodName)) {
        return;
      }

      if (path.parent && path.parent.node && path.parent.node.type === 'ExpressionStatement') {
        // Replace the whole console.* statement with an empty statement and attach
        // a trailing comment that contains the original source code.
        const commented = createCommentedOutStatementFrom(path.parent.node);
        j(path.parent).replaceWith(commented);
      }
      // NOTE: Inline usages inside larger expressions are intentionally left unchanged.
    });

  return root.toSource({ quote: 'single', trailingComma: true });
};
