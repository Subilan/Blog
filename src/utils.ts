import posts from "@/posts";
import pages from "@/pages";

export function getSortedPosts(): Post[] {
    return Object.values(posts).sort((a, b) => {
        return new Date(b.frontmatters.date?.replace("/", "-") || 0).getTime() - new Date(a.frontmatters.date?.replace("/", "-") || 0).getTime()
    }).map(x => {
        return {
            title: x.title,
            filename: x.filename,
            frontmatters: x.frontmatters
        }
    });
}

export function getPages(): Page[] {
    return Object.values(pages);
}

export function getCardIcon(cate: string | undefined) {
    if (!cate) return "";
    const match: Record<string, string> = {
        '思想': 'circle-opacity',
        '路径': 'arrow-right-top-bold',
        '记录': 'fountain-pen-tip',
        '代码': 'code-tags',
        '诗': 'flower-tulip'
    }
    return match[cate] ? `mdi-${match[cate]}` : "";
}