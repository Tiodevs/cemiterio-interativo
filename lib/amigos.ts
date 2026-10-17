export type Simbolo = "lua" | "morcego" | "aranha" | "vela";

export type Amigo = {
  id: string;
  nome: string;
  frase: string;
  simbolo: Simbolo;
};

export const AMIGOS: Amigo[] = [
  {
    id: "aurora",
    nome: "Aurora",
    frase: "Aqui jaz quem pedia só mais cinco minutinhos.",
    simbolo: "lua",
  },
  {
    id: "bruno",
    nome: "Bruno",
    frase: "Morreu de rir da própria piada. De novo.",
    simbolo: "morcego",
  },
  {
    id: "caio",
    nome: "Caio",
    frase: "Disse que já estava descendo. O túmulo ainda espera.",
    simbolo: "aranha",
  },
  {
    id: "diana",
    nome: "Diana",
    frase: "Sumiu na hora da louça. Desta vez, para sempre.",
    simbolo: "vela",
  },
];
