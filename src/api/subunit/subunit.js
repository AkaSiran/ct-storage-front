import request from '@/utils/request'

// 查询商品信息列表
export function listProductInfo(query) {
    return request({
      url: '/common/subunit/productPage',
      method: 'get',
      params: query
    })
  }

// 查询厂商信息列表
export function listSupplierInfo(query) {
  return request({
    url: '/common/subunit/supplierPage',
    method: 'get',
    params: query
  })
}