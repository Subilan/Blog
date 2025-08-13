import type { AvailableFont } from '~/utils/types/fonts';

const defaultFontSheetMapping: Record<AvailableFont, string[]> = {
	Literata: ['/fonts/literata/literata.css', '/fonts/noto-serif-sc/noto-serif-sc.css'],
	'Open Sans': ['/fonts/open-sans/open-sans.css'],
	Inter: ['/fonts/inter/inter.css'],
	'Fira Sans': ['/fonts/fira-sans/fira-sans.css'],
	'IBM Plex Sans': ['/fonts/ibm-plex-sans/ibm-plex-sans.css'],
	'Noto Sans': ['/fonts/noto-sans-sc/noto-sans-sc.css']
};

function buildStyleSheets(paths: string[]) {
	return paths.map(x => {
		return {
			rel: 'stylesheet' as const,
			href: x
		};
	});
}

export default function (currentFont: AvailableFont): Ref<{ rel: 'stylesheet'; href: string }[]> {
	return ref(buildStyleSheets(defaultFontSheetMapping[currentFont]));
}
