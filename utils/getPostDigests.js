import postdigests from '~/data/postdigests.json';

export default function getPostDigests() {
    return postdigests.filter(x => !x.hidden).sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime());
}