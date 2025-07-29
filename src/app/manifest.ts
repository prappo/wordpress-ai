import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
      name: 'WordPress AI',
  short_name: 'WordPress AI',
    description: 'AI-Powered WordPress Development',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
