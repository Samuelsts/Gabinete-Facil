import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Só em produção o Electron carrega via file://, exigindo caminhos
  // relativos. Em dev, o Next serve via http://localhost:3000, onde
  // caminho absoluto funciona normalmente — e é necessário para o
  // hot-reload (HMR) funcionar corretamente, sem exigir reload manual.
  assetPrefix: isDev ? undefined : './',
};

export default nextConfig;

//codigo funcionando antes da alteração que nao pegava em dev

// import type { NextConfig } from 'next';

// const nextConfig: NextConfig = {
//   output: 'export',
//   images: {
//     unoptimized: true,
//   },
//   trailingSlash: true,
//   // Sempre relativo, sem condicional: como a página é servida sempre
//   // a partir da raiz (tanto em "next dev" quanto no arquivo estático
//   // final), "./" funciona em ambos os casos sem diferença de
//   // comportamento — elimina qualquer risco de a condicional isProd
//   // não surtir efeito por alguma peculiaridade do Turbopack/Next 16.
//   assetPrefix: './',
// };

// export default nextConfig;
