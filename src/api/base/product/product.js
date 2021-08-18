import request from '@/utils/request'

// 查询商品信息列表
export function listProduct(query) {
  return request({
    url: '/base/product/page',
    method: 'get',
    params: query
  })
}

// 查询商品信息详细
export function getProduct(id) {
  return request({
    url: '/base/product/detail/' + id,
    method: 'get'
  })
}

// 新增商品信息
export function addProduct(data) {
  return request({
    url: '/base/product/insert',
    method: 'post',
    data: data
  })
}

// 修改商品信息
export function updateProduct(data) {
  return request({
    url: '/base/product/update',
    method: 'put',
    data: data
  })
}

// 删除商品信息
export function delProduct(id) {
  return request({
    url: '/base/product/delete/' + id,
    method: 'delete'
  })
}

// 导出商品信息
export function exportProduct(query) {
  return request({
    url: '/base/product/export',
    method: 'get',
    params: query
  })
}