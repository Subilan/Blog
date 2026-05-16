export default function () {
    const cookie = useCookie('subilan-blog-dark-mode-indicator');
    const forceMode = useState('force-mode', () => cookie.value || 'auto');

    switch (forceMode.value) {
        case 'auto':
        case undefined:
            forceMode.value = 'light';
            break;
        case 'light':
            forceMode.value = 'dark';
            break;
        case 'dark':
            forceMode.value = 'auto';
            break;
    }

    cookie.value = forceMode.value;
}
