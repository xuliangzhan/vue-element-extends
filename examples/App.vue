<template>
  <div id="app">
    <div class="apimenu-header">
       <a href="https://github.com/xuliangzhan/vue-element-extends/tree/master/examples/views/editable">查看代码</a>
      <div class="apimenu-row">
        <a class="apimenu-title">手动模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableManual1'}" replace>列编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual2'}" replace>行编辑+基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual3'}" replace>行编辑+校验+默认勾选</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual4'}" replace>行编辑+关闭自动清除</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual5'}" replace>行编辑+多表格</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual6'}" replace>行编辑+校验+树形表格</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual7'}" replace>可配置的动态列</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">单击模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableClick1'}" replace>列编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick2'}" replace>行编辑+基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick3'}" replace>列编辑+自定义渲染+禁止勾选</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick4'}" replace>行编辑+浮动列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick5'}" replace>列编辑+多级表头+实时同步</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick6'}" replace>行编辑+动态列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick7'}" replace>行编辑+表尾合计行</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick8'}" replace>列编辑+合并行或列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick9'}" replace>列编辑+校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick10'}" replace>列编辑+禁止编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick11'}" replace>列编辑+拖动表格</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick12'}" replace>列编辑+多级属性+方向键&amp;Tab键切换</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">双击模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick1'}" replace>列编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick2'}" replace>行编辑+基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick3'}" replace>列编辑+校验+修改校验提示</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick4'}" replace>行编辑+校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick5'}" replace>行编辑+动态列+自定义列头</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick6'}" replace>列编辑+动态列+方向键&amp;Tab键切换</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick7'}" replace>列编辑+校验+树形表格</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick8'}" replace>列编辑+校验+懒加载树形表格</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">Excel表格</a>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel1'}" replace>列编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel2'}" replace>列编辑+校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel3'}" replace>列编辑+动态列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel4'}" replace>列编辑+方向键&amp;Tab键切换</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel5'}" replace>列编辑+右键菜单</router-link>
      </div>
      <!-- <div class="apimenu-row">
        <a class="apimenu-title">El和iView</a>
        <router-link class="apimenu-link" :to="{name: 'EditableMultiComp1'}" replace>渲染多个 UI 组件</router-link>
      </div> -->
    </div>
    <div class="view-body">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.view-body {
  margin: 0 20px;
}
.apimenu-header {
  margin-bottom: 10px;
}
.apimenu-title {
  font-weight: 700;
  font-size: 14px;
}
.apimenu-link {
  margin: 2px;
  padding: 2px 4px;
  color: #606266;
  border: 1px solid #dcdfe6;
  display: inline-block;
  font-size: 12px;
  border-radius: 2px;
  text-decoration: none;
}
.apimenu-link:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
.apimenu-link.router-link-exact-active,
.apimenu-link.router-link-exact-active:hover {
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
}
</style>
