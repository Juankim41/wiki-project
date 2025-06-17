fetch('data/articles.json')
  .then(res => res.json())
  .then(posts => {
    // 날짜 기준 내림차순 정렬
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const list = document.getElementById('post-list');
    posts.forEach(post => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${post.file}">${post.title}</a> <small>(${post.date})</small>`;
      list.appendChild(li);
    });
  });
