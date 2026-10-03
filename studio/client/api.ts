export type PostSummary = {
	stem: string;
	file: string;
	title: string;
	words: number;
	mtime: number;
	hidden: boolean;
	date: string;
	cate: string;
	desc: string;
	'desc-short': string;
};

export type FrontMatter = {
	date: string;
	cate?: string;
	desc?: string;
	'desc-short'?: string;
	hidden?: boolean;
	ignoreOutdate?: boolean;
};

export type StagedImage = { name: string; size: number; mtime: number; url: string };

export type PostDetail = {
	stem: string;
	title: string;
	words: number;
	frontmatter: FrontMatter;
	doc: any;
	markdown: string;
	ossDir: string;
	staged: StagedImage[];
};

export type MediaItem = {
	key: string;
	decoded: string;
	size: number;
	url: string;
	posts: string[];
};

export type MediaIndex = {
	items: MediaItem[];
	references: { key: string; posts: string[] }[];
	missing: { key: string; posts: string[] }[];
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);
	const text = await response.text();
	let payload: any = null;
	if (text) {
		try {
			payload = JSON.parse(text);
		} catch {
			payload = { error: text };
		}
	}
	if (!response.ok) throw new Error(payload?.error || `${response.status} ${response.statusText}`);
	return payload as T;
}

function json(body: unknown, method = 'POST'): RequestInit {
	return { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
}

export const api = {
	listPosts: () => request<{ posts: PostSummary[] }>('/api/posts').then(result => result.posts),
	getPost: (stem: string) => request<PostDetail>(`/api/posts/${encodeURIComponent(stem)}`),
	createPost: (body: { file: string; title?: string; date?: string; cate?: string; desc?: string }) =>
		request<{ stem: string }>('/api/posts', json(body)),
	deletePost: (stem: string) => request<{ ok: true }>(`/api/posts/${encodeURIComponent(stem)}`, { method: 'DELETE' }),
	renamePost: (stem: string, to: string) =>
		request<{ stem: string }>(`/api/posts/${encodeURIComponent(stem)}/rename`, json({ to })),
	savePost: (
		stem: string,
		body: { frontmatter: FrontMatter; doc: any; ossDir?: string }
	) =>
		request<{ markdown: string; ossDir: string; uploaded: { key: string; url: string; before: number; after: number; label: string }[] }>(
			`/api/posts/${encodeURIComponent(stem)}`,
			json(body, 'PUT')
		),
	markdown: (body: { frontmatter: FrontMatter; doc: any }) =>
		request<{ markdown: string; html: string; title: string; words: number }>('/api/markdown', json(body)),
	build: () => request<{ ok: true; output: string }>('/api/build', json({})),

	listStaged: (stem: string) =>
		request<{ staged: StagedImage[] }>(`/api/posts/${encodeURIComponent(stem)}/staged`).then(result => result.staged),
	uploadStaged: (stem: string, file: File) =>
		request<{ name: string; size: number; url: string; original: string; renamed: boolean }>(
			`/api/posts/${encodeURIComponent(stem)}/staged?name=${encodeURIComponent(file.name)}`,
			{ method: 'POST', body: file }
		),
	deleteStaged: (stem: string, name: string) =>
		request<{ ok: true }>(`/api/posts/${encodeURIComponent(stem)}/staged?name=${encodeURIComponent(name)}`, {
			method: 'DELETE'
		}),

	media: () => request<MediaIndex>('/api/media'),
	uploadMedia: (dir: string, file: File) =>
		request<{ key: string; url: string; before: number; after: number; label: string }>(
			`/api/media/upload?dir=${encodeURIComponent(dir)}&name=${encodeURIComponent(file.name)}`,
			{ method: 'POST', body: file }
		),
	deleteMedia: (keys: string[]) => request<{ ok: true; deleted: string[] }>('/api/media/delete', json({ keys })),
	normalizeMedia: (dir: string) =>
		request<{ moves: { from: string; to: string; posts: string[] }[] }>('/api/media/normalize', json({ dir })),
	renameMedia: (dir: string, moves: { from: string; to: string }[], rewrite: boolean) =>
		request<{ applied: string[]; changedPosts: string[] }>('/api/media/rename', json({ dir, moves, rewrite })),
	checkMedia: () =>
		request<{ total: number; missing: string[]; stale: string[] }>('/api/media/check', json({}))
};
