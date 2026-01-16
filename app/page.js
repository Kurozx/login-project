"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // Data
  const [dataList, setDataList] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Form & Modal
  const [showModal, setShowModal] = useState(false); 
  const [editId, setEditId] = useState(null); 
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });

  const themeColor = '#198754'; 

  // Check Auth
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    try {
      setUser(JSON.parse(userData));
      fetchData();
    } catch (e) {
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  // --- 1. READ (ดึงข้อมูล) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setDataList(data);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // Helper Functions
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString('th-TH', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({ username: '', email: '', password: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    // รหัสผ่านปล่อยว่างไว้ ถ้า User ไม่กรอกแปลว่าไม่เปลี่ยน
    setFormData({ username: item.username, email: item.email, password: '' }); 
    setShowModal(true);
  };

  // --- 2. CREATE & 3. UPDATE (บันทึกข้อมูล) ---
  const handleSave = async (e) => {
    e.preventDefault();
    if(!formData.username || !formData.email) {
        Swal.fire('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบ', 'warning');
        return;
    }
    // ถ้าสร้างใหม่ ต้องกรอกรหัสผ่าน
    if(!editId && !formData.password) {
        Swal.fire('แจ้งเตือน', 'กรุณากำหนดรหัสผ่าน', 'warning');
        return;
    }

    try {
        const url = editId ? `/api/users/${editId}` : '/api/users';
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if(res.ok) {
            Swal.fire('สำเร็จ', editId ? 'แก้ไขข้อมูลเรียบร้อย' : 'เพิ่มผู้ใช้เรียบร้อย', 'success');
            setShowModal(false);
            fetchData(); // รีเฟรชตาราง
        } else {
            const errorData = await res.json();
            Swal.fire('Error', errorData.message || 'เกิดข้อผิดพลาด', 'error');
        }
    } catch (err) {
        Swal.fire('Error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์', 'error');
    }
  };

  // --- 4. DELETE (ลบข้อมูล) ---
  const handleDelete = async (id) => {
    const result = await Swal.fire({
        title: 'ยืนยันการลบ?',
        text: "ข้อมูลจะถูกลบถาวร ไม่สามารถกู้คืนได้",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: 'gray',
        confirmButtonText: 'ลบข้อมูล'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if(res.ok) {
                Swal.fire('ลบสำเร็จ', '', 'success');
                fetchData();
            } else {
                Swal.fire('Error', 'ลบไม่สำเร็จ', 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
        }
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'ออกจากระบบ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'ออก',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('user');
        router.push('/login');
      }
    });
  };

  if (!user) return null;

  return (
    <div className="min-vh-100 bg-light position-relative">
      {/* Navbar */}
      <nav className="navbar navbar-dark shadow-sm sticky-top px-3 px-lg-4" style={{ backgroundColor: themeColor }}>
        <div className="container-fluid p-0">
             <span className="navbar-brand fw-bold">Artto System</span>
             <button onClick={handleLogout} className="btn btn-sm btn-outline-light">
                <i className="bi bi-box-arrow-right me-1"></i> Logout
             </button>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold text-dark mb-0">จัดการผู้ใช้งาน</h2>
            <button onClick={handleOpenAdd} className="btn btn-success rounded-pill px-4 shadow-sm">
                <i className="bi bi-plus-lg me-2"></i> เพิ่มผู้ใช้ใหม่
            </button>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="ps-4">ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Password</th>
                            <th>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr> : 
                         dataList.map((item, index) => (
                            <tr key={item.id}>
                                <td className="ps-4 fw-bold text-muted">{index + 1}</td>
                                <td className="fw-bold">{item.username}</td>
                                <td>{item.email}</td>
                                <td className="text-muted" style={{ fontFamily: 'monospace' }}>{item.password}</td>
                                <td className="small text-muted">{formatDate(item.create_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="card border-0 shadow-lg rounded-4 animate__animated animate__fadeInUp" style={{ width: '400px' }}>
                <div className="card-header bg-white border-bottom-0 pt-4 px-4 d-flex justify-content-between">
                    <h5 className="fw-bold mb-0">{editId ? 'แก้ไขข้อมูล' : 'เพิ่มผู้ใช้ใหม่'}</h5>
                    <button onClick={() => setShowModal(false)} className="btn-close"></button>
                </div>
                <div className="card-body px-4 pb-4">
                    <form onSubmit={handleSave}>
                        <div className="mb-3">
                            <label className="form-label small text-muted">Username</label>
                            <input type="text" className="form-control bg-light" 
                                value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small text-muted">Email</label>
                            <input type="email" className="form-control bg-light" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label small text-muted">Password</label>
                            <input type="text" className="form-control bg-light" 
                                value={formData.password} 
                                onChange={e => setFormData({...formData, password: e.target.value})} 
                                placeholder={editId ? "ว่างไว้หากไม่ต้องการเปลี่ยน" : "กำหนดรหัสผ่าน"}
                                required={!editId} 
                            />
                        </div>
                        <button type="submit" className="btn btn-success w-100 rounded-pill py-2 mt-2 fw-bold">
                            {editId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่ม'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}