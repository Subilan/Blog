import postdigests from '~/data/postdigests.json';

export default function getPostDigest(id: string) {
    return postdigests.find(x => x.id === id);
}