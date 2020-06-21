const env = process.env
const ADBLOCK = is(env.ADBLOCK)
const CI = is(env.CI)
const DISABLE_OPENCOLLECTIVE = is(env.DISABLE_OPENCOLLECTIVE)

function is (it) {
  return !!it && it !== '0' && it !== 'false'
}

if (!ADBLOCK && !CI && !DISABLE_OPENCOLLECTIVE) {
  console.log('\n\x1B[91m>\x1B[91m 注: 该组件 vue-element-extends 已废弃不再维护，不再建议使用！')
  console.log('\x1B[93m>\x1B[92m 后续推荐使用: https://xuliangzhan_admin.gitee.io/vxe-table/#/donation/api\n')
}
