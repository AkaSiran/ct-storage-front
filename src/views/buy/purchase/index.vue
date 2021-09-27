<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="采购编号" prop="purchaseNo">
        <el-input
          v-model="queryParams.purchaseNo"
          placeholder="请输入采购编号"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="归属门店" prop="deptId">
        <treeselect v-model="queryParams.deptId" :options="deptOptions" :show-count="true" style="width:200px;" placeholder="请选择归属部门" />
      </el-form-item>
      <el-form-item label="厂商名称" prop="supplierId">
        <el-input
          v-model="queryParams.supplierId"
          placeholder="请输入供应商标识"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="采购类型" prop="purchaseType">
        <el-select v-model="queryParams.purchaseType" placeholder="请选择采购类型" clearable size="small">
          <el-option
            v-for="dict in purchaseTypeOptions"
            :key="dict.dictValue"
            :label="dict.dictLabel"
            :value="dict.dictValue"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="采购状态" prop="purchaseStatus">
        <el-select v-model="queryParams.purchaseStatus" placeholder="请选择采购状态" clearable size="small">
          <el-option
            v-for="dict in purchaseStatusOptions"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['voc:purchase:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['voc:purchase:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['voc:purchase:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
		  :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['voc:purchase:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="采购编号" align="center" prop="purchaseNo" />
      <el-table-column label="归属门店" align="center" prop="deptName" />
      <el-table-column label="厂商名称" align="center" prop="supplierName" />
      <el-table-column label="采购总数" align="center" prop="totalAmount" />
      <el-table-column label="采购总价" align="center" prop="totalPrice" />
      <el-table-column label="采购类型" align="center" prop="purchaseType" :formatter="purchaseTypeFormat" />
      <el-table-column label="采购状态" align="center" prop="purchaseStatus" :formatter="purchaseStatusFormat" />
      <el-table-column label="采购时间" align="center" prop="createTime" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleStorage(scope.row)"
            v-if="scope.row.purchaseStatus=='001'"
            v-hasPermi="['voc:purchase:storage']"
          >入库</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-view"
            @click="handleView(scope.row)"
            v-hasPermi="['voc:purchase:query']"
          >查看</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-if="scope.row.purchaseStatus=='001'"
            v-hasPermi="['voc:purchase:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-if="scope.row.purchaseStatus=='001'"
            v-hasPermi="['voc:purchase:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 商品选择组件-->
    <SubProductModel :productVisible="subProductVisible" @receiveSubProduct="receiveSubProductValues" @closeSubProduct="closeSubProductWindows"></SubProductModel>

    <!-- 厂家选择组件-->
    <SubSupplierModel :supplierVisible="subSupplierVisible" @receiveSubSupplier="receiveSubSupplierValues" @closeSubSupplier="closeSubSupplierWindows"></SubSupplierModel>

    <!-- =====================================================================编辑采购信息对话框 begin =====================================================================-->

    <!-- 添加或修改采购信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>

          <el-col :span="24">
            <el-form-item label="采购编号" prop="purchaseNo" v-if = "form.id">
              <el-input v-model="form.purchaseNo" :disabled="edit"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="厂商名称" prop="supplierName">
              <el-input v-model="form.supplierName" @click.native="handleSubSupplierForForm()" suffix-icon="el-icon-school" placeholder="请选择厂家" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="归属门店" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属部门"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购类型" prop="purchaseType">
              <el-select v-model="form.purchaseType" placeholder="请选择采购类型" style="width:300px;">
                <el-option
                  v-for="dict in purchaseTypeOptions"
                  :key="dict.dictValue"
                  :label="dict.dictLabel"
                  :value="dict.dictValue"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购总数" prop="totalAmount">
              <el-input v-model="form.totalAmount" :disabled="edit"/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购总价" prop="totalPrice">
              <el-input v-model="form.totalPrice" :disabled="edit"/>
            </el-form-item>
          </el-col>

          <el-col :span="24">  
            <el-form-item label="备注信息" prop="remarks">
              <el-input v-model="form.remarks" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 采购商品信息子表单-->
        <el-table
            ref="multipleTable"
            :data="form.itemList"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="selectChange"
          >
             <el-table-column label="序号"  type="index" width="60" align="center"></el-table-column>

             <el-table-column label="商品" align="center" width="200">
                <template slot-scope="scope">
                  <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.productName'" :rules = "rules.productName">
                    <el-input v-model="scope.row.productName" @click.native="handleSubProductForChild(scope.$index)" suffix-icon="el-icon-shopping-bag-1" readonly/>
                  </el-form-item>  
                </template>
            </el-table-column>

            <el-table-column label="数量" align="center">
                <template slot-scope="scope">
                  <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.amount'" :rules = "rules.amount">
                    <el-input v-model="scope.row.amount" @input="calculateRowTotalPrice(scope.row,scope.$index),calculateRowTotalAmount()"></el-input>
                  </el-form-item>  
                </template>
            </el-table-column>

            <el-table-column label="单价" align="center">
              <template slot-scope="scope">
                <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.singlePrice'" :rules = "rules.singlePrice">
                  <el-input v-model="scope.row.singlePrice" @input="calculateRowTotalPrice(scope.row,scope.$index)"></el-input>
                </el-form-item>  
              </template>
            </el-table-column>

             <el-table-column label="总价" align="center">
              <template slot-scope="scope">
                <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.totalPrice'">
                  <el-input v-model="scope.row.totalPrice" :disabled="edit"></el-input>
                </el-form-item>  
              </template>
            </el-table-column>
          
            <el-table-column label="操作" width="160" align="center">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="deleteRow(scope.row, scope.$index)">删除</el-button>
                <el-button v-if="lastRow(scope.$index)"  size="mini" type="primary" @click="addRow(scope.row, scope.$index)">增加</el-button>
              </template>
            </el-table-column>
        </el-table>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- =====================================================================编辑采购信息对话框 end ===================================================================== -->


    <!-- =====================================================================查看采购信息对话框 begin =====================================================================-->

    <!-- 查看采购信息对话框 -->
    <el-dialog :title="title" :visible.sync="viewOpen" width="800px" append-to-body>
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>

          <el-col :span="24">
            <el-form-item label="采购编号" prop="purchaseNo">
              <el-input v-model="form.purchaseNo" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="厂商名称" prop="supplierName">
              <el-input v-model="form.supplierName" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="归属门店" prop="deptId">
              <el-input v-model="form.deptName" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购类型" prop="purchaseType">
              <el-input v-model="form.purchaseTypeName" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购总数" prop="totalAmount">
              <el-input v-model="form.totalAmount" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="12">  
            <el-form-item label="采购总价" prop="totalPrice">
              <el-input v-model="form.totalPrice" readonly/>
            </el-form-item>
          </el-col>

          <el-col :span="24">  
            <el-form-item label="备注信息" prop="remarks">
              <el-input v-model="form.remarks" type="textarea" readonly/>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 采购商品信息子表单-->
        <el-table
            ref="multipleTable"
            :data="form.itemList"
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="selectChange"
          >
             <el-table-column label="序号"  type="index" width="60" align="center"></el-table-column>

             <el-table-column label="商品" align="center" width="200">
                <template slot-scope="scope">
                  <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.productName'">
                    <el-input v-model="scope.row.productName"  readonly/>
                  </el-form-item>  
                </template>
            </el-table-column>

            <el-table-column label="数量" align="center">
                <template slot-scope="scope">
                  <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.amount'">
                    <el-input v-model="scope.row.amount" readonly></el-input>
                  </el-form-item>  
                </template>
            </el-table-column>

            <el-table-column label="单价" align="center">
              <template slot-scope="scope">
                <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.singlePrice'">
                  <el-input v-model="scope.row.singlePrice" readonly></el-input>
                </el-form-item>  
              </template>
            </el-table-column>

             <el-table-column label="总价" align="center">
              <template slot-scope="scope">
                <el-form-item class="item-form" :prop="'itemList.'+scope.$index+'.totalPrice'">
                  <el-input v-model="scope.row.totalPrice" readonly></el-input>
                </el-form-item>  
              </template>
            </el-table-column>

        </el-table>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!-- =====================================================================查看采购信息对话框 end ===================================================================== -->
  </div>
</template>

<style scoped>
    .item-form >>> .el-form-item__content{
      margin-left:0px !important;
      margin-bottom:-20px !important;
    }
</style>

<script>
import { listPurchase, getPurchase, delPurchase, addPurchase, updatePurchase, storagePurchase, exportPurchase } from "@/api/buy/purchase/purchase";
import { powerTree } from "@/api/system/dept";
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import SubProductModel from '@/views/subunit/subproduct.vue';
import SubSupplierModel from '@/views/subunit/subsupplier.vue';

export default {
  name: "Purchase",
  components: { Treeselect, SubProductModel, SubSupplierModel},
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
      // 采购信息表格数据
      purchaseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      //是否显示详情查看弹出层
      viewOpen: false,
      // 采购类型字典
      purchaseTypeOptions: [],
      // 采购状态字典
      purchaseStatusOptions: [],
      // 部门树选项
      deptOptions: undefined,
      // 部门名称
      deptName: undefined,
      // 是否显示商品组件
      subProductVisible: false,
      //是否显示厂家组件
      subSupplierVisible: false,
      //开启只读
      readonly: true,
      //开启禁用
      edit: true,
      //商品组件调用场景类型
      productVisibleType: 0,
      //厂家组件调用类型
      supplierVisibleType: 0,
      //控件行号
      visitRowNum: 0,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        purchaseNo: null,
        deptId: null,
        supplierId: null,
        purchaseType: null,
        purchaseStatus: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        supplierName: [
            { required: true, message: "厂商不能为空", trigger: "blur" }
        ],
        deptId: [
            { required: true, message: "归属门店不能为空", trigger: "blur" }
        ],
        purchaseType: [
            { required: true, message: "采购类型不能为空", trigger: "blur" }
        ],
        singlePrice: [
            { required: true, message: "采购总价不能为空", trigger: "blur" }
        ],
        productName: [
            { required: true, message: "商品不能为空", trigger: "blur" }
        ],
        amount: [
            { required: true, message: "商品数量不能为空", trigger: "blur" }
        ]

      }
    };
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    }
  },
  created() {
    this.getList();
    this.getTreeselect();
    this.getDicts("voc_purchase_type").then(response => {
      this.purchaseTypeOptions = response.data;
    });
    this.getDicts("voc_purchase_status").then(response => {
      this.purchaseStatusOptions = response.data;
    });
  },
  methods: {
    /** 查询采购信息列表 */
    getList() {
      this.loading = true;
      listPurchase(this.queryParams).then(response => {
        this.purchaseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 采购类型字典翻译
    purchaseTypeFormat(row, column) {
      return this.selectDictLabel(this.purchaseTypeOptions, row.purchaseType);
    },
    // 采购状态字典翻译
    purchaseStatusFormat(row, column) {
      return this.selectDictLabel(this.purchaseStatusOptions, row.purchaseStatus);
    },
    /** 查询部门下拉树结构 */
    getTreeselect() {
      powerTree().then(response => {
        this.deptOptions = response.data;
      });
    },
    // 筛选节点
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.deptId = data.id;
      this.getList();
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.viewOpen = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        purchaseNo: null,
        deptId: null,
        deptName: null,
        supplierId: null,
        supplierName: null,
        storeId: null,
        purchaseType: null,
        totalAmount: null,
        totalPrice: null,
        purchaseStatus: "0",
        purchaseStatusName: null,
        remarks: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null,
        delFlag: null,
        itemList: [{
          rowNum: null,
          productId: null,
          productName: null,
          amount: null,
          singlePrice: null,
          totalPrice: null
        }],
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加采购信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getPurchase(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改采购信息";
      });
    },
    /** 查看按钮操作 */
    handleView(row){
      this.reset();
      const id = row.id || this.ids
      getPurchase(id).then(response => {
        this.form = response.data;
        this.viewOpen = true;
        this.title = "查看采购信息";
      });
    },
    /** 入库按钮操作 */
    handleStorage(row){
     const ids = row.id || this.ids;
      this.$confirm('是否确认对选中采购单进行入库操作?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return storagePurchase(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("入库成功");
        }).catch(() => {});
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updatePurchase(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addPurchase(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认对选中采购单进行删除操作?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delPurchase(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有采购信息数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          this.exportLoading = true;
          return exportPurchase(queryParams);
        }).then(response => {
          this.download(response.msg);
          this.exportLoading = false;
        }).catch(() => {});
    },
   /**弹出厂家组件-表格使用 */
    handleSubSupplierForForm()
    {
      this.subSupplierVisible = true;
      this.supplierVisibleType = 1;
    },
    /**关闭厂家组件 */
    closeSubSupplierWindows()
    {
        this.subSupplierVisible = false;
    },
     /**接收厂家组件选中值 */
    receiveSubSupplierValues(selectionId,selectionName)
    {
      if(this.supplierVisibleType==1){
        this.form.supplierName = selectionName;
        this.form.supplierId = selectionId;
      }
      this.supplierVisibleType=0;
    },

    /**弹出商品组件-子信息使用 */
    handleSubProductForChild(i)
    {
      this.subProductVisible = true;
      this.visitRowNum = i;
      this.productVisibleType = 3;
    },
    /**关闭商品组件 */
    closeSubProductWindows()
    {
        this.subProductVisible = false;
    },
     /**接收商品组件选中值 */
    receiveSubProductValues(selectionId,selectionName)
    {
      if(this.productVisibleType==3)
      {
        this.form.itemList[this.visitRowNum].productName = selectionName;
        this.form.itemList[this.visitRowNum].productId = selectionId;
      }
      this.productVisibleType=0;
    },
     //子信息方法
    lastRow(i)
    {
       if(i==this.form.itemList.length-1)
       {
         return true
       }else
       {
         return false
       }
    },
    resetItem()
    {
      this.form.itemList = 
      [{
         rowNum: null,
         productId: null,
         productName: null,
         amount: null,
         singlePrice: null,
         totalPrice: null
      }];
    },
    // 增加行
    addRow(rows,i)
    {
      if(!rows.productId || !rows.amount ||!rows.singlePrice) return;
      const row = 
      {
          rowNum: null,
          productId: null,
          productName: null,
          amount: null,
          singlePrice: null,
          totalPrice: null
      }
      this.form.itemList.push(row)
    },
    //删除单行
    deleteRow(rows, i) 
    { //删除
        this.form.itemList.splice(i, 1);
        if(this.form.itemList.length==0) this.resetItem();
    },
    selectChange(val) 
    {
      this.multipleSelection = val
    },
    //计算单行商品总价
    calculateRowTotalPrice(row,rowIndex)
    {
      const rowAmount = row.amount;
      const rowSinglePrice = row.singlePrice;
      if(null!=rowAmount && null!=rowSinglePrice)
      {
          const rowTotalPrice = rowAmount * rowSinglePrice;
          this.form.itemList[rowIndex].totalPrice = rowTotalPrice;
          this.calculateFormTotalPrice();
      }
    },
    //计算采购总金额
    calculateFormTotalPrice()
    {
       let formTotalPrice = 0;
       const formList = this.form.itemList;
       for(let i=0;i<formList.length;i++)
       {
          let rowTotalPrice = formList[i].totalPrice;
          formTotalPrice += rowTotalPrice;
       }
       this.form.totalPrice = formTotalPrice;
    },
    //计算采购总数量
    calculateRowTotalAmount()
    {
      let formTotalAmount = 0;
      const formList = this.form.itemList
      for(let i=0;i<formList.length;i++)
      {
        let rowTotalAmount = formList[i].amount * 1;
        formTotalAmount += rowTotalAmount;
      }
      this.form.totalAmount = formTotalAmount;  
    }
  }
};
</script>
