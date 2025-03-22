/**
 * 获取医院列表
 * 分页返回医院列表信息
 */
export default defineEventHandler(async (event) => {
  // 获取分页参数
  const page = getRouterParam(event, 'page') || '1'
  const limit = getRouterParam(event, 'limit') || '10'

  // 获取查询参数
  const query = getQuery(event)
  const hostype = query.hostype ? String(query.hostype) : ''
  const districtCode = query.districtCode ? String(query.districtCode) : ''
  const hosname = query.hosname ? String(query.hosname) : ''

  try {
    // 这里应该是实际调用后端接口，这里使用模拟数据
    const hospitals = [
      {
        id: '1000_0',
        hoscode: '1000_0',
        hosname: '北京协和医院',
        hostype: '三级甲等',
        province: '北京市',
        city: '北京市',
        district: '东城区',
        address: '北京市东城区帅府园一号',
        logoData:
          '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',
        status: 1,
      },
      {
        id: '1000_1',
        hoscode: '1000_1',
        hosname: '上海仁济医院',
        hostype: '三级甲等',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        address: '上海市浦东新区灵山路845号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_2',
        hoscode: '1000_2',
        hosname: '天津医科大学总医院',
        hostype: '三级甲等',
        province: '天津市',
        city: '天津市',
        district: '和平区',
        address: '天津市和平区鞍山道154号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_3',
        hoscode: '1000_3',
        hosname: '南京鼓楼医院',
        hostype: '三级甲等',
        province: '江苏省',
        city: '南京市',
        district: '鼓楼区',
        address: '南京市鼓楼区中山路321号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_4',
        hoscode: '1000_4',
        hosname: '北京大学人民医院',
        hostype: '三级甲等',
        province: '北京市',
        city: '北京市',
        district: '西城区',
        address: '北京市西城区西直门南大街11号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_5',
        hoscode: '1000_5',
        hosname: '广州市第一人民医院',
        hostype: '三级甲等',
        province: '广东省',
        city: '广州市',
        district: '越秀区',
        address: '广州市越秀区盘福路1号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_6',
        hoscode: '1000_6',
        hosname: '浙江大学医学院附属第一医院',
        hostype: '三级甲等',
        province: '浙江省',
        city: '杭州市',
        district: '上城区',
        address: '杭州市上城区庆春路79号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_7',
        hoscode: '1000_7',
        hosname: '武汉协和医院',
        hostype: '三级甲等',
        province: '湖北省',
        city: '武汉市',
        district: '江汉区',
        address: '武汉市江汉区解放大道1277号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_8',
        hoscode: '1000_8',
        hosname: '四川大学华西医院',
        hostype: '三级甲等',
        province: '四川省',
        city: '成都市',
        district: '武侯区',
        address: '成都市武侯区国学巷37号',
        logoData: '',
        status: 1,
      },
      {
        id: '1000_9',
        hoscode: '1000_9',
        hosname: '中山大学附属第一医院',
        hostype: '三级甲等',
        province: '广东省',
        city: '广州市',
        district: '越秀区',
        address: '广州市越秀区中山二路58号',
        logoData: '',
        status: 1,
      },
    ]

    // 过滤条件
    let filteredHospitals = [...hospitals]

    // 根据医院类型过滤
    if (hostype) {
      filteredHospitals = filteredHospitals.filter((h) => h.hostype === hostype)
    }

    // 根据区域编码过滤
    if (districtCode) {
      filteredHospitals = filteredHospitals.filter((h) =>
        h.district.includes(districtCode)
      )
    }

    // 根据医院名称过滤
    if (hosname) {
      filteredHospitals = filteredHospitals.filter((h) =>
        h.hosname.includes(hosname)
      )
    }

    // 分页处理
    const pageNum = parseInt(page)
    const pageSize = parseInt(limit)
    const start = (pageNum - 1) * pageSize
    const end = start + pageSize
    const records = filteredHospitals.slice(start, end)

    return {
      code: 200,
      message: '获取医院列表成功',
      data: {
        total: filteredHospitals.length,
        records,
      },
    }
  } catch (error) {
    console.error('获取医院列表失败', error)
    return {
      code: 500,
      message: '获取医院列表失败',
      data: null,
    }
  }
})
