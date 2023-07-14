const cates = ["代码", "思想", "实现"]

interface PostFrontmatter {
    hidden?: boolean,
    date: string,
    cate: typeof cates[number],
    desc: string,
    english?: boolean,
}

interface Post {
    title: string,
    filename: string,
    frontmatters: Partial<PostFrontmatter>
}