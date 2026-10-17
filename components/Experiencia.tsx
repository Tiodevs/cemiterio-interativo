"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Cemiterio } from "@/components/Cemiterio";
import { Ritual } from "@/components/Ritual";
import { loadMind, loadThree } from "@/lib/mindar";

export function Experiencia() {
  const [naCamera, setNaCamera] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void loadThree();
    void loadMind();
  }, []);

  if (naCamera) {
    return <Cemiterio onSair={() => setNaCamera(false)} />;
  }

  return (
    <Ritual
      acao={
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              void entrar(setNaCamera, setErro);
            }}
            className="h-14 rounded-full bg-ember px-6 font-sans text-base text-bone"
          >
            Entrar no cemitério
          </button>
          <Link
            href="/maquete"
            className="text-center font-sans text-sm text-moss underline decoration-moss/40 underline-offset-4"
          >
            Ver a maquete sem câmera
          </Link>
          {erro ? (
            <p className="font-sans text-sm leading-5 text-bone/80">{erro}</p>
          ) : null}
        </div>
      }
    />
  );
}

async function entrar(
  abrir: (valor: boolean) => void,
  avisar: (mensagem: string | null) => void,
) {
  if (!navigator.mediaDevices?.getUserMedia) {
    avisar("Este navegador não libera a câmera. Use a lista ou a maquete.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "environment" } },
    });
    stream.getTracks().forEach((trilha) => trilha.stop());
    avisar(null);
    abrir(true);
  } catch {
    avisar("A câmera ficou bloqueada. As frases continuam na lista abaixo.");
  }
}
