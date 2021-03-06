import React, { useEffect, useState } from 'react'
import { Modal, Button, Form, Input } from 'antd'
function AddModal(props) {
    const { onChange = () => { } } = props;
    const [modalVisible, setIsModalVisible] = useState(false);

    const handleAdd = () => {
        setIsModalVisible(true)
    }

    const handleOk = () => {
        form.submit()
    }
    const handleCancel = () => {
        setIsModalVisible(false)
    }
    const [form] = Form.useForm()

    useEffect(() => {
        modalVisible && form.setFieldsValue && form.setFieldsValue({
            name: ''
        })
        return () => { form.resetFields() }
    }, [modalVisible, form])

    const onFinish = ({ name }) => {
        setIsModalVisible(false)
        onChange(name)
    }

    return <>
        <Modal
            title="添加属性"
            visible={modalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <Form onFinish={onFinish} form={form}>
                <Form.Item label='属性名称' name='name' rules={[{ required: true }]} >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
        <Button onClick={handleAdd} type='primary'>添加属性</Button>
    </>
}
export default AddModal