<template>
  <div id="app">
    <h1>Editable 示例</h1>
    <div class="apimenu-header">
      <router-link class="apimenu-link" :to="{name: 'EditableDemo1'}">单击、列编辑、mini</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo2'}">双击、列编辑、small</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo3'}">单击、行样式、分页</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo4'}">手动模式、行编辑</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo5'}">单击、行编辑、排序</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo6'}">双击、行编辑、筛选</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo7'}">单击、多级表头、必填</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo8'}">单击、动态列渲染</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo9'}">单击、动态列渲染、自定义列</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo10'}">单击、表尾合计行</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo11'}">单击、合并行或列</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo12'}">单击、基本校验</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableDemo13'}">双击、自定义列、校验、自定义提示</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableExcelDemo1'}">Excel表格、单击、带状态</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableExcelDemo2'}">Excel表格、双击、排序</router-link>
      <router-link class="apimenu-link" :to="{name: 'EditableExcelDemo3'}">Excel表格、双击、校验、排序</router-link>
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
  display: inline-block;
}
.apimenu-link {
  margin: 4px;
  padding: 4px 10px;
  border: 1px solid #3a8ee6;
  float: left;
  text-decoration: none;
}
.apimenu-link.router-link-exact-active {
  background: #3a8ee6;
  border-color: #3a8ee6;
  color: #fff;
}
</style>
