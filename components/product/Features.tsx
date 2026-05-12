import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, Headphones, MonitorPlay, Globe, PlayCircle } from "lucide-react";

export default function Features() {
  const features = [
    { 
      icon: Zap, 
      title: "Activation Instantanée", 
      desc: "Recevez vos accès par WhatsApp/Email immédiatement." 
    },
    { 
      icon: MonitorPlay, 
      title: "Qualité 4K/UHD", 
      desc: "Vivez une expérience immersive en haute résolution." 
    },
    { 
      icon: ShieldCheck, 
      title: "Serveurs Stables", 
      desc: "Garantie de 99.9% de disponibilité sans coupures." 
    },
    { 
      icon: Headphones, 
      title: "Support 24/7", 
      desc: "Une équipe dédiée pour vous accompagner à tout moment." 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {features.map((feature, index) => (
        <Card key={index} className="border-none bg-white shadow-xl shadow-slate-200/50 hover:shadow-primary/10 hover:translate-y-[-5px] transition-all duration-500 group rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
              <div className="relative p-4 bg-slate-50 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-[15deg]">
                <feature.icon className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">{feature.title}</h3>
            <p className="text-xs text-slate-400 font-bold leading-relaxed uppercase tracking-widest">
              {feature.desc}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
