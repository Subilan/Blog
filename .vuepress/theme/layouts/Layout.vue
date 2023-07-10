<template>
	<div class="theme-container" :class="pageClasses" @touchstart="onTouchStart" @touchend="onTouchEnd">
		<Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />

		<div class="sidebar-mask" @click="toggleSidebar(false)"></div>

		<Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
			<slot name="sidebar-top" slot="top" />
			<slot name="sidebar-bottom" slot="bottom" />
		</Sidebar>
		<div class="post-list" v-if="isRoot">
			<div @click="$router.push(post.path)" class="post" v-for="(post, i) of getPages()" :key="i">
				<mdicon class="cate-icon" v-if="getCateIcon(post.frontmatter.cate) !== null"
					:name="getCateIcon(post.frontmatter.cate)" />
				<router-link class="post-title" :to="post.path">{{ post.title }}</router-link>
				<span class="last-updated">{{ post.frontmatter.date !== undefined ? post.frontmatter.date :
					getFormatedDate(post.lastUpdated) }} · 约 {{ post.frontmatter.english ? countWordsEn(post.content) :
		countWords(post.content) }} 字 {{ post.frontmatter.cate !== undefined ? '· ' + post.frontmatter.cate : ''
	}}</span>
				<span v-if="post.frontmatter.desc !== undefined" class="post-content"
					v-html="'<p>' + post.frontmatter.desc + '</p>'"></span>
			</div>
		</div>

		<Page v-else :sidebar-items="sidebarItems">
			<slot name="page-top" slot="top" />
			<slot name="page-bottom" slot="bottom" />
		</Page>

		<Footer />
	</div>
</template>

<script>
import Navbar from '@theme/components/Navbar.vue';
import Page from '@theme/components/Page.vue';
import Sidebar from '@theme/components/Sidebar.vue';
import Footer from '../components/Footer.vue';
import { resolveSidebarItems, getFormatedDate, getCateIcon, countWords } from '../util';

export default {
	components: { Page, Sidebar, Navbar, Footer },

	data() {
		return {
			isSidebarOpen: false,
			max: this.getPageCount
		};
	},

	computed: {
		shouldShowNavbar() {
			const { themeConfig } = this.$site;
			const { frontmatter } = this.$page;
			if (frontmatter.navbar === false || themeConfig.navbar === false) {
				return false;
			}
			return this.$title || themeConfig.logo || themeConfig.repo || themeConfig.nav || this.$themeLocaleConfig.nav;
		},

		shouldShowSidebar() {
			const { frontmatter } = this.$page;
			return !frontmatter.home && frontmatter.sidebar !== false && this.sidebarItems.length;
		},

		sidebarItems() {
			return resolveSidebarItems(this.$page, this.$page.regularPath, this.$site, this.$localePath);
		},

		pageClasses() {
			const userPageClass = this.$page.frontmatter.pageClass;
			return [
				{
					'no-navbar': !this.shouldShowNavbar,
					'sidebar-open': this.isSidebarOpen,
					'no-sidebar': !this.shouldShowSidebar
				},
				userPageClass
			];
		},

		isRoot() {
			const path = this.$route.path;
			return path === '/';
		},
	},

	mounted() {
		this.$router.afterEach(() => {
			this.isSidebarOpen = false;
		});
	},

	methods: {
		toggleSidebar(to) {
			this.isSidebarOpen = typeof to === 'boolean' ? to : !this.isSidebarOpen;
		},

		// side swipe
		onTouchStart(e) {
			this.touchStart = {
				x: e.changedTouches[0].clientX,
				y: e.changedTouches[0].clientY
			};
		},

		onTouchEnd(e) {
			const dx = e.changedTouches[0].clientX - this.touchStart.x;
			const dy = e.changedTouches[0].clientY - this.touchStart.y;
			if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
				if (dx > 0 && this.touchStart.x <= 80) {
					this.toggleSidebar(true);
				} else {
					this.toggleSidebar(false);
				}
			}
		},

		getPages() {
			let p = this.$site.pages.filter(i => !this.$site.themeConfig.hiddenPages.includes(i.path) && (i.frontmatter ? !i.frontmatter.hidden : true));
			return p.sort((a, b) => {
				return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
			});
		},

		getExcerptContent(excerpt) {
			return /^<h1.*?>(.|\n)*?<\/h1>((.|\n)*?)$/.exec(excerpt)[2];
		},

		getFormatedDate,

		isPublishDate(current, all_pages, index) {
			if (all_pages[index - 1] == undefined) return '';
			let c = new Date(current.lastUpdated).getTime();
			let n = new Date(all_pages[index - 1].lastUpdated).getTime();
			return c > n;
		},

		countWords,

		countWordsEn(str) {
			var matches = str.match(/[\w\d\’\'-]+/gi);
			return matches ? matches.length : 0;
		},

		getCateIcon
	}
};
</script>

<style lang="less" scoped>
@media screen and (max-width: 768px) {
	.post-list {
		padding: 16px !important;
	}
}

.post-list {
	max-width: 740px;
	margin: 0 auto;
	margin-top: 56px;
	padding: 2rem 2.5rem;
}

.post {
	overflow: hidden;
	background: white;
	border: 1px solid #eaecef;
	border-radius: 5px;
	margin-bottom: 16px;
	padding: 20px 16px;
	position: relative;
	transition: all 0.2s ease;

	.post-actions {
		display: flex;
		justify-content: flex-end;
	}

	.post-title {
		font-size: 36px;
		font-weight: 600;
	}

	.last-updated {
		margin-top: 16px;
		color: #bbb;
		display: block;
		font-size: 14px;
	}

	.continue-reading {
		padding: 6px;
		border-radius: 2px;
		background-color: white;
		display: inline-flex;
		transition: all linear 0.2s;
		border: 1px solid transparent;

		&:hover,
		&:focus {
			border-color: #3eaf7c;
			box-shadow: 0 2px 10px #eee;
		}
	}

	.edited-text {
		position: absolute;
		right: 16px;
		top: 16px;
		color: #bbb;
		font-size: 14px;
	}
}

.cate-icon {
	position: absolute;
	color: rgba(#3eaf7c, 0.5);
	right: 50px;
	bottom: 50px;
	transform: scale(10) translate3d(10px, 10px, 0);
	transition: all 0.3s ease;
	opacity: 0;
}

@media screen and (min-width: 900px) {
	.post:hover {
		.cate-icon {
			opacity: 1;
			transform: scale(9) translate3d(0, 0, 0);
		}

		border-color: #3eaf7c;
		cursor: pointer;
		transform: scale(1.05);
	}
}
</style>

<style lang="stylus" src="../styles/wrapper.styl"></style>
