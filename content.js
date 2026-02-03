(function () {

  const CONFIG = {
    relevantStyles: [
      'background-color', 'color', 'font-family', 'font-size', 'font-weight',
      'border-radius', 'box-shadow', 'display', 'grid-template-columns',
      'flex-direction', 'justify-content', 'align-items', 'gap',
      'position', 'overflow', 'opacity'
    ],
    ignoredTags: ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'META', 'LINK', 'HEAD', 'PATH', 'BR', 'HR', 'SVG'],
    interactiveTags: ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL']
  };

  const LEGEND = {
    t: "tag",
    m: "meta (id, class, interactive)",
    s: "styles",
    g: "geometry (width x height)",
    p: "position (x,y)",
    x: "text content",
    k: "kids (children)",
    a: "animation/motion"
  };

  function getRect(el) {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }

  function isVisible(el, rect) {
    if (el.nodeType !== Node.ELEMENT_NODE) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    if (rect.w < 5 && rect.h < 5) return false;
    return true;
  }

  function cleanStyleVal(val) {
    if (!val) return null;
    if (val.includes('px')) {
      return val.replace(/(\d+)\.\d+px/g, "$1px");
    }
    if (val.includes('rgba')) {
      return val.replace(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*1)?\)/g, "rgb($1,$2,$3)");
    }
    return val;
  }

  function analyzeNode(element) {
    if (!element || CONFIG.ignoredTags.includes(element.tagName)) return null;

    const rect = getRect(element);
    if (!isVisible(element, rect)) return null;

    const computedStyle = window.getComputedStyle(element);

    const m = {};
    if (element.id) m.id = element.id;
    if (element.className && typeof element.className === 'string') {
      const cls = element.className.trim();
      if (cls) m.c = cls.length > 30 ? cls.substring(0, 30) + '...' : cls;
    }

    if (CONFIG.interactiveTags.includes(element.tagName) || element.onclick || element.getAttribute('role') === 'button') {
      m.i = true;
      if (element.tagName === 'A') m.h = "LINK";
    }

    if (rect.w > 50 && rect.h > 50) {
      m.g = `${rect.w}x${rect.h}`;
      if (computedStyle.position === 'fixed' || computedStyle.position === 'absolute') {
        m.p = `${rect.x},${rect.y}`;
      }
    }

    const s = {};
    CONFIG.relevantStyles.forEach(prop => {
      const val = computedStyle.getPropertyValue(prop);
      if (val && val !== '0px' && val !== 'none' && val !== 'normal' && val !== 'auto' && !val.includes('rgba(0, 0, 0, 0)')) {
        s[prop] = cleanStyleVal(val);
      }
    });

    let x = '';
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) x += node.textContent.trim() + ' ';
    });
    x = x.trim();
    if (x.length > 40) x = x.substring(0, 40) + '..';

    const k = [];
    if (element.children) {
      Array.from(element.children).forEach(child => {
        const res = analyzeNode(child);
        if (res) k.push(res);
      });
    }

    const hasMeta = Object.keys(m).length > 0;
    const hasStyles = Object.keys(s).length > 0;

    if (element.tagName === 'DIV' && !hasMeta && !hasStyles && !x && k.length > 0) {
      if (k.length === 1) return k[0];
      return { ghost: true, k: k };
    }
    if (!hasMeta && !hasStyles && !x && k.length === 0) return null;
    if (k.some(kid => kid.ghost)) {
      const flattenedKids = [];
      k.forEach(kid => {
        if (kid.ghost) flattenedKids.push(...kid.k);
        else flattenedKids.push(kid);
      });
      k.length = 0;
      k.push(...flattenedKids);
    }

    return {
      t: element.tagName.toLowerCase(),
      m: hasMeta ? m : undefined,
      s: hasStyles ? s : undefined,
      x: x || undefined,
      k: k.length ? k : undefined
    };
  }

  const rootTree = analyzeNode(document.body);

  const finalOutput = {
    _AI_INSTRUCTIONS: "This JSON describes a website layout. Use the legend to decode keys.",
    _LEGEND: LEGEND,
    _VIBE: {
      title: document.title,
      font: window.getComputedStyle(document.body).fontFamily.split(',')[0],
      bg: window.getComputedStyle(document.body).backgroundColor
    },
    tree: rootTree
  };

  window.__skeletonizerData = finalOutput;

  const jsonString = JSON.stringify(finalOutput, null, 0);

  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mini-skeleton-${document.title.replace(/[^a-z0-9]/gi, '_').substring(0, 15)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
})();