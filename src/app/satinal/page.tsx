import type { Metadata } from "next";
import { PurchaseWizard } from "@/components/purchase/PurchaseWizard";
import "./purchase.css";

export const metadata: Metadata = {
  title: "Satın Al — Memoora",
  description:
    "Kişiye özel Memoora magnet ve anahtarlık siparişi. Canlı önizleme ile çiftinize özel deneyimi görün.",
};

export default function SatinalPage() {
  return <PurchaseWizard />;
}
