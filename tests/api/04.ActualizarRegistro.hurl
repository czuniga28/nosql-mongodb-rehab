# Obtener el primer registro, para obtener un ID válido
GET http://localhost:3000/api/pacientes?page=1&limit=1
HTTP 200

[Captures]
paciente_id: jsonpath "$.data[0]._id"

PUT http://localhost:3000/api/pacientes/{{paciente_id}}
Content-Type: application/json

{
  "recoveryStatus": "in_progress"
}
