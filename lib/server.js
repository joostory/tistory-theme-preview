// Tistory Theme Live Preview Server
const express = require('express');
const fs = require('fs');
const path = require('path');
const { compile } = require('./parser');
const { getMergedMockData } = require('./mock_data');
const { loadIndexXml } = require('./xml_parser');

function startServer(config) {
  const app = express();
  const PORT = config.port || 3000;
  const skinDir = config.skinDir;
  const skinHtmlPath = config.skinHtmlPath;
  const indexXmlPath = config.indexXmlPath;
  const styleCssPath = config.styleCssPath;
  const imagesDir = config.imagesDir;

  // Track connected SSE clients for live reload
  const liveReloadClients = [];

  // Watch for file changes
  const watchPaths = [skinHtmlPath, styleCssPath, indexXmlPath, imagesDir].filter(p => p && fs.existsSync(p));
  let reloadTimeout = null;

  watchPaths.forEach(targetPath => {
    try {
      fs.watch(targetPath, { recursive: true }, (eventType, filename) => {
        if (reloadTimeout) clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
          console.log(`[tistory-theme-preview] 변경 감지 (${filename || path.basename(targetPath)}) -> 라이브 리로드 전송`);
          liveReloadClients.forEach(client => {
            client.res.write('data: reload\n\n');
          });
        }, 150);
      });
    } catch (e) {
      // Ignore watch setup error on unsupported files
    }
  });

  // 1. Static asset serving
  app.use(express.static(skinDir));
  if (fs.existsSync(imagesDir)) {
    app.use('/images', express.static(imagesDir));
    app.use('./images', express.static(imagesDir));
  }
  app.use('/css', express.static(path.join(skinDir, 'css')));
  app.use('/js', express.static(path.join(skinDir, 'js')));

  // Directly serve style.css if requested
  app.get('/style.css', (req, res, next) => {
    if (fs.existsSync(styleCssPath)) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      return res.sendFile(styleCssPath);
    }
    next();
  });

  // 2. Smart Asset Replacer: redirects remote CDNs to matching local files
  function applySmartAssetReplacements(html) {
    const assetRegex = /(href|src)=["'](https?:\/\/[^"']+\.(css|js|png|jpg|jpeg|gif|svg|webp))["']/g;

    return html.replace(assetRegex, (match, attr, url, ext) => {
      const filename = path.basename(url);

      const checkPaths = [
        path.join(imagesDir, filename),
        path.join(skinDir, filename),
        path.join(skinDir, ext === 'css' ? 'css' : 'js', filename)
      ];

      for (const checkPath of checkPaths) {
        if (fs.existsSync(checkPath)) {
          console.log(`[tistory-theme-preview] 원격 에셋 [${filename}] 을 로컬 파일로 실시간 우회 서빙합니다.`);
          if (checkPath.startsWith(imagesDir)) {
            return `${attr}="/images/${filename}"`;
          } else {
            return `${attr}="/${filename}"`;
          }
        }
      }

      return match;
    });
  }

  // 3. API: Skin information and variables from index.xml
  app.get('/api/skin-info', (req, res) => {
    try {
      const xmlData = loadIndexXml(skinDir);
      res.json({
        hasIndexXml: !!xmlData,
        data: xmlData || {}
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // 4. API: Live Reload SSE endpoint
  app.get('/api/live-reload', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const client = { id: Date.now(), res };
    liveReloadClients.push(client);

    req.on('close', () => {
      const idx = liveReloadClients.findIndex(c => c.id === client.id);
      if (idx !== -1) liveReloadClients.splice(idx, 1);
    });
  });

  // 5. Dashboard UI endpoint
  app.get('/', (req, res) => {
    const dashboardPath = path.join(__dirname, '../dashboard.html');
    if (fs.existsSync(dashboardPath)) {
      res.sendFile(dashboardPath);
    } else {
      res.status(404).send('Preview Dashboard HTML이 존재하지 않습니다.');
    }
  });

  // 6. Theme live compile & render endpoint
  app.get('/render', (req, res) => {
    if (!fs.existsSync(skinHtmlPath)) {
      return res.status(404).send(`<h3>스킨 HTML 파일을 찾을 수 없습니다: ${skinHtmlPath}</h3>`);
    }

    try {
      let skinHTML = fs.readFileSync(skinHtmlPath, 'utf-8');

      // Smart asset replacements
      skinHTML = applySmartAssetReplacements(skinHTML);

      // Replace [##_image_path_##] with /images
      skinHTML = skinHTML.replace(/\[##_image_path_##\]/g, '/images');

      // Load merged mock data
      const mockData = getMergedMockData(skinDir);
      const query = req.query;

      // Prepare active variables
      const activeVariables = { ...(mockData.blog.variables || {}) };

      // Load index.xml defaults if available
      const xmlData = loadIndexXml(skinDir);
      if (xmlData && xmlData.variables) {
        xmlData.variables.forEach(v => {
          if (activeVariables[v.name] === undefined && v.default !== undefined) {
            activeVariables[v.name] = v.default;
          }
        });
      }

      // Query overrides for variables
      Object.keys(query).forEach(k => {
        if (!['viewType', 'enableCovers', 'listStyle', 'q', 'category', 'tag', 'postId', 'page'].includes(k)) {
          activeVariables[k] = query[k];
        }
      });

      // View type determination
      const viewType = query.viewType || 'index';
      const enableCovers = query.enableCovers !== 'false' && query.enableCovers !== '0';
      const listStyle = query.listStyle || (xmlData && xmlData.default && xmlData.default.liststyle) || 'list';
      const currentPage = parseInt(query.page, 10) || 1;

      let activePosts = [...mockData.posts];
      let searchQuery = query.q || '';
      let currentCategory = query.category || '';
      let currentTag = query.tag || '';

      if (viewType === 'search') {
        searchQuery = query.q !== undefined ? query.q : 'CSS';
        activePosts = mockData.posts.filter(p => {
          const matchTitle = p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase());
          const matchSummary = p.summary && p.summary.toLowerCase().includes(searchQuery.toLowerCase());
          const matchDesc = p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase());
          return matchTitle || matchSummary || matchDesc;
        });
      } else if (viewType === 'category') {
        currentCategory = query.category || '웹 개발';
        activePosts = mockData.posts.filter(p => p.category && p.category.includes(currentCategory));
      } else if (viewType === 'tag') {
        currentTag = query.tag || 'React';
        activePosts = mockData.posts.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === currentTag.toLowerCase()));
      } else if (viewType === 'permalink') {
        const postId = query.postId || '1';
        const target = mockData.posts.find(p => p.id === postId);
        activePosts = target ? [target] : (mockData.posts.length > 0 ? [mockData.posts[0]] : []);
      }

      // Context construction
      const context = {
        viewType,
        page: currentPage,
        currentPage,
        totalPages: 123,
        enableCovers,
        listStyle,
        searchQuery,
        currentCategory,
        currentTag,
        blog: {
          ...mockData.blog,
          variables: activeVariables
        },
        activeVariables,
        posts: activePosts,
        currentPost: activePosts[0] || null,
        notices: mockData.notices,
        currentNotice: mockData.notices[0] || null,
        protectedPost: mockData.protectedPost,
        pages: mockData.pages,
        guestbook: mockData.guestbook,
        tags: mockData.tags,
        covers: mockData.covers
      };

      // AST compilation
      let renderedHTML = compile(skinHTML, context);

      // Inject live reload script
      const liveReloadScript = `
        <!-- Injected by tistory-theme-preview -->
        <script>
          (function() {
            if (window.EventSource) {
              var es = new EventSource('/api/live-reload');
              es.onmessage = function(e) {
                if (e.data === 'reload') {
                  console.log('[tistory-theme-preview] 변경 감지 -> 실시간 갱신');
                  location.reload();
                }
              };
            }
          })();
        </script>
      `;

      if (renderedHTML.includes('</body>')) {
        renderedHTML = renderedHTML.replace('</body>', `${liveReloadScript}</body>`);
      } else {
        renderedHTML += liveReloadScript;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(renderedHTML);
    } catch (error) {
      console.error('[tistory-theme-preview] 렌더링 에러:', error);
      res.status(500).send(`<h1>스킨 렌더링 중 에러 발생</h1><pre>${error.stack}</pre>`);
    }
  });

  app.listen(PORT, () => {
    console.log(`\n\x1b[38;2;255;86;56m==================================================\x1b[0m`);
    console.log(`\x1b[1m ✦ Tistory Theme Live Preview Suite ✦ \x1b[0m`);
    console.log(`\x1b[36m - 스킨 디렉토리: ${skinDir}\x1b[0m`);
    console.log(`\x1b[36m - 템플릿 파일:   ${skinHtmlPath}\x1b[0m`);
    if (fs.existsSync(indexXmlPath)) {
      console.log(`\x1b[36m - 정보 파일(XML): ${indexXmlPath}\x1b[0m`);
    }
    console.log(`\x1b[33m - 대시보드 주소: http://localhost:${PORT}\x1b[0m`);
    console.log(`\x1b[38;2;255;86;56m==================================================\x1b[0m\n`);
  });
}

module.exports = {
  startServer
};
