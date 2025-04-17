<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer-container">
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
        <div class="copyright">
          <span>Copyright © {{ currentYear }} 医捷通</span>
          <span class="divider">|</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">陇ICP备2025017877号</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-container {
  background: #f8fafc;
  padding: 30px 0 20px;
  color: var(--el-text-color-regular);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  margin-bottom: 24px;
}

.footer-link-group h4 {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}

.footer-link-group a {
  display: block;
  color: var(--el-text-color-regular);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.footer-link-group a:hover {
  color: var(--el-color-primary);
  transform: translateX(4px);
}

.footer-bottom {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.copyright {
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.copyright .divider {
  margin: 0 12px;
  color: var(--el-border-color);
}

.copyright a {
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: color 0.3s;
}

.copyright a:hover {
  color: var(--el-color-primary);
}

@media screen and (max-width: 768px) {
  .footer-container {
    padding: 24px 0 16px;
  }

  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media screen and (max-width: 480px) {
  .footer-content {
    padding: 0 16px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .copyright {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .copyright .divider {
    display: none;
  }
}
</style>