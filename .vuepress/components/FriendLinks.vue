<template>
	<div class="links-container">
		<a
			target="_blank"
			:href="link.href"
			class="link"
			:style="
				link.background_type === 'image'
					? 'background-image: url(' + link.background + ');'
					: 'background-color: ' +
					  link.background +
					  ';' +
					  (link.background === '#fff'
							? 'border: 1px solid rgba(0, 0, 0, .21)'
							: '')
			"
			v-for="(link, i) in links"
			:key="i"
		>
			<img class="avatar" :src="link.avatar" />
			<div
				:style="link.light === true ? 'color: white' : null"
				class="link-content"
			>
				<span class="name">{{ link.name }}</span>
				<span class="description">{{ link.description }}</span>
			</div>
		</a>
	</div>
</template>

<script>
export default {
	data() {
		return {
			links: [
				{
					name: "Kiwi's House",
					href: "https://nyan.kiwi.cat",
					avatar: "https://i.loli.net/2018/12/14/5c135b73215cf.png",
					description: "Bio",
					background: "#000",
					light: true,
				},
				{
					name: "WindSpirit IT",
					href: "https://www.leviatan.cn/",
					avatar: "https://img.leviatan.cn/images/cat7ca3549fa0b56444.th.png",
					description: "跟随互联网发展的每一步",
					background: "#262626",
					light: true,
				},
				{
					name: "Dream City",
					href: "https://www.littleqiu.net",
					avatar: "https://www.littleqiu.net/wp-content/uploads/2018/01/Avatar.png",
					description: "愿你有一天，能与你最重要的人重逢",
					background_type: "image",
					background:
						"https://www.littleqiu.net/wp-content/uploads/2018/01/ChulillaSpain_ZH-CN10170248808_1920x1080.jpg",
					light: true,
				},
				{
					name: "Bottle 小站",
					href: "https://bottle.moe/",
					avatar: "https://cdn.jsdelivr.net/gh/BottleSome/blog@latest/avatar_square.png",
					description: "些瓶dalao的博客~",
					background: "rgb(102 203 254)",
				},
				{
					name: "crazyman_army's Blog",
					href: "https://crazymanarmy.github.io/",
					avatar: "https://imgur.com/lsmKGQE.png",
					description: "玩ctf的小菜鸡,又喜欢捣鼓捣鼓一些realworld的东西",
					background: "#fff",
				},
				{
					name: "Ojhdt's Blog",
					href: "https://blog.ojhdt.com",
					avatar: "https://www.gravatar.com/avatar/af6911b4de2f5a357fa796a66e202272?s=128",
					description: "隐约雷鸣，阴霾天空",
					background: "#009688",
					light: true,
				},
				{
					name: "9527's Blog",
					href: "https://9527dhx.top/",
					avatar: "https://i.loli.net/2019/05/26/5cea282e596b167848.png",
					description: "跌倒了，站起来，换个姿势，再跌倒。",
					background: "#80deea",
					light: true,
				},
				{
					name: "喵呜Moe!!!",
					href: "https://moe.jimmy0w0.me/",
					avatar: "https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/jimmy.jpg",
					description: "日常的生活",
					background: "#fff",
				},
				{
					name: "FlyEmoji STudio",
					href: "https://flyemoji.xyz",
					avatar: "https://s1.ax1x.com/2020/03/12/8Z0eFP.png",
					description: "摸鱼就完了（逃",
					background_type: "image",
					background: "https://s1.ax1x.com/2020/04/05/GD7Epq.jpg",
					light: true,
				},
				{
					name: "Mashirl's Blog",
					href: "https://www.mashirl.com/",
					avatar: "https://cdn.jsdelivr.net/gh/Mashirl/Blog/source/images/avatar.jpg",
					description: "予 世界温柔以待 惟愿 时光静好",
					background: "#FFAEB9",
				},
				{
					name: "Fidel's Lab",
					href: "https://fidel.js.org/",
					avatar: "https://gravatar.loli.net/avatar/bccd181c71d3a08f6c182f3f48164545",
					description: "不乱于心，不困于情。不畏将来，不念过往。",
					background_type: "image",
					background:
						"https://i.loli.net/2020/06/07/Sa7dWDtVMivUnoQ.jpg",
					light: true,
				},
				{
					name: "Socular 的博客",
					href: "https://awsl.rip",
					avatar: "https://www.gravatar.com/avatar/202e3e3a8e8fcefd140c1aab9b54c0d6",
					description: "少一点吹捧，多一点实干 :)",
					background: "#2196F3",
					light: true,
				},
				{
					name: "Restent Blog",
					href: "https://blog.restent.win/",
					avatar: "https://cdn.jsdelivr.net/gh/Restent/Restent/avatar.jpg",
					description: "面对黑暗，向往光明。",
					background_type: "image",
					background:
						"https://i.yecdn.com/images/2021/07/13/68dd24d85519577d858c1e87ea186a17.jpg",
					light: true,
				},
				{
					name: "Carm's Pages",
					href: "https://pages.carm.cc",
					avatar: "https://en.gravatar.com/userimage/186254338/92ff64167a1c45e8b995200e992bcfdb.png",
					description: "分享所见，总结所学。",
					background: "#8b658b",
					light: true,
				},
				{
					name: "Nocturne",
					href: "https://wynio.online",
					avatar: "https://i.328888.xyz/2023/01/17/2LG3w.png",
					description: "Ivory Tower",
					background: "#009999",
					light: true,
				}
			],
		};
	},
};
</script>

<style lang="less">
.links-container {
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	.link {
		text-decoration: none !important;
		@media screen and (max-width: 900px) {
			width: 100%;
		}
		@media screen and (min-width: 900px) {
            transition: all 0.2s ease;
			&:hover,
			&:focus {
				box-shadow: 0 1.5px 2px #bbb;
			}
		}
		color: black;
		font-weight: normal;
		display: flex;
		align-items: center;
		margin: 4px;
		padding: 10px 16px;
		border-radius: 5px;
		background-position: center;
		background-size: cover;
		.avatar {
			border-radius: 100%;
			width: 64px;
			height: 64px;
		}
		.link-content {
			margin-left: 16px;
			.name {
				font-size: 18px;
                font-weight: 500;
			}
			.description {
				font-size: 12px;
			}
			.name,
			.description {
				display: block;
				line-height: 1.7;
			}
		}
	}
}
</style>
