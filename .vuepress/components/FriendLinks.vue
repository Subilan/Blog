<template>
    <div class="links-container">
        <a target="_blank" :href="link.href" class="link" :style="link.background_type == 'image' ? 'background-image: url(' + link.background + ');' : 'background-color: ' + link.background + ';'" v-for="link of links">
            <img class="avatar" :src="link.avatar"/>
            <div :style="link.light == true ? 'color: white' : null" class="link-content">
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
                    name: "Dream City",
                    href: "https://www.littleqiu.net",
                    avatar: "https://www.littleqiu.net/wp-content/uploads/2018/01/Avatar.png",
                    description: "就算世界终结 也无所谓",
                    background_type: "image",
                    background: "https://www.littleqiu.net/wp-content/uploads/2018/01/ChulillaSpain_ZH-CN10170248808_1920x1080.jpg",
                    light: true,
                },
                {
                    name: "Bottle 小站",
                    href: "https://bottle.moe/",
                    avatar: "data:image/webp;base64,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",
                    description: "些瓶dalao的博客~",
                    background: "rgb(102 203 254)",
                },
                {
                    name: "浅墨小站",
                    href: "https://romonov.com",
                    avatar: "https://i.loli.net/2019/09/01/26aeCHOuNYhxXi8.jpg",
                    description: "No mountain too high, no ocean too deep.",
                    background: "rgb(217 112 213)",
                },
                {
                    name: "MoeClue~",
                    href: "https://moeclue.com",
                    avatar: "https://moeclue.com/icon.jpg",
                    description: "Moeka的辣鸡Blog",
                    background: "#FFB6C1",
                },
                {
                    name: "Ojhdt's Blog",
                    href: "https://blog.ojhdt.com",
                    avatar: "https://blog.ojhdt.com/img/logo.png",
                    description: "隐约雷鸣，阴霾天空",
                    background: "#009688",
                    light: true,
                },
                {
                    name: "Andy Wang",
                    href: "https://blog.uotca.com",
                    avatar: "https://i.loli.net/2019/09/01/Y6TbO1FGPSv4agE.jpg",
                    description: "a typical note-taker",
                    background: "#000",
                    light: true,
                },
                {
                    name: "Shine",
                    href: "https://ifsun.cc",
                    avatar: "https://i.loli.net/2019/09/01/XCmdWxSKyacp3E7.jpg",
                    description: "Thoughts, Stories and Ideas",
                    background: "#000",
                    light: true,
                }
            ]
        }
    }
}
</script>

<style lang="stylus" scoped>
.links-container
    display flex
    align-items center
    flex-wrap wrap
    .link
        color black
        font-weight normal
        display flex
        align-items center
        margin 4px
        padding 8px
        border-radius 2px
        background-position center
        background-size cover
        -webkit-box-shadow 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
        box-shadow 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
        transition box-shadow linear .2s
        &:hover,
        &:focus 
            text-decoration none
            -webkit-box-shadow 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.22), 0 1px 10px 0 rgba(0,0,0,.2)
            box-shadow 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.22), 0 1px 10px 0 rgba(0,0,0,.2)
            transition box-shadow linear .2s
        .avatar
            border-radius 100%
            width 64px
        .link-content
            margin-left 16px
            .name
                font-size 18px
            .description
                font-size 12px
            .name, .description
                display block
                line-height 1.7
        
</style>