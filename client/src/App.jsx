
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// API Backend đã triển khai trên Render
const API_URL =
  'https://mern-backend-236696.onrender.com/api/students';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    studentId: '',
    name: '',
    email: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Chuẩn hóa dữ liệu trả về từ API
  const normalizeStudents = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.students)) {
      return data.students;
    }

    return [];
  };

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Calling API:', API_URL);

      const response = await axios.get(API_URL);

      console.log('API response:', response.data);

      const list = normalizeStudents(response.data);
      setStudents(list);
    } catch (err) {
      console.error(
        'Error fetching students:',
        err.response?.data || err.message
      );

      if (err.response) {
        setError(
          `Không thể tải danh sách sinh viên (HTTP ${err.response.status}).`
        );
      } else if (err.request) {
        setError(
          'Không thể kết nối Backend. Hãy kiểm tra CORS hoặc trạng thái Render.'
        );
      } else {
        setError('Có lỗi xảy ra khi tải danh sách sinh viên.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi mở trang
  useEffect(() => {
    fetchStudents();
  }, []);

  // Nhập dữ liệu biểu mẫu
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // Xóa dữ liệu biểu mẫu
  const resetForm = () => {
    setForm({
      studentId: '',
      name: '',
      email: ''
    });

    setEditingId(null);
  };

  // Thêm hoặc cập nhật sinh viên
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const studentData = {
      studentId: form.studentId.trim(),
      name: form.name.trim(),
      email: form.email.trim()
    };

    if (
      !studentData.studentId ||
      !studentData.name ||
      !studentData.email
    ) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await axios.put(
          `${API_URL}/${editingId}`,
          studentData
        );

        alert('Cập nhật sinh viên thành công!');
      } else {
        await axios.post(API_URL, studentData);

        alert('Thêm sinh viên thành công!');
      }

      resetForm();
      await fetchStudents();
    } catch (err) {
      console.error(
        'Error saving student:',
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        'Có lỗi xảy ra khi lưu sinh viên.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Chọn sinh viên để chỉnh sửa
  const handleEdit = (student) => {
    setEditingId(student._id);

    setForm({
      studentId: student.studentId || '',
      name: student.name || '',
      email: student.email || ''
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    resetForm();
  };

  // Xóa sinh viên
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);

      alert('Xóa sinh viên thành công!');

      if (editingId === id) {
        resetForm();
      }

      await fetchStudents();
    } catch (err) {
      console.error(
        'Error deleting student:',
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
        'Có lỗi xảy ra khi xóa sinh viên.'
      );
    }
  };

  // Giao diện tải dữ liệu
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sinh viên...</p>
      </div>
    );
  }

  // Giao diện lỗi
  if (error) {
    return (
      <div className="error-container">
        <h2>Không thể tải dữ liệu</h2>
        <p>{error}</p>

        <button
          type="button"
          onClick={fetchStudents}
          className="retry-button"
        >
          Thử tải lại
        </button>
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="container">
      <header className="page-header">
        <div>
          <h1>📚 Quản lý sinh viên</h1>
          <p>Hệ thống quản lý thông tin sinh viên</p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={fetchStudents}
        >
          ↻ Làm mới
        </button>
      </header>

      {/* Form thêm và cập nhật */}
      <section className="form-card">
        <h2>
          {editingId
            ? '✏️ Cập nhật sinh viên'
            : '➕ Thêm sinh viên mới'}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="student-form"
        >
          <div className="form-group">
            <label htmlFor="studentId">Mã số sinh viên</label>
            <input
              id="studentId"
              type="text"
              name="studentId"
              placeholder="Ví dụ: SV001"
              value={form.studentId}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Nhập họ và tên"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="submit-button"
            >
              {submitting
                ? 'Đang xử lý...'
                : editingId
                  ? 'Lưu cập nhật'
                  : 'Thêm sinh viên'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="cancel-button"
              >
                Hủy chỉnh sửa
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Danh sách sinh viên */}
      <section className="list-card">
        <div className="list-header">
          <h2>Danh sách sinh viên</h2>

          <span className="student-count">
            Tổng số: {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có sinh viên nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="student-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>MSSV</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={student._id || student.studentId || index}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {student.studentId || '—'}
                      </strong>
                    </td>

                    <td>{student.name || '—'}</td>

                    <td>{student.email || '—'}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => handleEdit(student)}
                          disabled={!student._id}
                        >
                          Sửa
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDelete(student._id)}
                          disabled={!student._id}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="page-footer">
        Hệ thống quản lý sinh viên · MERN Stack
      </footer>
    </div>
  );
}

export default App;
