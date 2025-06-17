const preview = document.getElementById('preview');
const mdInput = document.getElementById('markdown');

// ✅ 실시간 마크다운 미리보기 렌더링
mdInput.addEventListener('input', () => {
  const md = mdInput.value;

  // footnote 정의 추출
  const footnotes = {};
  const footnotePattern = /\[\^(\d+)\]:\s*(.+)/g;
  let match;
  while ((match = footnotePattern.exec(md)) !== null) {
    footnotes[match[1]] = match[2];
  }

  // 정의부 제거
  const cleanedMd = md.replace(footnotePattern, '');

  // 마크다운 렌더링 후 footnote 참조 치환
  let rendered = marked.parse(cleanedMd);
  rendered = rendered.replace(/\[\^(\d+)\]/g, (_, id) => {
    const tip = footnotes[id] || 'No tooltip';
    return `<sup class="footnote-ref" data-tooltip="${tip}">[${id}]</sup>`;
  });

  preview.innerHTML = rendered;
});

// ✅ 저장 버튼 클릭 시 HTML 생성 및 저장 처리
document.getElementById('saveBtn').addEventListener('click', async () => {
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const md = mdInput.value;
  const slug = title.toLowerCase().replace(/\s+/g, '-');

  if (!title || !date || !md) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  // footnote 정의 추출
  const footnotes = {};
  const footnotePattern = /\[\^(\d+)\]:\s*(.+)/g;
  let match;
  while ((match = footnotePattern.exec(md)) !== null) {
    footnotes[match[1]] = match[2];
  }

  // 정의부 제거
  const cleanedMd = md.replace(footnotePattern, '');

  // 마크다운 렌더링 후 footnote 참조 치환
  let htmlContent = marked.parse(cleanedMd);
  htmlContent = htmlContent.replace(/\[\^(\d+)\]/g, (_, id) => {
    const tip = footnotes[id] || 'No tooltip';
    return `<sup class="footnote-ref" data-tooltip="${tip}">[${id}]</sup>`;
  });

  // ✅ header/footer 및 tooltip.js 내용 fetch
  let header = '', footer = '', tooltipJs = '';
  try {
    const [headerHtml, footerHtml, tooltipScript] = await Promise.all([
      fetch('/components/header.html').then(res => res.text()),
      fetch('/components/footer.html').then(res => res.text()),
      fetch('/js/tooltip.js').then(res => res.text())
    ]);
    header = headerHtml;
    footer = footerHtml;
    tooltipJs = tooltipScript;
  } catch (err) {
    alert('⚠️ header/footer 또는 JS 불러오기 실패');
    return;
  }

  // ✅ 최종 저장될 HTML
  const fullHtml = `
  <!DOCTYPE html>
  <html lang="ko">
  <head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="../css/style.css">
  </head>
  <body>
    <div id="header"></div>
  
    <main>
      <h1>${title}</h1>
      <p><em>${date}</em></p>
      ${htmlContent}
    </main>
  
    <div id="tooltip" class="tooltip"></div>
    <div id="footer"></div>
  
    <script>
      fetch('../components/header.html').then(res => res.text()).then(html => {
        document.getElementById('header').innerHTML = html;
      });
      fetch('../components/footer.html').then(res => res.text()).then(html => {
        document.getElementById('footer').innerHTML = html;
      });
    </script>
    <script src="../js/tooltip.js"></script>
  </body>
  </html>
  `;

  // ✅ 서버에 저장 요청
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug,
      title,
      date,
      html: fullHtml
    })
  }).then(res => {
    if (res.ok) {
      alert('저장 완료!');
      location.href = '/';
    } else {
      alert('저장 실패');
    }
  });
});
