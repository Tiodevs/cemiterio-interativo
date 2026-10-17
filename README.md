# Cemitério interativo

WebAR de Halloween. A pessoa deita um círculo no centro da sobremesa, toca em **Posicionar o cemitério**, e quatro lápides ficam fincadas na mesa. Dá para andar em volta. Com uma lápide no centro da tela, **Ler a lápide** mostra a frase em cima da pedra.

Esta versão usa quatro pessoas genéricas. Os nomes e as frases ficam em `lib/amigos.ts`.

## Rodar

```bash
npm install
npm run dev
```

- `/` abre a entrada, a lista de túmulos e o botão da câmera.
- `/maquete` mostra o cemitério sem câmera. **Ler a lápide** revela a frase.

## Na festa

1. O QR da mesa só abre o endereço HTTPS da Vercel.
2. Toque em **Entrar no cemitério** e aceite a câmera e o movimento do celular.
3. Comece com o celular a uns 35 cm da sobremesa, apontado para ela.
4. Mexa devagar até o círculo deitar no centro e toque em **Posicionar o cemitério**.
5. Ande em volta, aponte para uma lápide e toque em **Ler a lápide**. **Reposicionar** devolve o círculo.

Ao entrar, começa a trilha em `public/audio/suspense.mp3`. O celular só libera o som nesse toque.

A mousse lisa tem pouca textura para a câmera. Se aparecer o aviso, enquadre também a borda da travessa e a mesa.

A câmera do celular exige HTTPS. No computador, `localhost` basta.

## Rastreio

O rastreio de mundo vem do motor do 8th Wall, vendorizado em `public/xr`. Esses arquivos não podem ser alterados, e o aviso de licença no rodapé precisa ficar visível. O Three fica em `public/vendor`. Os dois carregam sem npm, por isso o lint ignora essas pastas.

Funciona no Safari do iPhone (iOS 16.4 ou mais novo) e no Chrome do Android.
