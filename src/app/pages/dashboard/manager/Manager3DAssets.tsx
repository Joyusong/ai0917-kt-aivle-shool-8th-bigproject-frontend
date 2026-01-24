import {
  Search,
  Filter,
  Download,
  Box,
  Layers,
  Grid,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";

export function Manager3DAssets() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="에셋 검색..."
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4 text-slate-600" />
          </Button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Box className="w-4 h-4 mr-2" />
          에셋 업로드
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
          <Card
            key={item}
            className="border-slate-200 hover:shadow-lg transition-all group overflow-hidden"
          >
            <div className="aspect-square bg-slate-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Box className="w-12 h-12 text-slate-300" />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                >
                  <Download className="w-4 h-4 text-slate-700" />
                </Button>
              </div>
              <div className="absolute bottom-2 left-2">
                <Badge className="bg-black/50 hover:bg-black/60 text-white backdrop-blur-sm border-0">
                  FBX
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate">
                    판타지 검 세트 {item}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Category: Weapons
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 -mr-2"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  24MB
                </span>
                <span className="flex items-center gap-1">
                  <Grid className="w-3 h-3" />
                  Low Poly
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
