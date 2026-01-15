export interface NewsItem {
  id: string;
  title: string;
  source: string;
  summary: string;
  link: string;
  pubDate: string;
}

export interface SectorAnalysis {
  id: string;
  name: string;
  reason: string;
  outlook: 'bullish' | 'neutral' | 'bearish';
  keywords: string[];
}

export interface StockRecommendation {
  id: string;
  name: string;
  code: string;
  sector: string;
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  entryPrice: number;
  analysis: {
    fundamental: string;
    technical: string;
    scenario: string;
  };
  rsiValue?: number;
  supportLevel?: number;
  resistanceLevel?: number;
}

export interface DailyAnalysis {
  date: string;
  news: NewsItem[];
  sectors: SectorAnalysis[];
  stocks: StockRecommendation[];
  createdAt: string;
}
