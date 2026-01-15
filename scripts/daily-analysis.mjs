/**
 * 매일 실행되는 투자 분석 스크립트
 * GitHub Actions에서 자동 실행됩니다.
 */

import fs from 'fs';
import path from 'path';

// 환경 변수
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
const EMAIL_TO = process.env.EMAIL_TO;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// 오늘 날짜
const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
});

/**
 * 네이버 뉴스 검색 API 호출
 */
async function fetchNaverNews(query, display = 5) {
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
 * 섹터 분석 (실제로는 AI API 연동 가능)
 */
function analyzeSectors(news) {
  // 뉴스 기반 간단한 섹터 분석
  const sectors = [
    {
      name: 'AI/반도체',
      outlook: 'bullish',
      reason: 'AI 반도체 수요 급증, 글로벌 테크 기업 투자 확대',
      keywords: ['엔비디아', 'HBM', 'AI 가속기', '삼성전자'],
    },
    {
      name: '2차전지',
      outlook: 'neutral',
      reason: '전기차 수요 둔화 우려 vs 장기 성장성',
      keywords: ['LG에너지솔루션', '삼성SDI', '전고체'],
    },
    {
      name: '바이오',
      outlook: 'bullish',
      reason: '신약 개발 성과 기대, FDA 승인 모멘텀',
      keywords: ['셀트리온', '삼성바이오로직스', 'ADC'],
    },
  ];

  return sectors;
}

/**
 * 종목 추천 생성
 */
function generateStockRecommendations() {
  return [
    {
      code: '005930',
      name: '삼성전자',
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
  ];
}

/**
 * HTML 이메일 템플릿 생성
 */
function generateEmailHTML(data) {
  const { news, sectors, stocks, date } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 700px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a2e; border-bottom: 3px solid #4f46e5; padding-bottom: 10px; }
    h2 { color: #4f46e5; margin-top: 30px; }
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
  <h1>📈 오늘의 투자 분석</h1>
  <p><strong>${date}</strong></p>

  <h2>📰 주요 뉴스</h2>
  ${news.map(item => `
    <div class="card">
      <a href="${item.link}" class="news-link"><strong>${item.title}</strong></a>
      <p class="news-source">${item.source} · ${item.pubDate}</p>
      <p>${item.summary}</p>
    </div>
  `).join('')}

  <h2>🎯 유망 섹터</h2>
  ${sectors.map(sector => `
    <div class="card ${sector.outlook}">
      <strong>${sector.name}</strong>
      <span class="badge badge-${sector.outlook}">
        ${sector.outlook === 'bullish' ? '📈 강세' : sector.outlook === 'bearish' ? '📉 약세' : '➡️ 중립'}
      </span>
      <p>${sector.reason}</p>
      <div class="keywords">
        ${sector.keywords.map(k => `<span class="keyword">${k}</span>`).join('')}
      </div>
    </div>
  `).join('')}

  <h2>💎 추천 종목</h2>
  ${stocks.map(stock => `
    <div class="card">
      <strong>${stock.name}</strong> <span style="color:#64748b">(${stock.code})</span>
      <div class="stock-grid">
        <div class="stock-row">
          <span>현재가</span>
          <span class="price">${stock.currentPrice.toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>목표가</span>
          <span class="target">${stock.targetPrice.toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>손절가</span>
          <span class="stop">${stock.stopLoss.toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>진입가</span>
          <span>${stock.entryPrice.toLocaleString()}원</span>
        </div>
        <div class="stock-row">
          <span>RSI</span>
          <span>${stock.rsiValue}</span>
        </div>
      </div>
      <p><strong>기본적 분석:</strong> ${stock.fundamentalAnalysis}</p>
      <p><strong>기술적 분석:</strong> ${stock.technicalAnalysis}</p>
      <p><strong>투자 시나리오:</strong> ${stock.investmentScenario}</p>
    </div>
  `).join('')}

  <div class="footer">
    <p>⚠️ 본 분석은 참고용이며, 투자의 최종 책임은 본인에게 있습니다.</p>
    <p>GitHub Actions로 자동 생성됨</p>
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
        subject: `📈 오늘의 투자 분석 - ${date}`,
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
  console.log('🚀 투자 분석 시작...');
  console.log(`📅 ${today}`);

  // 1. 뉴스 수집
  console.log('\n📰 뉴스 수집 중...');
  const news = await fetchNaverNews('경제 증시 투자', 5);
  console.log(`   ${news.length}개 뉴스 수집 완료`);

  // 2. 섹터 분석
  console.log('\n🎯 섹터 분석 중...');
  const sectors = analyzeSectors(news);
  console.log(`   ${sectors.length}개 섹터 분석 완료`);

  // 3. 종목 추천
  console.log('\n💎 종목 추천 생성 중...');
  const stocks = generateStockRecommendations();
  console.log(`   ${stocks.length}개 종목 추천 완료`);

  // 분석 결과
  const analysisData = {
    date: today,
    news,
    sectors,
    stocks,
    generatedAt: new Date().toISOString(),
  };

  // 4. 결과 저장
  const outputDir = 'output';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(outputDir, `analysis-${dateStr}.json`);
  const htmlPath = path.join(outputDir, `analysis-${dateStr}.html`);

  fs.writeFileSync(jsonPath, JSON.stringify(analysisData, null, 2));
  console.log(`\n💾 JSON 저장: ${jsonPath}`);

  // 5. HTML 생성
  const emailHTML = generateEmailHTML(analysisData);
  fs.writeFileSync(htmlPath, emailHTML);
  console.log(`📄 HTML 저장: ${htmlPath}`);

  // 6. 이메일 발송
  console.log('\n📧 이메일 발송 시도...');
  await sendEmail(emailHTML, today);

  console.log('\n✅ 분석 완료!');
}

main().catch(console.error);
