# Cemitério interativo

WebAR de Halloween. A pessoa aponta um círculo para o centro da sobremesa, toca em Pronto, e quatro lápides ficam fincadas nesse ponto. Perto de uma pedra, a frase de efeito surge em cima dela.

Esta versão usa quatro pessoas genéricas. Os nomes e as frases ficam em `lib/amigos.ts`.

## Rodar

```bash
npm install
npm run dev
```

- `/` abre a entrada, a lista de túmulos e o botão da câmera.
- `/maquete` mostra o cemitério sem câmera. O controle **Aproximar** revela a frase.

## Na festa

1. O QR da mesa só abre o endereço HTTPS da Vercel.
2. Toque em **Entrar no cemitério** e aceite a câmera e o movimento do celular.
3. Incline o aparelho até o círculo deitar no centro da sobremesa e toque em **Pronto**.
4. Mexa o celular para olhar as lápides. Chegue perto de uma para a frase aparecer.

O círculo não depende mais do brasão impresso. Se a pessoa andar para o outro lado da mesa, o giro do celular não acompanha o passo: o encaixe vale para quem está olhando de onde tocou em Pronto.

A câmera do celular exige HTTPS. No computador, `localhost` basta.
