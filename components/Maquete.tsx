"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio } from "@/lib/cena";
import { loadThree } from "@/lib/mindar";

export function Maquete() {
  const palcoRef = useRef<HTMLDivElement>(null);
  const distanciaRef = useRef(2.5);

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let quadro = 0;
    let limpar = () => {};

    const montar = async () => {
      try {
      const THREE = await loadThree();
      if (parado || !palco) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      palco.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#e7b4c4");
      const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 20);

      const brasao = new THREE.TextureLoader().load("/markers/centro.png");
      brasao.colorSpace = THREE.SRGBColorSpace;
      scene.add(
        new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ map: brasao }),
        ),
      );

      const cemiterio = criarCemiterio(THREE, AMIGOS);
      scene.add(cemiterio.group);
      cemiterio.surgir();

      const pedida = Number(
        new URLSearchParams(window.location.search).get("distancia"),
      );
      if (Number.isFinite(pedida) && pedida > 0) {
        distanciaRef.current = pedida;
      }

      const relogio = new THREE.Clock();
      const ajustar = () => {
        const largura = palco.clientWidth;
        const altura = palco.clientHeight;
        renderer.setSize(largura, altura, false);
        camera.aspect = largura / Math.max(altura, 1);
        camera.updateProjectionMatrix();
      };
      ajustar();
      window.addEventListener("resize", ajustar);

      const desenhar = () => {
        const distancia = distanciaRef.current;
        const perto = Math.min(1, Math.max(0, (3.3 - distancia) / 2.15));
        camera.position.set(0, -0.85 - perto * 0.7, 2.55 - perto * 1.45);
        camera.lookAt(0, -perto * 0.68, 0.05);
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
      } catch (error) {
        console.error(error);
      }
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
            min={1.15}
            max={3.3}
            step={0.01}
            defaultValue={2.5}
            aria-label="Aproximar a câmera"
            className="w-full accent-ember"
            onChange={(event) => {
              distanciaRef.current = Number(event.target.value);
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
