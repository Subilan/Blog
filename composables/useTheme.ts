export default function () {
	return {
		themeFont: useCookie('subilanblog-theme-font', {
			default: () => 'Literata'
		}),
		themeColor: useCookie('subilanblog-theme-color', {
			default: () => 'auto'
		}),
		themePalette: useCookie('subilanblog-theme-palette', {
			default: () => 'classic'
		})
	};
}
