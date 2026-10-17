import type { Metadata } from "next";
import { LARGURA_MARCADOR_CM } from "@/lib/amigos";

export const metadata: Metadata = {
  title: "Imprimir o brasão",
};

export default function ImprimirPage() {
  return (
    <main className="min-h-full bg-white px-8 py-10 text-ink print:px-0 print:py-0">
      <div className="mx-auto max-w-xl print:max-w-none">
        <p className="font-sans text-xs tracking-[0.28em] text-ember uppercase">
          Cemitério interativo
        </p>
        <h1 className="mt-2 font-serif text-4xl">Brasão do centro</h1>
        <p className="mt-4 max-w-md font-sans text-base leading-7 text-stone">
          Imprima em tamanho real, em 100%, sem ajustar à página. O quadrado
          tem {LARGURA_MARCADOR_CM} cm. Recorte, plastifique fosco e deite o
          brasão virado para cima no meio da sobremesa.
        </p>
        {/* O quadrado precisa sair com 10 cm reais. O otimizador do Next altera o tamanho. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/markers/centro.png"
          alt="Brasão assimétrico para a câmera reconhecer"
          className="marker mt-8 border border-ink"
        />
      </div>
      <style>{`
        .marker { width: ${LARGURA_MARCADOR_CM}cm; height: ${LARGURA_MARCADOR_CM}cm; }
        @page { size: A4; margin: 1.4cm; }
        @media print {
          body { background: white; }
          p, h1 { color: #1a120e; }
        }
      `}</style>
    </main>
  );
}
