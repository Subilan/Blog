<template>
	<div
		class="theme-container"
		:class="pageClasses"
		@touchstart="onTouchStart"
		@touchend="onTouchEnd"
	>
		<Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />

		<div class="sidebar-mask" @click="toggleSidebar(false)"></div>

		<Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
			<slot name="sidebar-top" slot="top" />
			<slot name="sidebar-bottom" slot="bottom" />
		</Sidebar>
		<div class="post-list" v-if="isRoot">
			<div class="post" v-for="(post, i) of getPages()" :key="i">
				<router-link class="post-title" :to="post.path">{{
					post.title
				}}</router-link>
				<span class="last-updated"
					>{{
						post.frontmatter.date !== undefined
							? post.frontmatter.date
							: getFormatedDate(post.lastUpdated)
					}}
					· 约 {{ countWords(post.content) }} 字</span
				>
				<span
					v-if="post.frontmatter.desc !== undefined"
					class="post-content"
					v-html="'<p>' + post.frontmatter.desc + '</p>'"
				></span>
				<div class="post-actions">
					<router-link class="continue-reading" :to="post.path"
						>查看全文 &raquo;</router-link
					>
				</div>
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
import Navbar from "@theme/components/Navbar.vue";
import Page from "@theme/components/Page.vue";
import Sidebar from "@theme/components/Sidebar.vue";
import Footer from "../components/Footer.vue";
import { resolveSidebarItems, getFormatedDate } from "../util";

export default {
	components: { Page, Sidebar, Navbar, Footer },

	data() {
		return {
			isSidebarOpen: false,
			max: this.getPageCount,
		};
	},

	computed: {
		shouldShowNavbar() {
			const { themeConfig } = this.$site;
			const { frontmatter } = this.$page;
			if (frontmatter.navbar === false || themeConfig.navbar === false) {
				return false;
			}
			return (
				this.$title ||
				themeConfig.logo ||
				themeConfig.repo ||
				themeConfig.nav ||
				this.$themeLocaleConfig.nav
			);
		},

		shouldShowSidebar() {
			const { frontmatter } = this.$page;
			return (
				!frontmatter.home &&
				frontmatter.sidebar !== false &&
				this.sidebarItems.length
			);
		},

		sidebarItems() {
			return resolveSidebarItems(
				this.$page,
				this.$page.regularPath,
				this.$site,
				this.$localePath
			);
		},

		pageClasses() {
			const userPageClass = this.$page.frontmatter.pageClass;
			return [
				{
					"no-navbar": !this.shouldShowNavbar,
					"sidebar-open": this.isSidebarOpen,
					"no-sidebar": !this.shouldShowSidebar,
				},
				userPageClass,
			];
		},

		isRoot() {
			const path = this.$route.path;
			return path === "/";
		},
	},

	mounted() {
		this.$router.afterEach(() => {
			this.isSidebarOpen = false;
		});
	},

	methods: {
		toggleSidebar(to) {
			this.isSidebarOpen =
				typeof to === "boolean" ? to : !this.isSidebarOpen;
		},

		// side swipe
		onTouchStart(e) {
			this.touchStart = {
				x: e.changedTouches[0].clientX,
				y: e.changedTouches[0].clientY,
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
			let p = this.$site.pages.filter(
				(i) => !this.$site.themeConfig.hiddenPages.includes(i.path)
			);
			return p.sort((a, b) => {
				return (
					new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
				);
			});
		},

		getExcerptContent(excerpt) {
			return /^<h1.*?>(.|\n)*?<\/h1>((.|\n)*?)$/.exec(excerpt)[2];
		},

		getFormatedDate,

		isPublishDate(current, all_pages, index) {
			if (all_pages[index - 1] == undefined) return "";
			let c = new Date(current.lastUpdated).getTime();
			let n = new Date(all_pages[index - 1].lastUpdated).getTime();
			return c > n;
		},

		countWords(str) {
			return (str.match(/[\u4E00-\u9FA5]/gu) || []).length;
		},
	},
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
	border: 1px solid #eaecef;
	border-radius: 2px;
	margin-bottom: 16px;
	padding: 16px;
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
</style>

<style lang="stylus" src="../styles/wrapper.styl"></style>
