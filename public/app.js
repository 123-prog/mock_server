// API基础URL
const API_BASE = '/admin/api';
let editingEndpointId = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadEndpoints();
    setupEventListeners();
    updateMockBaseUrl();
});

// 设置事件监听器
function setupEventListeners() {
    // 表单提交
    document.getElementById('mock-form').addEventListener('submit', handleFormSubmit);

    // 取消编辑
    document.getElementById('cancel-btn').addEventListener('click', resetForm);

    // 导出配置
    document.getElementById('export-btn').addEventListener('click', exportConfig);

    // 导入配置
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'block';
    });

    // 刷新列表
    document.getElementById('refresh-btn').addEventListener('click', loadEndpoints);

    // 导入确认
    document.getElementById('import-confirm-btn').addEventListener('click', importConfig);

    // 导入取消
    document.getElementById('import-cancel-btn').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'none';
        document.getElementById('import-data').value = '';
    });

    // 关闭模态框
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('import-modal').style.display = 'none';
    });

    // 自动格式化JSON
    document.getElementById('response-body').addEventListener('blur', formatJSON);
    document.getElementById('response-headers').addEventListener('blur', formatJSON);
}

// 加载所有端点
async function loadEndpoints() {
    try {
        const response = await fetch(`${API_BASE}/endpoints`);
        const result = await response.json();

        if (result.success) {
            displayEndpoints(result.data);
        } else {
            showNotification('加载失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('网络错误: ' + error.message, 'error');
    }
}

// 显示端点列表
function displayEndpoints(endpoints) {
    const container = document.getElementById('endpoints-list');
    const countElement = document.getElementById('endpoint-count');

    countElement.textContent = `总共 ${endpoints.length} 个接口`;

    if (endpoints.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无Mock接口，请创建一个</div>';
        return;
    }

    container.innerHTML = endpoints.map(endpoint => `
        <div class="endpoint-card">
            <div class="endpoint-header">
                <div class="endpoint-info">
                    <div class="endpoint-path">${escapeHtml(endpoint.path)}</div>
                    <div class="endpoint-meta">
                        <span class="badge badge-method">${endpoint.method}</span>
                        <span class="badge badge-status">HTTP ${endpoint.status_code}</span>
                        ${endpoint.delay > 0 ? `<span class="badge badge-delay">延迟 ${endpoint.delay}ms</span>` : ''}
                        <span class="badge" style="background:#6c757d;color:white;">${endpoint.content_type}</span>
                    </div>
                    <div class="endpoint-url">
                        <code id="url-${endpoint.id}">${window.location.origin}/mock${endpoint.path}</code>
                        <button class="btn-copy" onclick="copyUrl('${endpoint.id}')">复制</button>
                    </div>
                </div>
                <div class="endpoint-actions">
                    <button class="btn btn-small btn-info" onclick="editEndpoint('${endpoint.id}')">编辑</button>
                    <button class="btn btn-small btn-danger" onclick="deleteEndpoint('${endpoint.id}')">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();

    const path = document.getElementById('path').value.trim();
    const method = document.getElementById('method').value;
    const status_code = parseInt(document.getElementById('status-code').value);
    const content_type = document.getElementById('content-type').value;
    const delay = parseInt(document.getElementById('delay').value);
    const response_headers = document.getElementById('response-headers').value;
    const response_body = document.getElementById('response-body').value;

    // 验证JSON格式
    try {
        JSON.parse(response_headers);
        if (content_type === 'application/json') {
            JSON.parse(response_body);
        }
    } catch (error) {
        showNotification('JSON格式错误: ' + error.message, 'error');
        return;
    }

    const data = {
        path,
        method,
        status_code,
        content_type,
        delay,
        response_headers,
        response_body
    };

    try {
        let response;
        if (editingEndpointId) {
            // 更新
            response = await fetch(`${API_BASE}/endpoints/${editingEndpointId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            // 创建
            response = await fetch(`${API_BASE}/endpoints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        const result = await response.json();

        if (result.success) {
            showNotification(editingEndpointId ? '更新成功' : '创建成功', 'success');
            resetForm();
            loadEndpoints();
        } else {
            showNotification('操作失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('网络错误: ' + error.message, 'error');
    }
}

// 编辑端点
async function editEndpoint(id) {
    try {
        const response = await fetch(`${API_BASE}/endpoints`);
        const result = await response.json();

        if (result.success) {
            const endpoint = result.data.find(e => e.id === id);
            if (endpoint) {
                editingEndpointId = id;

                document.getElementById('path').value = endpoint.path;
                document.getElementById('method').value = endpoint.method;
                document.getElementById('status-code').value = endpoint.status_code;
                document.getElementById('content-type').value = endpoint.content_type;
                document.getElementById('delay').value = endpoint.delay;
                document.getElementById('response-headers').value = JSON.stringify(endpoint.response_headers, null, 2);
                document.getElementById('response-body').value =
                    endpoint.content_type === 'application/json'
                    ? JSON.stringify(endpoint.response_body, null, 2)
                    : endpoint.response_body;

                document.getElementById('form-title').textContent = '编辑Mock接口';
                document.getElementById('submit-btn').textContent = '更新接口';
                document.getElementById('cancel-btn').style.display = 'inline-block';

                // 滚动到表单
                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            }
        }
    } catch (error) {
        showNotification('加载失败: ' + error.message, 'error');
    }
}

// 删除端点
async function deleteEndpoint(id) {
    if (!confirm('确定要删除这个Mock接口吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/endpoints/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            showNotification('删除成功', 'success');
            loadEndpoints();
        } else {
            showNotification('删除失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('网络错误: ' + error.message, 'error');
    }
}

// 重置表单
function resetForm() {
    editingEndpointId = null;
    document.getElementById('mock-form').reset();
    document.getElementById('form-title').textContent = '创建新的Mock接口';
    document.getElementById('submit-btn').textContent = '创建接口';
    document.getElementById('cancel-btn').style.display = 'none';
    document.getElementById('response-headers').value = '{}';
    document.getElementById('response-body').value = '{}';
}

// 导出配置
async function exportConfig() {
    try {
        const response = await fetch(`${API_BASE}/export`);
        const result = await response.json();

        if (result.success) {
            const dataStr = JSON.stringify(result.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mock-config-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);

            showNotification('导出成功', 'success');
        } else {
            showNotification('导出失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('网络错误: ' + error.message, 'error');
    }
}

// 导入配置
async function importConfig() {
    const importData = document.getElementById('import-data').value;

    try {
        const endpoints = JSON.parse(importData);

        if (!Array.isArray(endpoints)) {
            throw new Error('配置必须是数组格式');
        }

        const response = await fetch(`${API_BASE}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoints })
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            document.getElementById('import-modal').style.display = 'none';
            document.getElementById('import-data').value = '';
            loadEndpoints();
        } else {
            showNotification('导入失败: ' + result.error, 'error');
        }
    } catch (error) {
        showNotification('导入错误: ' + error.message, 'error');
    }
}

// 格式化JSON
function formatJSON(e) {
    try {
        const value = e.target.value.trim();
        if (value) {
            const parsed = JSON.parse(value);
            e.target.value = JSON.stringify(parsed, null, 2);
        }
    } catch (error) {
        // 忽略格式化错误
    }
}

// 复制URL
function copyUrl(id) {
    const urlElement = document.getElementById(`url-${id}`);
    const text = urlElement.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showNotification('URL已复制到剪贴板', 'success');
    }).catch(() => {
        showNotification('复制失败', 'error');
    });
}

// 复制到剪贴板
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showNotification('已复制到剪贴板', 'success');
    }).catch(() => {
        showNotification('复制失败', 'error');
    });
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 6px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 更新Mock基础URL
function updateMockBaseUrl() {
    const baseUrl = `${window.location.origin}/mock`;
    document.getElementById('mock-base-url').textContent = baseUrl + '{your_path}';
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
