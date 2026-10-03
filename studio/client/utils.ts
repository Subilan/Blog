export function formatBytes(bytes: number) {
	if (!Number.isFinite(bytes)) return '-';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} K`;
	return `${(bytes / 1048576).toFixed(1)} M`;
}

export function formatTime(ms: number) {
	if (!ms) return '-';
	const date = new Date(ms);
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function today() {
	const date = new Date();
	const pad = (value: number) => String(value).padStart(2, '0');
	return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

export function dirOf(key: string) {
	const parts = key.split('/');
	return parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
}

export function baseOf(key: string) {
	return key.split('/').pop() ?? key;
}
