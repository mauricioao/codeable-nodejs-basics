import http from "node:http";
import fs from "node:fs";

interface Note {
    id: number;
    content: string;
}

let notes: Note[] = []

const path = "./src/notes.json";
const newNote = { id: 7, content: "Nueva nota" };

fs.readFile(path, "utf8", (err, content) => {
    if (err) {
        console.log(err);
        return;
    }

    notes = JSON.parse(content);
    if (notes.some(({ id }) => id !== newNote.id)) return;
    notes.push(newNote);

    fs.writeFile(path, JSON.stringify(notes), (err) => {
        if (err) {
            console.log(err);
        }
    });
});

const requestListener: http.RequestListener = (req, response) => {
    // Regular expressions
    const patronRaiz = /^\/$/; // "/"
    const patronNotas = /^\/notes$/; // "/notes"
    const patronNotasId = /^\/notes\/(\d+)$/; // "/notes/7"
    const urlReq = req.url || "/";

    const method = req.method;

    if (method === 'GET') {

        if (patronRaiz.test(urlReq)) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Bienvenido a Notas");
        } else if (patronNotas.test(urlReq)) {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(notes));
        } else if (patronNotasId.test(urlReq)) {
            const id = Number(urlReq.split("/")[2]);
            const note = notes.find((note) => note.id === id);
            if (note) {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(note));
            } else {
                // estatus 400 y con contenido JSON con el siguiente objeto: { error: "Not found" }
                response.writeHead(400, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Not found" }));
            }
        } else {
            response.writeHead(404, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Bad request" }));
        }

    } else if (method === 'POST') {

        if (patronRaiz.test(urlReq)) {
            response.writeHead(200, { "Content-Type": "text/plain" });
            response.end("Bienvenido a Notas");
        } else if (patronNotas.test(urlReq)) {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(notes));
        } else if (patronNotasId.test(urlReq)) {
            const id = Number(urlReq.split("/")[2]);
            const note = notes.find((note) => note.id === id);
            if (note) {
                response.writeHead(200, { "Content-Type": "application/json" });
                response.end(JSON.stringify(note));
            } else {
                // estatus 400 y con contenido JSON con el siguiente objeto: { error: "Not found" }
                response.writeHead(400, { "Content-Type": "application/json" });
                response.end(JSON.stringify({ error: "Not found" }));
            }
        } else {
            response.writeHead(404, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "Bad request" }));
        }

    }

};

const server = http.createServer(requestListener);
server.listen(5500);
console.log("Listen to the port 5500");