import formatDate from './utils/formatDate';
import React from 'react'; // do not remove

export default function getOgNode(post) {
	return (
		<section tw="bg-white h-full w-full relative">
			<section tw="flex flex-col p-[64px]">
				<h1
					style="font-family: Inter, NotoSansSC;"
					tw="text-[80px] leading-[1.5] m-0 max-w-[90%]"
				>
					{post.title}
				</h1>
				<section
					style="font-family: Inter, NotoSansSC;"
					tw="flex items-center text-[40px] text-neutral-400 mt-[30px]"
				>
					<span>{formatDate(post.frontmatter.date, 'YYYY 年 M 月 D 日')}</span>
					<span tw="mx-[16px]">·</span>
					<span>{post.analytics.cjkCharCount} 字</span>
				</section>
			</section>
			<p
				style="font-family: Inter, NotoSansSC;"
				tw="absolute bottom-[40px] right-[64px] text-[30px]"
			>
				<strong>Solitude Scroll</strong>
				<span tw="mx-[8px]">/</span>subilan.win
			</p>
		</section>
	);
}
