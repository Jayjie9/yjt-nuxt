<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="footer-container">
    <div class="footer-content">
      <div class="footer-links">
        <div class="footer-link-group">
          <h4>关于我们</h4>
          <a href="#">公司简介</a>
          <a href="#">联系方式</a>
          <a href="#">加入我们</a>
        </div>
        <div class="footer-link-group">
          <h4>帮助中心</h4>
          <a href="#">常见问题</a>
          <a href="#">用户指南</a>
          <a href="#">隐私政策</a>
        </div>
        <div class="footer-link-group">
          <h4>服务支持</h4>
          <a href="#">在线客服</a>
          <a href="#">意见反馈</a>
          <a href="#">服务条款</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>Copyright © {{ currentYear }} 医捷通 All Rights Reserved.</p>
        <p><a href="https://beian.miit.gov.cn/" target="_blank">陇ICP备2025017877号</a></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.footer-container {
  padding: 20px 0;
  background-color: #f8f9fa;
  color: #333
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 10px
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px
}

.footer-link-group {
  width: 25%;
  margin-bottom: 15px
}

.footer-link-group h4 {
  font-size: 15px;
  margin-bottom: 10px;
  font-weight: 600
}

.footer-link-group a {
  display: block;
  color: #666;
  text-decoration: none;
  margin-bottom: 6px;
  font-size: 13px
}

.footer-link-group a:hover {
  color: #409eff
}

.footer-bottom {
  border-top: 1px solid #e5e5e5;
  padding-top: 15px;
  text-align: center;
  font-size: 13px;
  color: #666
}

.footer-bottom a {
  color: #666;
  text-decoration: none
}

.footer-bottom a:hover {
  color: #409eff
}

@media (max-width:768px) {
  .footer-link-group {
    width: 100%
  }
}
</style>