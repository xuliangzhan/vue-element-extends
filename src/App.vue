<template>
  <div id="app">
    <h1>
      <a href="https://github.com/xuliangzhan/vue-element-extends">Editable</a>
    </h1>
    <div class="apimenu-header">
      <div class="apimenu-row">
        <router-link class="apimenu-link" :to="{name: 'EditableManual1'}" replace>手动模式、行编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual2'}" replace>手动模式、行编辑、校验</router-link>
      </div>
      <div class="apimenu-row">
        <router-link class="apimenu-link" :to="{name: 'EditableClick1'}" replace>单击、列编辑、mini</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick2'}" replace>单击、行样式、分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick3'}" replace>单击、行编辑、排序</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick4'}" replace>单击、多级表头、必填</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick5'}" replace>单击、动态列渲染</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick6'}" replace>单击、动态列渲染、自定义列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick7'}" replace>单击、表尾合计行</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick8'}" replace>单击、合并行或列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick9'}" replace>单击、基本校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick10'}" replace>单击、行编辑、排序、禁用行编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick11'}" replace>单击、列编辑、排序、禁用列编辑</router-link>
      </div>
      <div class="apimenu-row">
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick1'}" replace>双击、列编辑、small</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick2'}" replace>双击、行编辑、筛选、分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick3'}" replace>双击、个性化列、校验、自定义校验提示</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick4'}" replace>双击、个性化列、完整校验</router-link>
      </div>
      <div class="apimenu-row">
        <router-link class="apimenu-link" :to="{name: 'EditableExcel1'}" replace>Excel表格、单击、带状态</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel2'}" replace>Excel表格、双击、排序</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel3'}" replace>Excel表格、双击、校验、排序、筛选</router-link>
      </div>
    </div>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    activeName: {
      get () {
        return this.$route.name
      },
      set (value) {
        this.$router.replace({name: value})
      }
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.apimenu-header {
  margin-bottom: 10px;
}
.apimenu-link {
  margin: 2px;
  padding: 4px 6px;
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
