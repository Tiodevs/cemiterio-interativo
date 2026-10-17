import type { Camera, Scene, WebGLRenderer } from "three";

export type XrScene = {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
};

export type TrackingStatus = {
  status: "LIMITED" | "NORMAL";
  reason?: string;
};

export type PipelineModule = {
  name: string;
  onStart?: (args: { canvas: HTMLCanvasElement }) => void;
  onUpdate?: () => void;
  onException?: (error: unknown) => void;
  onCameraStatusChange?: (args: { status: string }) => void;
  listeners?: {
    event: string;
    process: (args: { detail: TrackingStatus }) => void;
  }[];
};

type Modulo = { pipelineModule: () => PipelineModule };

export type XR8 = {
  addCameraPipelineModules: (modules: PipelineModule[]) => void;
  clearCameraPipelineModules: () => void;
  run: (options: { canvas: HTMLCanvasElement; allowedDevices?: string }) => void;
  stop: () => void;
  GlTextureRenderer: Modulo;
  Threejs: Modulo & { xrScene: () => XrScene };
  XrController: Modulo & {
    configure: (options: Record<string, unknown>) => void;
    updateCameraProjectionMatrix: (options: {
      origin: { x: number; y: number; z: number };
      facing: { x: number; y: number; z: number; w: number };
    }) => void;
    recenter: () => void;
  };
  XrConfig: { device: () => { ANY: string } };
};

declare global {
  interface Window {
    XR8?: XR8;
    THREE?: unknown;
  }
}

let carregando: Promise<XR8> | null = null;

export function loadXr8() {
  if (window.XR8) return Promise.resolve(window.XR8);
  if (carregando) return carregando;

  carregando = new Promise<XR8>((resolve, reject) => {
    const pronto = () => {
      if (window.XR8) resolve(window.XR8);
    };
    window.addEventListener("xrloaded", pronto, { once: true });

    const script = document.createElement("script");
    script.src = "/xr/xr.js";
    script.async = true;
    script.dataset.preloadChunks = "slam";
    script.onerror = () => {
      carregando = null;
      reject(new Error("O motor de AR não carregou."));
    };
    document.head.append(script);
  });
  return carregando;
}
