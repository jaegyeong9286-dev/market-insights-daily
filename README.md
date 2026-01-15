# 📈 투자 분석 대시보드

오늘의 시장 뉴스와 유망 섹터, 추천 종목을 한눈에 볼 수 있는 대시보드입니다.

## 🚀 로컬 실행 방법

### 1. 사전 준비

- [Node.js](https://nodejs.org/) 18버전 이상 설치
- [Git](https://git-scm.com/) 설치

### 2. 프로젝트 클론

```bash
git clone <your-github-repo-url>
cd <project-folder>
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

---

## 🔗 네이버 뉴스 API 연동 (선택사항)

로컬에서 실시간 뉴스를 가져오려면 네이버 API를 연동할 수 있습니다.

### 1. 네이버 개발자 센터 등록

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 애플리케이션 등록 → "검색" API 선택
3. Client ID와 Client Secret 발급

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```env
VITE_NAVER_CLIENT_ID=your_client_id
VITE_NAVER_CLIENT_SECRET=your_client_secret
```

### 3. 프록시 서버 설정 (CORS 우회)

`vite.config.ts`에 프록시 설정 추가:

```typescript
export default defineConfig({
  // ... 기존 설정
  server: {
    proxy: {
      '/api/naver': {
        target: 'https://openapi.naver.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/naver/, ''),
        headers: {
          'X-Naver-Client-Id': process.env.VITE_NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.VITE_NAVER_CLIENT_SECRET,
        },
      },
    },
  },
});
```

### 4. API 호출 예시

`src/hooks/useInvestmentData.ts`의 `fetchData` 함수를 수정:

```typescript
const fetchData = async () => {
  setIsLoading(true);
  
  try {
    // 네이버 뉴스 검색 API 호출
    const response = await fetch('/api/naver/v1/search/news.json?query=경제&display=5&sort=date');
    const newsData = await response.json();
    
    // 뉴스 데이터 변환
    const news = newsData.items.map((item, index) => ({
      id: String(index),
      title: item.title.replace(/<[^>]*>/g, ''), // HTML 태그 제거
      source: item.originallink.split('/')[2] || '뉴스',
      summary: item.description.replace(/<[^>]*>/g, ''),
      link: item.link,
      pubDate: new Date(item.pubDate).toLocaleString('ko-KR'),
    }));
    
    setData({
      ...sampleData,
      news,
      date: new Date().toLocaleDateString('ko-KR'),
    });
  } catch (err) {
    console.error('뉴스 로드 실패:', err);
    // 실패 시 샘플 데이터 사용
    setData(sampleData);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   └── dashboard/
│       ├── DashboardHeader.tsx  # 헤더 컴포넌트
│       ├── NewsSection.tsx      # 뉴스 섹션
│       ├── SectorSection.tsx    # 섹터 분석 섹션
│       └── StockSection.tsx     # 종목 추천 섹션
├── hooks/
│   └── useInvestmentData.ts     # 데이터 관리 훅
├── types/
│   └── investment.ts            # 타입 정의
└── pages/
    └── Index.tsx                # 메인 페이지
```

---

## ⚠️ 주의사항

- 본 대시보드의 분석 정보는 **참고용**입니다.
- **투자의 최종 책임은 본인에게 있습니다.**
- 네이버 API는 **일 25,000건** 호출 제한이 있습니다.

---

## 🛠️ 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

---

## 📝 라이선스

MIT License
