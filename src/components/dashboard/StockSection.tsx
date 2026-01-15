import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, ShieldAlert } from "lucide-react";
import { StockRecommendation } from "@/types/investment";

interface StockSectionProps {
  stocks: StockRecommendation[];
  isLoading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ko-KR').format(price);
};

const calculateReturn = (current: number, target: number) => {
  return ((target - current) / current * 100).toFixed(1);
};

export const StockSection = ({ stocks, isLoading }: StockSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            📊 추천 종목 및 기술적 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse p-4 border rounded-lg">
                <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
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
          <BarChart3 className="h-5 w-5 text-primary" />
          📊 추천 종목 및 기술적 분석
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stocks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            추천 종목 데이터가 없습니다. 섹터 분석 후 종목을 추가해주세요.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {stocks.map((stock) => (
              <div
                key={stock.id}
                className="p-5 rounded-xl border bg-card hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{stock.name}</h3>
                    <span className="text-sm text-muted-foreground">{stock.code}</span>
                  </div>
                  <Badge variant="secondary">{stock.sector}</Badge>
                </div>

                {/* Price Info */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">현재가</p>
                    <p className="font-semibold">{formatPrice(stock.currentPrice)}원</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">목표가</p>
                    <p className="font-semibold text-green-600">
                      {formatPrice(stock.targetPrice)}원
                    </p>
                    <p className="text-xs text-green-600">
                      (+{calculateReturn(stock.currentPrice, stock.targetPrice)}%)
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">손절가</p>
                    <p className="font-semibold text-red-600">
                      {formatPrice(stock.stopLoss)}원
                    </p>
                  </div>
                </div>

                {/* Technical Indicators */}
                {(stock.rsiValue || stock.supportLevel || stock.resistanceLevel) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {stock.rsiValue && (
                      <Badge variant="outline" className="text-xs">
                        RSI: {stock.rsiValue}
                      </Badge>
                    )}
                    {stock.supportLevel && (
                      <Badge variant="outline" className="text-xs">
                        지지선: {formatPrice(stock.supportLevel)}
                      </Badge>
                    )}
                    {stock.resistanceLevel && (
                      <Badge variant="outline" className="text-xs">
                        저항선: {formatPrice(stock.resistanceLevel)}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Analysis */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">기본적 분석</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {stock.analysis.fundamental}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">기술적 분석</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {stock.analysis.technical}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">투자 시나리오</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {stock.analysis.scenario}
                    </p>
                  </div>
                </div>

                {/* Entry Point */}
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">추천 매수가</span>
                  </div>
                  <p className="text-lg font-bold text-primary mt-1">
                    {formatPrice(stock.entryPrice)}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
          <p className="text-xs text-muted-foreground text-center">
            ⚠️ <strong>투자 유의사항:</strong> 본 분석은 참고용이며, 투자의 최종 책임은 본인에게 있습니다.
            투자 전 충분한 검토를 권장합니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
