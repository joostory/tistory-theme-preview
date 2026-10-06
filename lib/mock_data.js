// Tistory Theme Live Preview Mock Data Engine
const fs = require('fs');
const path = require('path');

const defaultBlogMeta = {
  Title: "개발자의 정원 (Tistory DevSuite)",
  Desc: "최신 웹 표준과 반응형 디자인으로 구축하는 티스토리 커스텀 스킨 실시간 프리뷰어입니다.",
  Blogger: "Joo",
  BlogLink: "/",
  RssUrl: "/rss",
  TaglogLink: "/tag",
  GuestbookLink: "/guestbook",
  Image: "https://images.unsplash.com/photo-1534972195531-a756b1140f6c?auto=format&fit=crop&w=400&q=80",
  BlogImage: '<img src="https://images.unsplash.com/photo-1534972195531-a756b1140f6c?auto=format&fit=crop&w=400&q=80" alt="블로그 이미지" />',
  BlogMenu: `
    <ul class="tt_category">
      <li><a href="/">홈</a></li>
      <li><a href="/category/Tech">개발 (Tech)</a></li>
      <li><a href="/category/Design">디자인 (Design)</a></li>
      <li><a href="/notice">공지사항</a></li>
      <li><a href="/guestbook">방명록</a></li>
    </ul>
  `,
  RevenueUpper: '<div class="tistory_revenue_ad" style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.15);padding:14px;text-align:center;font-size:12px;color:#94a3b8;margin:12px 0;">[티스토리 상단 광고 치환 영역]</div>',
  RevenueLower: '<div class="tistory_revenue_ad" style="background:rgba(255,255,255,0.04);border:1px dashed rgba(255,255,255,0.15);padding:14px;text-align:center;font-size:12px;color:#94a3b8;margin:12px 0;">[티스토리 하단 광고 치환 영역]</div>',
  CountTotal: "128,450",
  CountToday: "1,520",
  CountYesterday: "2,380",
  CategoryHtml: `
    <ul class="tt_category">
      <li class="">
        <a class="link_tit" href="/category">분류 전체보기 <span class="c_cnt">(15)</span></a>
        <ul class="sub_category_list">
          <li class="">
            <a class="link_item" href="/category/Tech">웹 개발 <span class="c_cnt">(8)</span></a>
            <ul class="sub_category_list">
              <li class=""><a class="link_sub_item" href="/category/Tech/Frontend">프론트엔드 <span class="c_cnt">(5)</span></a></li>
              <li class=""><a class="link_sub_item" href="/category/Tech/Backend">백엔드 <span class="c_cnt">(3)</span></a></li>
            </ul>
          </li>
          <li class="">
            <a class="link_item" href="/category/Design">UI/UX 디자인 <span class="c_cnt">(4)</span></a>
          </li>
          <li class="">
            <a class="link_item" href="/category/Life">일상 &amp; 에세이 <span class="c_cnt">(3)</span></a>
          </li>
        </ul>
      </li>
    </ul>
  `,
  // Skin option variables default fallback
  variables: {
    "point-color": "#ff5638",
    "cover-image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    "scroll-load": "true",
    "theme-mode": "dark"
  }
};

const defaultPosts = [
  {
    id: "1",
    link: "/1",
    title: "React 19와 CSS Modern Features로 완성하는 인터랙티브 웹 디자인",
    category: "웹 개발/프론트엔드",
    categoryLink: "/category/Tech/Frontend",
    date: "2026. 10. 5. 14:30",
    simpleDate: "2026. 10. 5.",
    year: "2026",
    month: "10",
    day: "05",
    hour: "14",
    minute: "30",
    second: "15",
    author: "Joo",
    summary: "웹 컴포넌트 생태계의 비약적 발전과 CSS의 현대적 기능들(Container Queries, :has(), View Transitions)을 조합해 최고의 사용자 경험을 설계하는 실전 가이드를 공유합니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    rawThumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
    desc: `
      <p>오늘날 웹 개발 환경은 과거 그 어느 때보다 역동적으로 진화하고 있습니다. 브라우저의 기본 기능만으로도 과거에는 무거운 자바스크립트 라이브러리가 필요했던 인터랙션을 가볍고 유려하게 구현할 수 있게 되었습니다.</p>
      
      <h3>1. 최신 웹 기술의 핵심 이점</h3>
      <p>이번 프로젝트에서 주목한 요소는 다음과 같습니다:</p>
      <ul>
        <li><b>View Transitions API</b>: 페이지 전환 시 부드러운 앱 수준의 애니메이션 제공</li>
        <li><b>CSS Container Queries</b>: 뷰포트가 아닌 부모 컨테이너 크기에 반응하는 진정한 모듈형 UI</li>
        <li><b>CSS :has() 선택자</b>: 상위 요소 상태를 스타일링할 수 있는 강력한 부모 선택자</li>
      </ul>

      <blockquote>
        "웹 기술의 본질은 접근성과 유연함에 있습니다. 도구가 발전할수록 우리는 더 본질적인 사용자 경험에 집중할 수 있습니다."
      </blockquote>

      <h3>2. 코드 예시</h3>
      <p>아래는 테마에서 사용된 컨테이너 쿼리 예시 코드입니다:</p>
      <pre><code class="language-css">@container post-card (min-width: 480px) {
  .card-layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1.5rem;
  }
}</code></pre>

      <p>위와 같이 깔끔한 CSS로 복잡한 미디어 쿼리 없이도 카드 컴포넌트를 반응형으로 배치할 수 있습니다.</p>
    `,
    tags: ["React", "CSS", "Frontend", "Web Standards"],
    commentCount: 3,
    comments: [
      {
        id: "c1",
        name: "김프론트",
        date: "2026. 10. 5. 15:10",
        desc: "CSS :has() 선택자 활용법이 정말 흥미롭네요! 실무에 바로 적용해 보려고 합니다.",
        logo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80",
        link: "#c1",
        replies: [
          {
            id: "c1-1",
            name: "Joo",
            date: "2026. 10. 5. 15:35",
            desc: "도움이 되셨다니 기쁩니다! 특히 폼 검증 상태나 서브 메뉴 토글 시 CSS 코드량이 대폭 줄어듭니다.",
            logo: "https://images.unsplash.com/photo-1534972195531-a756b1140f6c?auto=format&fit=crop&w=80&q=80",
            link: "#c1-1",
            isAdmin: true
          }
        ]
      },
      {
        id: "c2",
        name: "이디자인",
        date: "2026. 10. 5. 16:20",
        desc: "테마 레이아웃과 타이포그래피가 정말 아름답습니다. 글 잘 읽었습니다!",
        logo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
        link: "#c2",
        replies: []
      }
    ]
  },
  {
    id: "2",
    link: "/2",
    title: "Tistory 스킨 개발 완벽 가이드: 치환자 엔진 분석과 최적화",
    category: "웹 개발/프론트엔드",
    categoryLink: "/category/Tech/Frontend",
    date: "2026. 10. 4. 11:15",
    simpleDate: "2026. 10. 4.",
    year: "2026",
    month: "10",
    day: "04",
    hour: "11",
    minute: "15",
    second: "00",
    author: "Joo",
    summary: "티스토리의 그룹 치환자와 값 치환자 동작 원리, 홈 커버 구성, 스킨 옵션 변수 설정 기법을 상세히 분석합니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
    rawThumbnailUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    desc: `
      <p>티스토리 스킨은 고유의 치환자 마크업 문법을 사용합니다. 스킨 파일 구조는 <code>skin.html</code>, <code>style.css</code>, <code>index.xml</code>로 구성되며, 로컬에서 빠른 테스트 환경을 구축하는 것이 생산성에 지대한 영향을 미칩니다.</p>
      <p>본 포스트에서는 스킨 옵션과 홈 커버를 유연하게 제어하는 베스트 프랙티스를 소개합니다.</p>
    `,
    tags: ["Tistory", "Skin", "TemplateEngine"],
    commentCount: 1,
    comments: [
      {
        id: "c3",
        name: "스킨마스터",
        date: "2026. 10. 4. 13:00",
        desc: "로컬 프리뷰 도구가 절실했는데 정말 유용한 정리입니다!",
        logo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&q=80",
        link: "#c3",
        replies: []
      }
    ]
  },
  {
    id: "3",
    link: "/3",
    title: "미니멀리즘과 다크모드를 조화롭게 녹여낸 UI 디자인 시스템",
    category: "UI/UX 디자인",
    categoryLink: "/category/Design",
    date: "2026. 10. 3. 18:40",
    simpleDate: "2026. 10. 3.",
    year: "2026",
    month: "10",
    day: "03",
    hour: "18",
    minute: "40",
    second: "22",
    author: "Joo",
    summary: "시각적 피로도를 낮추고 콘텐츠 몰입감을 극대화하는 다크모드 색상 팔레트와 폰트 크기 계층 구조를 설계합니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    rawThumbnailUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8",
    desc: `
      <p>단순히 배경을 검정색(#000000)으로 바꾸는 것만으로는 훌륭한 다크모드가 될 수 없습니다. 눈의 피로를 최소화하기 위한 명도 대비율과 미세한 그레이스케일 톤앤매너 조율이 필요합니다.</p>
    `,
    tags: ["Design", "DarkMode", "Minimalism", "UI/UX"],
    commentCount: 0,
    comments: []
  },
  {
    id: "4",
    link: "/4",
    title: "성공적인 개발 습관과 번아웃을 예방하는 워크플로우 회고",
    category: "일상 & 에세이",
    categoryLink: "/category/Life",
    date: "2026. 09. 29. 21:00",
    simpleDate: "2026. 09. 29.",
    year: "2026",
    month: "09",
    day: "29",
    hour: "21",
    minute: "00",
    second: "10",
    author: "Joo",
    summary: "꾸준히 코드를 작성하면서도 지치지 않는 멘탈 관리법과 개인 프로젝트 완주 팁을 돌아봅니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
    rawThumbnailUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
    desc: `
      <p>몰입과 휴식의 리듬을 찾는 것은 장기적인 엔지니어링 커리어에서 가장 중요한 능력 중 하나입니다. 작은 성취를 꾸준히 기록하는 습관이 큰 변화를 만듭니다.</p>
    `,
    tags: ["Life", "Essay", "Productivity"],
    commentCount: 2,
    comments: []
  },
  {
    id: "5",
    link: "/5",
    title: "Node.js 고성능 비동기 아키텍처와 경량 서버 설계 패턴",
    category: "웹 개발/백엔드",
    categoryLink: "/category/Tech/Backend",
    date: "2026. 09. 25. 16:10",
    simpleDate: "2026. 09. 25.",
    year: "2026",
    month: "09",
    day: "25",
    hour: "16",
    minute: "10",
    second: "45",
    author: "Joo",
    summary: "이벤트 루프의 특성을 극대화하여 마이크로서비스 및 CLI 도구에서 최고의 응답성을 끌어내는 패턴을 분석합니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    rawThumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    desc: `
      <p>가벼운 도구일수록 기동 속도와 메모리 점유율이 중요합니다. zero-config 원칙을 준수하면서도 확장성을 확보하는 아키텍처 설계법을 살펴봅니다.</p>
    `,
    tags: ["NodeJS", "Backend", "Architecture"],
    commentCount: 0,
    comments: []
  }
];

const defaultNotices = [
  {
    id: "notice-1",
    link: "/notice/1",
    title: "[공지] 2026년 티스토리 테마 프리뷰 스위트(tistory-theme-preview) 배포 안내",
    date: "2026. 10. 01. 10:00",
    simpleDate: "2026. 10. 01.",
    year: "2026",
    month: "10",
    day: "01",
    hour: "10",
    minute: "00",
    second: "00",
    author: "관리자",
    summary: "티스토리 커스텀 스킨을 로컬에서 브라우저 확장이나 서버 배포 없이 완벽하게 테스트할 수 있는 프리뷰어가 공개되었습니다.",
    thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    desc: `
      <p>안녕하세요, 블로그 관리자입니다.</p>
      <p>티스토리 스킨 제작자분들의 개발 경험을 획기적으로 향상시키기 위해 무설정 로컬 프리뷰어 <code>tistory-theme-preview</code>를 배포합니다.</p>
      <p>앞으로도 다양한 테마와 편의 기능을 지속해서 업데이트할 예정이니 많은 관심 부탁드립니다.</p>
    `
  }
];

const defaultProtectedPost = {
  id: "protected-1",
  link: "/protected/1",
  title: "[보호글] 2026 비공개 프로젝트 기획안 및 보안 가이드",
  category: "웹 개발",
  categoryLink: "/category/Tech",
  date: "2026. 09. 28. 18:00",
  simpleDate: "2026. 09. 28.",
  year: "2026",
  month: "09",
  day: "28",
  hour: "18",
  minute: "00",
  second: "00",
  author: "Joo",
  passwordId: "entry1Password",
  dissolveCode: "alert('비밀번호 검증 성공');"
};

const defaultPages = [
  {
    id: "page-about",
    link: "/about",
    title: "소개 (About Me)",
    date: "2026. 01. 01. 00:00",
    simpleDate: "2026. 01. 01.",
    year: "2026",
    month: "01",
    day: "01",
    hour: "00",
    minute: "00",
    second: "00",
    author: "Joo",
    desc: `
      <h2>안녕하세요! 프론트엔드 엔지니어 Joo입니다.</h2>
      <p>웹 표준과 성능 최적화, 그리고 개발자 경험(DX)을 혁신하는 다양한 오픈소스 도구를 만들고 있습니다.</p>
      <p>문의사항이나 피드백은 방명록 또는 이메일(joostory@example.com)로 언제든지 남겨주세요.</p>
    `
  }
];

const defaultGuestbook = [
  {
    id: "g1",
    name: "방문자 A",
    date: "2026. 10. 04. 14:20",
    desc: "스킨 디자인이 너무 감각적이고 깔끔하네요! 모바일에서도 가독성이 훌륭합니다.",
    replies: [
      {
        id: "g1-1",
        name: "Joo",
        date: "2026. 10. 04. 14:50",
        desc: "좋게 봐주셔서 감사합니다! 앞으로도 유익한 내용 많이 기록하겠습니다 :)"
      }
    ]
  },
  {
    id: "g2",
    name: "웹개발 꿈나무",
    date: "2026. 10. 03. 19:10",
    desc: "블로그 글 보면서 많은 도움 얻고 있습니다. 늘 응원합니다!",
    replies: []
  }
];

const defaultTags = [
  { name: "React", link: "/tag/React", class: "cloud1" },
  { name: "CSS", link: "/tag/CSS", class: "cloud1" },
  { name: "Frontend", link: "/tag/Frontend", class: "cloud2" },
  { name: "Tistory", link: "/tag/Tistory", class: "cloud2" },
  { name: "TemplateEngine", link: "/tag/TemplateEngine", class: "cloud3" },
  { name: "JavaScript", link: "/tag/JavaScript", class: "cloud3" },
  { name: "DarkMode", link: "/tag/DarkMode", class: "cloud4" },
  { name: "Minimalism", link: "/tag/Minimalism", class: "cloud4" },
  { name: "NodeJS", link: "/tag/NodeJS", class: "cloud5" },
  { name: "Architecture", link: "/tag/Architecture", class: "cloud5" }
];

const defaultCoverData = [
  {
    name: "featured",
    title: "주목할 만한 추천 포스트",
    url: "/category/Tech",
    items: [
      {
        isArticle: true,
        title: "React 19와 CSS Modern Features로 완성하는 인터랙티브 웹 디자인",
        summary: "웹 컴포넌트 생태계의 비약적 발전과 CSS 현대적 기능들을 조합해 최고의 사용자 경험을 설계하는 실전 가이드입니다.",
        url: "/1",
        thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        category: "웹 개발/프론트엔드",
        categoryUrl: "/category/Tech/Frontend",
        date: "2026. 10. 5. 14:30",
        simpleDate: "2026. 10. 5.",
        commentCount: 3
      },
      {
        isArticle: true,
        title: "Tistory 스킨 개발 완벽 가이드: 치환자 엔진 분석과 최적화",
        summary: "티스토리의 그룹 치환자와 값 치환자 동작 원리, 홈 커버 구성, 스킨 옵션 변수 설정 기법을 상세히 분석합니다.",
        url: "/2",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
        category: "웹 개발/프론트엔드",
        categoryUrl: "/category/Tech/Frontend",
        date: "2026. 10. 4. 11:15",
        simpleDate: "2026. 10. 4.",
        commentCount: 1
      }
    ]
  },
  {
    name: "list",
    title: "최신 아티클 모아보기",
    url: "/category",
    items: defaultPosts.map(p => ({
      isArticle: true,
      title: p.title,
      summary: p.summary,
      url: p.link,
      thumbnail: p.thumbnailUrl,
      category: p.category,
      categoryUrl: p.categoryLink,
      date: p.date,
      simpleDate: p.simpleDate,
      commentCount: p.commentCount
    }))
  }
];

const defaultLinks = [
  { site: "JooStory.net", name: "JooStory.net", url: "https://joostory.net" },
  { site: "Github", name: "Github", url: "https://github.com/joostory" },
  { site: "X", name: "X", url: "https://x.com/@JooStory" },
  { site: "LinkedIn", name: "LinkedIn", url: "https://www.linkedin.com/in/hyeokjoo/" }
];

/**
 * Loads mock data and overrides with local tistory-mock.json or tistory-mock.js
 */
function getMergedMockData(staticDir = process.cwd()) {
  let blogMeta = { ...defaultBlogMeta };
  let posts = [...defaultPosts];
  let notices = [...defaultNotices];
  let protectedPost = { ...defaultProtectedPost };
  let pages = [...defaultPages];
  let guestbook = [...defaultGuestbook];
  let tags = [...defaultTags];
  let covers = [...defaultCoverData];
  let links = [...defaultLinks];

  const possibleMockFiles = [
    path.join(staticDir, 'tistory-mock.json'),
    path.join(staticDir, 'tistory-mock.js'),
    path.join(process.cwd(), 'tistory-mock.json'),
    path.join(process.cwd(), 'tistory-mock.js')
  ];

  for (const mockPath of possibleMockFiles) {
    if (fs.existsSync(mockPath)) {
      try {
        let customData;
        if (mockPath.endsWith('.json')) {
          const content = fs.readFileSync(mockPath, 'utf-8');
          customData = JSON.parse(content);
        } else {
          // .js
          delete require.cache[require.resolve(mockPath)];
          customData = require(mockPath);
        }

        if (customData.blog) {
          blogMeta = { ...blogMeta, ...customData.blog };
          if (customData.blog.variables) {
            blogMeta.variables = { ...blogMeta.variables, ...customData.blog.variables };
          }
        }
        if (customData.posts && Array.isArray(customData.posts)) {
          posts = customData.posts;
        }
        if (customData.notices && Array.isArray(customData.notices)) {
          notices = customData.notices;
        }
        if (customData.protectedPost) {
          protectedPost = { ...protectedPost, ...customData.protectedPost };
        }
        if (customData.pages && Array.isArray(customData.pages)) {
          pages = customData.pages;
        }
        if (customData.guestbook && Array.isArray(customData.guestbook)) {
          guestbook = customData.guestbook;
        }
        if (customData.tags && Array.isArray(customData.tags)) {
          tags = customData.tags;
        }
        if (customData.covers && Array.isArray(customData.covers)) {
          covers = customData.covers;
        }
        if (customData.links && Array.isArray(customData.links)) {
          links = customData.links;
        }
        break;
      } catch (e) {
        console.warn(`[tistory-mock] 커스텀 Mock 파일 로드 실패 (${mockPath}): ${e.message}`);
      }
    }
  }

  return {
    blog: blogMeta,
    posts,
    notices,
    protectedPost,
    pages,
    guestbook,
    tags,
    covers,
    links
  };
}

module.exports = {
  defaultBlogMeta,
  defaultPosts,
  defaultNotices,
  defaultProtectedPost,
  defaultPages,
  defaultGuestbook,
  defaultTags,
  defaultCoverData,
  defaultLinks,
  getMergedMockData
};
