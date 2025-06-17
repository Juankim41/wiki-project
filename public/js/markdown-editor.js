const preview = document.getElementById('preview');
const mdInput = document.getElementById('markdown');

// ✅ 실시간 마크다운 미리보기 렌더링
mdInput.addEventListener('input', () => {
  const md = mdInput.value;
  const rendered = marked.parse(md).replace(/\^\[(.*?)\]/g, (_, tip) =>
    `<sup class="footnote-ref" data-tooltip="${tip}">[?]</sup>`
  );
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

  const htmlContent = marked.parse(md).replace(/\^\[(.*?)\]/g, (_, tip) =>
    `<sup class="footnote-ref" data-tooltip="${tip}">[?]</sup>`
  );

  // ✅ header/footer 및 tooltip.js 내용을 모두 fetch
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

  // ✅ 최종 저장될 HTML (정적 HTML 완성형)
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

  // 🔽 문서 목록 불러오기
fetch('/data/articles.json')
.then(res => res.json())
.then(articles => {
  const tbody = document.getElementById('docList');
  tbody.innerHTML = '';

  articles
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // 최신순
    .forEach(article => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${article.title}</td>
        <td>${article.date}</td>
        <td>${article.slug}</td>
        <td><button onclick="editArticle('${article.slug}')">편집</button></td>
        <td><button onclick="deleteArticle('${article.slug}')">삭제</button></td>
      `;
      tbody.appendChild(tr);
    });
});

// 🔽 삭제 기능
function deleteArticle(slug) {
if (!confirm(`"${slug}" 문서를 삭제하시겠습니까?`)) return;

fetch(`/delete?slug=${slug}`, { method: 'DELETE' })
  .then(res => {
    if (res.ok) {
      alert('삭제 완료');
      location.reload();
    } else {
      alert('삭제 실패');
    }
  });
}

// 🔽 편집 이동 (예정)
function editArticle(slug) {
location.href = `/edit?slug=${slug}`; // 향후 편집 페이지로 연결
}


});
