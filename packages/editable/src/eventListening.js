import XEUtils from 'xe-utils'

// 监听全局事件
var EventListening = {
  list: [],
  on (comp, type, cb) {
    EventListening.list.push({ comp, type, cb })
  },
  off (comp, type) {
    XEUtils.remove(EventListening.list, item => item.comp === comp && item.type === type)
  },
  trigger (evnt) {
    EventListening.list.forEach(({ comp, type, cb }) => {
      if (type === evnt.type) {
        cb.call(comp, evnt)
      }
    })
  }
}

window.addEventListener('click', EventListening.trigger)

export default EventListening
