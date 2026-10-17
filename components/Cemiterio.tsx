"use client";

import { useEffect, useRef, useState } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio } from "@/lib/cena";
import { loadThree } from "@/lib/mindar";
import { criarOrientacao } from "@/lib/orientacao";

type CemiterioProps = {
  onSair: () => void;
};

type Fase = "abrindo" | "mirando" | "colocado" | "erro";

/** 1 unidade = 10 cm. O celular fica cerca de 35 cm acima da mesa. */
const ALTURA = 3.5;

export function Cemiterio({ onSair }: CemiterioProps) {
  const palcoRef = useRef<HTMLDivElement>(null);
  const colocarRef = useRef<(() => boolean) | null>(null);
  const arrastoRef = useRef<((dx: number, dy: number) => void) | null>(null);
  const [fase, setFase] = useState<Fase>("abrindo");
  const [podeColocar, setPodeColocar] = useState(false);

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let quadro = 0;
    let video: HTMLVideoElement | null = null;
    let pararOrientacao = () => {};
    let soltarArrasto = () => {};

    const ligar = async () => {
      try {
        const THREE = await loadThree();
        if (parado) return;

        video = document.createElement("video");
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute("playsinline", "");
        video.className = "absolute inset-0 h-full w-full object-cover";
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
        if (parado) {
          stream.getTracks().forEach((trilha) => trilha.stop());
          return;
        }
        video.srcObject = stream;
        palco.append(video);
        await video.play();

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.className = "absolute inset-0 h-full w-full";
        palco.append(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(58, 1, 0.05, 40);
        camera.position.set(0, ALTURA, 0);
        camera.rotation.order = "YXZ";
        camera.rotation.x = -1.05;

        const orientacao = criarOrientacao(THREE, camera);
        orientacao.ligar();
        pararOrientacao = () => orientacao.parar();

        const circulo = new THREE.Mesh(
          new THREE.RingGeometry(0.34, 0.42, 64),
          new THREE.MeshBasicMaterial({
            color: 0xf3e6c8,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
          }),
        );
        circulo.rotation.x = -Math.PI / 2;
        scene.add(circulo);

        const cemiterio = criarCemiterio(THREE, AMIGOS);
        const suporte = new THREE.Group();
        cemiterio.group.rotation.x = -Math.PI / 2;
        suporte.add(cemiterio.group);
        suporte.visible = false;
        scene.add(suporte);

        const chao = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const raio = new THREE.Ray();
        const direcao = new THREE.Vector3();
        const ponto = new THREE.Vector3();
        const relogio = new THREE.Clock();
        let colocado = false;
        let mirando = false;
        let yaw = 0;
        let pitch = -1.05;

        const apontar = () => {
          if (orientacao.temLeitura()) {
            orientacao.atualizar();
            return;
          }
          camera.position.set(0, ALTURA, 0);
          camera.rotation.set(pitch, yaw, 0, "YXZ");
        };

        arrastoRef.current = (dx, dy) => {
          if (orientacao.temLeitura()) return;
          yaw -= dx * 0.005;
          pitch = Math.min(-0.25, Math.max(-1.35, pitch - dy * 0.005));
        };

        const noChao = () => {
          camera.getWorldDirection(direcao);
          if (direcao.y > -0.12) return false;
          raio.set(camera.position, direcao);
          return raio.intersectPlane(chao, ponto) !== null;
        };

        colocarRef.current = () => {
          if (colocado || !noChao()) return false;
          suporte.position.copy(ponto);
          suporte.rotation.y = Math.atan2(direcao.x, direcao.z) + Math.PI;
          suporte.visible = true;
          circulo.visible = false;
          cemiterio.surgir();
          colocado = true;
          setFase("colocado");
          setPodeColocar(false);
          return true;
        };

        const ajustar = () => {
          const largura = palco.clientWidth;
          const altura = palco.clientHeight;
          renderer.setSize(largura, altura, false);
          renderer.domElement.style.width = "100%";
          renderer.domElement.style.height = "100%";
          camera.aspect = largura / Math.max(altura, 1);
          camera.updateProjectionMatrix();
        };
        ajustar();
        window.addEventListener("resize", ajustar);

        const desenhar = () => {
          apontar();
          const visivel = !colocado && noChao();
          circulo.visible = visivel;
          if (visivel) {
            circulo.position.copy(ponto);
            const pulso = 1 + Math.sin(relogio.getElapsedTime() * 4) * 0.05;
            circulo.scale.setScalar(pulso);
          }
          if (visivel !== mirando) {
            mirando = visivel;
            setPodeColocar(visivel);
          }
          if (colocado) cemiterio.update(camera, relogio.getDelta());
          else relogio.getDelta();
          renderer.render(scene, camera);
          quadro = window.requestAnimationFrame(desenhar);
        };
        setFase("mirando");
        desenhar();

        soltarArrasto = () => {
          window.removeEventListener("resize", ajustar);
          window.cancelAnimationFrame(quadro);
          renderer.dispose();
        };
      } catch {
        if (!parado) setFase("erro");
      }
    };

    void ligar();

    return () => {
      parado = true;
      pararOrientacao();
      soltarArrasto();
      const trilha = video?.srcObject;
      if (trilha instanceof MediaStream) {
        trilha.getTracks().forEach((item) => item.stop());
      }
      palco.replaceChildren();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-ink text-bone"
      onPointerDown={(evento) => {
        let ultimoX = evento.clientX;
        let ultimoY = evento.clientY;
        const mover = (proximo: PointerEvent) => {
          arrastoRef.current?.(proximo.clientX - ultimoX, proximo.clientY - ultimoY);
          ultimoX = proximo.clientX;
          ultimoY = proximo.clientY;
        };
        const soltar = () => {
          window.removeEventListener("pointermove", mover);
          window.removeEventListener("pointerup", soltar);
        };
        window.addEventListener("pointermove", mover);
        window.addEventListener("pointerup", soltar);
      }}
    >
      <div ref={palcoRef} className="absolute inset-0 overflow-hidden" />
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-6">
        <p className="max-w-sm rounded-full bg-ink/80 px-4 py-2 text-center font-sans text-sm leading-5">
          {legenda(fase, podeColocar)}
        </p>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-5 pb-6"
        onPointerDown={(evento) => evento.stopPropagation()}
      >
        {fase === "mirando" ? (
          <button
            type="button"
            disabled={!podeColocar}
            onClick={() => {
              colocarRef.current?.();
            }}
            className="h-14 w-full max-w-sm rounded-full bg-ember font-sans text-base text-bone disabled:opacity-40"
          >
            Pronto
          </button>
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

function legenda(fase: Fase, podeColocar: boolean) {
  if (fase === "abrindo") return "Abrindo a câmera…";
  if (fase === "mirando" && !podeColocar) {
    return "Incline o celular até o círculo deitar no centro da sobremesa.";
  }
  if (fase === "mirando") {
    return "O círculo marca o centro. Toque em Pronto para fincar as lápides.";
  }
  if (fase === "colocado") {
    return "Mexa o celular para ver as pedras. Chegue perto para a frase aparecer.";
  }
  return "A câmera não abriu. A lista de túmulos continua na página anterior.";
}
