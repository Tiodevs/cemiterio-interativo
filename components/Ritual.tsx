import type { ReactNode } from "react";
import { ListaTumulos } from "@/components/ListaTumulos";

type RitualProps = {
  acao?: ReactNode;
};

export function Ritual({ acao }: RitualProps) {
  return (
    <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(196,85,58,0.22),transparent_68%)]" />
      <header className="relative">
        <p className="font-sans text-xs tracking-[0.32em] text-ember uppercase">
          Sobremesa de Halloween
        </p>
        <h1 className="mt-3 max-w-xl font-serif text-5xl leading-[0.95] text-bone sm:text-6xl">
          Cemitério da travessa
        </h1>
        <p className="mt-5 max-w-md font-sans text-lg leading-7 text-bone/75">
          Deite o círculo no centro da sobremesa e toque em Posicionar. As
          lápides ficam fincadas na mesa: ande em volta e chegue perto de uma
          para a frase aparecer em cima da pedra.
        </p>
      </header>
      {acao ? <div className="relative mt-8">{acao}</div> : null}
      <ListaTumulos />
      <p className="relative mt-8 font-sans text-sm text-bone/60">
        Sem a câmera, a lista acima já conta as frases.
      </p>
    </main>
  );
}
