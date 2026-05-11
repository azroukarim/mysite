import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, Headphones, MonitorPlay } from "lucide-react";

export default function Features() {
  const features = [
    { 
      icon: Zap, 
      title: "Instant Activation", 
      desc: "Get your account details immediately after payment." 
    },
    { 
      icon: MonitorPlay, 
      title: "4K Quality", 
      desc: "Enjoy your favorite channels in crystal clear resolution." 
    },
    { 
      icon: ShieldCheck, 
      title: "99.9% Uptime", 
      desc: "Stable servers for a buffer-free viewing experience." 
    },
    { 
      icon: Headphones, 
      title: "24/7 Support", 
      desc: "Our team is always here to help you with any issues." 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {features.map((feature, index) => (
        <Card key={index} className="border-none bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
            <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <feature.icon className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
            <h3 className="font-bold text-slate-900">{feature.title}</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              {feature.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
