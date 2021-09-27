<template>
  <div class="app-container">
    <el-dialog :title="title"   width="75%" height="75%"  :visible.sync="supplierVisible" :before-close="cancelPage"  append-to-body>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="厂商编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入厂商编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="厂商名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入厂商名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="负责人" prop="managerName">
        <el-input
          v-model="queryParams.managerName"
          placeholder="请输入负责人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="supplierList" @selection-change="handleSelectionChange" class="single-selection-table" ref="Table">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="厂商编号" align="center" prop="no" />
      <el-table-column label="厂商名称" align="center" prop="name" />
      <el-table-column label="厂商电话" align="center" prop="phone" />
      <el-table-column label="负责人" align="center" prop="managerName" />、
    </el-table>
       
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
   
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submitPage">确 定</el-button>
      <el-button @click="cancelPage">取 消</el-button>
    </div>
    </el-dialog>
  </div>
</template>

<style>
   thead .el-table-column--selection .cell{
        display: none;
    }
</style>

<script>
import { listSupplierInfo } from "@/api/subunit/subunit";

export default {
  name: "SubSupplier",
  props: {
    supplierVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 商品信息表格数据
      supplierList: [],
      // 弹出层标题
      title: "商品列表",
      // 是否显示弹出层
      open: false,
      //是否显示提交按钮
      commitShow : false,
      // 查询参数
      queryParams: {
       pageNum: 1,
        pageSize: 10,
        no: null,
        name: null,
        shortName: null,
        managerName: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询商品信息列表 */
    getList() {
      this.loading = true;
      listSupplierInfo(this.queryParams).then(response =>
      {
        this.supplierList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancelPage()
     {
      this.$refs.Table.clearSelection()
      this.$emit('closeSubSupplier');
    },
    submitPage(row)
    {
       const supplierId = row.id || this.selectionId[0];
       const supplierName = row.name || this.selectionName[0];
       if(!supplierId)
       {
           this.msgError('请选择一个厂家');
           return;
       }
       this.$refs.Table.clearSelection()
       this.$emit('receiveSubSupplier',supplierId,supplierName);
       this.$emit('closeSubSupplier');
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) 
    {
      this.selectionId = selection.map(item => item.id);
      this.selectionName = selection.map(item => item.name);
      //复选改单选效果
      if(selection.length>1)
      {
         this.$refs.Table.clearSelection()
         this.$refs.Table.toggleRowSelection(selection.pop())
      }
    }

  }
};
</script>