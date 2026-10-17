import type { Camera, Group, Mesh, MeshBasicMaterial, Object3D } from "three";
import type * as ThreeTypes from "three";
import type { Amigo, Simbolo } from "@/lib/amigos";

type ThreeModule = typeof ThreeTypes;

export type CenaCemiterio = {
  group: Group;
  surgir: () => void;
  update: (camera: Camera, delta: number) => void;
};

const RAIO_X = 0.98;
const RAIO_Y = 0.7;

type Lapide = {
  pedra: Mesh;
  letreiro: Mesh;
  material: MeshBasicMaterial;
};

export function criarCemiterio(
  THREE: ThreeModule,
  amigos: Amigo[],
): CenaCemiterio {
  const group = new THREE.Group();
  const lapides: Lapide[] = [];
  const morcegos = new THREE.Group();
  const texturaMorcego = texturaDeCanvas(THREE, desenharMorcego());

  amigos.forEach((amigo, index) => {
    const angulo = (index / amigos.length) * Math.PI * 2 - Math.PI / 2;
    const pedra = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.52),
      new THREE.MeshBasicMaterial({
        map: texturaDeCanvas(THREE, desenharLapide(amigo)),
        transparent: true,
        alphaTest: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    pedra.position.set(
      Math.cos(angulo) * RAIO_X,
      Math.sin(angulo) * RAIO_Y,
      0.02,
    );
    const material = new THREE.MeshBasicMaterial({
      map: texturaDeCanvas(THREE, desenharFrase(amigo.frase)),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const letreiro = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.24), material);
    letreiro.visible = false;
    group.add(pedra, letreiro);
    lapides.push({ pedra, letreiro, material });
  });

  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.78, 0.86, 64),
    new THREE.MeshBasicMaterial({
      color: 0x1a120e,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    }),
  );
  anel.scale.set(RAIO_X, RAIO_Y, 1);
  anel.position.z = 0.001;
  group.add(anel);

  for (let index = 0; index < 3; index += 1) {
    const angulo = (index / 3) * Math.PI * 2;
    const morcego = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.1),
      new THREE.MeshBasicMaterial({
        map: texturaMorcego,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    morcego.position.set(Math.cos(angulo) * 0.5, Math.sin(angulo) * 0.34, 0.62);
    morcegos.add(morcego);
  }
  group.add(morcegos);

  let subida = 0;
  let surgindo = false;
  group.scale.setScalar(0.001);

  return {
    group,
    surgir() {
      surgindo = true;
      subida = 0;
    },
    update(camera, delta) {
      if (surgindo) {
        subida = Math.min(1, subida + delta * 1.35);
      }
      const curva = 1 - (1 - subida) ** 3;
      group.scale.setScalar(Math.max(0.001, curva));
      group.parent?.updateMatrixWorld(true);
      morcegos.rotation.z += delta * 0.65;

      const cameraNoMundo = new THREE.Vector3();
      camera.getWorldPosition(cameraNoMundo);
      const posicao = new THREE.Vector3();
      const projetado = new THREE.Vector3();
      let escolhida: Lapide | null = null;
      let distanciaAoCentro = Infinity;

      for (const lapide of lapides) {
        lapide.pedra.lookAt(cameraNoMundo);
        lapide.pedra.getWorldPosition(posicao);
        projetado.copy(posicao).project(camera);
        const naTela =
          projetado.z < 1 &&
          Math.abs(projetado.x) < 1.05 &&
          Math.abs(projetado.y) < 1.05;
        const aoCentro = Math.hypot(projetado.x, projetado.y);
        if (naTela && aoCentro < distanciaAoCentro) {
          distanciaAoCentro = aoCentro;
          escolhida = lapide;
        }
      }

      const zoom = escolhida
        ? aproximacaoDaPedra(THREE, escolhida.pedra, camera)
        : 0;
      const mira = THREE.MathUtils.clamp(1 - distanciaAoCentro / 0.5, 0, 1);

      for (const lapide of lapides) {
        const alvo = lapide === escolhida ? zoom * mira : 0;
        const passo = Math.min(1, delta * 8);
        lapide.material.opacity += (alvo - lapide.material.opacity) * passo;
        lapide.letreiro.visible = lapide.material.opacity > 0.04;
        const topo = new THREE.Vector3(0, 0.36, 0);
        lapide.pedra.localToWorld(topo);
        group.worldToLocal(topo);
        lapide.letreiro.position.copy(topo);
        lapide.letreiro.lookAt(cameraNoMundo);
      }

      for (const morcego of morcegos.children) {
        (morcego as Object3D).lookAt(cameraNoMundo);
      }
    },
  };
}

function aproximacaoDaPedra(
  THREE: ThreeModule,
  pedra: Mesh,
  camera: Camera,
) {
  pedra.updateMatrixWorld(true);
  const baixo = new THREE.Vector3(0, -0.26, 0);
  const cima = new THREE.Vector3(0, 0.26, 0);
  pedra.localToWorld(baixo);
  pedra.localToWorld(cima);
  baixo.project(camera);
  cima.project(camera);
  const altura = Math.hypot(baixo.x - cima.x, baixo.y - cima.y);
  return THREE.MathUtils.clamp((altura - 0.2) / 0.16, 0, 1);
}

function texturaDeCanvas(THREE: ThreeModule, canvas: HTMLCanvasElement) {
  const textura = new THREE.CanvasTexture(canvas);
  textura.colorSpace = THREE.SRGBColorSpace;
  textura.needsUpdate = true;
  return textura;
}

function desenharLapide(amigo: Amigo) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  tracarLapide(ctx);
  ctx.fillStyle = "#3a3532";
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = "#1a120e";
  ctx.stroke();

  ctx.save();
  ctx.translate(256, 300);
  ctx.fillStyle = "#f3e6c8";
  ctx.strokeStyle = "#f3e6c8";
  desenharSimbolo(ctx, amigo.simbolo);
  ctx.restore();

  ctx.fillStyle = "#f3e6c8";
  ctx.font = "600 78px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(amigo.nome, 256, 560);
  return canvas;
}

function tracarLapide(ctx: CanvasRenderingContext2D) {
  const x = 48;
  const largura = 416;
  const arco = largura / 2;
  const topo = 70;
  const base = 700;
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, topo + arco);
  ctx.arc(x + arco, topo + arco, arco, Math.PI, 0);
  ctx.lineTo(x + largura, base);
  ctx.closePath();
}

function desenharSimbolo(ctx: CanvasRenderingContext2D, simbolo: Simbolo) {
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  if (simbolo === "lua") {
    ctx.beginPath();
    ctx.arc(-10, 0, 54, 0.6, Math.PI * 1.7);
    ctx.stroke();
    return;
  }
  if (simbolo === "morcego") {
    ctx.beginPath();
    ctx.moveTo(-70, 10);
    ctx.quadraticCurveTo(-30, -50, 0, 0);
    ctx.quadraticCurveTo(30, -50, 70, 10);
    ctx.quadraticCurveTo(20, 8, 0, 24);
    ctx.quadraticCurveTo(-20, 8, -70, 10);
    ctx.fill();
    return;
  }
  if (simbolo === "aranha") {
    ctx.beginPath();
    ctx.arc(0, 8, 18, 0, Math.PI * 2);
    ctx.fill();
    for (let perna = 0; perna < 4; perna += 1) {
      const y = -20 + perna * 16;
      ctx.beginPath();
      ctx.moveTo(-16, y);
      ctx.lineTo(-58, y - 18);
      ctx.moveTo(16, y);
      ctx.lineTo(58, y - 18);
      ctx.stroke();
    }
    return;
  }
  ctx.fillRect(-12, -10, 24, 58);
  ctx.beginPath();
  ctx.ellipse(0, -28, 16, 24, 0, 0, Math.PI * 2);
  ctx.fill();
}

function desenharFrase(frase: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(26, 18, 12, 0.88)";
  ctx.beginPath();
  ctx.roundRect(20, 70, 984, 244, 40);
  ctx.fill();
  ctx.fillStyle = "#f3e6c8";
  ctx.font = "600 58px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const linhas = quebrarLinhas(ctx, frase, 900);
  const topo = 192 - ((linhas.length - 1) * 68) / 2;
  linhas.forEach((linha, index) => {
    ctx.fillText(linha, 512, topo + index * 68);
  });
  return canvas;
}

function quebrarLinhas(
  ctx: CanvasRenderingContext2D,
  frase: string,
  largura: number,
) {
  const linhas: string[] = [];
  let atual = "";
  for (const palavra of frase.split(" ")) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (ctx.measureText(tentativa).width > largura && atual) {
      linhas.push(atual);
      atual = palavra;
    } else {
      atual = tentativa;
    }
  }
  if (atual) linhas.push(atual);
  return linhas.slice(0, 3);
}

function desenharMorcego() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#1a120e";
  ctx.beginPath();
  ctx.moveTo(8, 70);
  ctx.quadraticCurveTo(50, 10, 128, 64);
  ctx.quadraticCurveTo(206, 10, 248, 70);
  ctx.quadraticCurveTo(180, 78, 128, 96);
  ctx.quadraticCurveTo(76, 78, 8, 70);
  ctx.fill();
  return canvas;
}
