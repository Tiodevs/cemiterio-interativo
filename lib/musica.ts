const FAIXA = "/audio/suspense.mp3";

let faixa: HTMLAudioElement | null = null;

/** O iPhone só deixa o som sair se o play() nascer de um toque. */
export function tocarMusica() {
  if (!faixa) {
    faixa = new Audio(FAIXA);
    faixa.loop = true;
    faixa.volume = 0.55;
    faixa.preload = "auto";
  }
  void faixa.play().catch(() => undefined);
}
