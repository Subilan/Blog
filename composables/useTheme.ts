export default function () {
	return {
		themeFont: useCookie('subilanblog-theme-font', {
			default: () => 'Literata'
		}),
		themeColor: useCookie('subilanblog-theme-color', {
			default: () => 'auto'
		}),
		themeStyle: useCookie('subilanblog-theme-style', {
			default: () => 'classic'
		})
	};
}
