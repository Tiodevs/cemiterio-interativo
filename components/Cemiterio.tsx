"use client";

import { useEffect, useRef, useState } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio, type FocoLapide } from "@/lib/cena";
import { tocarMusica } from "@/lib/musica";
import { loadThree } from "@/lib/three";
import { loadXr8, type TrackingStatus, type XR8 } from "@/lib/xr8";

type CemiterioProps = {
  onSair: () => void;
};

type Fase = "carregando" | "mirando" | "colocado" | "erro";

/** 1 unidade = 10 cm. O celular começa cerca de 35 cm acima da sobremesa. */
const ALTURA_INICIAL = 3.5;
const ALCANCE = 14;

export function Cemiterio({ onSair }: CemiterioProps) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const posicionarRef = useRef<(() => void) | null>(null);
  const reposicionarRef = useRef<(() => void) | null>(null);
  const mostrarFraseRef = useRef<(id: string | null) => void>(() => {});
  const [fase, setFase] = useState<Fase>("carregando");
  const [noChao, setNoChao] = useState(false);
  const [rastreio, setRastreio] = useState<TrackingStatus | null>(null);
  const [foco, setFoco] = useState<FocoLapide | null>(null);
  const [fraseAberta, setFraseAberta] = useState<string | null>(null);

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let xr8: XR8 | null = null;
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block h-full w-full";
    palco.append(canvas);

    // O motor mede o canvas em pixels do buffer e grava isso no estilo.
    // No celular isso deixa o desenho maior que a tela e o recorte mostra
    // só o canto, com o círculo preso na lateral. O estilo volta a caber
    // no palco; o buffer continua nítido.
    const encaixarCanvas = () => {
      const escala = Math.min(window.devicePixelRatio || 1, 2);
      const largura = Math.max(1, Math.round(palco.clientWidth * escala));
      const altura = Math.max(1, Math.round(palco.clientHeight * escala));
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      if (canvas.width !== largura || canvas.height !== altura) {
        canvas.width = largura;
        canvas.height = altura;
      }
    };
    encaixarCanvas();
    window.addEventListener("resize", encaixarCanvas);

    const ligar = async () => {
      try {
        const [THREE, motor] = await Promise.all([loadThree(), loadXr8()]);
        if (parado) return;
        xr8 = motor;
        window.THREE = { ...THREE };

        const cemiterio = criarCemiterio(THREE, AMIGOS, {
          aoMudarFoco: (proxima) => {
            if (!parado) setFoco(proxima);
          },
        });
        mostrarFraseRef.current = cemiterio.mostrarFrase;
        cemiterio.group.visible = false;
        const circulo = new THREE.Group();
        const aro = new THREE.Mesh(
          new THREE.RingGeometry(0.62, 0.74, 64),
          new THREE.MeshBasicMaterial({
            color: 0xf3e6c8,
            transparent: true,
            opacity: 0.95,
            depthTest: false,
            side: THREE.DoubleSide,
          }),
        );
        const miolo = new THREE.Mesh(
          new THREE.CircleGeometry(0.62, 64),
          new THREE.MeshBasicMaterial({
            color: 0xf3e6c8,
            transparent: true,
            opacity: 0.18,
            depthTest: false,
          }),
        );
        aro.rotation.x = -Math.PI / 2;
        miolo.rotation.x = -Math.PI / 2;
        aro.renderOrder = 20;
        miolo.renderOrder = 19;
        circulo.add(miolo, aro);
        circulo.visible = false;

        const raio = new THREE.Raycaster();
        const centroDaTela = new THREE.Vector2(0, 0);
        const chao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const ponto = new THREE.Vector3();
        const cameraNoMundo = new THREE.Vector3();
        const relogio = new THREE.Clock();
        let colocado = false;
        let acertando = false;

        posicionarRef.current = () => {
          if (colocado || !acertando) return;
          const { camera } = motor.Threejs.xrScene();
          camera.getWorldPosition(cameraNoMundo);
          cemiterio.group.position.copy(ponto);
          cemiterio.group.rotation.y = Math.atan2(
            cameraNoMundo.x - ponto.x,
            cameraNoMundo.z - ponto.z,
          );
          cemiterio.group.visible = true;
          circulo.visible = false;
          cemiterio.surgir();
          colocado = true;
          setFase("colocado");
        };

        reposicionarRef.current = () => {
          colocado = false;
          cemiterio.group.visible = false;
          cemiterio.mostrarFrase(null);
          setFraseAberta(null);
          setFase("mirando");
        };

        motor.XrController.configure({ disableWorldTracking: false, scale: "responsive" });
        motor.addCameraPipelineModules([
          motor.GlTextureRenderer.pipelineModule(),
          motor.Threejs.pipelineModule(),
          motor.XrController.pipelineModule(),
          {
            name: "cemiterio",
            onStart: () => {
              const { scene, camera } = motor.Threejs.xrScene();
              scene.add(cemiterio.group, circulo);
              camera.position.set(0, ALTURA_INICIAL, 0);
              motor.XrController.updateCameraProjectionMatrix({
                origin: camera.position,
                facing: camera.quaternion,
              });
              encaixarCanvas();
              if (!parado) setFase("mirando");
            },
            onCanvasSizeChange: () => {
              encaixarCanvas();
            },
            onUpdate: () => {
              if (canvas.style.width !== "100%" || canvas.style.height !== "100%") {
                canvas.style.width = "100%";
                canvas.style.height = "100%";
              }
              const { camera } = motor.Threejs.xrScene();
              const delta = relogio.getDelta();
              if (colocado) {
                cemiterio.update(camera, delta);
                return;
              }
              camera.updateMatrixWorld();
              raio.setFromCamera(centroDaTela, camera);
              const acerto = raio.ray.intersectPlane(chao, ponto);
              const valido =
                acerto !== null && acerto.distanceTo(raio.ray.origin) < ALCANCE;
              circulo.visible = valido;
              if (valido) {
                circulo.position.copy(ponto);
                circulo.scale.setScalar(1 + Math.sin(relogio.elapsedTime * 4) * 0.06);
              }
              if (valido !== acertando) {
                acertando = valido;
                setNoChao(valido);
              }
            },
            listeners: [
              {
                event: "reality.trackingstatus",
                process: ({ detail }) => setRastreio(detail),
              },
            ],
            onCameraStatusChange: ({ status }) => {
              if (status === "failed" && !parado) setFase("erro");
            },
            onException: () => {
              if (!parado) setFase("erro");
            },
          },
        ]);
        motor.run({ canvas, allowedDevices: motor.XrConfig.device().ANY });
      } catch {
        if (!parado) setFase("erro");
      }
    };

    void ligar();

    return () => {
      parado = true;
      window.removeEventListener("resize", encaixarCanvas);
      posicionarRef.current = null;
      reposicionarRef.current = null;
      mostrarFraseRef.current = () => {};
      if (xr8) {
        xr8.stop();
        xr8.clearCameraPipelineModules();
      }
      palco.replaceChildren();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-ink text-bone">
      <div ref={palcoRef} className="absolute inset-0 overflow-hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-6">
        <p className="max-w-sm rounded-2xl bg-ink/80 px-4 py-2 text-center font-sans text-sm leading-5">
          {legenda(fase, noChao, rastreio)}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-5 pb-6">
        {fase === "mirando" ? (
          <button
            type="button"
            disabled={!noChao}
            onClick={() => {
              tocarMusica();
              posicionarRef.current?.();
            }}
            className="h-14 w-full max-w-sm rounded-full bg-ember font-sans text-base text-bone disabled:opacity-40"
          >
            Posicionar o cemitério
          </button>
        ) : null}
        {fase === "colocado" ? (
          <>
            <button
              type="button"
              disabled={!foco && fraseAberta === null}
              onClick={() => {
                tocarMusica();
                const proxima = fraseAberta === foco?.id ? null : (foco?.id ?? null);
                mostrarFraseRef.current(proxima);
                setFraseAberta(proxima);
              }}
              className="h-14 w-full max-w-sm rounded-full bg-ember font-sans text-base text-bone disabled:opacity-40"
            >
              {rotuloDaFrase(foco, fraseAberta)}
            </button>
            <button
              type="button"
              onClick={() => reposicionarRef.current?.()}
              className="h-12 rounded-full border border-bone/30 bg-ink/80 px-5 font-sans text-sm"
            >
              Reposicionar
            </button>
          </>
        ) : null}
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

function legenda(fase: Fase, noChao: boolean, rastreio: TrackingStatus | null) {
  if (fase === "carregando") return "Preparando a câmera…";
  if (fase === "erro") {
    return "A câmera ou o movimento do celular não abriram. A lista de túmulos continua na página anterior.";
  }
  if (rastreio?.status === "LIMITED") {
    if (rastreio.reason === "TOO_MUCH_MOTION") return "Mexa o celular mais devagar.";
    if (rastreio.reason === "NOT_ENOUGH_TEXTURE") {
      return "Mostre também a borda da travessa e a mesa. A mousse lisa sozinha engana a câmera.";
    }
    return "Mexa o celular devagar de um lado para o outro.";
  }
  if (fase === "mirando" && !noChao) {
    return "Aponte para baixo até o círculo deitar no centro da sobremesa.";
  }
  if (fase === "mirando") return "Círculo no centro? Toque em Posicionar o cemitério.";
  return "Aponte para uma lápide e toque em Ler a lápide. A frase aparece em cima da pedra.";
}

function rotuloDaFrase(foco: FocoLapide | null, fraseAberta: string | null) {
  if (foco && fraseAberta === foco.id) return "Esconder a frase";
  if (foco) return `Ler a lápide de ${foco.nome}`;
  if (fraseAberta) return "Esconder a frase";
  return "Aponte para uma lápide";
}
