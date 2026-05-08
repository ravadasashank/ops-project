const request = require('supertest');
const app     = require('../src/app');

describe('MediTrack API - Health', () => {
  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('MediTrack API');
  });
});

describe('MediTrack API - Patients', () => {
  it('GET /api/patients returns patient list', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('patients');
    expect(Array.isArray(res.body.patients)).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('GET /api/patients/stats returns stats', async () => {
    const res = await request(app).get('/api/patients/stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('critical');
  });

  let createdId;

  it('POST /api/patients admits a new patient', async () => {
    const res = await request(app).post('/api/patients').send({
      name: 'Test Patient',
      age: 30,
      gender: 'Male',
      bloodGroup: 'O+',
      ward: 'General',
      status: 'Stable',
      doctor: 'Dr. Test',
      contact: '+91-9000000000',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Test Patient');
    createdId = res.body.id;
  });

  it('GET /api/patients/:id returns the patient', async () => {
    const res = await request(app).get(`/api/patients/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('PUT /api/patients/:id updates patient status', async () => {
    const res = await request(app).put(`/api/patients/${createdId}`).send({ status: 'Recovering' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Recovering');
  });

  it('DELETE /api/patients/:id discharges the patient', async () => {
    const res = await request(app).delete(`/api/patients/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain('discharged');
  });

  it('POST /api/patients returns 400 with invalid data', async () => {
    const res = await request(app).post('/api/patients').send({ name: '' });
    expect(res.statusCode).toBe(400);
  });
});

describe('MediTrack API - Vitals', () => {
  it('GET /api/vitals/:id returns vitals for seeded patient', async () => {
    const res = await request(app).get('/api/vitals/p-001');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.vitals)).toBe(true);
  });

  it('POST /api/vitals/:id records new vitals', async () => {
    const res = await request(app).post('/api/vitals/p-001').send({
      heartRate: 75,
      bloodPressureSys: 120,
      bloodPressureDia: 80,
      temperature: 37.0,
      oxygenSaturation: 98,
      respiratoryRate: 16,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.heartRate).toBe(75);
  });
});

describe('MediTrack API - Metrics', () => {
  it('GET /metrics returns Prometheus metrics', async () => {
    const res = await request(app).get('/metrics');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('meditrack_http_requests_total');
  });
});
