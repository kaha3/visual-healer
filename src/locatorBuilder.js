export function buildSmartSelector(el) {
  if (!el || !el.tag) return { selector: '', confidence: 0 };

  const tag = el.tag.toLowerCase();
  const attrs = el.attributes || {};

  // data-testid
  if (attrs['data-testid']) {
    return {
      selector: `[data-testid="${attrs['data-testid']}"]`,
      confidence: 100
    };
  }

  // id (if not auto-generated)
  if (attrs.id && !attrs.id.match(/^[a-z0-9-_]{8,}$/i)) {
    return {
      selector: `#${attrs.id}`,
      confidence: 95
    };
  }

  // name
  if (attrs.name) {
    return {
      selector: `${tag}[name="${attrs.name}"]`,
      confidence: 90
    };
  }

  // class
  if (attrs.class) {
    const classParts = attrs.class
      .split(/\s+/)
      .filter(c => c && !c.match(/^\d+$/) && c.length > 1)
      .slice(0, 2)
      .map(c => `.${c}`);
    if (classParts.length > 0) {
      return {
        selector: `${tag}${classParts.join('')}`,
        confidence: 80
      };
    }
  }

  // role
  if (attrs.role) {
    return {
      selector: `${tag}[role="${attrs.role}"]`,
      confidence: 70
    };
  }

  // fallback
  return {
    selector: tag,
    confidence: 40
  };
}
