import postsearch from '@/data/postsearch.json';
import getNearestText from "@/utils/getNearestText.js";

export default function getSearchContent(keywords) {
    if (keywords === '') return [];
    const res = postsearch.filter(x => (x.content.toLowerCase().includes(keywords.toLowerCase()) || x.title.toLowerCase().includes(keywords.toLowerCase())) && !x.hidden);
    return res.map(x => {
        x['excerpt'] = getNearestText(x.content, keywords);
        return x;
    })
}