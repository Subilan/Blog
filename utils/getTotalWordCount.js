import posts from '@/data/posts.json'

export default function getTotalWordCount() {
    return posts.reduce((a, b) => a + b.wordCount, 0);
}