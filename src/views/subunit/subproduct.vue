<template>
  <div class="app-container">
    <el-dialog :title="title"   width="75%" height="75%"  :visible.sync="productVisible" :before-close="cancelPage"  append-to-body>
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品编号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入商品编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>

      <el-form-item label="商品名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入商品名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="商品类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择商品类型" clearable size="small">
          <el-option
            v-for="dict in productTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商品型号" prop="size">
        <el-select v-model="queryParams.size" placeholder="请选择商品型号" clearable size="small">
          <el-option
            v-for="dict in productSizeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange" class="single-selection-table" ref="Table">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="商品编号" align="center" prop="no" />
      <el-table-column label="商品名称" align="center" prop="name" />
      <el-table-column label="商品类型" align="center" prop="type" :formatter="productTypeFormat"/>
      <el-table-column label="商品型号" align="center" prop="size" :formatter="productSizeFormat"/>
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
import { listProductInfo } from "@/api/subunit/subunit";

export default {
  name: "SubProduct",
  props: {
    productVisible: {
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
      productList: [],
      // 弹出层标题
      title: "",
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
        type: null,
        size: null,
      },
      //商品类型列表
      productTypeOptions: [],
      //商品型号列表
      productSizeOptions: [],
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
    //获取商品类型下拉字典
    this.getDicts("voc_product_type").then(response => {
      this.productTypeOptions = response.data;
    });
    //获取商品型号下拉字典
    this.getDicts("voc_product_size").then(response => {
      this.productSizeOptions = response.data;
    });
  },
  methods: {
    // 商品类型字典翻译
    productTypeFormat(row, column) {
      return this.selectDictLabel(this.productTypeOptions, row.type);
    },
    // 商品型号字典翻译
    productSizeFormat(row, column) {
      return this.selectDictLabel(this.productSizeOptions, row.size);
    },
    /** 查询商品信息列表 */
    getList() {
      this.loading = true;
      listProductInfo(this.queryParams).then(response => {
        this.productList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancelPage() {
      this.$refs.Table.clearSelection()
      this.$emit('closeSubProduct');
    },
    submitPage(row){
       const productId = row.id || this.selectionId[0];
       const productName = row.name || this.selectionName[0];
       if(!productId){
           this.msgError('请选择一种商品');
           return;
       }
       this.$refs.Table.clearSelection()
       this.$emit('receiveSubProduct',productId,productName);
       this.$emit('closeSubProduct');
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        no: null,
        name: null,
        shortName: null,
        type: null,
        size: null,
        remarks: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null
      };
      this.resetForm("form");
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
    handleSelectionChange(selection) {
      this.selectionId = selection.map(item => item.id);
      this.selectionName = selection.map(item => item.name);
      //复选改单选效果
      if(selection.length>1){
         this.$refs.Table.clearSelection()
         this.$refs.Table.toggleRowSelection(selection.pop())
      }
    }

  }
};
</script>