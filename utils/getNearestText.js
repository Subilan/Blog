export default function getNearestText(content, searchString) {
    const index = content.toLowerCase().indexOf(searchString.toLowerCase());
    const start = index - 50;
    const end = index + searchString.length + 50
    const part = content.substring(
        start < 0 ? 0 : start,
        end > content.length - 1 ? content.length - 1 : end
    );
    return "..."
        + part.replace(
            new RegExp(`(${searchString})`, "gi"),
            `<strong>$1</strong>`
        )
        + "...";
}