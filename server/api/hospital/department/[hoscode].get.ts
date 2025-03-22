/**
 * 获取医院科室列表
 * 根据医院编码返回该医院所有科室信息
 */
export default defineEventHandler(async (event) => {
  // 获取医院编码
  const hoscode = getRouterParam(event, 'hoscode')

  try {
    // 这里应该是实际调用后端接口，这里使用模拟数据
    const departmentList = [
      {
        depcode: '100',
        depname: '内科',
        children: [
          {
            depcode: '1001',
            depname: '呼吸内科',
            children: null,
          },
          {
            depcode: '1002',
            depname: '消化内科',
            children: null,
          },
          {
            depcode: '1003',
            depname: '神经内科',
            children: null,
          },
          {
            depcode: '1004',
            depname: '心血管内科',
            children: null,
          },
        ],
      },
      {
        depcode: '200',
        depname: '外科',
        children: [
          {
            depcode: '2001',
            depname: '普通外科',
            children: null,
          },
          {
            depcode: '2002',
            depname: '骨科',
            children: null,
          },
          {
            depcode: '2003',
            depname: '泌尿外科',
            children: null,
          },
          {
            depcode: '2004',
            depname: '神经外科',
            children: null,
          },
        ],
      },
      {
        depcode: '300',
        depname: '妇产科',
        children: [
          {
            depcode: '3001',
            depname: '妇科',
            children: null,
          },
          {
            depcode: '3002',
            depname: '产科',
            children: null,
          },
        ],
      },
      {
        depcode: '400',
        depname: '儿科',
        children: [
          {
            depcode: '4001',
            depname: '小儿内科',
            children: null,
          },
          {
            depcode: '4002',
            depname: '小儿外科',
            children: null,
          },
          {
            depcode: '4003',
            depname: '新生儿科',
            children: null,
          },
        ],
      },
      {
        depcode: '500',
        depname: '急诊医学科',
        children: [
          {
            depcode: '5001',
            depname: '急诊内科',
            children: null,
          },
          {
            depcode: '5002',
            depname: '急诊外科',
            children: null,
          },
        ],
      },
    ]

    return {
      code: 200,
      message: '获取科室列表成功',
      data: departmentList,
    }
  } catch (error) {
    console.error('获取科室列表失败', error)
    return {
      code: 500,
      message: '获取科室列表失败',
      data: null,
    }
  }
})
