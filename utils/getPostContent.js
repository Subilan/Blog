import posts from '~/data/posts.json'

export default function getPostContent(slug) {
    const filtered = posts.filter(x => x.slug === slug);
    if (filtered.length > 0) return filtered[0];
    return null;
}