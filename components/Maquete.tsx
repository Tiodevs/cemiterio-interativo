"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AMIGOS } from "@/lib/amigos";
import { criarCemiterio } from "@/lib/cena";
import { loadThree } from "@/lib/mindar";

export function Maquete() {
  const palcoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;

    let parado = false;
    let quadro = 0;
    let limpar = () => {};

    const montar = async () => {
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
        const tempo = relogio.getElapsedTime();
        camera.position.set(Math.sin(tempo * 0.25) * 0.55, -1.2, 2.15);
        camera.lookAt(0, 0, 0);
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
      <div className="pointer-events-none absolute inset-x-0 top-0 px-4 pt-6 text-center">
        <p className="mx-auto max-w-sm rounded-full bg-ink/80 px-4 py-2 font-sans text-sm">
          Maquete sem câmera, para conferir o anel de lápides.
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-4 pb-6">
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
