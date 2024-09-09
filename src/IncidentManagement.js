import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IncidentManagement.css'; // 导入CSS文件

function IncidentManagement() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // 当前页
  const [size] = useState(5); // 每页记录数
  const [totalPages, setTotalPages] = useState(0); // 总页数
  const [totalElements, setTotalElements] = useState(0); // 总记录数
  const [showModal, setShowModal] = useState(false); // 控制模态框显示
  const [isEditing, setIsEditing] = useState(false); // 区分新增和编辑
  const [currentIncident, setCurrentIncident] = useState(null); // 当前正在修改的 Incident 数据

  // Fetch incidents from backend
  useEffect(() => {
    fetchIncidents(page, size);
  }, [page, size]);

  const fetchIncidents = async (page, size) => {
    setLoading(true);
    try {
      console.log(process.env.REACT_APP_API_BASE_URL); 
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/incidents?page=${page}&size=${size}`);
      const { content, totalElements, totalPages, currentPage } = response.data;
      setIncidents(content);
      setTotalElements(totalElements);
      setTotalPages(totalPages);
      setPage(currentPage);
    } catch (error) {
      alert('There was an error fetching the incidents!');
    } finally {
      setLoading(false);
    }
  };

  // 打开新增或编辑模态框
  const openModal = (incident = null) => {
    if (incident) {
      setIsEditing(true);
      setCurrentIncident(incident); // 编辑时设置当前 Incident 数据
    } else {
      setIsEditing(false);
      setCurrentIncident({ title: '', type: '', status: '', reporter: '', handler: '', detail: '' }); // 新增时清空表单
    }
    setShowModal(true);
  };

  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentIncident({ ...currentIncident, [name]: value });
  };

  // 提交新增或修改的 Incident
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      // 修改 Incident
      axios
        .put(`${process.env.REACT_APP_API_BASE_URL}/incidents/${currentIncident.id}`, currentIncident)
        .then((response) => {
          setIncidents(
            incidents.map((incident) =>
              incident.id === currentIncident.id ? response.data : incident
            )
          );
          closeModal(); // 关闭模态框
        })
        .catch((error) => {
          alert('There was an error updating the incident!');
        });
    } else {
      // 新增 Incident
      axios
        .post(`${process.env.REACT_APP_API_BASE_URL}/incidents`, currentIncident)
        .then((response) => {
          // 新增后跳转到最后一页
          fetchLastPage();
          closeModal(); // 关闭模态框
        })
        .catch((error) => {
          alert('There was an error creating the incident!');
        });
    }
  };

  // 删除 Incident
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      axios
        .delete(`${process.env.REACT_APP_API_BASE_URL}/incidents/${id}`)
        .then(() => {
          fetchIncidents(page, size); // 删除后刷新当前页的数据
        })
        .catch((error) => {
          alert('There was an error deleting the incident!');
        });
    }
  };

  // 获取最后一页的函数
  const fetchLastPage = () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/incidents?page=${totalPages - 1}&size=${size}`)
      .then((response) => {
        const { content, totalElements, totalPages } = response.data;
        setIncidents(content);
        setTotalElements(totalElements);
        setTotalPages(totalPages);
        setPage(totalPages - 1); // 设置到最后一页
      })
      .catch((error) => {
        alert('There was an error fetching the incidents!');
      });
  };

  // 关闭模态框并重置当前的 Incident
  const closeModal = () => {
    setShowModal(false);
    setCurrentIncident(null); // 重置 currentIncident
  };

  // Handle pagination (go to next/previous page)
  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return <div className="spinner">Loading incidents...</div>;
  }

  return (
    <div>
      <h1>Incident Management</h1>

      {/* Report 按钮 */}
      <div className="header">
        <button className="report-button" onClick={() => openModal()}>
          Report
        </button>
      </div>

      {/* 模态框：用于新增或修改 Incident */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>{isEditing ? 'Modify Incident' : 'Report New Incident'}</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Reporter:
                <input
                  type="text"
                  name="reporter"
                  value={currentIncident.reporter}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={currentIncident.title}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}  // 修改时禁用 title 字段
                />
              </label>
              <label>
                Type:
                <select
                  name="type"
                  value={currentIncident.type}
                  onChange={handleInputChange}
                  required
                  disabled={isEditing}  // 修改时禁用 type 字段
                >
                  <option value="">Select Type</option>
                  <option value="Server">Server</option>
                  <option value="Database">Database</option>
                  <option value="Network">Network</option>
                  <option value="Storage">Storage</option>
                </select>
              </label>
              <label>
                Handler:
                <input
                  type="text"
                  name="handler"
                  value={currentIncident.handler || ''}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Status:
                <select name="status" value={currentIncident.status} onChange={handleInputChange} required>
                  <option value="">Select status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </label>
              <label>
                Detail:
                <textarea
                  name="detail"
                  value={currentIncident.detail}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <button type="submit">{isEditing ? 'Update' : 'Submit'}</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      <table border="1" cellPadding="10" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Reporter</th>
            <th>Handler</th>
            <th>Detail</th>
            <th>Create Time</th>
            <th>Update Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id}>
              <td>{incident.id}</td>
              <td>{incident.title}</td>
              <td>{incident.type}</td>
              <td>{incident.status}</td>
              <td>{incident.reporter}</td>
              <td>{incident.handler || 'Unassigned'}</td>
              <td>{incident.detail}</td>
              <td>{new Date(incident.createTime).toLocaleString()}</td>
              <td>{new Date(incident.updateTime).toLocaleString()}</td>
              <td>
                <button onClick={() => openModal(incident)}>Modify</button>
                <button onClick={() => handleDelete(incident.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 页脚部分：包含总数和分页控制 */}
      <div className="footer">
        <div>Total Incidents: {totalElements}</div>
        <div className="pagination">
          <button onClick={handlePreviousPage} disabled={page === 0}>
            Previous
          </button>
          <span> Page {page + 1} of {totalPages} </span>
          <button onClick={handleNextPage} disabled={page >= totalPages - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default IncidentManagement;
