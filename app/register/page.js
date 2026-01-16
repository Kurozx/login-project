"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function RegisterPage() {
  const router = useRouter();
  
  const [inputs, setInputs] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [loading, setLoading] = useState(false);

  const themeColor = '#198754'; 

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- 1. เช็คความยาวรหัสผ่าน (เพิ่มใหม่ตรงนี้) ---
    if (inputs.password.length < 8) {
        Swal.fire({
            icon: 'warning',
            title: 'รหัสผ่านสั้นเกินไป',
            text: 'กรุณาตั้งรหัสผ่านอย่างน้อย 8 ตัวอักษร',
            confirmButtonColor: themeColor
        });
        setLoading(false);
        return;
    }

    // --- 2. เช็คว่ารหัสผ่านตรงกันไหม ---
    if (inputs.password !== inputs.confirmPassword) {
        Swal.fire({
            icon: 'warning',
            title: 'รหัสผ่านไม่ตรงกัน',
            text: 'กรุณากรอกรหัสผ่านยืนยันให้ถูกต้อง',
            confirmButtonColor: themeColor
        });
        setLoading(false);
        return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: inputs.username,
            email: inputs.email,
            password: inputs.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
            icon: 'success',
            title: 'สมัครสมาชิกสำเร็จ!',
            text: 'ระบบกำลังพาท่านไปหน้าเข้าสู่ระบบ',
            timer: 2000,
            showConfirmButton: false
        });
        router.push('/login'); 
      } else {
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: data.message || 'ไม่สามารถสร้างบัญชีได้',
            confirmButtonColor: themeColor
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้',
        confirmButtonColor: themeColor
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="d-flex align-items-center justify-content-center vh-100 w-100"
      style={{ 
        background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
        fontFamily: "'Sarabun', sans-serif"
      }}
    >
      <div 
        className="card border-0 shadow-lg" 
        style={{ 
          maxWidth: '450px', 
          width: '90%', 
          borderRadius: '20px',
          overflow: 'hidden'
        }}
      >
        <div className="text-center py-4 bg-white">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
              style={{ width: '70px', height: '70px', backgroundColor: '#e8f5e9' }}
            >
               <i className="bi bi-person-plus-fill fs-2" style={{ color: themeColor }}></i>
            </div>
            <h3 className="fw-bold mb-1" style={{ color: '#2c3e50' }}>สร้างบัญชีใหม่</h3>
            <p className="text-muted small">กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ</p>
        </div>

        <div className="card-body px-4 px-md-5 pb-5 pt-0 bg-white">
          <form onSubmit={handleSubmit}>
            
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">ชื่อผู้ใช้งาน</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-person-badge text-success"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="กรอกชื่อผู้ใช้"
                  value={inputs.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">อีเมล</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-envelope text-success"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="กรอกอีเมล"
                  value={inputs.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* --- ส่วนที่แก้ไข: Password Input --- */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-secondary">รหัสผ่าน</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-lock text-success"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="กรอกรหัสผ่าน" 
                  value={inputs.password}
                  onChange={handleChange}
                  minLength={8} // HTML check
                  required
                />
              </div>
            </div>

            {/* --- ส่วนที่แก้ไข: Confirm Password Input --- */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-secondary">ยืนยันรหัสผ่าน</label>
              <div className="input-group">
                <span className="input-group-text border-end-0 bg-light" style={{ borderColor: '#ced4da' }}>
                  <i className="bi bi-check-circle text-success"></i>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control bg-light border-start-0 ps-0 shadow-none"
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                  value={inputs.confirmPassword}
                  onChange={handleChange}
                  minLength={8} // HTML check
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn w-100 py-2 rounded-pill fw-bold text-white shadow-sm mt-2"
              disabled={loading}
              style={{ 
                backgroundColor: themeColor, 
                border: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.opacity = '0.9'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  กำลังบันทึกข้อมูล...
                </>
              ) : (
                'ลงทะเบียน'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="small text-muted mb-0">
              มีบัญชีผู้ใช้งานอยู่แล้ว? <a href="/login" className="fw-bold text-decoration-none" style={{ color: themeColor }}>เข้าสู่ระบบ</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}