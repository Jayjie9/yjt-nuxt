/**
 * 获取医院排班列表详情
 * 根据医院编码、科室编码和工作日期获取具体排班信息
 */
export default defineEventHandler(async (event) => {
  // 获取路径参数
  const hoscode = getRouterParam(event, 'hoscode')
  const depcode = getRouterParam(event, 'depcode')
  const workDate = getRouterParam(event, 'workDate')

  try {
    // 这里应该是实际调用后端接口，这里使用模拟数据
    // 创建上午排班
    const morningSchedules = Array.from({ length: 3 }, (_, index) => {
      return {
        id: `morning_${hoscode}_${depcode}_${workDate}_${index}`,
        workDate,
        workTime: 0, // 0表示上午
        title: `${index + 1}号诊室`,
        docname: ['张医生', '李医生', '王医生'][index],
        skill: ['常见呼吸系统疾病', '肺部感染', '慢性阻塞性肺疾病'][index],
        amount: 100 + Math.floor(Math.random() * 100),
        availableNumber: Math.floor(Math.random() * 20),
        reservedNumber: Math.floor(Math.random() * 10),
      }
    })

    // 创建下午排班
    const afternoonSchedules = Array.from({ length: 2 }, (_, index) => {
      return {
        id: `afternoon_${hoscode}_${depcode}_${workDate}_${index}`,
        workDate,
        workTime: 1, // 1表示下午
        title: `${index + 1}号诊室`,
        docname: ['赵医生', '钱医生'][index],
        skill: ['哮喘', '肺结核'][index],
        amount: 120 + Math.floor(Math.random() * 100),
        availableNumber: Math.floor(Math.random() * 20),
        reservedNumber: Math.floor(Math.random() * 10),
      }
    })

    // 合并上午和下午排班
    const schedules = [...morningSchedules, ...afternoonSchedules]

    return {
      code: 200,
      message: '获取排班列表成功',
      data: schedules,
    }
  } catch (error) {
    console.error('获取排班列表失败', error)
    return {
      code: 500,
      message: '获取排班列表失败',
      data: null,
    }
  }
})
