const express = require('express');
const { body, validationResult } = require('express-validator');
const store = require('../models/store');

const router = express.Router();

// GET /api/vitals/:patientId — get all vitals for a patient
router.get('/:patientId', (req, res) => {
  const patient = store.getById(req.params.patientId);
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  const vitals = store.getVitals(req.params.patientId);
  res.json({ patient: patient.name, vitals });
});

// POST /api/vitals/:patientId — record new vitals
router.post('/:patientId',
  [
    body('heartRate').isInt({ min: 20, max: 250 }).withMessage('Heart rate must be 20–250 bpm'),
    body('bloodPressureSys').isInt({ min: 50, max: 300 }).withMessage('Systolic BP must be 50–300'),
    body('bloodPressureDia').isInt({ min: 30, max: 200 }).withMessage('Diastolic BP must be 30–200'),
    body('temperature').isFloat({ min: 30, max: 45 }).withMessage('Temperature must be 30–45°C'),
    body('oxygenSaturation').isInt({ min: 50, max: 100 }).withMessage('SpO2 must be 50–100%'),
    body('respiratoryRate').isInt({ min: 5, max: 60 }).withMessage('Respiratory rate must be 5–60'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const patient = store.getById(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const vital = store.addVital(req.params.patientId, req.body);
    res.status(201).json(vital);
  }
);

module.exports = router;
