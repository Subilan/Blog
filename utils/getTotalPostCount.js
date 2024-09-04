import posts from '~/data/posts.json'

export default function getTotalPostCount() {
    return posts.filter(x => !x.hidden).length;
}