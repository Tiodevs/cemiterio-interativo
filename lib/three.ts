import type { Camera, Group, Scene, WebGLRenderer } from "three";

export type MindAnchor = {
  group: Group;
  onTargetFound: (() => void) | null;
  onTargetLost: (() => void) | null;
};

export type MindSession = {
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
  addAnchor: (index: number) => MindAnchor;
  start: () => Promise<void>;
  stop: () => void;
};

type MindModule = {
  MindARThree: new (options: {
    container: HTMLElement;
    imageTargetSrc: string;
    maxTrack: number;
    filterMinCF: number | null;
    filterBeta: number | null;
    warmupTolerance: number | null;
    missTolerance: number | null;
    uiLoading: string;
    uiScanning: string;
    uiError: string;
  }) => MindSession;
};

export function loadThree() {
  return import(/* webpackIgnore: true */ "three");
}

const MINDAR_URL = "/vendor/mindar-image-three.prod.js";

export function loadMind() {
  return import(
    /* webpackIgnore: true */
    /* turbopackIgnore: true */
    MINDAR_URL
  ) as Promise<MindModule>;
}
