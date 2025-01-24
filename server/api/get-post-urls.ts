import posts from '@/data/posts.json';

export default defineSitemapEventHandler(() => {
  return posts.filter(post => !post.hidden).map(post => {
    return {
      loc: `/posts/${post.slug}`
    }
  });
})
