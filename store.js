const { v4: uuidv4 } = require('uuid');

// In-memory store (use MongoDB/PostgreSQL in real production)
let patients = [
  {
    id: 'p-001',
    name: 'Arjun Sharma',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    ward: 'Cardiology',
    status: 'Critical',
    admittedAt: new Date('2024-01-10T08:30:00Z').toISOString(),
    doctor: 'Dr. Priya Mehta',
    contact: '+91-9876543210',
  },
  {
    id: 'p-002',
    name: 'Sunita Verma',
    age: 34,
    gender: 'Female',
    bloodGroup: 'A+',
    ward: 'Neurology',
    status: 'Stable',
    admittedAt: new Date('2024-01-12T11:00:00Z').toISOString(),
    doctor: 'Dr. Ramesh Gupta',
    contact: '+91-9123456789',
  },
  {
    id: 'p-003',
    name: 'Mohammed Irfan',
    age: 62,
    gender: 'Male',
    bloodGroup: 'B-',
    ward: 'Orthopedics',
    status: 'Recovering',
    admittedAt: new Date('2024-01-08T14:15:00Z').toISOString(),
    doctor: 'Dr. Anjali Singh',
    contact: '+91-9012345678',
  },
  {
    id: 'p-004',
    name: 'Kavita Nair',
    age: 28,
    gender: 'Female',
    bloodGroup: 'AB+',
    ward: 'Maternity',
    status: 'Stable',
    admittedAt: new Date('2024-01-14T09:45:00Z').toISOString(),
    doctor: 'Dr. Deepa Krishnan',
    contact: '+91-9988776655',
  },
  {
    id: 'p-005',
    name: 'Rajesh Patel',
    age: 55,
    gender: 'Male',
    bloodGroup: 'O-',
    ward: 'ICU',
    status: 'Critical',
    admittedAt: new Date('2024-01-15T02:00:00Z').toISOString(),
    doctor: 'Dr. Priya Mehta',
    contact: '+91-9876501234',
  },
];

// Vitals keyed by patientId
let vitals = {};

// Generate realistic vitals for seeded patients
function generateVital(patientId, status) {
  const isCritical  = status === 'Critical';
  const isRecovering = status === 'Recovering';
  return {
    id: uuidv4(),
    patientId,
    heartRate:       isCritical ? Math.floor(Math.random() * 40 + 110) : Math.floor(Math.random() * 20 + 68),
    bloodPressureSys: isCritical ? Math.floor(Math.random() * 30 + 150) : Math.floor(Math.random() * 20 + 110),
    bloodPressureDia: isCritical ? Math.floor(Math.random() * 20 + 95)  : Math.floor(Math.random() * 15 + 70),
    temperature:     isCritical ? (38.5 + Math.random()).toFixed(1)     : (36.5 + Math.random() * 0.8).toFixed(1),
    oxygenSaturation: isCritical ? Math.floor(Math.random() * 5 + 88)  : Math.floor(Math.random() * 3 + 96),
    respiratoryRate: isCritical ? Math.floor(Math.random() * 8 + 22)   : Math.floor(Math.random() * 6 + 14),
    recordedAt: new Date().toISOString(),
  };
}

patients.forEach(p => {
  vitals[p.id] = [generateVital(p.id, p.status)];
});

module.exports = {
  getAll:    ()          => patients,
  getById:   (id)        => patients.find(p => p.id === id),
  create:    (data)      => { const p = { id: uuidv4(), admittedAt: new Date().toISOString(), ...data }; patients.push(p); vitals[p.id] = []; return p; },
  update:    (id, data)  => { const i = patients.findIndex(p => p.id === id); if (i === -1) return null; patients[i] = { ...patients[i], ...data }; return patients[i]; },
  remove:    (id)        => { const i = patients.findIndex(p => p.id === id); if (i === -1) return false; patients.splice(i, 1); delete vitals[id]; return true; },
  getVitals: (id)        => vitals[id] || [],
  addVital:  (id, data)  => { const v = { id: uuidv4(), patientId: id, recordedAt: new Date().toISOString(), ...data }; if (!vitals[id]) vitals[id] = []; vitals[id].unshift(v); return v; },
  stats: () => ({
    total:     patients.length,
    critical:  patients.filter(p => p.status === 'Critical').length,
    stable:    patients.filter(p => p.status === 'Stable').length,
    recovering: patients.filter(p => p.status === 'Recovering').length,
    wards:     [...new Set(patients.map(p => p.ward))].length,
  }),
};
