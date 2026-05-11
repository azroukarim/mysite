'use client';

import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, XCircle, AlertTriangle, Clock } from "lucide-react";

export default function RefundPolicyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-2xl mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            {t('refund_policy_title')}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t('refund_policy_subtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-8">
          {/* Section 1: No Refund After Delivery */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0">
                <XCircle size={24} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {t('refund_no_refund_after_delivery_title')}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('refund_no_refund_after_delivery_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Technical Issues */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-xl shrink-0">
                <Clock size={24} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {t('refund_technical_issues_title')}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('refund_technical_issues_desc')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Compatibility */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-6">
              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-bold text-slate-900">
                  {t('refund_compatibility_title')}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {t('refund_compatibility_desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Contact */}
        <div className="mt-16 text-center p-10 bg-white rounded-3xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            {t('contact_hear_from_you_title')}
          </h3>
          <a 
            href="https://wa.me/212670965351" 
            target="_blank" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95"
          >
            {t('footer_whatsapp')}
          </a>
        </div>
      </div>
    </div>
  );
}
