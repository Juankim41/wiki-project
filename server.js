const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// ✅ Render 환경 대응 포트 설정
const PORT = process.env.PORT || 3000;

// ✅ 정적 파일 라우팅
app.use(express.static('public'));
app.use(express.json());

// ✅ 경로 상수
const ARTICLES_PATH = path.join(__dirname, 'public', 'data', 'articles.json');
const DOCS_DIR = path.join(__dirname, 'public', 'docs');

// ✅ articles.json 읽기
function readArticles() {
  if (!fs.existsSync(ARTICLES_PATH)) return [];
  return JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'));
}

// ✅ articles.json 저장
function writeArticles(articles) {
  fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), 'utf-8');
}

// ✅ 저장 API
app.post('/save', (req, res) => {
  const { slug, title, date, html } = req.body;
  if (!slug || !title || !date || !html) {
    return res.status(400).send('필수 값 누락');
  }

  try {
    // HTML 파일 저장
    const docPath = path.join(DOCS_DIR, `${slug}.html`);
    fs.writeFileSync(docPath, html, 'utf-8');

    // articles 목록 갱신
    let articles = readArticles();
    articles = articles.filter(article => article.slug !== slug); // 중복 제거
    articles.unshift({
      title,
      date,
      slug,
      file: `docs/${slug}.html`
    });

    writeArticles(articles);

    res.status(200).send('Saved');
  } catch (err) {
    console.error('❌ 저장 오류:', err);
    res.status(500).send('저장 실패');
  }
});

// ✅ 삭제 API
app.post('/delete', (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).send('slug 누락');

  try {
    // HTML 문서 삭제
    const docPath = path.join(DOCS_DIR, `${slug}.html`);
    if (fs.existsSync(docPath)) {
      fs.unlinkSync(docPath);
    }

    // articles.json 목록 수정
    let articles = readArticles();
    articles = articles.filter(article => article.slug !== slug);
    writeArticles(articles);

    res.status(200).send('삭제 완료');
  } catch (err) {
    console.error('❌ 삭제 오류:', err);
    res.status(500).send('삭제 실패');
  }
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
