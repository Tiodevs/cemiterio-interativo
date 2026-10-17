import type { PerspectiveCamera } from "three";
import type * as ThreeTypes from "three";

type ThreeModule = typeof ThreeTypes;

export type Orientacao = {
  ligar: () => void;
  parar: () => void;
  atualizar: () => void;
  temLeitura: () => boolean;
};

export async function pedirPermissaoDeOrientacao() {
  const evento = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
    requestPermission?: () => Promise<PermissionState>;
  };
  if (typeof evento.requestPermission !== "function") return true;
  try {
    return (await evento.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

export function criarOrientacao(
  THREE: ThreeModule,
  camera: PerspectiveCamera,
): Orientacao {
  const euler = new THREE.Euler();
  const ajuste = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  const giroDaTela = new THREE.Quaternion();
  const eixo = new THREE.Vector3(0, 0, 1);
  let leitura: DeviceOrientationEvent | null = null;
  let angulo = anguloDaTela();

  const aoOrientar = (evento: DeviceOrientationEvent) => {
    leitura = evento;
  };
  const aoGirar = () => {
    angulo = anguloDaTela();
  };

  return {
    ligar() {
      window.addEventListener("deviceorientation", aoOrientar);
      window.addEventListener("orientationchange", aoGirar);
    },
    parar() {
      window.removeEventListener("deviceorientation", aoOrientar);
      window.removeEventListener("orientationchange", aoGirar);
    },
    temLeitura() {
      return leitura?.beta != null;
    },
    atualizar() {
      if (leitura?.beta == null) return;
      const alpha = THREE.MathUtils.degToRad(leitura.alpha ?? 0);
      const beta = THREE.MathUtils.degToRad(leitura.beta);
      const gamma = THREE.MathUtils.degToRad(leitura.gamma ?? 0);
      euler.set(beta, alpha, -gamma, "YXZ");
      camera.quaternion.setFromEuler(euler);
      camera.quaternion.multiply(ajuste);
      camera.quaternion.multiply(
        giroDaTela.setFromAxisAngle(eixo, -THREE.MathUtils.degToRad(angulo)),
      );
    },
  };
}

function anguloDaTela() {
  const atual = screen.orientation?.angle;
  if (typeof atual === "number") return atual;
  const legado = (window as Window & { orientation?: number }).orientation;
  return legado ?? 0;
}
