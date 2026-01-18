export default function formatDate(date: string | Date, layout: string) {
	return getDayjs()(date).format(layout);
}
