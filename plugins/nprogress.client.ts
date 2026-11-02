import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

/** 同页锚点跳转在该时间窗内视为不触发进度条 */
const ANCHOR_SUPPRESS_WINDOW = 1000;

function isInPageAnchor(link: HTMLAnchorElement) {
	if (link.target && link.target !== '_self') return false;
	if (link.hasAttribute('download')) return false;

	const url = new URL(link.href, location.href);
	if (url.origin !== location.origin) return false;
	if (!url.hash || url.hash === '#') return false;

	return url.pathname === location.pathname && url.search === location.search;
}

export default defineNuxtPlugin(nuxtApp => {
	NProgress.configure({
		showSpinner: false,
		minimum: 0.08,
		speed: 300,
		trickleSpeed: 200
	});

	let anchorClickAt = 0;

	const onClick = (event: MouseEvent) => {
		const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
		const isPlainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
		anchorClickAt = isPlainClick && link && isInPageAnchor(link) ? Date.now() : 0;
	};

	document.addEventListener('click', onClick, true);

	nuxtApp.hook('page:loading:start', () => {
		if (Date.now() - anchorClickAt < ANCHOR_SUPPRESS_WINDOW) return;
		NProgress.start();
	});
	nuxtApp.hook('page:loading:end', () => {
		NProgress.done();
	});
	nuxtApp.hook('app:error', () => {
		NProgress.done();
	});
});
