export default function () {
    const cookie = useCookie('subilan-blog-font-style');
    const fontStyle = useState('font-style', () => cookie.value || 'sans');

    if (fontStyle.value === 'sans') {
        fontStyle.value = 'serif';
    } else {
        fontStyle.value = 'sans';
    }

    cookie.value = fontStyle.value;
}
