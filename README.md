# Cemitério interativo

WebAR de Halloween. Um brasão deitado no centro da sobremesa segura quatro lápides digitais. De longe aparecem os nomes. Perto de uma pedra, a frase de efeito surge em cima dela.

Esta versão usa quatro pessoas genéricas. Os nomes e as frases ficam em `lib/amigos.ts`.

## Rodar

```bash
npm install
npm run dev
```

- `/` abre a entrada, a lista de túmulos e o botão da câmera.
- `/maquete` mostra o cemitério sem câmera. O controle **Aproximar** revela a frase.
- `/imprimir` gera o brasão com 10 cm de lado.

## Imprimir e usar na festa

1. Abra `/imprimir` e imprima em **100%**, sem ajustar à página.
2. O quadrado tem 10 cm. Recorte, plastifique fosco e deite o brasão **virado para cima** no meio do doce, sobre uma base que não afunde.
3. O QR da mesa é outro papel: ele só abre o endereço do site. Não use o QR como marcador.
4. No celular, toque em **Entrar no cemitério** e aponte para o brasão. Suba e desça o aparelho ainda com o centro no quadro. Se o brasão sair da imagem, o cemitério some.

A câmera do celular exige HTTPS. No computador, `localhost` basta. Para a festa, publique na Vercel e aponte o QR para essa URL.

Uma luz em cima da travessa ajuda o rastreio. Luz roxa muito fraca atrapalha.

## Trocar o brasão

O desenho está em `public/markers/centro.svg`. Para gerar o PNG e o alvo do MindAR de novo:

```bash
npm run compile:marker
```

O script usa o Google Chrome instalado nesta máquina. Se o brasão mudar e o `.mind` não for recompilado, a câmera deixa de reconhecer.
