import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://daily-english-sentence.vercel.app/',
      lastModified: new Date(),
    },
  ];
}
