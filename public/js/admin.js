// 문서 목록 불러오기
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


// 문서 삭제
window.deleteArticle = function (slug) {
    if (!confirm(`\"${slug}\" 문서를 삭제하시겠습니까?`)) return;
  
    fetch(`/delete`, {
      method: 'POST', // ✅ 서버에서 DELETE가 안되면 POST로 대체
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

// 문서 편집 이동
window.editArticle = function (slug) {
  location.href = `/edit?slug=${slug}`; // 추후 구현될 편집 페이지
};
