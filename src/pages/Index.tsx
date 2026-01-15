import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NewsSection } from "@/components/dashboard/NewsSection";
import { SectorSection } from "@/components/dashboard/SectorSection";
import { StockSection } from "@/components/dashboard/StockSection";
import { useInvestmentData } from "@/hooks/useInvestmentData";

const Index = () => {
  const { data, isLoading, refresh } = useInvestmentData();

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <DashboardHeader 
          date={today} 
          onRefresh={refresh} 
          isLoading={isLoading} 
        />
        
        <div className="space-y-6">
          {/* 뉴스 섹션 */}
          <NewsSection 
            news={data?.news || []} 
            isLoading={isLoading} 
          />
          
          {/* 섹터 분석 섹션 */}
          <SectorSection 
            sectors={data?.sectors || []} 
            isLoading={isLoading} 
          />
          
          {/* 종목 추천 섹션 */}
          <StockSection 
            stocks={data?.stocks || []} 
            isLoading={isLoading} 
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
