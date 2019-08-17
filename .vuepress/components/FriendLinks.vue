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
                    href: "https://imbottle.com",
                    avatar: "https://ww2.sinaimg.cn/large/ed039e1fgy1ft1plam1e5j2046046t94",
                    description: "些瓶dalao的博客~",
                    background: "rgb(102 203 254)",
                },
                {
                    name: "浅墨小站",
                    href: "https://romonov.com",
                    avatar: "https://www.romonov.com/wp-content/uploads/2017/09/head.jpg",
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
                    avatar: "https://avatars2.githubusercontent.com/u/16192291?s=400&v=4",
                    description: "a typical note-taker",
                    background: "#000",
                    light: true,
                },
                {
                    name: "Shine",
                    href: "https://ifsun.cc",
                    avatar: "https://www.gravatar.com/avatar/9fe93675cf47b3452b99a81c780d2913?s=500",
                    description: "Though, Stories and Ideas",
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