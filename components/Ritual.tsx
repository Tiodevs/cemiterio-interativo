import type { ReactNode } from "react";

type RitualProps = {
  acao?: ReactNode;
};

export function Ritual({ acao }: RitualProps) {
  return (
    <main className="shell flex flex-1 flex-col justify-end py-16 md:justify-center">
      <p className="eyebrow">Sobremesa de Halloween</p>
      <h1 className="display mt-5 max-w-3xl text-5xl text-bone sm:text-7xl">
        Cemitério da travessa
      </h1>
      <p className="mt-6 max-w-md text-base leading-7 text-bone-dim">
        Um cemitério digital fincado na sobremesa. Entre com a câmera, deite o
        círculo no centro da travessa e toque em posicionar. Ande em volta:
        perto de uma lápide, a frase aparece em cima da pedra.
      </p>
      {acao ? <div className="mt-10">{acao}</div> : null}
    </main>
  );
}
