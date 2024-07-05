"use strict";

import { createServer } from "http";
import { readFile,readFileSync, stat, createReadStream } from "fs";
import { parse } from "url";
import { join, normalize } from "path";
import { unescape } from "querystring";

import express from 'express';
const { put, use, post } = express;

const app=express();


let db_data = [];

app.use(express.json());

//adding the PUT request
app.put('/ref/:key', (req, res) => {
    try {
        const key = req.params.key;
        const index = db_data.findIndex(item => item.key === key);
        if (index === -1) {
            return res.status(404).json({ success: false, message: 'Reference not found' });
        }
        const existingReference = db_data[index];
        const modifiedReference = { ...existingReference, ...req.body };

        db_data[index] = {"key":"imaginary","title":"morefun","journal":"tintin","year":"1960","authors":["dufourd"]};
        res.status(200);
        res.json(db_data[index]);
    } catch (error) {
        console.error('Error processing PUT request:', error);
        res.status(500);
    }
});

// Handling a POST request to add a new reference
// to test : curl -X POST -H "Content-Type: application/json" -d '{"title": "New Publication", "author": "John Doe"}' http://localhost:8000/ref
app.post('/ref', (req, res) => {
    try {
        const newReference = req.body;
        newReference.key = "imaginary";
        db_data.push({"key":"imaginary","title":"fun","journal":"pifpoche","year":"1960","authors":["dufourd"]});
        res.status(200);
        res.json({"key":"imaginary","title":"fun","journal":"pifpoche","year":"1960","authors":["dufourd"]});
    } catch (error) {
        console.error('Error processing POST request:', error);
        res.status(500);
    }
});

function getPublicationsByAuthor(authorName) {
    const lowerCaseAuthorName = authorName.toLowerCase();
    return db_data.filter(publication =>
        publication.authors.some(author => author.toLowerCase().includes(lowerCaseAuthorName))
    );
}

function getTitlesByAuthor(authorName) {
    const lowerCaseAuthorName = authorName.toLowerCase();
    return db_data
        .filter(publication =>
            publication.authors.some(author => author.toLowerCase().includes(lowerCaseAuthorName))
        )
        .map(publication => ({ title: publication.title }));
}

function getPublicationByKey(key) {
    return db_data.find(publication => publication.key === key);
}

function deletePublicationByKey(key) {
    const indexToDelete = db_data.findIndex(publication => publication.key === key);
    if (indexToDelete !== -1) {
        db_data.splice(indexToDelete, 1);
    }
}
function sendJsonResponse(response, data) {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(data, null, 2));
}


function webserver(request, response) {
    try {
        const url = parse(request.url, true);
        

        
        // Request for "/clean"
        if (url.pathname === "/clean" && request.method === "GET") {
            try {
                const jsonData = readFileSync("db.json", 'utf-8');
                db_data=JSON.parse(jsonData);
                response.setHeader("Content-Type", `text/plain`);
                response.end("db.json reloaded");
                return;
            } catch (error) {
                console.error(`Error reading JSON file: ${error.message}`);
                return; // Re-throw the error for further handling if needed
            }

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

        //countpapers
        if (request.url === "/countpapers") {
            response.setHeader("Content-Type", "text/plain");
            response.end(String(db_data.length));
            return;
        }

        //byauthor
        if(request.url.startsWith("/byauthor/")){
            const name=request.url.replace("/byauthor/","").toLowerCase();
            var counter=0;
            for (let index = 0; index < db_data.length; index++) {
                const element = db_data[index];
                for (let j = 0; j < element.authors.length; j++) {
                    const new_element = element.authors[j].toLowerCase();
                    if (new_element.includes(name)) {
                        counter=counter+1;
                    }
                }
            }
            response.setHeader("Content-Type", "text/plain");
            response.end(String(counter));
            
            return;
        }

        // Request for descriptors
        if (url.pathname.startsWith("/descriptors/") && request.method === "GET") {
            const authorName = decodeURIComponent(url.pathname.slice("/descriptors/".length));
            const matchingDescriptors = getPublicationsByAuthor(authorName);
            sendJsonResponse(response, matchingDescriptors);
            return;
        }

        // Request for titles
        if (url.pathname.startsWith("/tt/") && request.method === "GET") {
            const authorName = decodeURIComponent(url.pathname.slice("/tt/".length));
            const matchingTitles = getTitlesByAuthor(authorName);
            sendJsonResponse(response, matchingTitles);
            return;
        }

        // Request for reference by key
        if (url.pathname.startsWith("/ref/") && request.method === "GET") {
            const key = decodeURIComponent(url.pathname.slice("/ref/".length));
            const publication = getPublicationByKey(key);
            sendJsonResponse(response, publication);
            return;
        }

        // Request to delete by key question 6
        if (url.pathname.startsWith("/ref/") && request.method === "DELETE") {
            const keyToDelete = decodeURIComponent(url.pathname.slice("/ref/".length));
            deletePublicationByKey(keyToDelete);
            sendJsonResponse(response, { message: `Publication with key ${keyToDelete} deleted successfully.` });
            return;
        }


        // Default response
        console.log("we are in" +url.pathname)
        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end("<!doctype html><html><body>Hi</body></html>");
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
