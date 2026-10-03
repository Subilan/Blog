/**
 * 后端把 OSS 前缀配置交给前端，图片预览必须用和站点完全相同的展开规则，
 * 否则编辑器里看到的地址和线上会不一致。
 */

import { reactive } from 'vue';

export const config = reactive({ ossOrigin: '', ossScheme: 'oss://', loaded: false });

export function resolveAssetUrl(src: string) {
	if (!config.loaded || !src) return src;
	if (src.startsWith(config.ossScheme)) return config.ossOrigin + src.slice(config.ossScheme.length);
	return src;
}

export async function loadConfig() {
	if (config.loaded) return;
	const response = await fetch('/api/config');
	if (!response.ok) return;
	Object.assign(config, await response.json());
	config.loaded = true;
}
