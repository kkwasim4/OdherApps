import { Shield, Zap, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Automatic Risk Detection",
    description: "Honeypot detection, owner privileges, mint authority, and in-depth security analysis",
  },
  {
    icon: Zap,
    title: "Real-Time Liquidity",
    description: "Auto-scan Uniswap, PancakeSwap, Raydium, and other DEXs for actual liquidity data",
  },
  {
    icon: Globe,
    title: "Multi-Chain Support",
    description: "23 EVM networks + Solana. Auto-detect chain and complete metadata in one query",
  },
];

export function FeatureHighlights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card key={index} className="hover-elevate transition-all">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
