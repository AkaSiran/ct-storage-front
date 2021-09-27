import request from '@/utils/request'

// 查询采购信息列表
export function listPurchase(query) {
  return request({
    url: '/voc/purchase/page',
    method: 'get',
    params: query
  })
}

// 查询采购信息详细
export function getPurchase(id) {
  return request({
    url: '/voc/purchase/detail/' + id,
    method: 'get'
  })
}

// 新增采购信息
export function addPurchase(data) {
  return request({
    url: '/voc/purchase/insert',
    method: 'post',
    data: data
  })
}

// 修改采购信息
export function updatePurchase(data) {
  return request({
    url: '/voc/purchase/update',
    method: 'put',
    data: data
  })
}

// 删除采购信息
export function delPurchase(id) {
  return request({
    url: '/voc/purchase/delete/' + id,
    method: 'delete'
  })
}

// 导出采购信息
export function exportPurchase(query) {
  return request({
    url: '/voc/purchase/export',
    method: 'get',
    params: query
  })
}

//采购入库
export function storagePurchase(id) {
  return request({
    url: '/voc/purchase/storage/'+id,
    method: 'get'
  })
}