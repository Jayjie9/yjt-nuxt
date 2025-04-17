<script setup>

</script>

<template>
    <!--左侧导航 #start -->
    <div class="user-nav">
        <div class="nav-item ">
            <NuxtLink class="nav-link" :to="`/user`">实名认证 </NuxtLink>
        </div>
        <div class="nav-item selected">
            <NuxtLink class="nav-link" :to="`/order`"> 挂号订单 </NuxtLink>
        </div>
        <div class="nav-item ">
            <NuxtLink class="nav-link" :to="`/patient`"> 就诊人管理 </NuxtLink>
        </div>
        <div class="nav-item ">
            <span class="nav-link"> 修改账号信息 </span>
        </div>
        <div class="nav-item ">
            <span class="nav-link"> 意见反馈 </span>
        </div>
    </div>
</template>

<style scoped>
.user-nav {
    position: sticky;
    width: 200px;
    min-width: 200px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    top: 20px;
}

.nav-item {
    border-left: 4px solid transparent;
    transition: all 0.3s ease;
}

.nav-item:hover:not(.disabled) {
    background-color: #f5f7fa;
}

.nav-item.active {
    background-color: #ecf5ff;
    border-left-color: #409EFF;
}

.nav-item.disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.nav-link {
    display: block;
    padding: 16px 20px;
    color: #303133;
    text-decoration: none;
    font-size: 14px;
}

.nav-item.active .nav-link {
    color: #409EFF;
    font-weight: 500;
}

.nav-item.disabled .nav-link {
    color: #909399;
}
</style>