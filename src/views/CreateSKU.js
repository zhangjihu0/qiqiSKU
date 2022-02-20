import React from "react";
import { Tag, Form, Space, Table, Row, Col, TableColumnType, InputNumber, Button } from "antd";
import { produce } from "immer";
import AddOptions from "./components/AddCol";
import AddAttrItem from "./components/AddRow";
import { useStore } from '../store';

function CreateSKU() {
    const { state: { skuList, attrList }, dispatch } = useStore();
    let {
        handleDeleteCol,
        handleAddCol,
        handleAddRow,
        handleChangeStock,
    } = useCreateSKUHook({ skuList, attrList, dispatch })

    let {
        handleQuickSetSkuStock
    } = useCreateSKUTableHook({ skuList, attrList, dispatch })

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        ...(attrList.map((item, index) => {
            return {
                title: item.attrLabel,
                dataIndex: item.attrLabel,
                render(_, row) {
                    return row.attrSet.find(({ label }) => label === item.attrLabel)?.value
                }
            }
        })),
        {
            title: '库存',
            dataIndex: 'stock',
            render(val, row) {
                return <InputNumber value={val} onChange={(num) => handleChangeStock(row.key, num)} />
            }
        }
    ]
    return <Row>
        <Col span={12}>
            <CreateSKUItemContainer
                attrList={attrList}
                handleAddCol={handleAddCol}
                handleDeleteCol={handleDeleteCol}
                handleAddRow={handleAddRow}
            />
        </Col>
        <Col span={12}>
            <Row justify='space-between'>
                <Col>
                    <h1>SKU列表</h1>
                </Col>
                <Col pull={1}>
                    <Button onClick={handleQuickSetSkuStock} type='primary'>一键回填库存</Button>
                </Col>
            </Row>
            <Table
                rowKey='id'
                columns={columns}
                dataSource={skuList}
                size='small'
                pagination={{ showTotal: (num) => `${num}个` }}
            />
        </Col>
    </Row>
}

const CreateSKUItemContainer = ({
    attrList = [],
    handleAddCol = () => { },
    handleDeleteCol = () => { },
    handleAddRow = () => { },
    head = () => <h1>规格属性</h1>,
    footer = (handleAddRow) => <AddAttrItem onChange={handleAddRow} />
}) => {
    return <Form style={{ marginLeft: 50 }}>
        {head()}
        {attrList.map((attrItem, rowIndex) => (
            <CreateSKUItem
                key={attrItem.attrLabel}
                attrItem={attrItem}
                rowIndex={rowIndex}
                handleAddCol={handleAddCol}
                handleDeleteCol={handleDeleteCol}
            />
        ))}
        {
            footer(handleAddRow)
        }
    </Form>
}



const CreateSKUItem = ({ attrItem, rowIndex = 0, handleAddCol = () => { }, handleDeleteCol = () => { } }) => {
    return <Form.Item label={attrItem.attrLabel}>
        <Space>
            {(attrItem?.options ?? []).map((option, colIndex) => <Tag
                key={option.value + colIndex}
                closable
                onClose={() => handleDeleteCol(rowIndex, colIndex)}
            >{option.value}</Tag>)}
            <AddOptions onChange={(val) => handleAddCol(val, rowIndex)} />
        </Space>
    </Form.Item>
}
const useCreateSKUTableHook = ({ skuList = [], attrList = [], dispatch = () => { } }) => {
    // 快速设置库存,方便调试Mock

    const handleQuickSetSkuStock = () => {
        dispatch({
            type: 'setSkuList',
            payLoad: produce(skuList, (draft) => {
                draft.forEach((item) => {
                    // 这里预设的都是没库存的
                    const noneStockKeys = [
                        '白色_128G_标准版',
                        '白色_256G_标准版',
                    ];
                    if (noneStockKeys.includes(item.key)) {
                        item.stock = 0
                    } else {
                        item.stock = 10
                    }
                })
            })
        })
    }
    return {
        handleQuickSetSkuStock
    }
}

const useCreateSKUHook = ({ skuList = [], attrList = [], dispatch = () => { } }) => {

    // 更新sku列表
    const handleUpdateSkuList = (attrList = []) => {
        dispatch({
            type: 'setSkuList',
            payLoad: createSkuList(attrList, skuList)
        })
    }
    // 增加属性
    const handleAddRow = (attrName = "") => {
        const newAttrList = produce(attrList, (draft) => {
            draft.push({
                attrLabel: attrName,
                options: []
            })
        })
        dispatch({
            type: "setAttrList",
            payLoad: newAttrList
        })
        handleUpdateSkuList(newAttrList)
    }
    // 选项-添加
    const handleAddCol = (optionName = "", rowIndex = 0) => {
        const newAttrList = produce(attrList, (draft) => {
            Array.isArray(draft?.[rowIndex]?.options) ? draft[rowIndex].options.push({
                value: optionName
            }) : draft[rowIndex].options = [
                {
                    value: optionName
                }
            ]
        })
        dispatch({
            type: "setAttrList",
            payLoad: newAttrList
        })
        handleUpdateSkuList(newAttrList)
    }
    // 选项-删除
    const handleDeleteCol = (rowIndex = 0, colIndex = 0) => {
        const newAttrList = produce(attrList, (draft) => {
            draft[rowIndex].options.splice(colIndex, 1)
        })
        dispatch({
            type: "setAttrList",
            payLoad: newAttrList
        })
        handleUpdateSkuList(newAttrList)
    }
    // 更新库存
    const handleChangeStock = (skuKey, stockNum) => {
        dispatch({
            type: 'setSkuList',
            payLoad: produce(skuList, (draft) => {
                const sku = draft.find(({ key }) => key === skuKey)
                sku && (sku.stock = stockNum);
            })
        })
    }

    return {
        handleUpdateSkuList,
        handleDeleteCol,
        handleAddCol,
        handleAddRow,
        handleChangeStock,
    }
}


/**
 * @description 递归版本的SKU全排列组合
 * @param attrList 属性列表
 * @param prevSkuList 上一次的sku列表数据
 * @returns 新的sku列表数据
 */
export function createSkuList(attrList = [], prevSkuList = []) {
    const skuList = [];//收集结果
    let id = 0;//生成skuId
    // 旧的SkuList转map，方便下方的复用判断
    const prevSkuMap = skuList2Map(prevSkuList);

    const loop = (rowIndex, prevOptions) => {
        const attrItem = attrList[rowIndex];
        if (attrItem?.options && (attrItem?.options ?? []).length === 0) {
            loop(rowIndex + 1, prevOptions)
            return
        }
        for (const option of (attrItem?.options ?? [])) {
            const curOptions = prevOptions.concat({
                label: attrItem.attrLabel,
                value: option.value
            });

            if (rowIndex === attrList.length - 1) {//判断如果是最后一层，那就是组合完整了，将结果收集到全局的容器里
                id++;
                const key = curOptions.map(({ value }) => value).join('_'); // 将sku的选项值用'_'连接起来组成一个key
                if (prevSkuMap[key]) {// 如果改变前后的sku key相同，复用sku数据,避免数据覆盖
                    skuList.push({
                        ...prevSkuMap[key],
                        id: `${id}`
                    })
                } else {
                    skuList.push({
                        id: `${id}`,
                        key,
                        attrSet: curOptions,
                        stock: 0
                    })
                }
            } else {
                loop(rowIndex + 1, curOptions)
            }
        }
    }
    loop(0, [])
    return skuList
}
/**
 * @description sku列表数据转map,方便映射查找，判断sku数据对比复用
 * @param skuList  sku列表
 * @returns skuKey做键,sku数据做值的sku查找映射
 */
function skuList2Map(skuList) {
    return skuList.reduce((map, sku) => {
        map[sku.key] = sku;
        return map
    }, {})
}

export default CreateSKU;