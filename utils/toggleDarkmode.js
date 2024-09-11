import {usePreferredDark} from "@vueuse/core";

export default function (state) {
    const preference = usePreferredDark();
    const cookie = useCookie('subilan-blog-dark-mode-indicator');
    const forceMode = useState('force-mode');

    switch (forceMode.value) {
        case 'dark': {
            forceMode.value = 'light';
            break;
        }

        case 'light': {
            forceMode.value = 'dark';
            break;
        }

        default: {
            forceMode.value = preference.value ? 'light' : 'dark';
        }
    }

    cookie.value = forceMode.value;
}