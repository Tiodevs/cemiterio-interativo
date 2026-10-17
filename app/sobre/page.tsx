import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre o projeto — Cemitério interativo",
  description:
    "Como o cemitério digital da sobremesa foi feito, com quais tecnologias e quais desafios apareceram no caminho.",
};

export default function Sobre() {
  return (
    <main className="shell flex-1 py-16">
      <Link href="/" className="eyebrow transition-colors hover:text-cyan">
        Voltar
      </Link>
      <h1 className="display mt-8 max-w-3xl text-5xl text-bone sm:text-7xl">
        Sobre o projeto
      </h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-bone-dim">
        Um cemitério de Halloween que vive no navegador do celular. A pessoa
        aponta a câmera para a sobremesa, escolhe o ponto no centro da travessa
        e as lápides ficam fincadas na mesa. Dá para andar em volta. Perto de
        uma pedra, a frase aparece em cima dela.
      </p>

      <section className="mt-16 max-w-xl border-t border-ink-line pt-8">
        <h2 className="eyebrow">Tecnologias</h2>
        <ul className="mt-6 flex flex-col gap-4 text-base leading-7 text-bone-dim">
          <li>
            Next.js e React desenham a página. Não existe aplicativo para
            baixar: o QR da mesa abre o site no Safari ou no Chrome.
          </li>
          <li>
            Three.js monta as lápides, o chão e a frase que flutua sobre a
            pedra.
          </li>
          <li>
            O rastreio de mundo vem do motor de SLAM do 8th Wall. Ele entende
            para onde o celular andou, não só para onde girou, e segura a cena
            no lugar.
          </li>
          <li>
            O site fica na Vercel. A câmera do celular só abre em HTTPS.
          </li>
        </ul>
      </section>

      <section className="mt-16 max-w-xl border-t border-ink-line pt-8">
        <h2 className="eyebrow">Desafios</h2>
        <ul className="mt-6 flex flex-col gap-4 text-base leading-7 text-bone-dim">
          <li>
            A primeira versão seguia uma imagem impressa. Quando essa imagem
            saía do enquadramento, o cemitério sumia. Na festa a pessoa precisa
            andar em volta da mesa.
          </li>
          <li>
            Usar só o giro do celular deixava as lápides grudadas no centro da
            tela. Não havia como se aproximar de uma pedra.
          </li>
          <li>
            No iPhone, a permissão de movimento tem que nascer dentro do toque.
            Se a espera da câmera acontece antes, o pedido se perde e a cena não
            gruda na mesa.
          </li>
          <li>
            O desenho da câmera ficou maior que a tela e o navegador cortou a
            sobra. O círculo de mira aparecia preso na lateral.
          </li>
          <li>
            Uma sobremesa lisa tem pouca textura. O rastreio se apoia na borda
            da travessa e na mesa, não só na mousse.
          </li>
          <li>
            Nove lápides num círculo largo se cobriam. O grupo ficou menor:
            seis no anel e três no miolo.
          </li>
        </ul>
      </section>
    </main>
  );
}
