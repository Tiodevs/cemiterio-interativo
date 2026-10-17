"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio } from "@/lib/cena";
import { loadThree } from "@/lib/mindar";

const LONGE = 5;
const PERTO = 1.6;

export function Maquete() {
  const palcoRef = useRef<HTMLDivElement>(null);
  const distanciaRef = useRef(LONGE);

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let quadro = 0;
    let limpar = () => {};

    const montar = async () => {
      const THREE = await loadThree();
      if (parado) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      palco.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#2a201c");
      const camera = new THREE.PerspectiveCamera(60, 1, 0.05, 60);

      const travessa = new THREE.Mesh(
        new THREE.CircleGeometry(1, 64),
        new THREE.MeshBasicMaterial({ color: "#e7a3b6" }),
      );
      travessa.rotation.x = -Math.PI / 2;
      travessa.scale.set(2, 1.25, 1);
      scene.add(travessa);

      const cemiterio = criarCemiterio(THREE, AMIGOS);
      scene.add(cemiterio.group);
      cemiterio.surgir();

      const pedida = Number(new URLSearchParams(window.location.search).get("distancia"));
      if (Number.isFinite(pedida) && pedida > 0) {
        distanciaRef.current = pedida;
      }

      const relogio = new THREE.Clock();
      const alvo = new THREE.Vector3();
      const direcao = new THREE.Vector3(0, 0.62, 0.78).normalize();
      const ajustar = () => {
        renderer.setSize(palco.clientWidth, palco.clientHeight, false);
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        camera.aspect = palco.clientWidth / Math.max(palco.clientHeight, 1);
        camera.updateProjectionMatrix();
      };
      ajustar();
      window.addEventListener("resize", ajustar);

      const desenhar = () => {
        const distancia = distanciaRef.current;
        const perto = THREE.MathUtils.clamp((LONGE - distancia) / (LONGE - PERTO), 0, 1);
        alvo.set(0, 0.2 + perto * 0.16, perto * 0.7);
        camera.position.copy(alvo).addScaledVector(direcao, distancia);
        camera.lookAt(alvo);
        cemiterio.update(camera, relogio.getDelta());
        renderer.render(scene, camera);
        quadro = window.requestAnimationFrame(desenhar);
      };
      desenhar();

      limpar = () => {
        window.removeEventListener("resize", ajustar);
        window.cancelAnimationFrame(quadro);
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    void montar();

    return () => {
      parado = true;
      limpar();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-ink text-bone">
      <div ref={palcoRef} className="absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6">
        <p className="max-w-sm rounded-full bg-ink/80 px-4 py-2 text-center font-sans text-sm">
          Arraste para chegar perto de uma lápide. A frase nasce em cima dela.
        </p>
        <label className="flex w-full max-w-xs items-center gap-3 rounded-full bg-ink/80 px-4 py-2 font-sans text-xs tracking-wide text-bone/80 uppercase">
          Aproximar
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0}
            aria-label="Aproximar a câmera"
            className="w-full accent-ember"
            onChange={(event) => {
              const perto = Number(event.target.value);
              distanciaRef.current = LONGE - perto * (LONGE - PERTO);
            }}
          />
        </label>
        <Link
          href="/"
          className="flex h-12 items-center rounded-full border border-bone/30 bg-ink/80 px-5 font-sans text-sm"
        >
          Voltar
        </Link>
      </div>
    </div>
  );
}
