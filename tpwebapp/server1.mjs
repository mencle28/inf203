"use strict";

import { createServer } from "http";
import { readFile,writeFile, stat, createReadStream } from "fs";
import { parse } from "url";
import { join, normalize } from "path";
import { unescape } from "querystring";

let jsonData = [];

function webserver(request, response) {
    try {
        const url = parse(request.url, true);
        
        
        const filePath = normalize(url.pathname.slice("/files".length));
        console.log("filePath is "+filePath);
       
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
                            jpg: "image/jpeg",
                            json: "application/json; charset=utf-8"
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

        //request test2.html
        if (request.url === "/client/test2.html") {
            try{
                readFile("client/test2.html", (error, content) => {
                    if (error) {
                        response.writeHead(500);
                        response.end('Internal Server Error');
                    } else {
                        response.setHeader("Content-Type", "text/html");
                        response.end(content);
                    }
                })
                ;}
                catch (err) {
                    console.error("Error processing '/test2.html' request:", err);
                    response.writeHead(404);
                    response.end("Internal Server Error /test2.html");
                    return;
                }
            return;
        }

        //request test2.js
        if (request.url === "/client/test2.js") {
            try{
                readFile("client/test2.js", (error, content) => {
                    if (error) {
                        response.writeHead(500);
                        response.end('Internal Server Error');
                    } else {
                        response.setHeader("Content-Type", "text/html");
                        response.end(content);
                    }
                });}
                catch (err) {
                    console.error("Error processing '/test2.js' request:", err);
                    response.writeHead(404);
                    response.end("Internal Server Error /test2.js");
                    return;
                }
            return;
        }
        // Route pour la requête PIChart
        if(request.url === "/PIEChart" && request.method === "GET"){
            
            console.log("we are in /PIEChart");
            try{
                readFile("storage.json", (err, data) => {
                    if (err) {
                        response.writeHead(500);
                        response.end("Internal Server Error loading file");
                        return;
                    }
                    try {
                        const Data = JSON.parse(data);
                        console.log("JSON data:", Data);
                        const svg = generatePieChartSVG(Data);
                        console.log("SVG:", svg);
                        response.setHeader("Content-Type", `image/svg+xml`);
                        response.end(svg);
                        return;
                    } catch (error) {
                        console.error(error);
                        console.log("Error generating SVG; charset=utf-8");
                        response.writeHead(500);
                        response.end("Internal Server Error");
                        return;
                    }
                    
                    });
          
            }
            catch (err) {
                console.error("Error processing '/test2.js' request:", err);
                response.writeHead(404);
                response.end("Internal Server Error /test2.js");
                return;
            }
            return;
            
        };
        
       
        
        

        //##########################Ajout de code pour le nouveau TP ######################################
        // Request to show JSON
        if (url.pathname === "/Items" && request.method === "GET") {
            try {
                    readFile("storage.json", (err, data) => {
                        if (err) {
                            response.writeHead(500);
                            response.end("Internal Server Error loading file");
                            return;
                        }
                     
                        const mimeType = "application/json; charset=utf-8";
                        response.setHeader("Content-Type", `${mimeType}`);
                        response.end(data);
                        
                        //console.log("The file you are looking for is"+chemin+"the extension is"+mimeType)
                    });
              
                return;
            } catch (err) {
                console.error("Error processing '/files' request:", err);
                response.writeHead(404);
                response.end("Internal Server Error /files");
                return;
            }
        }

        // Request to add element to storage JSON
        if (url.pathname === "/add" && request.method === "GET") {
            var { title, color, value } = url.query;
            value=parseInt(value);
            const newItem = { title, color, value };
            //on lit le JSON
            try{ readFile('storage.json',(err,data)=>{
                
                //on recrée le dico
                const jsonData=JSON.parse(data);
                jsonData.push(newItem);
                const new_content= JSON.stringify(jsonData,null , 2);
                
                writeFile('storage.json',new_content, 'utf-8', (err)=>{
                    if (err) {
                        console.log("erruer writing json")
                    }
                });
                response.writeHead(200);
                response.end();
                return;
                
            });
                return;
        } catch (err) {
                console.error("Error processing add request:", err);
                response.writeHead(404);
                response.end("Internal Server Error /add");
                return;
            }

            
            return;
        }

         // Request to clear element to storage JSON
         if (url.pathname === "/clear" && request.method === "GET") {
                
                //on recrée le dico
                const new_content= JSON.stringify([{"title": "empty", "color": "red", "value": 1}],null , 2);
                writeFile('storage.json',new_content, 'utf-8', (err)=>{
                    if (err) {
                        console.log("erruer writing json")
                    }
                });
                response.writeHead(200);
                response.end();
                return;
        }
        if (request.url === '/favicon.ico') {
            response.writeHead(204);
            response.end();
            return;
        }
        // Request to restore JSON
        if (url.pathname === "/restore" && request.method === "GET") {
            var dico=[
                {
                  "title": "foo",
                  "color": "red",
                  "value": 20
                },
                {
                  "title": "bar",
                  "color": "ivory",
                  "value": 100
                },
                {
                  "title": "blib",
                  "color": "mauve",
                  "value": 75
                }
              ];
            //on recrée le dico
            const new_content= JSON.stringify(dico,null , 2);
            writeFile('storage.json',new_content, 'utf-8', (err)=>{
                if (err) {
                    console.log("erruer writing json")
                }
            });
            response.writeHead(200);
            response.end();

            return;
    }
        // Request to remove element to storage JSON
        if (url.pathname === "/remove" && request.method === "GET") {
            var { index } = url.query;
            index=parseInt(index);
            //on lit le JSON
            try{ readFile('storage.json',(err,data)=>{
                
                //on recrée le dico
                const jsonData=JSON.parse(data);
                jsonData.splice(index,1);
                const new_content= JSON.stringify(jsonData,null , 2);
                
                writeFile('storage.json',new_content, 'utf-8', (err)=>{
                    if (err) {
                        console.log("erruer writing json in remove")
                    }
                });
                response.writeHead(200);
                response.end();
                return;
                
            });
                return;
        } catch (err) {
                console.error("Error processing remove request:", err);
                response.writeHead(404);
                response.end("Internal Server Error /remove");
                return;
            }

            
            return;
        }

        //#################################################################################################
        // Default response
        //console.log("we are in" +url.pathname)
        console.log("we  are in default response");
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




function generatePieChartSVG(data) {
    const total = data.reduce((acc, entree) => acc + entree.value, 0);
    let startAngle = 0;
    let svg = `<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">`;
    
    data.forEach(entry => {
        const percentage = (entry.value / total) * 100;
        const endAngle = startAngle + (percentage * 3.6);
        const path = describeArc(150, 150, 100, startAngle, endAngle);
        svg += `<path d="${path}" fill="${entry.color}" />`;
        startAngle = endAngle;
    });
    
    svg += `</svg>`;
    console.log("svg");
    console.log(svg);
    return svg;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
        `M ${start.x} ${start.y}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
        `L ${x} ${y}`,
    ].join(' ');
    return d;
}
