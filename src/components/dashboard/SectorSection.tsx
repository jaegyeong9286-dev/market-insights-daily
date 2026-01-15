import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { SectorAnalysis } from "@/types/investment";

interface SectorSectionProps {
  sectors: SectorAnalysis[];
  isLoading?: boolean;
}

const OutlookIcon = ({ outlook }: { outlook: SectorAnalysis['outlook'] }) => {
  switch (outlook) {
    case 'bullish':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'bearish':
      return <TrendingDown className="h-5 w-5 text-red-500" />;
    default:
      return <Minus className="h-5 w-5 text-yellow-500" />;
  }
};

const OutlookBadge = ({ outlook }: { outlook: SectorAnalysis['outlook'] }) => {
  const variants = {
    bullish: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    bearish: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    neutral: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  const labels = {
    bullish: '상승 전망',
    bearish: '하락 전망',
    neutral: '중립',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[outlook]}`}>
      {labels[outlook]}
    </span>
  );
};

export const SectorSection = ({ sectors, isLoading }: SectorSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            💡 섹터 분석 및 투자 인사이트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="h-5 bg-muted rounded w-1/3 mb-3"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          💡 섹터 분석 및 투자 인사이트
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sectors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            섹터 분석 데이터가 없습니다. 뉴스 분석 후 유망 섹터를 추가해주세요.
          </p>
        ) : (
          <div className="space-y-4">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <OutlookIcon outlook={sector.outlook} />
                    <h3 className="font-bold text-lg">{sector.name}</h3>
                  </div>
                  <OutlookBadge outlook={sector.outlook} />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {sector.reason}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sector.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      #{keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
