"use client";

import { useEffect, useState } from "react";
import { Cemiterio } from "@/components/Cemiterio";
import { Ritual } from "@/components/Ritual";
import { tocarMusica } from "@/lib/musica";
import { loadThree } from "@/lib/three";
import { pedirMovimento } from "@/lib/permissoes";
import { loadXr8 } from "@/lib/xr8";

export function Experiencia() {
  const [naCamera, setNaCamera] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    void loadThree();
  }, []);

  if (naCamera) {
    return <Cemiterio onSair={() => setNaCamera(false)} />;
  }

  return (
    <Ritual
      acao={
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={() => {
              tocarMusica();
              const movimento = pedirMovimento();
              void loadXr8().catch(() => undefined);
              void entrar(movimento, setNaCamera, setErro);
            }}
            className="btn-cyan w-full sm:w-auto"
          >
            Entrar e escanear
          </button>
          {erro ? <p className="aviso">{erro}</p> : null}
        </div>
      }
    />
  );
}

async function entrar(
  movimento: Promise<unknown[]>,
  abrir: (valor: boolean) => void,
  avisar: (mensagem: string | null) => void,
) {
  if (!navigator.mediaDevices?.getUserMedia) {
    avisar("Este navegador não libera a câmera.");
    return;
  }

  const respostas = await movimento;
  if (respostas.includes("denied")) {
    avisar(
      "O movimento do celular ficou bloqueado. Sem ele as lápides não ficam presas na mesa.",
    );
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
    avisar("A câmera ficou bloqueada.");
  }
}
