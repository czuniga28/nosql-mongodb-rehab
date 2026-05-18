POST http://localhost:3000/api/pacientes
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez García",
  "birthDate": "1985-03-15T00:00:00Z",
  "gender": "male",
  "contact": {
    "phone": "+50688888888",
    "email": "juan.perez@example.com"
  },
  "diagnosis": {
    "type": "Rehabilitation Post-Injury",
    "description": "Right knee ligament reconstruction rehabilitation",
    "diagnosisDate": "2024-01-10T00:00:00Z"
  },
  "recoveryStatus": "initial"
}

POST http://localhost:3000/api/pacientes
Content-Type: application/json

{
  "firstName": "Laura",
  "lastName": "Ramírez Soto",
  "birthDate": "1985-03-15T00:00:00Z",
  "gender": "female",
  "contact": {
    "phone": "+50688888890",
    "email": "laura.ramirez@example.com"
  },
  "diagnosis": {
    "type": "Shoulder tendon rehabilitation",
    "description": "Recovery plan focused on restoring shoulder mobility, reducing inflammation, and rebuilding strength after tendon injury",
    "diagnosisDate": "2026-07-08T00:00:00Z"
  },
  "recoveryStatus": "initial"
}

POST http://localhost:3000/api/pacientes
Content-Type: application/json

{
  "firstName": "Pablo",
  "lastName": "Camacho Ortiz",
  "birthDate": "1985-03-15T00:00:00Z",
  "gender": "male",
  "contact": {
    "phone": "+50688888889",
    "email": "pablo.camacho@example.com"
  },
  "diagnosis": {
    "type": "Post-operative ACL rehabilitation",
    "description": "Recovery plan after anterior cruciate ligament reconstruction with focus on mobility, stability, and strength restoration",
    "diagnosisDate": "2026-05-17T00:00:00Z"
  },
  "recoveryStatus": "initial"
}
