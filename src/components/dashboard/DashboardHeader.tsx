import { CalendarDays, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  date: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const DashboardHeader = ({ date, onRefresh, isLoading }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">
            📈 투자 분석 대시보드
          </h1>
          <p className="text-muted-foreground mt-1">
            오늘의 시장 뉴스와 유망 섹터, 추천 종목을 한눈에
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{date}</span>
          </div>
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
