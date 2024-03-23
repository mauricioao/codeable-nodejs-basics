import http from "node:http";
import fs from "node:fs/promises";
import { randomInt } from "node:crypto";

// const notes = [
//   { id: 1, content: "Hacer la cama" },
//   { id: 2, content: "Lavar los platos" },
//   { id: 3, content: "Estudiar JavaScript" },
//   { id: 4, content: "Hacer las compras" },
//   { id: 5, content: "Limpiar mi habitación" },
//   { id: 6, content: "Almorzar a tiempo" },
// ];
const path = "./src/notes.json";

interface Note {
  id: number;
  content: string;
}

const requestListener: http.RequestListener = (req, response) => {
  const method = req.method;
  // Regular expressions
  const patronRaiz = /^\/$/; // "/"
  const patronNotas = /^\/notes$/; // "/notes"
  const patronNotasId = /^\/notes\/(\d+)$/; // "/notes/7"
  const urlReq = req.url || "/";
  if (patronRaiz.test(urlReq)) {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Bienvenido a Notas");
  } else if (patronNotas.test(urlReq)) {
    // /notes
    if (method === "GET") {
      (async () => {
        try {
          const content = await fs.readFile(path, "utf8");
          const notes = JSON.parse(content); //TODO: probar sin hacer el parse
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(notes, null, 2));
        } catch (error) {
          console.log(error);
        }
      })();
    } else if (method === "POST") {
      let body = "";
      // Recibe los datos en partes (chunks)
      req.on("data", (chunk) => {
        body += chunk.toString(); // convierte el Buffer a string
      });

      // Fin de la recepción de datos
      req.on("end", async () => {
        // aquí tienes el cuerpo completo de la solicitud POST
        try {
          //leer el archivo
          const content = await fs.readFile(path, "utf8");
          //trasformar
          const notes = JSON.parse(content);
          //Crear el objeto de nueva nota con el boby y un id
          const newNote = JSON.parse(body); // {content: "nuevo contenido"}
          newNote.id = randomInt(1000);
          notes.push(newNote); // {id:56 , content: "nuevo contenido"}
          //escribir el archivo
          await fs.writeFile(path, JSON.stringify(notes, null, 2));
          response.end(JSON.stringify(notes, null, 2));
        } catch (error) {
          console.log(error);
        }
      });
    }
  } else if (patronNotasId.test(urlReq)) {
    (async () => {
      try {
        const id = Number(urlReq.split("/")[2]);
        const content = await fs.readFile(path, "utf8"); // string
        const notes: Note[] = JSON.parse(content); // string => obj {} ó [{}]
        const note = notes.find((note) => note.id === id);
        if (note) {
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(note));
        } else {
          // estatus 400 y con contenido JSON con el siguiente objeto: { error: "Not found" }
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Not found" }));
        }
      } catch (error) {
        console.log(error);
      }
    })();
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Bad request" }));
  }
};

const server = http.createServer(requestListener);
server.listen(5500);
console.log("Listen to the port 5500");