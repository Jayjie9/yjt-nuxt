<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const state = ref('')

interface LinkItem {
    value: string
    link: string
}

const links = ref<LinkItem[]>([])

const loadAll = () => {
    return [
        { value: '北京协和医院', link: 'https://github.com/vuejs/vue' },
        { value: '北京人民医院', link: 'https://github.com/ElemeFE/element' },
        { value: '北京儿童医院', link: 'https://github.com/ElemeFE/cooking' },
        { value: '上海瑞金医院', link: 'https://github.com/ElemeFE/mint-ui' },
        { value: '中山医院', link: 'https://github.com/vuejs/vuex' },
        { value: '秦安医院', link: 'https://github.com/vuejs/vue-router' },
        { value: '四川医院', link: 'https://github.com/babel/babel' },
    ]
}

let timeout: ReturnType<typeof setTimeout>
const querySearchAsync = (queryString: string, cb: (arg: any) => void) => {
    console.log('links.value: ', links.value);

    const results = queryString
        ? links.value.filter(createFilter(queryString))
        : links.value

    clearTimeout(timeout)
    timeout = setTimeout(() => {
        cb(results)
    }, 3000 * Math.random())
}
const createFilter = (queryString: string) => {
    return (restaurant: LinkItem) => {
        return (
            restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        )
    }
}

const handleSelect = (item: Record<string, any>) => {
    window.open(item.link, '_blank')
}

onMounted(() => {
    links.value = loadAll()
})
</script>

<template>
    <div class="test">
        <el-autocomplete v-model="state" :fetch-suggestions="querySearchAsync" placeholder="Please input"
            @select="handleSelect" />
    </div>
</template>

<style scoped>
.test {
    margin-top: 100px;
}
</style>