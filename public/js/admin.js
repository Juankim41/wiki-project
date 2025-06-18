// 📄 문서 목록 불러오기
fetch('/data/articles.json')
  .then(res => res.json())
  .then(articles => {
    const tbody = document.getElementById('docList');
    tbody.innerHTML = '';

    articles
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // 최신순 정렬
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


// 🗑 문서 삭제
window.deleteArticle = function (slug) {
  if (!confirm(`"${slug}" 문서를 삭제하시겠습니까?`)) return;

  fetch(`/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug })
  })
    .then(res => {
      if (res.ok) {
        alert('삭제 완료');
        location.reload();
      } else {
        res.text().then(msg => alert('삭제 실패: ' + msg));
      }
    })
    .catch(err => alert('삭제 요청 실패: ' + err.message));
};


// ✏️ 문서 편집 이동
window.editArticle = function (slug) {
  location.href = `admin.html?slug=${slug}`;
};


// ✍️ 편집 모드 감지
const params = new URLSearchParams(window.location.search);
const slug = params.get('slug');

if (slug) {
    fetch(`/data/docs/${slug}.html`)
      .then(res => res.text())
      .then(html => {
        document.getElementById('title').value = decodeURIComponent(slug.replace(/-/g, ' '));
        document.getElementById('markdown').value = htmlToMarkdown(html);
        document.getElementById('saveBtn').textContent = '✏️ 수정하기';
  
        // 🔽 날짜 정보를 articles.json에서 가져와서 date 필드에 설정
        return fetch('/data/articles.json');
      })
      .then(res => res.json())
      .then(articles => {
        const article = articles.find(a => a.slug === slug);
        if (article && article.date) {
          document.getElementById('date').value = article.date;
        }
      });
  }



// 💾 저장 처리 (등록 & 수정 겸용)
document.getElementById('saveBtn').addEventListener('click', () => {
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const markdown = document.getElementById('markdown').value;
  const html = marked.parse(markdown);

  if (!title || !date || !markdown) {
    alert('모든 항목을 입력해주세요.');
    return;
  }

  const slugToUse = slug || title.replace(/\s+/g, '-');

  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: slugToUse,
      title,
      date,
      html
    })
  })
    .then(res => {
      if (res.ok) {
        alert(slug ? '수정 완료' : '등록 완료');
        location.href = 'admin.html';
      } else {
        res.text().then(msg => alert('저장 실패: ' + msg));
      }
    })
    .catch(err => alert('요청 실패: ' + err.message));
});


// 🔁 HTML → Markdown 변환 함수 (간단 버전)
function htmlToMarkdown(html) {
  return html
    .replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
    .replace(/<ul>\s*([\s\S]*?)\s*<\/ul>/g, (_, list) =>
      list.replace(/<li>(.*?)<\/li>/g, '- $1\n')
    )
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/?[^>]+(>|$)/g, ''); // 나머지 태그 제거
}
