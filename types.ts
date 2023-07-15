const cates = ["代码", "思想", "实现"]

interface PostFrontmatter {
    hidden?: boolean,
    date: string,
    cate: typeof cates[number],
    desc: string,
    english?: boolean,
}

interface Page {
    title: string,
    filename: string
}

interface Post extends Page {
    frontmatters: Partial<PostFrontmatter>
}