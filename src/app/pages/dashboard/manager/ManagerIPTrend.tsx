import {
  TrendingUp,
  BarChart3,
  Sparkles,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";

export function ManagerIPTrend() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Popular Genres */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            인기 장르 순위
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    판타지
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +24%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: "92%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    로맨스
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +18%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    무협
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +15%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: "78%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    현대 판타지
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +12%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">
                    SF
                  </span>
                  <span className="text-sm text-slate-500">
                    전월 대비 +8%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: "65%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Works Ranking */}
      <Card className="border-slate-200">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            작품 순위 (조회수 기준)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[
              {
                rank: 1,
                title: "암흑의 영역 연대기",
                author: "김민지",
                views: "1,254,892",
                change: "+15%",
                color: "from-blue-500 to-blue-600",
              },
              {
                rank: 2,
                title: "별빛 아카데미",
                author: "박수진",
                views: "1,128,456",
                change: "+22%",
                color: "from-purple-500 to-purple-600",
              },
              {
                rank: 3,
                title: "운명의 검",
                author: "이재원",
                views: "987,234",
                change: "+8%",
                color: "from-green-500 to-green-600",
              },
              {
                rank: 4,
                title: "시간의 문",
                author: "최현우",
                views: "856,123",
                change: "+12%",
                color: "from-orange-500 to-orange-600",
              },
              {
                rank: 5,
                title: "마법 학원",
                author: "정서연",
                views: "745,892",
                change: "+18%",
                color: "from-red-500 to-red-600",
              },
            ].map((work) => (
              <div
                key={work.rank}
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${work.color} rounded-lg flex items-center justify-center text-white font-bold`}
                >
                  {work.rank}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-900">
                    {work.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {work.author}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900">
                    {work.views}
                  </div>
                  <div className="text-xs text-green-600">
                    {work.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  급상승 키워드
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  다크 판타지, 회귀물, 먼치킨
                </p>
                <Badge className="bg-blue-500 text-white text-xs">
                  HOT
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  IP 확장 트렌드
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  웹툰 → 드라마 전환율 상승
                </p>
                <Badge className="bg-purple-500 text-white text-xs">
                  +32%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">
                  글로벌 시장
                </h4>
                <p className="text-xs text-slate-600 mb-3">
                  북미 판타지 수요 증가
                </p>
                <Badge className="bg-green-500 text-white text-xs">
                  +45%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
