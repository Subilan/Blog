import path from 'path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Link, Image } from 'mdast';

interface Options {
	prefix?: string; // 默认 /posts
}

const isRelative = (url: string) => {
	return (
		!url.startsWith('http://') &&
		!url.startsWith('https://') &&
		!url.startsWith('/') &&
		!url.startsWith('#')
	);
};

export const remarkRelativeAssetsToPosts: Plugin<[Options?], Root> = (options = {}) => {
	const prefix = options.prefix ?? '/posts';

	return tree => {
		visit(tree, ['link', 'image'], (node: any) => {
			const url = node.url;
			if (!isRelative(url)) return;

			/**
			 * Markdown 文件：./ABC.md → /posts/abc
			 */
			if (url.endsWith('.md')) {
				const basename = path.basename(url, '.md');
				const slug = basename.toLowerCase();
				node.url = `${prefix}/${slug}`;
				return;
			}

			/**
			 * 图片 / 静态资源：
			 * ./foo/bar.png → /posts/foo/bar.png
			 */
			const normalized = url.replace(/^\.\//, '');
			node.url = `${prefix}/${normalized}`;
		});
	};
};
