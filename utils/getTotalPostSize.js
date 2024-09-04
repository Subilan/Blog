import postsearch from '~/data/postsearch.json';

export default function getTotalPostSize() {
    return postsearch.reduce((a, b) => a + b.filesize, 0);
}