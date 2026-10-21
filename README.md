# AnMar Lovers · Brandbook interativo

Apresentação interativa da marca AnMar Lovers, montada a partir do kit de marca no Google Drive
(pranchas do brandbook, Guia Social Media, Guia de entrega e produção, LEIA-ME e manifesto do kit).

## Como abrir

Página estática, sem build. Abra `index.html` no navegador, ou sirva a pasta:

```sh
npx serve .
```

Para publicar no GitHub Pages: Settings → Pages → Deploy from branch → pasta raiz.

## Conteúdo

Capa com o símbolo em 3D (arraste para girar) · Essência · Construção do logo em 6 etapas no scroll ·
Cores em rolagem horizontal · Tipografia cinética e visualizador de glifos · Pattern com paralaxe e profundidade ·
Ícones · Estúdio 3D com caixa, sacola, cartão, tag, adesivo, papel de seda e símbolo · Instagram · Voz · Conteúdo · Peças.

## Estrutura

- `index.html`, `css/site.css`
- `js/main.js`: animações de scroll (GSAP + ScrollTrigger), rolagem suave (Lenis) e interações
- `js/hero3d.js`, `js/studio3d.js`: cenas 3D (Three.js)
- `js/brand-data.js`: caminhos vetoriais oficiais do logo; `js/brand.js` desenha logo, símbolo e pattern
- `vendor/`: Three.js 0.160, GSAP 3.12.5 e Lenis 1.1.13, servidos localmente
- `assets/mockups/`: fotos de mockup do kit; `lista.json` diz quais arquivos a galeria mostra

O site usa módulos ES, então precisa ser servido por HTTP (GitHub Pages ou `npx serve .`), não aberto como arquivo.
