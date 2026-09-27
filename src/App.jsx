import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Dùng đường dẫn tương đối để request đi qua proxy của Vite.
const API_URL = '/api/students';
function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ studentId: '', name: '', email: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Calling API:', API_URL);
      const response = await axios.get(API_URL);
      console.log('Response:', response.data);
      setStudents(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.studentId || !form.name || !form.email) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setEditingId(null);
        alert('Cập nhật sinh viên thành công!');
      } else {
        await axios.post(API_URL, form);
        alert('Thêm sinh viên thành công!');
      }
      
      setForm({ studentId: '', name: '', email: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra';
      alert(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      alert('Xóa sinh viên thành công!');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      studentId: student.studentId,
      name: student.name,
      email: student.email
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ studentId: '', name: '', email: '' });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1>📚 Quản lý Sinh viên</h1>
      
      <form onSubmit={handleSubmit} className="student-form">
        <input
          type="text"
          name="studentId"
          placeholder="Mã số sinh viên"
          value={form.studentId}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Họ và tên"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {editingId ? '✏️ Cập nhật' : '➕ Thêm sinh viên'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit}>
            ❌ Hủy
          </button>
        )}
      </form>

      {students.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          Chưa có sinh viên nào. Hãy thêm sinh viên mới!
        </p>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>MSSV</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td><strong>{student.studentId}</strong></td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <button onClick={() => handleEdit(student)}>
                    ✏️ Sửa
                  </button>
                  <button onClick={() => handleDelete(student._id)}>
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      <p style={{ textAlign: 'center', color: '#666', marginTop: '20px', fontSize: '14px' }}>
        Tổng số sinh viên: <strong>{students.length}</strong>
      </p>
    </div>
  );
}

export default App;