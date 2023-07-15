import posts from "@/posts";
import pages from "@/pages";
import search from '@/searchdata.json';

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

export function getSearch(): Search[] {
    return search as Search[];
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

export function isPCWidth() {
    return window.innerWidth > 700;
}

export function disableScroll() {
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
}

export function enableScroll() {
    document.body.style.overflow = "";
    document.body.style.height = "";
}