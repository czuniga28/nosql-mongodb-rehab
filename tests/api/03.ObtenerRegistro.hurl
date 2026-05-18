# Obtener el primer registro, para obtener un ID válido
GET http://localhost:3000/api/pacientes?page=1&limit=1
HTTP 200

[Captures]
paciente_id: jsonpath "$.data[0]._id"

# Obtener el paciente directamente por su ID
GET http://localhost:3000/api/pacientes/{{paciente_id}}
