import { useState, useEffect } from 'react';
import { DailyAnalysis, NewsItem, SectorAnalysis, StockRecommendation } from '@/types/investment';

// 샘플 데이터 (로컬 실행 시 네이버 API로 대체 가능)
const sampleData: DailyAnalysis = {
  date: new Date().toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }),
  news: [
    {
      id: '1',
      title: '미국 연준, 금리 동결 시사... 글로벌 증시 상승세',
      source: '한국경제',
      summary: '미국 연방준비제도(Fed)가 인플레이션 완화 조짐에 따라 금리 인상 사이클 종료를 시사하며 글로벌 증시가 일제히 상승했습니다.',
      link: '#',
      pubDate: '2026.01.15 09:30',
    },
    {
      id: '2',
      title: '삼성전자, AI 반도체 HBM4 양산 본격화',
      source: '조선일보',
      summary: '삼성전자가 AI 서버용 고대역폭메모리(HBM) 4세대 제품 양산을 시작하며 엔비디아 공급 확대에 나섭니다.',
      link: '#',
      pubDate: '2026.01.15 08:45',
    },
    {
      id: '3',
      title: '2차전지 업계, 전고체 배터리 상용화 가속',
      source: '매일경제',
      summary: 'LG에너지솔루션과 삼성SDI가 전고체 배터리 파일럿 라인 가동을 시작하며 2027년 상용화를 목표로 개발을 가속화합니다.',
      link: '#',
      pubDate: '2026.01.15 10:15',
    },
  ],
  sectors: [
    {
      id: '1',
      name: 'AI 반도체',
      reason: '글로벌 AI 투자 확대와 함께 HBM, GPU 등 AI 반도체 수요가 폭발적으로 증가하고 있습니다. 미국 빅테크 기업들의 AI 인프라 투자가 지속되면서 관련 국내 기업들의 수혜가 예상됩니다.',
      outlook: 'bullish',
      keywords: ['HBM', 'AI', '엔비디아', '데이터센터', 'GPU'],
    },
    {
      id: '2',
      name: '2차전지',
      reason: '전고체 배터리 기술 진전과 전기차 시장 확대로 2차전지 섹터의 중장기 성장 모멘텀이 유지되고 있습니다. 다만 단기적으로는 원자재 가격 변동성에 유의할 필요가 있습니다.',
      outlook: 'bullish',
      keywords: ['전고체', '리튬', '전기차', 'ESS', '배터리'],
    },
  ],
  stocks: [
    {
      id: '1',
      name: '삼성전자',
      code: '005930',
      sector: 'AI 반도체',
      currentPrice: 78500,
      targetPrice: 95000,
      stopLoss: 72000,
      entryPrice: 76000,
      rsiValue: 45,
      supportLevel: 75000,
      resistanceLevel: 82000,
      analysis: {
        fundamental: 'HBM4 양산 시작으로 AI 반도체 매출 비중 확대 기대. 2026년 예상 영업이익 전년 대비 35% 증가 전망.',
        technical: '현재 20일 이동평균선 위에서 거래 중. RSI 45로 과매도 구간 탈피. 거래량이 평균 대비 20% 증가하며 매수세 유입 확인.',
        scenario: '75,000원대 지지선에서 분할 매수 진입. 82,000원 돌파 시 추가 매수. 72,000원 이탈 시 손절 권고.',
      },
    },
    {
      id: '2',
      name: 'SK하이닉스',
      code: '000660',
      sector: 'AI 반도체',
      currentPrice: 185000,
      targetPrice: 230000,
      stopLoss: 168000,
      entryPrice: 180000,
      rsiValue: 52,
      supportLevel: 175000,
      resistanceLevel: 195000,
      analysis: {
        fundamental: '엔비디아향 HBM3E 공급 확대 지속. AI 서버 수요 증가로 DRAM ASP 상승 추세. 분기 사상 최대 실적 경신 기대.',
        technical: '상승 채널 하단에서 반등 시도 중. 볼린저밴드 중심선(185,000원) 회복. MACD 골든크로스 임박.',
        scenario: '175,000~180,000원 구간에서 분할 매수. 195,000원 돌파 시 목표가 상향. 168,000원 하회 시 손절.',
      },
    },
  ],
  createdAt: new Date().toISOString(),
};

export const useInvestmentData = () => {
  const [data, setData] = useState<DailyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 로컬 실행 시 여기에 네이버 API 호출 로직 추가
      // const response = await fetch('/api/news');
      // const newsData = await response.json();
      
      // 현재는 샘플 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
      setData({
        ...sampleData,
        date: new Date().toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        }),
      });
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addNews = (news: NewsItem) => {
    if (data) {
      setData({ ...data, news: [...data.news, news] });
    }
  };

  const addSector = (sector: SectorAnalysis) => {
    if (data) {
      setData({ ...data, sectors: [...data.sectors, sector] });
    }
  };

  const addStock = (stock: StockRecommendation) => {
    if (data) {
      setData({ ...data, stocks: [...data.stocks, stock] });
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: fetchData,
    addNews,
    addSector,
    addStock,
  };
};
