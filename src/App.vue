<template>
  <div id="app">
    <el-tabs v-model="activeName">
      <el-tab-pane label="单击列编辑 mini" name="EditableDemo1"></el-tab-pane>
      <el-tab-pane label="双击列编辑 small" name="EditableDemo2"></el-tab-pane>
      <el-tab-pane label="单击行编辑 medium" name="EditableDemo3"></el-tab-pane>
      <el-tab-pane label="双击行编辑 medium" name="EditableDemo4"></el-tab-pane>
      <el-tab-pane label="多级表头" name="EditableDemo5"></el-tab-pane>
      <el-tab-pane label="动态列渲染" name="EditableDemo6"></el-tab-pane>
      <el-tab-pane label="自定义动态列" name="EditableDemo7"></el-tab-pane>
      <el-tab-pane label="动态表尾合计行" name="EditableDemo8"></el-tab-pane>
      <el-tab-pane label="动态合并行或列" name="EditableDemo9"></el-tab-pane>
    </el-tabs>
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
  margin-top: 60px;
}
</style>
