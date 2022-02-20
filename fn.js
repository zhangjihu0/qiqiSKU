const skuList = [
    {
        attrSet: {
            color: "白色",
            memory: "128G",
            version: "标准版",
        },
        stock: 12
    },
    {
        attrSet: {
            color: "白色",
            memory: "256G",
            version: "标准版",
        },
        stock: 3
    },
    {
        attrSet: {
            color: "蓝色",
            memory: "128G",
            version: "标准版",
        },
        stock: 2
    },
    {
        attrSet: {
            color: "蓝色",
            memory: "512G",
            version: "标准版",
        },
        stock: 2
    },
    {
        attrSet: {
            color: "黑色",
            memory: "256G",
            version: "标准版",
        },
        stock: 33
    },
    {
        attrSet: {
            color: "黑色",
            memory: "512G",
            version: "标准版",
        },
        stock: 23
    },
    {
        attrSet: {
            color: "白色",
            memory: "256G",
            version: "套装",
        },
        stock: 10
    },
    {
        attrSet: {
            color: "黑色",
            memory: "128G",
            version: "套装",
        },
        stock: 10
    },
    {
        attrSet: {
            color: "蓝色",
            memory: "512G",
            version: "套装",
        },
        stock: 6
    }
]
const attrList = [
    {
        attrLabel: '颜色',
        key: "color",
        options: [
            { value: "白色" },
            { value: "黑色" },
            { value: "蓝色" },
        ],
    },
    {
        attrLabel: '内存',
        key: "memory",
        options: [
            { value: "128G" },
            { value: "256G" },
            { value: "512G" },
        ],
    },
    {
        attrLabel: '版本',
        key: "version",
        options: [
            { value: "标准版" },
            { value: "套装" },
        ],
    },
]
/**
 * 
 * @param  skuList 列表SKU
 * @param  attrList 规格属性列表
 * @param  selectedSet 输入选择的属性对象 
 * @returns 返回值为库存数>0的其他规格值列表
 */
const fn = (skuList = [], attrList = []) => {
    return (selectedSet = {}) => {
        return attrList.map((attr) => {
            attr.options = attr.options.reduce((sum, option) => {
                if (attr.key in selectedSet && option.value == selectedSet[attr.key]) {
                    return sum;
                } else {
                    //收集下次可能点击的节点
                    const nextSelectSet = { ...selectedSet, [attr.key]: option.value }
                    const keys = Object.keys(nextSelectSet);
                    //在skuList中查找，如果能找到就说明关联节点可以被选择。
                    let flag = skuList.findIndex((sku) => {
                        return keys.every((attrKey) => {
                            return nextSelectSet[attrKey] == sku.attrSet[attrKey];
                        }) && sku.stock > 0
                    }) > -1
                    sum = flag ? [
                        ...sum,
                        option
                    ] : sum
                    return sum
                }
            }, [])
            return attr
        })
    }
}
/**
 * 
 * 格式化函数返回结果，方便查看
 * @param {*} pre 前缀标记 sring
 * @param {*} list fns返回值
 */
const log = (pre, list) => {
    let result = list.reduce((sum, item) => {
        sum = [
            ...sum,
            `${item.attrLabel}:${item.options.map(item1 => item1.value).join(',')}`
        ];
        return sum
    }, []).join("\n")
    console.log(pre, '可选规格值:\n', result)
}

let fns = fn(skuList, attrList);

let result = fns({ memory: "512G" });
log('1', result)

let result1 = fns({ memory: "512G", color: "蓝色" });
log('2', result1)

let result2 = fns({ memory: "512G", color: "蓝色", version: "套装" });
log('3', result2)



