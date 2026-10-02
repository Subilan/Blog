import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export default defineNuxtPlugin((nuxtApp) => {
	NProgress.configure({ showSpinner: false });

	nuxtApp.hook('page:loading:start', () => {
		NProgress.start();
	});
	nuxtApp.hook('page:loading:end', () => {
		NProgress.done();
	});
	nuxtApp.hook('app:error', () => {
		NProgress.done();
	});
});
