import { Truck, Wallet, ShieldCheck, MessageCircle } from "lucide-react";
import type { Dictionary } from "@/i18n/types";

export default function TrustBar({ dict }: { dict: Dictionary }) {
  const items = [
    { Icon: Truck, title: dict.trust.deliveryTitle, desc: dict.trust.deliveryDesc },
    { Icon: Wallet, title: dict.trust.paymentTitle, desc: dict.trust.paymentDesc },
    { Icon: ShieldCheck, title: dict.trust.qualityTitle, desc: dict.trust.qualityDesc },
    { Icon: MessageCircle, title: dict.trust.supportTitle, desc: dict.trust.supportDesc },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ Icon, title, desc }) => (
        <div key={title} className="card card-hover p-5 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-light/40 text-accent-dark">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted mt-0.5 leading-snug">{desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
