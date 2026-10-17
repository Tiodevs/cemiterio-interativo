import type { Camera, Group, Mesh, MeshBasicMaterial } from "three";
import type * as ThreeTypes from "three";
import type { Amigo, Simbolo } from "@/lib/amigos";

type ThreeModule = typeof ThreeTypes;

export type FocoLapide = {
  id: string;
  nome: string;
};

export type CenaCemiterio = {
  group: Group;
  surgir: () => void;
  update: (camera: Camera, delta: number) => void;
  mostrarFrase: (id: string | null) => void;
};

type OpcoesCena = {
  aoMudarFoco?: (foco: FocoLapide | null) => void;
};

/** 1 unidade = 10 cm. O chão da cena (y = 0) é a superfície da sobremesa. */
const RAIO_X = 1;
const RAIO_Z = 0.7;
const LARGURA_PEDRA = 0.5;
const ALTURA_PEDRA = 0.72;

type Lapide = {
  id: string;
  nome: string;
  pedra: Mesh;
  letreiro: Mesh;
  material: MeshBasicMaterial;
};

export function criarCemiterio(
  THREE: ThreeModule,
  amigos: Amigo[],
  opcoes: OpcoesCena = {},
): CenaCemiterio {
  const group = new THREE.Group();
  const lapides: Lapide[] = [];
  const morcegos = new THREE.Group();
  const texturaMorcego = texturaDeCanvas(THREE, desenharMorcego());

  const terra = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 64),
    new THREE.MeshBasicMaterial({
      color: 0x1a120e,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  );
  terra.rotation.x = -Math.PI / 2;
  terra.scale.set(RAIO_X, RAIO_Z, 1);
  terra.position.y = 0.002;
  group.add(terra);

  const anel = new THREE.Mesh(
    new THREE.RingGeometry(0.94, 1, 64),
    new THREE.MeshBasicMaterial({
      color: 0x1a120e,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  anel.rotation.x = -Math.PI / 2;
  anel.scale.set(RAIO_X, RAIO_Z, 1);
  anel.position.y = 0.004;
  group.add(anel);

  amigos.forEach((amigo, index) => {
    const angulo = (index / amigos.length) * Math.PI * 2 + Math.PI / 2;
    const geometria = new THREE.PlaneGeometry(LARGURA_PEDRA, ALTURA_PEDRA);
    geometria.translate(0, ALTURA_PEDRA / 2, 0);
    const pedra = new THREE.Mesh(
      geometria,
      new THREE.MeshBasicMaterial({
        map: texturaDeCanvas(THREE, desenharLapide(amigo)),
        transparent: true,
        alphaTest: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    pedra.position.set(Math.cos(angulo) * RAIO_X, 0, Math.sin(angulo) * RAIO_Z);

    const material = new THREE.MeshBasicMaterial({
      map: texturaDeCanvas(THREE, desenharFrase(amigo.frase)),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    });
    const letreiro = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.21), material);
    letreiro.position.set(pedra.position.x, ALTURA_PEDRA + 0.16, pedra.position.z);
    letreiro.renderOrder = 10;
    letreiro.visible = false;

    group.add(pedra, letreiro);
    lapides.push({ id: amigo.id, nome: amigo.nome, pedra, letreiro, material });
  });

  for (let index = 0; index < 3; index += 1) {
    const angulo = (index / 3) * Math.PI * 2;
    const morcego = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.13),
      new THREE.MeshBasicMaterial({
        map: texturaMorcego,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    morcego.position.set(Math.cos(angulo) * 0.55, 1.25 + index * 0.12, Math.sin(angulo) * 0.4);
    morcegos.add(morcego);
  }
  group.add(morcegos);

  let subida = 0;
  let surgindo = false;
  let fraseId: string | null = null;
  let focoId: string | null = null;
  group.scale.setScalar(0.001);

  const cameraNoMundo = new THREE.Vector3();
  const cameraNoGrupo = new THREE.Vector3();
  const meio = new THREE.Vector3();

  return {
    group,
    surgir() {
      surgindo = true;
      subida = 0;
    },
    mostrarFrase(id) {
      fraseId = id;
    },
    update(camera, delta) {
      if (surgindo) {
        subida = Math.min(1, subida + delta * 1.2);
      }
      const curva = 1 - (1 - subida) ** 3;
      group.scale.setScalar(Math.max(0.001, curva));
      group.updateWorldMatrix(true, true);
      morcegos.rotation.y += delta * 0.7;

      camera.getWorldPosition(cameraNoMundo);
      cameraNoGrupo.copy(cameraNoMundo);
      group.worldToLocal(cameraNoGrupo);

      let escolhida: Lapide | null = null;
      let distanciaAoCentro = Infinity;

      for (const lapide of lapides) {
        const { pedra } = lapide;
        pedra.rotation.y = Math.atan2(
          cameraNoGrupo.x - pedra.position.x,
          cameraNoGrupo.z - pedra.position.z,
        );
        meio.set(pedra.position.x, ALTURA_PEDRA / 2, pedra.position.z);
        group.localToWorld(meio);
        meio.project(camera);
        const naTela = meio.z < 1 && Math.abs(meio.x) < 1 && Math.abs(meio.y) < 1;
        const aoCentro = Math.hypot(meio.x, meio.y);
        if (naTela && aoCentro < 0.5 && aoCentro < distanciaAoCentro) {
          distanciaAoCentro = aoCentro;
          escolhida = lapide;
        }
      }

      const novoFoco = escolhida?.id ?? null;
      if (novoFoco !== focoId) {
        focoId = novoFoco;
        opcoes.aoMudarFoco?.(escolhida ? { id: escolhida.id, nome: escolhida.nome } : null);
      }

      const passo = Math.min(1, delta * 8);

      for (const lapide of lapides) {
        const alvo = lapide.id === fraseId ? 1 : 0;
        lapide.material.opacity += (alvo - lapide.material.opacity) * passo;
        lapide.letreiro.visible = lapide.material.opacity > 0.04;
        const escala = 0.75 + lapide.material.opacity * 0.25;
        lapide.letreiro.scale.setScalar(escala);
        lapide.letreiro.lookAt(cameraNoMundo);
      }

      for (const morcego of morcegos.children) {
        morcego.lookAt(cameraNoMundo);
      }
    },
  };
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
  const base = 760;
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
