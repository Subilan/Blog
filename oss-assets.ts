import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'hast';

export const OSS_SCHEME = 'oss://';
export const OSS_BUCKET = 'fnmdp';
export const OSS_KEY_PREFIX = 'public/blog/';
export const OSS_ORIGIN = `https://${OSS_BUCKET}.oss-cn-beijing.aliyuncs.com/${OSS_KEY_PREFIX}`;
export const OSS_URI = `oss://${OSS_BUCKET}/${OSS_KEY_PREFIX}`;

export const rehypeOssAssets: Plugin<[], Root> = () => {
	return tree => {
		visit(tree, 'element', (node: any) => {
			for (const property of ['src', 'href']) {
				const value = node.properties?.[property];
				if (typeof value !== 'string' || !value.startsWith(OSS_SCHEME)) continue;
				node.properties[property] = OSS_ORIGIN + value.slice(OSS_SCHEME.length);
			}
		});
	};
};
