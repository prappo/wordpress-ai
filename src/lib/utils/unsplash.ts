const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function searchUnsplashImage(query: string) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      const image = data.results[0];
      return {
        url: image.urls.regular,
        alt: image.alt_description || query,
        photographer: image.user.name,
        photographerUrl: image.user.links.html,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return null;
  }
}

export async function getUnsplashImage(id: string) {
  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/${id}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const image = await response.json();
    return {
      url: image.urls.regular,
      alt: image.alt_description || 'Unsplash image',
      photographer: image.user.name,
      photographerUrl: image.user.links.html,
    };
  } catch (error) {
    console.error('Error fetching from Unsplash:', error);
    return null;
  }
} 