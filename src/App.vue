<template>
  <div id="app">
    <router-link :to="{name: 'EditableDemo1'}" replace>示例1</router-link>
    <router-link :to="{name: 'EditableDemo2'}" replace>示例2</router-link>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
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
