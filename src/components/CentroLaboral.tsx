import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Calendar, DollarSign, Printer, Download, Eye, Trash2, 
  Search, CheckCircle, Clock, Award, ShieldAlert, ChevronRight, UserCheck, Briefcase
} from 'lucide-react';
import { calculatePrestaciones } from '../lib/calculations/prestaciones';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'Activo' | 'Suspendido' | 'Licenciado';
}

interface AttendanceLog {
  id: string;
  employeeName: string;
  timestamp: string;
  type: 'Entrada' | 'Salida';
}

const downloadCsvFile = (filename: string, csvContent: string) => {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function CentroLaboral() {
  // Setup local states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [printSize, setPrintSize] = useState<'letter' | 'legal'>('letter');
  
  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('Operaciones');
  const [salary, setSalary] = useState<number>(25000);
  const [hireDate, setHireDate] = useState('');
  const [status, setStatus] = useState<'Activo' | 'Suspendido' | 'Licenciado'>('Activo');

  // Preview panel states
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [showSlip, setShowSlip] = useState(false);
  const [showPrestacionesPreview, setShowPrestacionesPreview] = useState(false);

  // Custom Liquidation Simulator Options
  const [optPreavisoEjercido, setOptPreavisoEjercido] = useState(false);
  const [optIncluirCesantia, setOptIncluirCesantia] = useState(true);
  const [optVacacionesTomadas, setOptVacacionesTomadas] = useState(false);

  // Tab state for labor calculators
  const [activeLaborTab, setActiveLaborTab] = useState<'extra_hours' | 'regalia' | 'bono_anual' | 'subsidio_social'>('extra_hours');

  // 1. Extra hours calculator states
  const [overtimeSalary, setOvertimeSalary] = useState<number>(35000);
  const [hours35, setHours35] = useState<number>(12); // ordinary overtime (>44h up to 68h) -> +35%
  const [hours100, setHours100] = useState<number>(6); // Sunday/holiday or >68h -> +100%
  const [hoursNight, setHoursNight] = useState<number>(10); // night hours (9pm-7am) -> +15% extra

  // 2. Christmas bonus states
  const [regaliaSalary, setRegaliaSalary] = useState<number>(35000);
  const [regaliaMonths, setRegaliaMonths] = useState<number>(12);

  // 3. Profit sharing (Bonificación) states
  const [bonoSalary, setBonoSalary] = useState<number>(35000);
  const [bonoAntiguedad, setBonoAntiguedad] = useState<'menos3' | 'mas3'>('menos3');
  const [empresaUtilidad, setEmpresaUtilidad] = useState<boolean>(true);

  // 4. Subsidies states
  const [subsidioSalary, setSubsidioSalary] = useState<number>(35000);
  const [subsidioType, setSubsidioType] = useState<'maternidad' | 'enfermedad_amb' | 'enfermedad_hosp'>('maternidad');
  const [subsidioDays, setSubsidioDays] = useState<number>(14);

  // Load initial content
  useEffect(() => {
    const cachedEmp = localStorage.getItem('negociord_employees');
    if (cachedEmp) {
      setEmployees(JSON.parse(cachedEmp));
    } else {
      // Default placeholder employees to look professional immediately
      const defaultEmployees: Employee[] = [
        { id: '1', name: 'Ramón Almonte', role: 'Encargado de Almacén', department: 'Logística', salary: 35000, hireDate: '2021-03-15', status: 'Activo' },
        { id: '2', name: 'Laura Vásquez', role: 'Desarrolladora Web Sr', department: 'Tecnología', salary: 95000, hireDate: '2022-06-01', status: 'Activo' },
        { id: '3', name: 'Carlos Mendoza', role: 'Especialista de Ventas', department: 'Ventas', salary: 28000, hireDate: '2023-11-10', status: 'Activo' },
        { id: '4', name: 'Patricia Reyes', role: 'Asistente de Contabilidad', department: 'Finanzas', salary: 45000, hireDate: '2020-01-20', status: 'Activo' }
      ];
      setEmployees(defaultEmployees);
      localStorage.setItem('negociord_employees', JSON.stringify(defaultEmployees));
    }

    const cachedLog = localStorage.getItem('negociord_attendance');
    if (cachedLog) {
      setAttendance(JSON.parse(cachedLog));
    } else {
      const defaultLogs: AttendanceLog[] = [
        { id: 'l1', employeeName: 'Ramón Almonte', timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(), type: 'Entrada' },
        { id: 'l2', employeeName: 'Laura Vásquez', timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(), type: 'Entrada' }
      ];
      setAttendance(defaultLogs);
      localStorage.setItem('negociord_attendance', JSON.stringify(defaultLogs));
    }
  }, []);

  // Sync to local storage
  const saveEmployees = (list: Employee[]) => {
    setEmployees(list);
    localStorage.setItem('negociord_employees', JSON.stringify(list));
  };

  const saveAttendance = (logs: AttendanceLog[]) => {
    setAttendance(logs);
    localStorage.setItem('negociord_attendance', JSON.stringify(logs));
  };

  // Add Employee handler
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !hireDate) return;

    const newEmp: Employee = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      role: role.trim(),
      department: dept,
      salary: Number(salary) || 0,
      hireDate,
      status
    };

    const updatedList = [newEmp, ...employees];
    saveEmployees(updatedList);
    
    // Clear fields
    setName('');
    setRole('');
    setDept('Operaciones');
    setSalary(25000);
    setHireDate('');
    setStatus('Activo');
    setIsAdding(false);
  };

  // Delete employee
  const handleDeleteEmployee = (id: string, name: string) => {
    if (confirm(`¿Está seguro de eliminar a ${name} de los registros activos?`)) {
      const filtered = employees.filter(e => e.id !== id);
      saveEmployees(filtered);
      if (activeEmployee?.id === id) {
        setActiveEmployee(null);
      }
    }
  };

  // Record Attendance
  const handleRecordAttendance = (empName: string, type: 'Entrada' | 'Salida') => {
    const newLog: AttendanceLog = {
      id: Math.random().toString(36).substring(2, 9),
      employeeName: empName,
      timestamp: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type
    };
    const updated = [newLog, ...attendance].slice(0, 30); // Keep last 30
    saveAttendance(updated);
  };

  // Calculations for active slip
  const slipMath = activeEmployee ? (() => {
    const s = activeEmployee.salary;
    const afp = s * 0.0287; // 2.87% AFP Empleado
    const sfs = s * 0.0304; // 3.04% SFS Empleado
    
    // Simple ISR check matching scale
    let isrBase = s - afp - sfs;
    let isr = 0;
    const annualBase = isrBase * 12;
    if (annualBase > 867123.01) {
      isr = ((annualBase - 867123.01) * 0.25 + 79776) / 12;
    } else if (annualBase > 624329.01) {
      isr = ((annualBase - 624329.01) * 0.20 + 31216) / 12;
    } else if (annualBase > 416220.01) {
      isr = ((annualBase - 416220.01) * 0.15) / 12;
    }

    const totalDeductions = afp + sfs + isr;
    const netSalary = s - totalDeductions;

    // Employer taxes
    const afpEmployer = s * 0.0710;
    const sfsEmployer = s * 0.0709;
    const srlEmployer = s * 0.012;
    const infotepEmployer = s * 0.01;
    const companyCost = s + afpEmployer + sfsEmployer + srlEmployer + infotepEmployer;

    return { afp, sfs, isr, totalDeductions, netSalary, afpEmployer, sfsEmployer, srlEmployer, infotepEmployer, companyCost };
  })() : null;

  // Benefits Simulation matching legal guidelines
  const benefitsReport = activeEmployee ? (() => {
    const date1 = new Date(activeEmployee.hireDate);
    const date2 = new Date(); // Cut-off today
    
    // Quick diff years/months
    let diffMs = Math.abs(date2.getTime() - date1.getTime());
    let diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    let years = Math.floor(diffDays / 365);
    let remainingDays = diffDays % 365;
    let months = Math.floor(remainingDays / 30);

    const averageDaily = activeEmployee.salary / 23.83;

    // Simulating parameters: Desahucio por empleador, sin preaviso
    // Preaviso (de 3 a 6 meses: 7 dias; 6 a 12 meses: 14 dias; mas de 12 meses: 28 dias)
    let preavisoDays = 0;
    if (years >= 1) preavisoDays = 28;
    else if (months >= 6) preavisoDays = 14;
    else if (months >= 3) preavisoDays = 7;

    const preavisoDaysVal = optPreavisoEjercido ? 0 : preavisoDays;
    const preavisoAmount = preavisoDaysVal * averageDaily;

    // Cesantia (3 a 6 meses: 6 dias; 6 a 12 meses: 13 dias; 1 a 5 años: 21 dias por año; mas de 5 años: 23 dias por año)
    let cesantiaDays = 0;
    if (years >= 5) {
      cesantiaDays = (years * 23) + (months >= 6 ? 21 : months >= 3 ? 13 : 0);
    } else if (years >= 1) {
      cesantiaDays = (years * 21) + (months >= 6 ? 13 : months >= 3 ? 6 : 0);
    } else if (months >= 6) {
      cesantiaDays = 13;
    } else if (months >= 3) {
      cesantiaDays = 6;
    }

    const cesantiaDaysVal = optIncluirCesantia ? cesantiaDays : 0;
    const cesantiaAmount = cesantiaDaysVal * averageDaily;

    // Proportional Vacations
    let vacationDays = 0;
    if (months >= 11) vacationDays = 14;
    else if (months >= 10) vacationDays = 12;
    else if (months >= 9) vacationDays = 11;
    else if (months >= 8) vacationDays = 10;
    else if (months >= 7) vacationDays = 9;
    else if (months >= 6) vacationDays = 8;
    else if (months >= 5) vacationDays = 7;

    const vacationDaysVal = optVacacionesTomadas ? 0 : vacationDays;
    const vacationAmount = vacationDaysVal * averageDaily;

    // Proportional Christmas bonus (Regalia)
    const activeMonthsNum = Math.min(12, Math.max(1, Math.round(diffDays / 30)));
    const regaliaAmount = (activeEmployee.salary * activeMonthsNum) / 12;

    const totalBenefits = preavisoAmount + cesantiaAmount + vacationAmount + regaliaAmount;

    return { years, months, averageDaily, preavisoDays: preavisoDaysVal, preavisoAmount, cesantiaDays: cesantiaDaysVal, cesantiaAmount, vacationDays: vacationDaysVal, vacationAmount, regaliaAmount, totalBenefits };
  })() : null;

  // Filter employees
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'Todos' || e.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = employees.length ? totalPayroll / employees.length : 0;

  // Print friendly page
  const handlePrintSlip = () => {
    window.print();
  };

  // Export payroll and employees to CSV/Excel format
  const handleExportEmployeesCSV = () => {
    if (employees.length === 0) return;
    const headers = ['ID', 'Nombre', 'Cargo', 'Departamento', 'Salario Bruto (RD$)', 'Fecha de Ingreso', 'Estatus'];
    const rows = employees.map(e => [
      e.id,
      `"${e.name.replace(/"/g, '""')}"`,
      `"${e.role.replace(/"/g, '""')}"`,
      `"${e.department.replace(/"/g, '""')}"`,
      e.salary,
      e.hireDate,
      e.status
    ]);
    const summaryRows = [
      '',
      'Resumen de nomina',
      `Total colaboradores,${employees.length}`,
      `Total bruto mensual,${totalPayroll}`,
      `Salario promedio,${avgSalary.toFixed(2)}`,
      `Fecha de emision,${new Date().toLocaleDateString('es-DO')}`,
    ];
    downloadCsvFile("nomina_colaboradores_tu_negocio_rd.csv", [headers.join(','), ...rows.map(r => r.join(',')), ...summaryRows].join('\n'));
  };

  return (
    <div className="p-4 md:p-8 space-y-6" id="centro-laboral-root">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <span className="text-xs font-extrabold text-[#0F766E] uppercase tracking-widest block mb-1">Módulo Premium Empleadores & RH</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111827] flex items-center gap-2">
            <Users className="text-[#0F766E]" size={28} />
            Centro Laboral RD
          </h1>
          <p className="text-gray-500 text-xs mt-1">Gestión administrativa de nómina física, control de asistencia, volantes de pago y provisión de prestaciones.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-[#0F766E] text-white rounded-lg text-xs font-bold hover:opacity-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <UserPlus size={16} />
          {isAdding ? 'Cerrar Formulario' : 'Agregar Colaborador'}
        </button>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="labor-stats-grid">
        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Costo de Nómina Mensual</span>
            <span className="text-xl font-extrabold text-gray-900 font-mono">RD$ {totalPayroll.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-[#0F766E] font-semibold block mt-1">Sueldos base contractuales</span>
          </div>
          <div className="p-3 bg-teal-50 text-[#0F766E] rounded-lg">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1 font-sans">Nómina de Empleados</span>
            <span className="text-xl font-extrabold text-gray-900 font-mono">{employees.length} activos</span>
            <span className="text-[9px] text-gray-400 block mt-1">En el período comercial activo</span>
          </div>
          <div className="p-3 bg-gray-50 text-gray-500 rounded-lg">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Salario Base Promedio</span>
            <span className="text-xl font-extrabold text-gray-900 font-mono">RD$ {avgSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-[9px] text-gray-400 block mt-1">Prueba de balance promedio de ley</span>
          </div>
          <div className="p-3 bg-gray-50 text-gray-500 rounded-lg">
            <Award size={20} />
          </div>
        </div>
      </div>

      {/* Add Employee Form Drawer-like block */}
      {isAdding && (
        <form onSubmit={handleAddEmployee} className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4 animate-in slide-in-from-top duration-200" id="add-employee-form">
          <h3 className="font-extrabold text-sm text-[#111827] flex items-center gap-1.5 border-b pb-2 mb-3">
            <UserPlus size={16} className="text-[#0F766E]" />
            Registrar Nuevo Colaborador Contratado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cl-name" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Nombre Completo</label>
              <input 
                id="cl-name"
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              />
            </div>
            <div>
              <label htmlFor="cl-role" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Cargo / Función</label>
              <input 
                id="cl-role"
                type="text" 
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ej. Programador Frontend"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Departamento</label>
              <select 
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              >
                <option value="Operaciones">Operaciones</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Ventas">Ventas</option>
                <option value="Servicio al Cliente">Servicio al Cliente</option>
                <option value="Logística">Logística</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cl-salary" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Salario Mensual Bruto (RD$)</label>
              <input 
                id="cl-salary"
                type="number" 
                required
                min={100}
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value))}
                placeholder="Ej. 30000"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              />
            </div>
            <div>
              <label htmlFor="cl-hire-date" className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Fecha de Ingreso (Hiring Date)</label>
              <input 
                id="cl-hire-date"
                type="date" 
                required
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Estatus Laboral</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
              >
                <option value="Activo">Activo</option>
                <option value="Suspendido">Suspendido</option>
                <option value="Licenciado">Licenciado</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              className="px-3.5 py-1.5 border border-gray-350 text-gray-600 rounded text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-[#0F766E] text-white rounded text-xs font-semibold cursor-pointer"
            >
              Guardar Colaborador
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Management Table on left, Active Employee Drawer on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="labor-database-manager">
        
        {/* Employees Table view */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
            {/* Table Filters */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="relative w-full sm:max-w-xs">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={14} />
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar colaborador..."
                  aria-label="Buscar colaborador por nombre"
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Filtrar Dept:</span>
                  <select 
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="px-2 py-1 bg-white border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-[#0F766E]"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Logística">Logística</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportEmployeesCSV}
                  disabled={employees.length === 0}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Exportar nómina a formato CSV / Excel"
                >
                  <Download size={13} className="text-[#0F766E]" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Employee rows */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Colaborador</th>
                    <th className="p-4">Departamento</th>
                    <th className="p-4">Sueldo Mensual</th>
                    <th className="p-4 text-center">Estatus</th>
                    <th className="p-4 text-right">Controles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-medium">
                        No se encontraron colaboradores agregados que coincidan.
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${activeEmployee?.id === emp.id ? 'bg-teal-50/20' : ''}`}
                        onClick={() => { setActiveEmployee(emp); setShowSlip(false); setShowPrestacionesPreview(false); }}
                      >
                        <td className="p-4">
                          <div className="font-extrabold text-gray-900">{emp.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium">{emp.role}</div>
                        </td>
                        <td className="p-4 font-medium text-gray-650">{emp.department}</td>
                        <td className="p-4 font-mono font-bold text-gray-800">RD$ {emp.salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            emp.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' :
                            emp.status === 'Licenciado' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {emp.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => { setActiveEmployee(emp); setShowSlip(false); setShowPrestacionesPreview(false); }}
                            className="p-1 px-2 border border-gray-200 rounded text-[10px] font-bold text-[#0F766E] hover:bg-teal-50 transition-colors"
                          >
                            Administrar
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded hover:bg-gray-100"
                            title="Eliminar Colaborador"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Record Attendance Log Box */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-[#111827] flex items-center gap-1.5 border-b pb-2.5 mb-3">
              <Clock size={16} className="text-[#0F766E]" />
              Control Diario de Asistencia Rápido (Reloj Checador)
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs font-semibold text-gray-500">Marcar evento para:</span>
              <select 
                id="att-emp-picker"
                className="px-3 py-1.5 bg-white border border-gray-200 rounded text-xs outline-none focus:ring-1 focus:ring-[#0F766E] font-medium"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.name}>{e.name}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const select = document.getElementById('att-emp-picker') as HTMLSelectElement;
                    if (select) handleRecordAttendance(select.value, 'Entrada');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-emerald-700 transition"
                >
                  Marcar Entrada
                </button>
                <button 
                  onClick={() => {
                    const select = document.getElementById('att-emp-picker') as HTMLSelectElement;
                    if (select) handleRecordAttendance(select.value, 'Salida');
                  }}
                  className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded cursor-pointer hover:bg-rose-700 transition"
                >
                  Marcar Salida
                </button>
              </div>
            </div>

            {/* Attendance logs list */}
            <div className="mt-4 border-t border-gray-100 pt-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Últimas Marcas Registradas</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono max-h-36 overflow-y-auto">
                {attendance.length === 0 ? (
                  <span className="text-gray-400 italic">No hay marcas todavía grabadas hoy.</span>
                ) : (
                  attendance.map((log) => (
                    <div key={log.id} className="flex justify-between p-2 bg-gray-50 border border-gray-150 rounded">
                      <span>{log.employeeName}</span>
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {log.type} a las {log.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic HR operations drawer card (Right Side) */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs h-max space-y-4">
          {activeEmployee ? (
            <div className="space-y-4">
              {/* Employee brief */}
              <div className="border-b pb-3.5 flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-[#111827] text-base leading-tight">{activeEmployee.name}</h3>
                  <p className="text-xs text-gray-500 font-medium">{activeEmployee.role} — <span className="font-bold text-[#0F766E]">{activeEmployee.department}</span></p>
                </div>
                <span className="text-[10px] text-gray-400 font-bold font-mono">ID: {activeEmployee.id}</span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-b pb-3.5">
                <div>
                  <span className="text-gray-400 block font-medium">Salario Bruto:</span>
                  <span className="font-extrabold text-gray-800 font-mono">RD$ {activeEmployee.salary.toLocaleString('en-US')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Sueldo Diario:</span>
                  <span className="font-extrabold text-gray-800 font-mono">RD$ {(activeEmployee.salary / 23.83).toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Fecha de Contrato:</span>
                  <span className="font-extrabold text-gray-800">{activeEmployee.hireDate}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Antigüedad:</span>
                  <span className="font-extrabold text-gray-800">
                    {benefitsReport ? `${benefitsReport.years} año(s) y ${benefitsReport.months} mes(es)` : 'Calculando...'}
                  </span>
                </div>
              </div>

              {/* HR action buttons */}
              <div className="space-y-2">
                <button 
                  onClick={() => { setShowSlip(!showSlip); setShowPrestacionesPreview(false); }}
                  className={`w-full py-2 border rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    showSlip ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-gray-250 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Printer size={14} />
                  {showSlip ? 'Ocultar Volante' : 'Ver Volante de Pago'}
                </button>
                
                <button 
                  onClick={() => { setShowPrestacionesPreview(!showPrestacionesPreview); setShowSlip(false); }}
                  className={`w-full py-2 border rounded-lg text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 ${
                    showPrestacionesPreview ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-gray-250 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Award size={14} />
                  {showPrestacionesPreview ? 'Ocultar Provisión' : 'Simular Liquidación / Prestaciones'}
                </button>
              </div>

              {/* Dynamic Action 1: Payslip display */}
              {showSlip && slipMath && (
                <div className="bg-[#FAFAFA] border border-gray-200 rounded-lg p-4 font-mono text-[11px] text-gray-700 space-y-3 relative print:absolute print:inset-0 print:bg-white print:z-50" id="payslip-print-block">
                  <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                      @page {
                        size: ${printSize === 'legal' ? 'legal' : 'letter'} portrait !important;
                        margin: 1.5cm !important;
                      }
                    }
                  `}} />
                  <div className="border-b border-dashed border-gray-300 pb-2 text-center">
                    <span className="font-bold text-xs uppercase tracking-widest block">Tu Negocio RD</span>
                    <span className="text-[9px] text-gray-400 font-sans block">VOLANTE DE PAGO OFICIAL</span>
                  </div>

                  <div className="space-y-1">
                    <div><strong>COLABORADOR:</strong> <span className="font-sans font-bold">{activeEmployee.name}</span></div>
                    <div><strong>CARGO:</strong> <span className="font-sans">{activeEmployee.role}</span></div>
                    <div><strong>DEPARTAMENTO:</strong> <span className="font-sans">{activeEmployee.department}</span></div>
                  </div>

                  <hr className="border-dashed border-gray-300" />

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span>Sueldo Bruto Mensual:</span>
                      <strong>RD$ {activeEmployee.salary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Deducción AFP (2.87%):</span>
                      <span>-RD$ {slipMath.afp.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-rose-600">
                      <span>Deducción SFS (3.04%):</span>
                      <span>-RD$ {slipMath.sfs.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {slipMath.isr > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Deducción ISR (DGII):</span>
                        <span>-RD$ {slipMath.isr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-dashed border-gray-300" />

                  <div className="flex justify-between text-xs font-bold text-emerald-700">
                    <span>SUELDO NETO RECIBIBLE:</span>
                    <span>RD$ {slipMath.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="bg-white border rounded p-2 mt-2 space-y-1 text-[10px] text-gray-400 font-sans">
                    <span className="font-bold uppercase tracking-wider text-gray-500 block mb-1">Aporte de Carga Patronal (Costo Empleador)</span>
                    <div className="flex justify-between">
                      <span>AFP (7.10%):</span>
                      <span>RD$ {slipMath.afpEmployer.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SFS (7.09%):</span>
                      <span>RD$ {slipMath.sfsEmployer.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SRL (1.2%):</span>
                      <span>RD$ {slipMath.srlEmployer.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>INFOTEP (1%):</span>
                      <span>RD$ {slipMath.infotepEmployer.toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-bold text-gray-600 mt-1">
                      <span>Costo Mensual Empresa:</span>
                      <span>RD$ {slipMath.companyCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-6 text-[10px] text-gray-500 font-sans print-avoid-break">
                    <div className="text-center border-t border-gray-300 pt-1">Firma colaborador</div>
                    <div className="text-center border-t border-gray-300 pt-1">Firma RRHH / Empresa</div>
                  </div>

                  <div className="text-[9px] text-gray-400 font-sans border-t border-dashed border-gray-200 pt-2 flex justify-between print-avoid-break">
                    <span>Referencia: NRD-PAY-{activeEmployee.id.toUpperCase()}</span>
                    <span>Emitido: {new Date().toLocaleDateString('es-DO')}</span>
                  </div>

                  <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <div className="flex items-center gap-1 bg-white border border-gray-205 rounded px-2 py-0.5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase">Papel:</span>
                      <select
                        value={printSize}
                        onChange={(e) => setPrintSize(e.target.value as 'letter' | 'legal')}
                        className="bg-transparent border-none text-[10px] font-semibold text-[#111827] outline-none cursor-pointer focus:ring-0 p-0"
                        aria-label="Seleccionar tamaño de papel"
                      >
                        <option value="letter">Carta (8.5" x 11")</option>
                        <option value="legal">Oficio / Legal (8.5" x 14")</option>
                      </select>
                    </div>

                    <button 
                      onClick={handlePrintSlip}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded font-bold font-sans text-[10px] cursor-pointer inline-flex items-center gap-1.5 active:scale-95 transition-all text-gray-950"
                      aria-label="Imprimir Volante de Pago oficial"
                    >
                      <Printer size={12} />
                      Imprimir Volante de Pago
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Action 2: Benefits Simulation display */}
              {showPrestacionesPreview && benefitsReport && (
                <div className="bg-teal-50/40 p-4 rounded-lg border border-teal-100 text-xs space-y-3 animate-in fade-in" id="benefits-simulation-block">
                  <div className="border-b border-teal-100 pb-2 flex items-center justify-between">
                    <span className="font-bold text-[#0F766E] uppercase tracking-wider">Cálculo de Provisores de Prestaciones</span>
                    <span className="text-[10px] font-mono bg-teal-100/50 px-1.5 rounded text-[#0F766E]">Código Trabajo Art 80</span>
                  </div>

                  <p className="text-gray-500 font-medium">Estime la liquidación según la situación comercial real modificando los selectores:</p>

                  <div className="bg-white/80 p-2.5 rounded border border-teal-100/50 space-y-2 text-[11px]">
                    <span className="font-bold text-gray-700 block text-[10px] uppercase tracking-wide">Ajustar Variables de Salida</span>
                    
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                      <input 
                        type="checkbox" 
                        checked={optPreavisoEjercido}
                        onChange={(e) => setOptPreavisoEjercido(e.target.checked)}
                        className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E] w-3.5 h-3.5"
                      />
                      <span>Preaviso trabajado / Notificado</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                      <input 
                        type="checkbox" 
                        checked={optIncluirCesantia}
                        onChange={(e) => setOptIncluirCesantia(e.target.checked)}
                        className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E] w-3.5 h-3.5"
                      />
                      <span>Aplicar Cesantía (Desahucio)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-900 select-none">
                      <input 
                        type="checkbox" 
                        checked={optVacacionesTomadas}
                        onChange={(e) => setOptVacacionesTomadas(e.target.checked)}
                        className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E] w-3.5 h-3.5"
                      />
                      <span>Vacaciones ya disfrutadas</span>
                    </label>
                  </div>

                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between text-gray-700">
                      <span>Deber de Preaviso ({benefitsReport.preavisoDays} d.):</span>
                      <span className="font-mono font-semibold">RD$ {benefitsReport.preavisoAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Auxilio de Cesantía ({benefitsReport.cesantiaDays} d.):</span>
                      <span className="font-mono font-semibold">RD$ {benefitsReport.cesantiaAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Vacaciones Proporcionales ({benefitsReport.vacationDays} d.):</span>
                      <span className="font-mono font-semibold">RD$ {benefitsReport.vacationAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Regalía Pascual Proporcional:</span>
                      <span className="font-mono font-semibold">RD$ {benefitsReport.regaliaAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <hr className="border-teal-200/50" />

                  <div className="flex justify-between font-bold text-[#0F766E] text-sm">
                    <span>LIQUIDACIÓN BRUTA DE LEY:</span>
                    <span className="font-mono">RD$ {benefitsReport.totalBenefits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <Users size={32} className="mx-auto text-gray-300" />
              <p className="text-xs font-semibold">Seleccione un colaborador de la nómina para generar su volante de pago, simular sus prestaciones de ley o registrar asistencia.</p>
            </div>
          )}
        </div>

      </div>

      {/* SECTION: Calculadoras Especializadas de la Ley Laboral Dominicana (Código de Trabajo & SISALRIL) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6" id="calculadoras-ley-laboral-seccion">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-[10px] font-extrabold text-[#0F766E] uppercase tracking-widest block mb-1">Planificador Multi-Estrategia</span>
          <h2 className="text-lg font-extrabold text-[#111827] flex items-center gap-2">
            <Briefcase size={20} className="text-[#0F766E]" />
            Calculadoras Avanzadas de Ley y Beneficios (República Dominicana)
          </h2>
          <p className="text-gray-500 text-xs mt-1">Simuladores interactivos ajustados al Código de Trabajo dominicano, escalas salariales ordinarias, cálculos de horas extras y subsidios de seguridad social (SISALRIL).</p>
        </div>

        {/* Tab Selection Row */}
        <div className="flex flex-wrap border-b border-gray-200 text-xs font-semibold gap-1">
          <button 
            type="button"
            onClick={() => setActiveLaborTab('extra_hours')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeLaborTab === 'extra_hours' 
                ? 'border-[#0F766E] text-[#0F766E] bg-teal-50/20 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
            }`}
          >
            <Clock size={14} />
            <span>Horas Extras & Nocturnas</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveLaborTab('regalia')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeLaborTab === 'regalia' 
                ? 'border-[#0F766E] text-[#0F766E] bg-teal-50/20 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
            }`}
          >
            <Calendar size={14} />
            <span>Salario de Navidad (Regalía)</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveLaborTab('bono_anual')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeLaborTab === 'bono_anual' 
                ? 'border-[#0F766E] text-[#0F766E] bg-teal-50/20 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
            }`}
          >
            <Award size={14} />
            <span>Bonificación (Utilidades)</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveLaborTab('subsidio_social')}
            className={`px-4 py-2.5 rounded-t-lg transition border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeLaborTab === 'subsidio_social' 
                ? 'border-[#0F766E] text-[#0F766E] bg-teal-50/20 font-bold' 
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50/50'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Subsidios & Licencias SISALRIL</span>
          </button>
        </div>

        {/* Tab Content Areas */}
        <div className="bg-[#FAFBFB] rounded-xl border border-gray-150 p-5">
          
          {/* TAB 1: HORAS EXTRAS */}
          {activeLaborTab === 'extra_hours' && (() => {
            const hourlyRate = (overtimeSalary / 23.83) / 8;
            const amount35 = hours35 * (hourlyRate * 1.35);
            const amount100 = hours100 * (hourlyRate * 2.0);
            const amountNight = hoursNight * (hourlyRate * 0.15);
            const totalExtraIncome = amount35 + amount100 + amountNight;
            const absoluteTotal = overtimeSalary + totalExtraIncome;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-wider block">Datos para calcular sueldo y horas</span>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Sueldo Base Mensual Bruto (RD$)</label>
                      <input 
                        type="number"
                        min="1000"
                        value={overtimeSalary}
                        onChange={(e) => setOvertimeSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                        <span>Horas Extras Ordinarias (+35%):</span>
                        <span className="font-mono text-gray-800 font-bold">{hours35} horas</span>
                      </label>
                      <input 
                        type="range"
                        min="0"
                        max="60"
                        value={hours35}
                        onChange={(e) => setHours35(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer accent-[#0F766E]"
                      />
                      <span className="text-[9px] text-gray-400 block mt-1">Horas laboradas que superan las 44 semanales hasta las 68 semanales (Art. 203 Código de Trabajo).</span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                        <span>Horas Extras en Feriados / Mayores a 68 (+100%):</span>
                        <span className="font-mono text-gray-800 font-bold">{hours100} horas</span>
                      </label>
                      <input 
                        type="range"
                        min="0"
                        max="40"
                        value={hours100}
                        onChange={(e) => setHours100(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer accent-[#0F766E]"
                      />
                      <span className="text-[9px] text-gray-400 block mt-1">Horas trabajadas en días declarados feriados, domingos de descanso obligatorio o tras sobrepasar las 68 h. semanales.</span>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-550 block mb-1 flex justify-between">
                        <span>Horas Nocturnas Trabajadas (+15%):</span>
                        <span className="font-mono text-gray-800 font-bold">{hoursNight} horas</span>
                      </label>
                      <input 
                        type="range"
                        min="0"
                        max="80"
                        value={hoursNight}
                        onChange={(e) => setHoursNight(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer accent-[#0F766E]"
                      />
                      <span className="text-[9px] text-gray-400 block mt-1">Sobreprecio del 15% para horas regulares ejecutadas en jornada comprendida entre las 9:00 PM y 7:00 AM (Art. 204).</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-wider block mb-2">Desglose de Ingresos de Jornada</span>
                    
                    <div className="divide-y divide-gray-100 font-sans text-xs space-y-2">
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500 font-medium">Sueldo Diario / Hora (Base):</span>
                        <span className="font-mono font-bold text-gray-800 text-[11px]">
                          RD$ {(overtimeSalary / 23.83).toFixed(2)} / RD$ {hourlyRate.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500 font-medium">Pago Horas Extras Ordinarias (1.35x):</span>
                        <span className="font-mono font-bold text-gray-800">
                          RD$ {amount35.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500 font-medium">Pago Horas Dobles/Feriados (2.0x):</span>
                        <span className="font-mono font-bold text-gray-800">
                          RD$ {amount100.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5">
                        <span className="text-gray-500 font-medium">Retribución por Nocturnidad (+15%):</span>
                        <span className="font-mono font-bold text-gray-800">
                          RD$ {amountNight.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between py-2 border-t font-semibold text-[#0F766E] text-[13px]">
                        <span>Ingreso Adicional Neto:</span>
                        <span className="font-mono font-extrabold">
                          +RD$ {totalExtraIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100 space-y-1.5 text-center mt-3">
                    <span className="text-[9px] uppercase font-bold text-teal-800 tracking-wider block">Ingreso Bruto de Mes Proyectado</span>
                    <strong className="text-base text-teal-950 font-mono font-extrabold block">
                      RD$ {absoluteTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                    <p className="text-[9px] text-[#0F766E] leading-relaxed">
                      Este monto sirve de base impositiva para la cotización de AFP, SFS y retenciones de impuesto sobre la renta (ISR).
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: REGALÍA PASCUAL (SALARIO 13) */}
          {activeLaborTab === 'regalia' && (() => {
            const calculatedRegalia = (regaliaSalary * regaliaMonths) / 12;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Cálculo Proporcional de Aguinaldo</span>
                  
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Salario Devengado Mensual Promedio (RD$)</label>
                      <input 
                        type="number"
                        min="1000"
                        value={regaliaSalary}
                        onChange={(e) => setRegaliaSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                        <span>Meses Laborados en el Año Comercial:</span>
                        <span className="font-mono text-gray-800 font-bold">{regaliaMonths} meses</span>
                      </label>
                      <input 
                        type="range"
                        min="1"
                        max="12"
                        value={regaliaMonths}
                        onChange={(e) => setRegaliaMonths(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer accent-[#0F766E]"
                      />
                      <span className="text-[9px] text-gray-400 block mt-1">Involucra todo sueldo percibido en el año dividido de manera equitativa por 12 meses, conforme al Art. 219.</span>
                    </div>

                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 text-[10px] text-amber-900 leading-relaxed font-sans">
                      <strong>Artículo 222 del Código de Trabajo:</strong> El Salario de Navidad (Regalía Pascual) está plenamente <strong>exento de todo tipo de impuestos</strong> nacionales o deducciones de seguridad social (SFS, AFP, ISR). Rige su pago total completo sin gravamen hasta el día 20 de diciembre.
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Resultado Oficial Regalía Navidad</span>
                    
                    <div className="p-5 bg-teal-50/40 rounded-xl border border-teal-100/50 text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-wider block">Sueldo de Navidad Proyectado</span>
                      <strong className="text-2xl text-[#0F766E] font-mono font-extrabold block">
                        RD$ {calculatedRegalia.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                      <span className="text-[10px] text-teal-800 font-bold rounded bg-teal-100/40 px-2 py-0.5 inline-block">
                        ¡Monto 100% Neto Libre de Impuestos!
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1.5 font-medium leading-normal pt-2">
                      <p><strong>Notas de Liquidación:</strong></p>
                      <ul className="list-disc pl-4 space-y-1 text-gray-500 text-[11px]">
                        <li>Si el colaborador fuese despedido o renunciase antes de diciembre, tiene derecho a recibir su porción proporcional acumulada en su liquidación final.</li>
                        <li>Las propinas obligatorias u horas extraordinarias no se toman en cuenta para promediar la Regalía de Navidad.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 3: PARTICIPACIÓN EN BENEFICIOS (BONIFICACIÓN) */}
          {activeLaborTab === 'bono_anual' && (() => {
            const dailyWage = bonoSalary / 23.83;
            const daysToPay = bonoAntiguedad === 'menos3' ? 45 : 60;
            const calculatedBono = empresaUtilidad ? (dailyWage * daysToPay) : 0;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Parámetros de Participación de Beneficios</span>
                  
                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Salario Base Mensual Ordinario (RD$)</label>
                      <input 
                        type="number"
                        min="1000"
                        value={bonoSalary}
                        onChange={(e) => setBonoSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-gray-800"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Antigüedad en la Empresa (Años)</label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button 
                          type="button"
                          onClick={() => setBonoAntiguedad('menos3')}
                          className={`py-2 px-3 border rounded text-xs font-bold transition ${
                            bonoAntiguedad === 'menos3' 
                              ? 'bg-[#0F766E] border-[#0F766E] text-white' 
                              : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Menos de 3 años
                        </button>
                        <button 
                          type="button"
                          onClick={() => setBonoAntiguedad('mas3')}
                          className={`py-2 px-3 border rounded text-xs font-bold transition ${
                            bonoAntiguedad === 'mas3' 
                              ? 'bg-[#0F766E] border-[#0F766E] text-white' 
                              : 'bg-white border-gray-250 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          3 años o más
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-gray-50 border rounded-lg space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 select-none">
                        <input 
                          type="checkbox" 
                          checked={empresaUtilidad}
                          onChange={(e) => setEmpresaUtilidad(e.target.checked)}
                          className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E] w-4 h-4"
                        />
                        <span>La empresa generó beneficio acumulado anual</span>
                      </label>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed pl-6">
                        El Art. 223 obliga a pagar participación a todo colaborador ordinario siempre que los estados financieros anuales fiscales presenten utilidades netas positivas.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">Mesa de Liquidación — Art. 223</span>
                    
                    <div className="bg-[#FAFAFA] border rounded-lg p-4 font-mono text-[11px] text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span>Antigüedad Definida:</span>
                        <strong className="text-gray-900 font-sans">{bonoAntiguedad === 'menos3' ? 'Menos de 3 años' : '3 años o más'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Días Correspondientes por Antigüedad:</span>
                        <strong className="text-gray-900">{daysToPay} días de salario</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Normal del Salario Diario:</span>
                        <strong className="text-gray-900">RD$ {dailyWage.toLocaleString('en-US', { maximumFractionDigits: 2 })}</strong>
                      </div>
                    </div>

                    <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100 text-center space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#0F766E] tracking-wider block">Monto de Bonificación Estimada</span>
                      <strong className="text-xl text-[#0F766E] font-mono font-extrabold block">
                        RD$ {calculatedBono.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </strong>
                      <span className="text-[9px] text-teal-800 leading-normal block max-w-xs mx-auto">
                        Los primeros 10 salarios mínimos están exentos del ISR dominicano. El resto acumula sobretasa legal.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 4: SUBSIDIOS SISALRIL Y LICENCIAS SOCIALES */}
          {activeLaborTab === 'subsidio_social' && (() => {
            const dailyWage = subsidioSalary / 23.83;
            let subsidioSisalril = 0;
            let sumEmployer = 0;

            if (subsidioType === 'maternidad') {
              subsidioSisalril = dailyWage * 98; // 14 weeks maternity standard
              sumEmployer = 0; // standard full payout is covered via social security (SISALRIL subsidies)
            } else if (subsidioType === 'enfermedad_amb') {
              sumEmployer = Math.min(subsidioDays, 3) * dailyWage; // First 3 days covered normally
              subsidioSisalril = Math.max(0, subsidioDays - 3) * dailyWage * 0.60;
            } else {
              sumEmployer = Math.min(subsidioDays, 3) * dailyWage;
              subsidioSisalril = Math.max(0, subsidioDays - 3) * dailyWage * 0.40;
            }

            const totalBenefitPayout = subsidioSisalril + sumEmployer;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Estructuración de Subsidios (Ley 87-01 de Seguridad Social)</span>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Clasificación de Licencia Médica</label>
                      <select 
                        value={subsidioType}
                        onChange={(e) => setSubsidioType(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium"
                      >
                        <option value="maternidad">Maternidad de Ley (14 Semanas / 98 Días)</option>
                        <option value="enfermedad_amb">Enfermedad Común — Tratamiento Ambulatorio (60% SISALRIL)</option>
                        <option value="enfermedad_hosp">Enfermedad Común — Hospitalización (40% SISALRIL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Salario Cotizable Mensual TCS (RD$)</label>
                      <input 
                        type="number"
                        min="1000"
                        value={subsidioSalary}
                        onChange={(e) => setSubsidioSalary(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-xs focus:ring-1 focus:ring-[#0F766E] outline-none font-medium text-gray-800"
                      />
                    </div>

                    {subsidioType !== 'maternidad' && (
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 flex justify-between">
                          <span>Duración de la Licencia Médica:</span>
                          <span className="font-mono text-gray-800 font-bold">{subsidioDays} días</span>
                        </label>
                        <input 
                          type="range"
                          min="1"
                          max="90"
                          value={subsidioDays}
                          onChange={(e) => setSubsidioDays(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg cursor-pointer accent-[#0F766E]"
                        />
                        <span className="text-[9px] text-gray-400 block mt-1">Días prescritos por el médico tratante de la red de prestadores certificados por el SDSS.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-gray-550 tracking-wider block">Distribución del Pago de Cobertura</span>
                    
                    <div className="divide-y divide-gray-100 font-sans text-xs space-y-2.5">
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500 font-medium">Asumido por Empleador (Primeros 3 días):</span>
                        <strong className="font-mono font-bold text-gray-800">
                          RD$ {sumEmployer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500 font-medium">
                          {subsidioType === 'maternidad' 
                            ? 'Subsidio por Maternidad (98d. 100%):'
                            : `Subsidio SISALRIL (${subsidioType === 'enfermedad_amb' ? '60%' : '40%'}):`
                          }
                        </span>
                        <strong className="font-mono font-bold text-teal-800">
                          RD$ {subsidioSisalril.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>

                      <div className="bg-[#F8FAFC] p-2.5 rounded text-[10px] text-gray-500 font-sans mt-2">
                        {subsidioType === 'maternidad' ? (
                          <span className="leading-relaxed block">
                            <strong>Nota de Ley:</strong> El subsidio corresponde íntegramente al 100% de la cotización mensual, eximiendo a la empresa de su pago ordinario parcial, reembolsable por el sistema SISALRIL.
                          </span>
                        ) : (
                          <span className="leading-relaxed block">
                            <strong>Nota de Subsidio SISALRIL:</strong> Se paga a partir del cuarto (4to) día de enfermedad médica reportada a la Superintendencia de Salud y Riesgos Laborales.
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between py-2.5 border-t font-semibold text-[#0F766E] text-xs">
                        <span>Suma de Beneficio Total Recibido:</span>
                        <span className="font-mono font-extrabold text-[#0F766E] text-sm">
                          RD$ {totalBenefitPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

    </div>
  );
}
