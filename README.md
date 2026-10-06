# tistory-theme-preview ✦

> Zero-config local live preview & debugging suite for Tistory custom themes and skins.
> 티스토리 커스텀 스킨 개발자를 위한 무설정 로컬 라이브 프리뷰 및 디버깅 툴킷.

이제 복잡한 브라우저 확장 프로그램 설정이나 매번 티스토리 블로그 관리자 화면에 스킨 zip 파일을 업로드하는 번거로움 없이, 로컬에서 테마 `skin.html`, `style.css`, `index.xml`, `images/` 파일을 실시간으로 미리보고 디버깅할 수 있습니다.

참고: [티스토리 스킨 가이드 공식 문서](https://tistory.github.io/document-tistory-skin/)

---

## ✨ Features (주요 기능)

- ⚡ **무설정 자동 탐색 (Zero-Config)**: 작업 폴더 내의 `skin.html` (또는 티스토리 치환자가 포함된 HTML), `index.xml`, `style.css`, `images/` 리소스를 자동으로 인식해 즉시 로컬 개발 서버를 구동합니다.
- 🔄 **실시간 변경 감지 & 라이브 리로드 (Live Reload)**: `skin.html`이나 `style.css`를 수정하고 저장하면 Server-Sent Events(SSE)를 통해 브라우저가 새로고침 없이 즉각 최신 상태를 반영합니다.
- 🎨 **프리미엄 튜닝 대시보드 (Glassmorphism Dashboard)**: 세련된 다크 테마 대시보드를 통해 데스크톱, 랩톱, 태블릿, 모바일 뷰포트 전환 및 화면 회전(가로/세로)을 간편하게 테스트할 수 있습니다.
- 🎛️ **스킨 옵션 & 홈 커버 동적 제어 (Dynamic Skin Options & Covers)**: `index.xml`에 정의된 `<variables>`(COLOR, BOOL, SELECT, STRING, IMAGE)를 자동으로 분석해 실시간 조작 UI를 생성하며, 홈 커버(`<s_cover_group>`) 노출 여부도 스위치로 바로 전환해 볼 수 있습니다.
- 📑 **10가지 이상의 뷰 모드 완벽 지원**:
  - 🏠 홈 (인덱스 / 홈 커버)
  - 📄 글 본문 상세 (댓글/답글, 태그, 관련 글, 이전/다음 글)
  - 📋 카테고리 글 목록 (`<s_list>`)
  - 🔍 검색 결과 및 검색 결과 없음
  - 🏷️ 태그 클라우드 (`/tag`)
  - 📢 공지사항 (`<s_notice_rep>`)
  - 🔒 보호글 (`<s_article_protected>`)
  - 📑 독립 페이지 (`<s_page_rep>`)
  - 📖 방명록 (`<s_guest>`)
- 📝 **목 데이터 자유 커스텀 (Flexible Mock Override)**: 프로젝트 루트에 `tistory-mock.json`이나 `tistory-mock.js` 파일을 배치하면 자신만의 고유한 블로그 글, 카테고리, 댓글 데이터로 즉시 교체 적용됩니다.

---

## 🚀 Quick Start (빠른 시작)

### 1. 전역 설치 (Global Install)
터미널에서 전역으로 설치하거나 `npx`로 바로 실행할 수 있습니다.
```bash
npm install -g tistory-theme-preview
```

### 2. 스킨 프로젝트 폴더에서 실행
본인의 티스토리 스킨 프로젝트 디렉토리로 이동한 뒤 명령어를 실행합니다:
```bash
tistory-theme-preview
```
또는 설치 없이 `npx`로 즉시 실행할 수도 있습니다:
```bash
npx tistory-theme-preview
```

### 3. 브라우저로 대시보드 접속
브라우저를 열고 아래 주소로 접속합니다:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ⚙️ CLI Options (명령어 옵션)

```bash
tistory-theme-preview [옵션]

옵션 목록:
  -p, --port <number>     프리뷰 서버가 실행될 포트 번호 (기본값: 3000)
  -s, --skin <path>       테스트할 티스토리 스킨 폴더 또는 skin.html 경로 (기본값: 현재 폴더 자동 탐색)
  -d, --dir <path>        정적 리소스 및 Mock 데이터 위치 디렉토리 (기본값: 스킨 폴더)
  -v, --version           버전 정보 출력
  -h, --help              도움말 출력
```

---

## 📝 Customizing Mock Data (목 데이터 커스터마이징)

본인의 실제 블로그 글 제목이나 카테고리 정보로 미리보고 싶다면, 프로젝트 루트에 `tistory-mock.json` 파일을 생성해 원하는 항목만 덮어쓸 수 있습니다.

### `tistory-mock.json` 작성 예시:
```json
{
  "blog": {
    "Title": "나만의 티스토리 블로그",
    "Desc": "개발과 일상을 기록하는 공간입니다.",
    "Blogger": "홍길동"
  },
  "posts": [
    {
      "id": "1",
      "link": "/1",
      "title": "로컬 목 데이터 연동 성공!",
      "category": "개발/프론트엔드",
      "categoryLink": "/category/frontend",
      "date": "2026. 10. 05. 15:00",
      "simpleDate": "2026. 10. 05.",
      "author": "홍길동",
      "summary": "tistory-mock.json을 통해 직접 주입된 테스트 포스트입니다.",
      "desc": "<p>이 글은 로컬 <code>tistory-mock.json</code>을 통해 주입되었습니다.</p>",
      "tags": ["Tistory", "Preview"],
      "commentCount": 1,
      "comments": [
        {
          "id": "c1",
          "name": "방문자",
          "date": "2026. 10. 05. 15:30",
          "desc": "목 데이터가 정상적으로 표시됩니다!",
          "replies": []
        }
      ]
    }
  ],
  "links": [
    { "site": "JooStory.net", "url": "https://joostory.net" },
    { "site": "Github", "url": "https://github.com/joostory" }
  ]
}
```

---

## 🧪 테스트 실행

```bash
npm test
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE details.
