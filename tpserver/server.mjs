"use strict";

import { createServer } from "http";
import { readFile, stat, createReadStream } from "fs";
import { parse } from "url";
import { join, normalize } from "path";
import { unescape } from "querystring";

let visites = [];

function webserver(request, response) {
    try {
        const url = parse(request.url, true);
        
        if (url.pathname.includes("..")) {
            response.writeHead(404);
            response.end("404 Not Found");
            return;
        }
        const filePath = normalize(url.pathname.slice("/files".length));

        // Request for "/coucou"
        if (url.pathname === "/coucou" && request.method === "GET") {
            try {
                
                const user = url.query.nom;
                //console.log(user);
                const nom = user.replace("<", "_").replace(">", "_");

                const usersList = Array.from(new Set(visites)).join(", ");
                const rep = `<!doctype html><html><body>coucou ${nom}, the following users have already visited this page: ${usersList}</body></html>`;
                response.setHeader("Content-Type", "text/html; charset=utf-8");
                response.end(rep);
                return;
            } catch (err) {
                console.error("Error processing '/coucou' request:", err);
                response.writeHead(500);
                response.end("Internal Server Error /coucou");
                return;
            }
        }

        // Request for "/clear"
        if (url.pathname === "/clear" && request.method === "GET") {
            visites = [];
            const rep = "<!doctype html><html><body>Memory cleared. No users have visited the page.</body></html>";
            response.setHeader("Content-Type", "text/html; charset=utf-8");
            response.end(rep);
            return;
        }

        // Request for "/hallo"
        if (url.pathname === "/hallo" && request.method === "GET") {
            const nom = url.query.visiteur;
            visites.push(nom);
            const rep = `<!doctype html><html><body>hallo ${unescape(nom)}</body></html>`;
            response.setHeader("Content-Type", "text/html ; charset=utf-8");
            response.end(rep);
            return;
        }

        // Request for "/files"
        if (url.pathname.startsWith("/files") && request.method === "GET") {
            //console.log("we are in /files")
            try {
                const url_prov=url.pathname;
                const chemin = url_prov.replace("/files/",'').replace("..",'');
                
                stat(chemin, (err, stats) => {
                    if (err) {
                        response.writeHead(404);
                        response.end("404 Not Found");
                        return;
                    }
                    readFile(chemin, (err, data) => {
                        if (err) {
                            response.writeHead(500);
                            response.end("Internal Server Error loading file");
                            return;
                        }
                        const extension = chemin.split(".").pop().toLowerCase();
                        const mimeTypes = {
                            html: "text/html; charset=utf-8",
                            css: "text/css; charset=utf-8",
                            js: "application/javascript; charset=utf-8",
                            png: "image/png; charset=utf-8",
                            mjs: "application/javascript; charset=utf-8",
                            jpg: "image/jpeg"
                        };
                        const mimeType = mimeTypes[extension] || "application/octet-stream ; charset=utf-8";
                        response.setHeader("Content-Type", `${mimeType}`);
                        const stream = createReadStream(chemin);
                        stream.pipe(response);
                        //console.log("The file you are looking for is"+chemin+"the extension is"+mimeType)
                    });
                });
                return;
            } catch (err) {
                console.error("Error processing '/files' request:", err);
                response.writeHead(404);
                response.end("Internal Server Error /files");
                return;
            }
        }

        // Request to stop the server
        if (request.url === "/stop") {
            response.setHeader("Content-Type", "text/html");
            response.end("<!doctype html><html><body>The server will stop now.</body></html>")
            server.close(() => {
                process.exit(0);
            });
            return;
        }

        // Default response
        //console.log("we are in" +url.pathname)
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end("<!doctype html><html><body>Working!</body></html>");
    } catch (err) {
        console.error("Error processing request:", err);
        response.writeHead(500);
        response.end("Internal Server Error /working");
    }
}

const port = process.argv[2] || 8000;

// instantiate server
const server = createServer(webserver);

// start the server
server.listen(port, (err) => {
    if (err) {
        console.error("Error starting the server:", err);
    } else {
        console.log(`Server is running on port ${port}`);
    }
});
