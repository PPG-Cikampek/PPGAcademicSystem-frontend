// Single source of truth for request account form & table definitions
// Field definitions kept minimal so both DynamicForm (JS) & TS table can use.

export type AccountField = {
  name: string;
  label: string;
  type: string; // 'text' | 'date' | 'email' | 'phone' | 'select' | 'textarea'
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

export const teacherFields: AccountField[] = [
  { name: 'name', label: 'Nama', type: 'text', placeholder: 'Nama Lengkap', required: true },
  { name: 'dateOfBirth', label: 'Tanggal Lahir', type: 'date', placeholder: 'Tanggal Lahir', required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Email', required: true },
  { name: 'phone', label: 'Nomor WA Aktif', type: 'phone', placeholder: '8123456789', required: true },
  { name: 'position', label: 'Posisi', type: 'select', placeholder: 'Pilih Posisi', required: true, options: [
    { label: 'MT Desa', value: 'branchTeacher' },
    { label: 'MT Kelompok', value: 'subBranchTeacher' },
    { label: 'MS', value: 'localTeacher' },
    { label: 'Asisten', value: 'assistant' }
  ]},
  { name: 'gender', label: 'Jenis Kelamin', type: 'select', placeholder: 'Pilih Jenis Kelamin', required: true, options: [
    { label: 'Laki-Laki', value: 'male' },
    { label: 'Perempuan', value: 'female' }
  ]},
  { name: 'address', label: 'Alamat', type: 'textarea', placeholder: 'Alamat Lengkap', required: true }
];

export const studentFields: AccountField[] = [
  { name: 'name', label: 'Nama', type: 'text', placeholder: 'Nama Lengkap', required: true },
  { name: 'dateOfBirth', label: 'Tanggal Lahir', type: 'date', placeholder: 'Tanggal Lahir', required: true },
  { name: 'className', label: 'Kelas', type: 'select', placeholder: 'Pilih Kelas', required: true, options: [
    { label: 'Kelas PRA-PAUD', value: 'Kelas PRA-PAUD' },
    { label: 'Kelas PAUD', value: 'Kelas PAUD' },
    { label: 'Kelas 1', value: 'Kelas 1' },
    { label: 'Kelas 2', value: 'Kelas 2' },
    { label: 'Kelas 3', value: 'Kelas 3' },
    { label: 'Kelas 4', value: 'Kelas 4' },
    { label: 'Kelas 5', value: 'Kelas 5' },
    { label: 'Kelas 6', value: 'Kelas 6' }
  ]},
  { name: 'gender', label: 'Jenis Kelamin', type: 'select', placeholder: 'Pilih Jenis Kelamin', required: true, options: [
    { label: 'Laki-Laki', value: 'male' },
    { label: 'Perempuan', value: 'female' }
  ]},
  { name: 'parentName', label: 'Nama Orang Tua/Wali', type: 'text', placeholder: 'Nama Orang Tua/Wali', required: true },
  { name: 'parentPhone', label: 'Nomor WA Orang Tua/Wali', type: 'phone', placeholder: '8123456789', required: true },
  { name: 'address', label: 'Alamat', type: 'textarea', placeholder: 'Alamat Lengkap', required: true }
];

export const labelMap: Record<string, string> = {
  name: 'NAMA',
  dateOfBirth: 'TANGGAL LAHIR',
  className: 'KELAS',
  email: 'EMAIL',
  phone: 'NO WA',
  position: 'POSISI',
  gender: 'JENIS KELAMIN',
  parentName: 'NAMA ORANG TUA/WALI',
  parentPhone: 'NO WA ORANG TUA',
  address: 'ALAMAT'
};

export const columnOrder = [
  'name','dateOfBirth','className','email','phone','position','gender','parentName','parentPhone','address'
];

export type AccountRole = 'student' | 'teacher';
export interface AccountBase { name: string; dateOfBirth?: string; accountRole?: AccountRole; }
export interface StudentAccount extends AccountBase { accountRole?: 'student'; className?: string; gender?: string; parentName?: string; parentPhone?: string; address?: string; }
export interface TeacherAccount extends AccountBase { accountRole?: 'teacher'; email?: string; phone?: string; position?: string; gender?: string; address?: string; }
export type AnyAccount = StudentAccount | TeacherAccount | (StudentAccount & TeacherAccount);
