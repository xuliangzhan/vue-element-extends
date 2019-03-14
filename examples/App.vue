<template>
  <div id="app">
    <div class="apimenu-header">
       <a href="https://github.com/xuliangzhan/vue-element-extends/tree/master/examples/views/editable">查看代码</a>
      <div class="apimenu-row">
        <a class="apimenu-title">手动模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableManual1'}" replace>基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual2'}" replace>基本操作+分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual3'}" replace>行编辑+校验+多选操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual4'}" replace>行编辑+校验+禁用自动清除活动编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual5'}" replace>基本操作+树表格+校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual6'}" replace>行编辑+校验+导出数据</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableManual7'}" replace>行编辑+多个表格</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">单击模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableClick1'}" replace>基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick2'}" replace>基本操作+分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick3'}" replace>行编辑+自定义渲染+排序</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick4'}" replace>多级表头+多选操作+校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick5'}" replace>动态列渲染</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick6'}" replace>动态列渲染+自定义列+分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick7'}" replace>表尾合计行</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick8'}" replace>合并行或列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick9'}" replace>基本校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick10'}" replace>行编辑+排序+禁用行编辑</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick11'}" replace>列编辑+排序+禁用列编辑+唯一下拉选项</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick12'}" replace>列编辑+排序+多级属性</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableClick13'}" replace>列编辑+排序+标记删除+方向键&amp;Tab键切换</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">双击模式</a>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick1'}" replace>基本操作</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick2'}" replace>基本操作+分页</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick3'}" replace>个性化列+自定义渲染+自定义校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick4'}" replace>个性化列+唯一下拉选项+完整校验</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick5'}" replace>个性化列+自定义列头+校验+自适应高度</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick6'}" replace>个性化列+自定义列头+校验+关闭默认校验方式</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableDblclick7'}" replace>个性化列+校验+标记删除+导出数据+方向键&amp;Tab键切换</router-link>
      </div>
      <div class="apimenu-row">
        <a class="apimenu-title">Excel表格</a>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel1'}" replace>带状态</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel2'}" replace>排序</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel3'}" replace>校验+排序+筛选</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel4'}" replace>校验+排序+筛选+个性化列</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel5'}" replace>校验+排序+筛选+个性化列+导出数据</router-link>
        <router-link class="apimenu-link" :to="{name: 'EditableExcel6'}" replace>校验+排序+筛选+个性化列+导出数据+方向键&amp;Tab键切换</router-link>
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
  name: 'App',
  computed: {
    activeName: {
      get () {
        return this.$route.name
      },
      set (value) {
        this.$router.replace({ name: value })
      }
    }
  }
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
