import request from '@/utils/request'

// 查询供应商信息列表
export function listSupplier(query) {
  return request({
    url: '/base/supplier/page',
    method: 'get',
    params: query
  })
}

// 查询供应商信息详细
export function getSupplier(id) {
  return request({
    url: '/base/supplier/detail/' + id,
    method: 'get'
  })
}

// 新增供应商信息
export function addSupplier(data) {
  return request({
    url: '/base/supplier/insert',
    method: 'post',
    data: data
  })
}

// 修改供应商信息
export function updateSupplier(data) {
  return request({
    url: '/base/supplier/update',
    method: 'put',
    data: data
  })
}

// 删除供应商信息
export function delSupplier(id) {
  return request({
    url: '/base/supplier/delete/' + id,
    method: 'delete'
  })
}

// 导出供应商信息
export function exportSupplier(query) {
  return request({
    url: '/base/supplier/export',
    method: 'get',
    params: query
  })
}