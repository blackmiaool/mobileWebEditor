'use strict';
let fs = require("fs");
let http = require("http");
let bl = require("bl");



let port = 8088;
let pageFileName = "page.txt";

function readFileArray(fileName) {
    try {
        return JSON.parse(fs.readFileSync(fileName).toString());
    } catch (e) {
        fs.writeFileSync(fileName, "[]");
        return [];
    }
}

function readFileObj(fileName) {
    try {
        return JSON.parse(fs.readFileSync(fileName).toString());
    } catch (e) {
        fs.writeFileSync(fileName, "{}");
        return {};
    }
}

console.log(`listen on ${port}`);
http.createServer(function (req, res) {

        function writeHead() {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "accept, content-type"
            })
        }

        writeHead();
        console.log(req.url);


        req.pipe(bl(function (err, data) {

            try {
                data = JSON.parse(data.toString());
            } catch (e) {
                console.log(e);
                res.end("bad json");
                return;
            }
            let ret;
            switch (req.url) {
            case "/common/if_editor_data":
                switch (data.action) {
                case "get":{
                    let pageList = readFileArray(pageFileName);
                    res.end(JSON.stringify({
                            result:pageList[data.id]
                    }));
                    break;
                }
                case "list":
                    {
                        ret = {
                            result: {
                                list: []
                            }
                        };
                        let pageList = readFileArray(pageFileName);
                        res.end(JSON.stringify({
                            result: {
                                list: pageList
                            }
                        }));
                        break;
                    }
                case "put":
                    {
                        let result = JSON.parse(JSON.stringify(data));
                        delete result.action;
                        let pageList = readFileArray(pageFileName);
                        if (result.id) {
                            pageList[result.id] = result;
                        } else {
                            pageList.push(result);
                            result.id = pageList.length - 1;
                        }
                        fs.writeFileSync(pageFileName, JSON.stringify(pageList));
                        res.end(JSON.stringify({
                            result: {
                                id: result.id
                            }
                        }));
                        break;
                    }
                default:
                    res.end("");
                }
                break;
            case "/common/if_mail":

                res.end("");
                break;
            case "/common/if_editor_addon":
                switch (data.action) {
                case "list":
                    ret = {
                        result: []
                    };
                    res.end(JSON.stringify(ret));
                    break;
                default:
                    res.end("");
                }
                break;
            }
        }))


    }

).listen(port);