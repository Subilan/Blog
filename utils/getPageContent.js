import pages from '@/data/pages.json';

export function getPageContent(slug) {
    const target = pages.filter(x => x.slug === slug);
    if (target.length === 0) return null;
    return target[0];
}