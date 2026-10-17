export type Simbolo = "lua" | "morcego" | "aranha" | "vela";

export type Amigo = {
  id: string;
  nome: string;
  frase: string;
  simbolo: Simbolo;
};

const SIMBOLOS: Simbolo[] = ["lua", "morcego", "aranha", "vela"];

const PESSOAS: { nome: string; frase: string }[] = [
  {
    nome: "Jonas",
    frase: "Morreu enviando uma figurinha do Leonardo DiCaprio",
  },
  {
    nome: "Jaque",
    frase: "Morreu de tristeza com o fim da carreira da Ariana Grande",
  },
  {
    nome: "Leo",
    frase: "Morreu de tanto batizar",
  },
  {
    nome: "Felipe",
    frase: "Morreu depois de ficar 4 dias programando sem parar",
  },
  {
    nome: "Ludi",
    frase: "Morreu depois de declarar o IR de todos os macacos",
  },
  {
    nome: "Tone",
    frase: "Morreu depois de beber 30 Pepsi",
  },
  {
    nome: "Francisco",
    frase: "Morreu ao trabalhar em 10 empregos em uma semana",
  },
  {
    nome: "Pedro",
    frase: "Morreu ao tentar farmar aura",
  },
  {
    nome: "Vittoria",
    frase: "Morreu lutando contra um urso canadense",
  },
];

export const AMIGOS: Amigo[] = PESSOAS.map((pessoa, index) => ({
  id: pessoa.nome.toLowerCase(),
  nome: pessoa.nome,
  frase: pessoa.frase,
  simbolo: SIMBOLOS[index % SIMBOLOS.length],
}));
