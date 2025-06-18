const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// ✅ '/data/docs' 라우트를 '/public/docs'로 연결
app.use('/data/docs', express.static(path.join(__dirname, 'public/docs')));

// ✅ 저장 API
app.post('/save', (req, res) => {
  const { slug, title, date, html } = req.body;

  // 저장할 HTML 파일 경로
  const docPath = path.join(__dirname, 'public', 'docs', `${slug}.html`);

  // 게시글 목록 JSON 파일 경로
  const postsPath = path.join(__dirname, 'public', 'data', 'article.json');

  // HTML 파일 저장
  fs.writeFileSync(docPath, html, 'utf-8');

  // 기존 포스트 목록 불러오기
  let posts = [];
  if (fs.existsSync(postsPath)) {
    posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));
  }

  // 새 포스트 정보 추가 (중복 제거)
  const newPost = { slug, title, date };
  posts = posts.filter(post => post.slug !== slug); // 중복 방지
  posts.unshift(newPost); // 최신순 정렬

  // 포스트 목록 저장
  fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf-8');

  res.json({ success: true });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
