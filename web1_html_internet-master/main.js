var http = require('http');
var fs = require('fs');
var url = require('url');
function templateHTML(title, list, body){
  return `
  <!doctype html>
  <html>
  <head>
  <title>WEB1-${title}</title>
  <meta charset="utf-8">
  </head>
  <body>
  <h1><a href="/">WEB</a></h1>
  ${list}
  ${body}
  </body>
  </html>
  `; //html part
}

function templateList(filelist){
  var list = '<ul>';
  var i =0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i+1;
  }
  list = list + '</ul>';
  return list;
}

var app = http.createServer(function(request, response){
  var _url = request.url; //www.localhost:(postnum)
  var queryData = url.parse(_url, true).query; //내가 생각하기론 _url이 일종의 키값
  //?뒤의 문자열
  var pathname = url.parse(_url, true).pathname;

  if(pathname === '/'){
    fs.readdir('./data', function(error, filelist){
      var list = templateList(filelist);
      var title;
      var description;
      var template;
      if(queryData.id === undefined){
        title = 'Welcome';
        description = 'Hello Node.js';
        template = templateHTML(title, list, `<h2>${title}</h2>${description}`);
        response.writeHead(200);
        response.end(template);
      }
      else{
        fs.readFile(`./data/${queryData.id}`, 'utf8', function(err, description){
            title = queryData.id;
            template =  templateHTML(title, list,`<h2>${title}</h2>${description}`);
            response.writeHead(200);
            response.end(template);
        });
      }

    });
  }else{
    reponse.writeHead(404);
    reponse.end('Not Found!');
  }

});
app.listen(3000);
