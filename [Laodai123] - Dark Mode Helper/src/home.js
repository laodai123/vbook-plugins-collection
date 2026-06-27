(function(){
  const css = `
    body, html { background:#0d1117 !important; color:#c9d1d9 !important; }
    a { color:#58a6ff !important; }
    img { filter:brightness(0.8) !important; }
    ::-webkit-scrollbar { width:12px; }
    ::-webkit-scrollbar-track { background:#0d1117; }
    ::-webkit-scrollbar-thumb { background:#58a6ff; border-radius:6px; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();