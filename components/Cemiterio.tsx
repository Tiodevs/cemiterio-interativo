"use client";

import { useEffect, useRef, useState } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio } from "@/lib/cena";
import { loadMind, loadThree, type MindSession } from "@/lib/mindar";

type CemiterioProps = {
  onSair: () => void;
};

type Estado = "abrindo" | "procurando" | "visto" | "erro";

export function Cemiterio({ onSair }: CemiterioProps) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<Estado>("abrindo");

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let sessao: MindSession | null = null;

    const ligar = async () => {
      try {
        const [THREE, mind] = await Promise.all([loadThree(), loadMind()]);
        if (parado) return;

        const cena = criarCemiterio(THREE, AMIGOS);
        sessao = new mind.MindARThree({
          container: palco,
          imageTargetSrc: "/targets/centro.mind",
          maxTrack: 1,
          filterMinCF: null,
          filterBeta: null,
          warmupTolerance: 5,
          missTolerance: 8,
          uiLoading: "no",
          uiScanning: "no",
          uiError: "no",
        });
        const ancora = sessao.addAnchor(0);
        ancora.group.add(cena.group);
        ancora.onTargetFound = () => {
          cena.surgir();
          setEstado("visto");
        };
        ancora.onTargetLost = () => {
          setEstado("procurando");
        };

        await sessao.start();
        if (parado) return;
        setEstado("procurando");

        const relogio = new THREE.Clock();
        const ativa = sessao;
        ativa.renderer.setAnimationLoop(() => {
          cena.update(ativa.camera, relogio.getDelta());
          ativa.renderer.render(ativa.scene, ativa.camera);
        });
      } catch {
        if (!parado) setEstado("erro");
      }
    };

    void ligar();

    return () => {
      parado = true;
      encerrar(sessao);
      palco.replaceChildren();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-ink text-bone">
      <div ref={palcoRef} className="ar-stage absolute inset-0 overflow-hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-6">
        <p className="max-w-sm rounded-full bg-ink/80 px-4 py-2 text-center font-sans text-sm leading-5">
          {legenda(estado)}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6">
        <button
          type="button"
          onClick={onSair}
          className="h-12 rounded-full border border-bone/30 bg-ink/80 px-5 font-sans text-sm"
        >
          Voltar à lista
        </button>
      </div>
    </div>
  );
}

function legenda(estado: Estado) {
  if (estado === "abrindo") return "Abrindo a câmera…";
  if (estado === "procurando") {
    return "Aponte para o brasão deitado no centro da sobremesa.";
  }
  if (estado === "visto") return "O cemitério está em volta do brasão. Afaste um pouco para ver as quatro lápides.";
  return "A câmera não abriu. A lista de túmulos continua na página anterior.";
}

function encerrar(sessao: MindSession | null) {
  if (!sessao) return;
  sessao.renderer.setAnimationLoop(null);
  try {
    sessao.stop();
  } catch {
    /* a câmera pode ter falhado antes de existir */
  }
}
