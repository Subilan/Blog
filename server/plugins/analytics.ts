export default defineNitroPlugin((nitroApp) => {
    nitroApp.hooks.hook('render:html', (html) => {
        html.head.push(`<script defer src="https://analytics.subilan.win/script.js" data-website-id="2056540d-6201-4ab2-8af2-d793dce4abc1"></script>`);
    })
})