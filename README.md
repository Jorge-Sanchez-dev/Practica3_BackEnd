Crea una API REST completa llamada ComicVault, que gestione una colección de tebeos de distintos usuarios.
Requisitos funcionales:
1.Autenticación de usuarios:
Permite registrar nuevos usuarios con nombre y contraseña.
Implementa un sistema de login que devuelva un token JWT.
Las rutas protegidas solo podrán usarse si se envía un token válido en la cabecera.
2.Gestión de tebeos:
Cada usuario podrá crear, leer, actualizar y eliminar sus propios tebeos.
Un tebeo debe incluir al menos los campos:
title (título)
author (autor o guionista)
year (año de publicación)
publisher (editorial, opcional)
userId (referencia al propietario del tebeo)
3.Rutas principales:
POST /auth/register → registrar usuario
POST /auth/login → iniciar sesión y obtener token
GET /comics → listar los tebeos del usuario autenticado
POST /comics → crear un nuevo tebeo
PUT /comics/:id → modificar un tebeo existente
DELETE /comics/:id → eliminar un tebeo
4.Base de datos:
Usa MongoDB con la librería oficial de Node.js (mongodb).
Crea las colecciones users y comics.
Asegura que un usuario solo pueda acceder o modificar sus propios documentos.
5.Aspectos técnicos:
Implementa el backend con Node.js y Express.
Usa TypeScript.
Implementa un middleware para validar el token JWT.
Devuelve mensajes de error claros en formato JSON.
5.Extra (opcional):
Añade paginación o búsqueda por título dentro de los tebeos del usuario.
Permite marcar tebeos como “leídos” o “pendientes”.
Crea un endpoint público /comics/public que liste los títulos más populares sin requerir autenticación.
