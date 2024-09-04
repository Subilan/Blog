import {
    mdiHome,
    mdiHomeOutline,
    mdiInformation,
    mdiInformationOutline, mdiKey, mdiKeyOutline,
    mdiLinkBox,
    mdiLinkBoxOutline
} from "@mdi/js";

export const pages = [
    {
        name: '首页',
        to: '/',
        icon: mdiHomeOutline,
        iconActive: mdiHome
    },
    {
        name: '关于',
        to: '/pages/about',
        icon: mdiInformationOutline,
        iconActive: mdiInformation
    },
    {
        name: '友链',
        to: '/pages/blogroll',
        icon: mdiLinkBoxOutline,
        iconActive: mdiLinkBox
    },
    {
        name: 'PGP',
        to: '/pages/pgp',
        icon: mdiKeyOutline,
        iconActive: mdiKey
    }
]