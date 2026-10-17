import type { Metadata } from "next";
import { Maquete } from "@/components/Maquete";

export const metadata: Metadata = {
  title: "Maquete do cemitério",
};

export default function MaquetePage() {
  return <Maquete />;
}
