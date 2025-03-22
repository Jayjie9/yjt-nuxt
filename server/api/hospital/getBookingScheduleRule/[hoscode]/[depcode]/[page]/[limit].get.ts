/**
 * 获取医院排班预约规则
 * 返回指定医院科室的排班规则和可预约日期
 */
export default defineEventHandler(async (event) => {
  // 获取路径参数
  const hoscode = getRouterParam(event, 'hoscode')
  const depcode = getRouterParam(event, 'depcode')
  const page = parseInt(getRouterParam(event, 'page') || '1')
  const limit = parseInt(getRouterParam(event, 'limit') || '10')

  try {
    // 这里应该是实际调用后端接口，这里使用模拟数据
    // 模拟数据生成
    const currentDate = new Date()
    const bookingScheduleList = Array.from({ length: 10 }, (_, index) => {
      const date = new Date(currentDate)
      date.setDate(currentDate.getDate() + index)

      // 格式化日期
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`

      // 星期几
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const dayOfWeek = weekdays[date.getDay()]

      // 随机生成可预约数和状态
      const availableNumber = Math.floor(Math.random() * 20)
      let status = 0
      if (index === 0) {
        status = 0 // 可预约
      } else if (index === 1) {
        status = 1 // 即将放号
      } else {
        status = Math.random() > 0.2 ? 0 : -1 // 80%可预约，20%停止挂号
      }

      return {
        workDate: formattedDate,
        dayOfWeek,
        status,
        availableNumber: status === -1 ? -1 : availableNumber,
        reservedNumber: Math.floor(Math.random() * 10),
        id: `schedule_${hoscode}_${depcode}_${formattedDate}`,
      }
    })

    // 模拟基础数据
    const baseMap = {
      hosname: '北京协和医院',
      bigname: '内科',
      depname: '呼吸内科',
      workDateString: '科室可预约时间',
      releaseTime: '08:30',
    }

    return {
      code: 200,
      message: '获取排班规则成功',
      data: {
        total: 30, // 总数据量
        bookingScheduleList,
        baseMap,
      },
    }
  } catch (error) {
    console.error('获取排班规则失败', error)
    return {
      code: 500,
      message: '获取排班规则失败',
      data: null,
    }
  }
})
