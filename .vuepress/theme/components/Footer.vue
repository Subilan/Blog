<template>
    <footer class="footer">
        <div class="copyright">&copy; {{ year }} Subilan's Blog</div>
        <div class="license">Powered by <a href="//vuepress.vuejs.org">VuePress</a></div>
    </footer>
</template>

<script>
export default {
    computed: {
        year() {
            let date = new Date();
            return date.getFullYear().toString();
        }
    }
}
</script>

<style scoped>
.footer {
    text-align: center;
    color: #aaa;
    border-top: 1px solid #eaecef;
    padding-top: 16px;
    padding-bottom: 16px;
}

.license {
    font-size: 14px;
}
</style>