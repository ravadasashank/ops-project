const express = require('express');
const { body, validationResult } = require('express-validator');
const store   = require('../models/store');
const { activePatients, criticalPatients } = require('../middleware/metrics');

const router = express.Router();

function updateGauges() {
  const s = store.stats();
  activePatients.set(s.total);
  criticalPatients.set(s.critical);
}

// GET /api/patients — list all patients
router.get('/', (req, res) => {
  const { ward, status, search } = req.query;
  let list = store.getAll();
  if (ward)   list = list.filter(p => p.ward.toLowerCase() === ward.toLowerCase());
  if (status) list = list.filter(p => p.status.toLowerCase() === status.toLowerCase());
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json({ count: list.length, patients: list });
});

// GET /api/patients/stats — dashboard summary
router.get('/stats', (req, res) => {
  res.json(store.stats());
});

// GET /api/patients/:id — single patient
router.get('/:id', (req, res) => {
  const patient = store.getById(req.params.id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// POST /api/patients — admit new patient
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('age').isInt({ min: 0, max: 150 }).withMessage('Valid age required'),
    body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('ward').notEmpty().withMessage('Ward is required'),
    body('status').isIn(['Critical', 'Stable', 'Recovering']).withMessage('Invalid status'),
    body('doctor').notEmpty().withMessage('Doctor name required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const patient = store.create(req.body);
    updateGauges();
    res.status(201).json(patient);
  }
);

// PUT /api/patients/:id — update patient
router.put('/:id', (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Patient not found' });
  updateGauges();
  res.json(updated);
});

// DELETE /api/patients/:id — discharge patient
router.delete('/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Patient not found' });
  updateGauges();
  res.json({ message: 'Patient discharged successfully' });
});

module.exports = router;
