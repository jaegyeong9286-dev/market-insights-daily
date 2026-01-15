/**
 * 매일 실행되는 투자 분석 스크립트
 * GitHub Actions에서 자동 실행됩니다.
 * Google Gemini API를 활용한 AI 분석
 */

import fs from 'fs';
import path from 'path';

// 환경 변수
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const EMAIL_TO = process.env.EMAIL_TO;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 오늘 날짜
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

/**
 * Google Gemini API 호출
 */
async function callGeminiAPI(prompt) {
  if (!GEMINI_API_KEY) {
    console.log('⚠️ Gemini API 키가 설정되지 않았습니다.');
    return null;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API 오류: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
  } catch (error) {
    console.error('Gemini API 호출 실패:', error);
    return null;
  }
}

/**
 * 네이버 뉴스 검색 API 호출
 */
async function fetchNaverNews(query, display = 15) {
  if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
    console.log('⚠️ 네이버 API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다.');
    return getSampleNews();
  }

  try {
    const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
    
    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    const data = await response.json();
    
    return data.items.map((item, index) => ({
      id: String(index + 1),
      title: item.title.replace(/<[^>]*>/g, ''),
      source: extractDomain(item.originallink),
      summary: item.description.replace(/<[^>]*>/g, ''),
      link: item.link,
      pubDate: new Date(item.pubDate).toLocaleString('ko-KR'),
    }));
  } catch (error) {
    console.error('뉴스 가져오기 실패:', error);
    return getSampleNews();
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '뉴스';
  }
}

function getSampleNews() {
  return [
    {
      id: '1',
      title: '반도체 업황 회복세 뚜렷...AI 수요 급증',
      source: 'economy.sample.com',
      summary: 'AI 반도체 수요 증가로 업황 회복이 본격화되고 있습니다.',
      link: '#',
      pubDate: today,
    },
    {
      id: '2',
      title: '금리 인하 기대감에 성장주 강세',
      source: 'finance.sample.com',
      summary: '연준의 금리 인하 시사에 기술주 중심으로 상승세를 보이고 있습니다.',
      link: '#',
      pubDate: today,
    },
  ];
}

/**
 * AI 기반 심층 투자 분석
 * - 대중 심리/트렌드 분석
 * - 숨겨진 수혜주 발굴
 * - 해외/국내 글로벌 관점
 */
async function analyzeSectorsWithAI(news) {
  const newsText = news.map(n => `- ${n.title}: ${n.summary}`).join('\n');
  
  const prompt = `당신은 월가 출신 헤지펀드 매니저이자 행동경제학 전문가입니다. 
단순한 산업 분류(반도체, 2차전지 등)가 아닌, 숨겨진 투자 기회를 발굴해주세요.

## 분석 관점
1. **대중 심리 & SNS 트렌드**: 바이럴 현상, 소비자 행동 변화, MZ세대 트렌드
   - 예시: "불닭볶음면 해외 SNS 화제" → 삼양식품 수혜
   - 예시: "테일러 스위프트 NFL 경기 참석" → NFL 시청률/관련주 상승
   
2. **연결고리 투자 (2차, 3차 수혜)**: 직접 수혜가 아닌 간접 수혜주
   - 예시: "AI 열풍" → 엔비디아(직접) → 전력인프라/냉각장치(간접)
   
3. **글로벌 매크로**: 해외 정책, 지정학, 환율, 원자재 흐름
   
4. **역발상 투자**: 과매도 구간, 시장이 놓친 기회

오늘의 뉴스:
${newsText}

## 출력 형식
다음 JSON 형식으로 정확히 4개의 투자 테마를 분석해주세요.
일반적인 섹터명(AI반도체, 2차전지)보다 구체적인 테마명을 사용하세요.

[
  {
    "name": "구체적인 투자 테마명 (예: K-푸드 글로벌 확장, AI 전력 인프라, 엔터 IP 확장)",
    "outlook": "bullish 또는 bearish 또는 neutral",
    "reason": "왜 이 테마에 주목해야 하는지, 대중 심리나 트렌드 연결고리 포함 (3-4문장)",
    "triggerNews": "이 테마를 도출한 핵심 뉴스/이벤트",
    "directBeneficiary": "직접 수혜 기업/섹터",
    "indirectBeneficiary": "간접/2차 수혜 기업/섹터", 
    "risk": "주의해야 할 리스크 요인",
    "keywords": ["관련 키워드 5개"]
  }
]

JSON만 출력하세요.`;

  const response = await callGeminiAPI(prompt);
  
  if (response) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const sectors = JSON.parse(jsonMatch[0]);
        console.log('   ✅ AI 심층 분석 완료');
        return sectors;
      }
    } catch (e) {
      console.log('   ⚠️ AI 응답 파싱 실패, 기본 분석 사용');
    }
  }

  return getDefaultSectors();
}

function getDefaultSectors() {
  return [
    {
      name: 'AI/반도체',
      outlook: 'bullish',
      reason: 'AI 반도체 수요 급증, 글로벌 테크 기업 투자 확대',
      keywords: ['엔비디아', 'HBM', 'AI 가속기', '삼성전자', 'SK하이닉스'],
    },
    {
      name: '2차전지',
      outlook: 'neutral',
      reason: '전기차 수요 둔화 우려 vs 장기 성장성',
      keywords: ['LG에너지솔루션', '삼성SDI', '전고체', '리튬', 'ESS'],
    },
    {
      name: '바이오',
      outlook: 'bullish',
      reason: '신약 개발 성과 기대, FDA 승인 모멘텀',
      keywords: ['셀트리온', '삼성바이오로직스', 'ADC', '비만치료제', 'GLP-1'],
    },
  ];
}

/**
 * AI 기반 종목 추천 (숨겨진 수혜주 포함)
 */
async function generateStockRecommendationsWithAI(sectors, news) {
  const sectorsInfo = sectors.map(s => `- ${s.name}: ${s.reason}`).join('\n');
  const newsText = news.slice(0, 7).map(n => `- ${n.title}: ${n.summary}`).join('\n');
  
  const prompt = `당신은 숨겨진 투자 기회를 발굴하는 전문 애널리스트입니다.

## 오늘의 투자 테마
${sectorsInfo}

## 최근 뉴스
${newsText}

## 종목 선정 기준
1. **숨은 수혜주**: 뉴스에 직접 언급되지 않았지만 간접적으로 수혜받을 종목
2. **대중 심리 반영**: SNS 트렌드, 소비자 행동 변화와 연결된 종목
3. **글로벌 연결고리**: 해외 이벤트가 국내 기업에 미치는 영향
4. **밸류에이션**: 현재 저평가되어 있거나 모멘텀이 살아나는 종목

## 주의사항
- 삼성전자, SK하이닉스 같은 대형주보다는 중소형 숨은 수혜주 위주
- 단, 확실한 모멘텀이 있다면 대형주도 포함 가능
- 실제 한국 상장 종목만 (코스피/코스닥)

다음 JSON 형식으로 정확히 4개의 종목을 추천해주세요:
[
  {
    "code": "종목코드 (예: 003230)",
    "name": "종목명",
    "theme": "연결된 투자 테마",
    "whyNow": "지금 이 종목에 주목해야 하는 이유 (대중 심리, 트렌드 연결)",
    "hiddenLink": "뉴스와 이 종목의 숨겨진 연결고리",
    "currentPrice": 현재 추정가(숫자),
    "targetPrice": 목표가(숫자),
    "stopLoss": 손절가(숫자),
    "entryPrice": 매수 희망가(숫자),
    "rsiValue": RSI 추정값(30-70),
    "supportLevel": 지지선(숫자),
    "resistanceLevel": 저항선(숫자),
    "fundamentalAnalysis": "기본적 분석 - 실적, 밸류에이션, 성장성",
    "technicalAnalysis": "기술적 분석 - 차트, 거래량, 수급",
    "investmentScenario": "구체적인 매매 시나리오 (진입/추가매수/손절 시점)",
    "riskFactor": "이 종목의 리스크 요인"
  }
]

JSON만 출력하세요.`;

  const response = await callGeminiAPI(prompt);
  
  if (response) {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const stocks = JSON.parse(jsonMatch[0]);
        console.log('   ✅ AI 숨은 수혜주 분석 완료');
        return stocks;
      }
    } catch (e) {
      console.log('   ⚠️ AI 응답 파싱 실패, 기본 추천 사용');
    }
  }

  return getDefaultStockRecommendations();
}

function getDefaultStockRecommendations() {
  return [
    {
      code: '005930',
      name: '삼성전자',
      sector: 'AI/반도체',
      currentPrice: 72500,
      targetPrice: 85000,
      stopLoss: 68000,
      entryPrice: 71000,
      rsiValue: 42,
      supportLevel: 70000,
      resistanceLevel: 75000,
      fundamentalAnalysis: 'HBM 생산 확대로 AI 반도체 수혜 기대. 파운드리 경쟁력 회복 중.',
      technicalAnalysis: '60일선 지지 확인, RSI 과매도권 진입으로 반등 가능성.',
      investmentScenario: '71,000원 부근 분할 매수 진입, 1차 목표 78,000원, 최종 목표 85,000원. 68,000원 이탈 시 손절.',
    },
    {
      code: '000660',
      name: 'SK하이닉스',
      sector: 'AI/반도체',
      currentPrice: 178000,
      targetPrice: 220000,
      stopLoss: 165000,
      entryPrice: 175000,
      rsiValue: 55,
      supportLevel: 170000,
      resistanceLevel: 185000,
      fundamentalAnalysis: 'HBM3E 독점 공급으로 수익성 개선. AI 서버 수요 급증.',
      technicalAnalysis: '상승 채널 유지 중. 185,000원 돌파 시 추가 상승 여력.',
      investmentScenario: '175,000원 매수, 목표가 220,000원 (수익률 25%). 165,000원 손절.',
    },
    {
      code: '068270',
      name: '셀트리온',
      sector: '바이오',
      currentPrice: 185000,
      targetPrice: 220000,
      stopLoss: 170000,
      entryPrice: 180000,
      rsiValue: 48,
      supportLevel: 175000,
      resistanceLevel: 195000,
      fundamentalAnalysis: '바이오시밀러 시장 확대와 신약 파이프라인 기대.',
      technicalAnalysis: '박스권 하단 지지 후 반등 시도 중.',
      investmentScenario: '180,000원 분할 매수, 195,000원 돌파 시 추가 매수. 170,000원 손절.',
    },
  ];
}

/**
 * AI 기반 종합 투자 인사이트 생성
 */
async function generateInvestmentInsight(sectors, stocks, news) {
  const prompt = `당신은 헤지펀드 CIO입니다. 오늘의 시장을 대중 심리와 숨겨진 기회 관점에서 분석해주세요.

투자 테마: ${sectors.map(s => s.name).join(', ')}
주목 종목: ${stocks.map(s => s.name).join(', ')}

다음 형식으로 150자 이내 작성:
"[핵심 트렌드/심리] → [투자 기회] → [주의점]"

예시: "K-콘텐츠 글로벌 확산이 IP 관련주에 모멘텀 제공 → 엔터/게임 2차 수혜주 주목 → 단기 과열 시 분할매수 권장"`;

  const response = await callGeminiAPI(prompt);
  return response || '대중 심리와 트렌드 변화를 주시하며, 숨겨진 수혜주를 발굴하는 투자를 권장합니다.';
}

/**
 * HTML 이메일 템플릿 생성
 */
function generateEmailHTML(data) {
  const { news, sectors, stocks, date, insight } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 30px; }
    .insight { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; }
    .insight p { margin: 0; font-size: 16px; }
    .ai-badge { background: #fbbf24; color: #1a1a2e; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .card { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 12px 0; border-left: 4px solid #4f46e5; }
    .bullish { border-left-color: #22c55e; }
    .bearish { border-left-color: #ef4444; }
    .neutral { border-left-color: #f59e0b; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-bullish { background: #dcfce7; color: #166534; }
    .badge-bearish { background: #fee2e2; color: #991b1b; }
    .badge-neutral { background: #fef3c7; color: #92400e; }
    .stock-grid { display: grid; gap: 8px; margin-top: 8px; }
    .stock-row { display: flex; justify-content: space-between; padding: 8px; background: white; border-radius: 8px; }
    .price { font-weight: 600; color: #4f46e5; }
    .target { color: #22c55e; }
    .stop { color: #ef4444; }
    .keywords { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .keyword { background: #e0e7ff; color: #4338ca; padding: 4px 10px; border-radius: 16px; font-size: 12px; }
    .news-link { color: #4f46e5; text-decoration: none; }
    .news-source { color: #64748b; font-size: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <h1>📈 오늘의 AI 투자 분석 <span class="ai-badge">🤖 AI Powered</span></h1>
  <p><strong>${date}</strong></p>

  <div class="insight">
    <p>💡 <strong>오늘의 투자 포인트:</strong> ${insight}</p>
  </div>

  <h2>📰 주요 뉴스</h2>
  ${news.slice(0, 5).map(item => `
    <div class="card">
      <a href="${item.link}" class="news-link"><strong>${item.title}</strong></a>
      <p class="news-source">${item.source} · ${item.pubDate}</p>
      <p>${item.summary}</p>
    </div>
  `).join('')}

  <h2>🎯 숨겨진 투자 테마</h2>
  ${sectors.map(sector => `
    <div class="card ${sector.outlook}">
      <strong>${sector.name}</strong>
      <span class="badge badge-${sector.outlook}">
        ${sector.outlook === 'bullish' ? '📈 강세' : sector.outlook === 'bearish' ? '📉 약세' : '➡️ 중립'}
      </span>
      ${sector.triggerNews ? `<p style="color:#64748b;font-size:13px;margin:8px 0">📰 <em>${sector.triggerNews}</em></p>` : ''}
      <p>${sector.reason}</p>
      ${sector.directBeneficiary ? `<p><strong>💎 직접 수혜:</strong> ${sector.directBeneficiary}</p>` : ''}
      ${sector.indirectBeneficiary ? `<p><strong>🔗 간접 수혜:</strong> ${sector.indirectBeneficiary}</p>` : ''}
      ${sector.risk ? `<p style="color:#ef4444;font-size:13px">⚠️ 리스크: ${sector.risk}</p>` : ''}
      <div class="keywords">
        ${(sector.keywords || []).map(k => `<span class="keyword">${k}</span>`).join('')}
      </div>
    </div>
  `).join('')}

  <h2>💎 숨은 수혜주 발굴</h2>
  ${stocks.map(stock => `
    <div class="card">
      <strong>${stock.name}</strong> <span style="color:#64748b">(${stock.code})</span>
      <span class="badge" style="background:#e0e7ff;color:#4338ca;margin-left:8px">${stock.theme || stock.sector || ''}</span>
      
      ${stock.whyNow ? `<p style="background:#fef3c7;padding:10px;border-radius:8px;margin:10px 0"><strong>🔥 지금 주목하는 이유:</strong> ${stock.whyNow}</p>` : ''}
      ${stock.hiddenLink ? `<p><strong>🔗 숨겨진 연결고리:</strong> ${stock.hiddenLink}</p>` : ''}
      
      <div class="stock-grid">
        <div class="stock-row">
          <span>현재가</span>
          <span class="price">${Number(stock.currentPrice).toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>목표가</span>
          <span class="target">${Number(stock.targetPrice).toLocaleString()}원 (+${Math.round((stock.targetPrice / stock.currentPrice - 1) * 100)}%)</span>
        </div>
        <div class="stock-row">
          <span>손절가</span>
          <span class="stop">${Number(stock.stopLoss).toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>매수 희망가</span>
          <span>${Number(stock.entryPrice).toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>RSI</span>
          <span>${stock.rsiValue}</span>
        </div>
      </div>
      <p><strong>🔍 기본적 분석:</strong> ${stock.fundamentalAnalysis}</p>
      <p><strong>📊 기술적 분석:</strong> ${stock.technicalAnalysis}</p>
      <p><strong>🎯 매매 시나리오:</strong> ${stock.investmentScenario}</p>
      ${stock.riskFactor ? `<p style="color:#ef4444;font-size:13px">⚠️ 리스크: ${stock.riskFactor}</p>` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>⚠️ 본 분석은 AI가 생성한 참고용 정보이며, 투자의 최종 책임은 본인에게 있습니다.</p>
    <p>🤖 Powered by Google Gemini AI | GitHub Actions 자동 생성</p>
  </div>
</body>
</html>
  `;
}

/**
 * Resend로 이메일 발송
 */
async function sendEmail(html, date) {
  if (!RESEND_API_KEY || !EMAIL_TO) {
    console.log('⚠️ 이메일 설정이 없어 발송을 건너뜁니다.');
    console.log('📧 EMAIL_TO:', EMAIL_TO ? '설정됨' : '미설정');
    console.log('🔑 RESEND_API_KEY:', RESEND_API_KEY ? '설정됨' : '미설정');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Investment Bot <onboarding@resend.dev>',
        to: [EMAIL_TO],
        subject: `📈 오늘의 AI 투자 분석 - ${date}`,
        html: html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`이메일 발송 실패: ${error}`);
    }

    console.log('✅ 이메일 발송 완료!');
    return true;
  } catch (error) {
    console.error('❌ 이메일 발송 실패:', error);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 AI 투자 분석 시작...');
  console.log(`📅 ${today}`);
  console.log(`🤖 Gemini API: ${GEMINI_API_KEY ? '활성화' : '비활성화 (기본 분석 사용)'}`);

  // 1. 뉴스 수집
  console.log('\n📰 뉴스 수집 중...');
  const news = await fetchNaverNews('경제 증시 투자 주식', 10);
  console.log(`   ${news.length}개 뉴스 수집 완료`);

  // 2. AI 섹터 분석
  console.log('\n🎯 AI 섹터 분석 중...');
  const sectors = await analyzeSectorsWithAI(news);
  console.log(`   ${sectors.length}개 섹터 분석 완료`);

  // 3. AI 종목 추천
  console.log('\n💎 AI 종목 추천 생성 중...');
  const stocks = await generateStockRecommendationsWithAI(sectors, news);
  console.log(`   ${stocks.length}개 종목 추천 완료`);

  // 4. 투자 인사이트 생성
  console.log('\n💡 투자 인사이트 생성 중...');
  const insight = await generateInvestmentInsight(sectors, stocks, news);
  console.log('   인사이트 생성 완료');

  // 분석 결과
  const analysisData = {
    date: today,
    news,
    sectors,
    stocks,
    insight,
    generatedAt: new Date().toISOString(),
    aiPowered: !!GEMINI_API_KEY,
  };

  // 5. 결과 저장
  const outputDir = 'output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `analysis-${dateStr}.json`);
  const htmlPath = path.join(outputDir, `analysis-${dateStr}.html`);

  fs.writeFileSync(jsonPath, JSON.stringify(analysisData, null, 2));
  console.log(`\n💾 JSON 저장: ${jsonPath}`);

  // 6. HTML 생성
  const emailHTML = generateEmailHTML(analysisData);
  fs.writeFileSync(htmlPath, emailHTML);
  console.log(`📄 HTML 저장: ${htmlPath}`);

  // 7. 이메일 발송
  console.log('\n📧 이메일 발송 시도...');
  await sendEmail(emailHTML, today);

  console.log('\n✅ AI 분석 완료!');
}

main().catch(console.error);
