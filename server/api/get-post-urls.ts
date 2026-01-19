import postdigests from '~/data/postdigests.json';

export default defineSitemapEventHandler(() => {
  return postdigests.map(post => {
    return {
      loc: `/posts/${post.id}`
    }
  });
})
