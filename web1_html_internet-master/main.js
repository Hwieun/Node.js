var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control){
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
  ${control}
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
        template = templateHTML(title, list, `<h2>${title}</h2>${description}`,
        `<a href="/create">create</a>`);
        response.writeHead(200);
        response.end(template);
      }
      else{
        fs.readFile(`./data/${queryData.id}`, 'utf8', function(err, description){
            title = queryData.id;
            template =  templateHTML(title, list,`<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
             <a href="/update?id=${title} ">update</a>
             <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <input type="submit" value="delete">
             </form>
             `);
            response.writeHead(200);
            response.end(template);
        });
      }
    });
  }
  else if(pathname === '/create'){
    fs.readdir('./data', function(error, filelist){
      var title = 'WEB - create';
      var list = templateList(filelist);
      var template = templateHTML(title, list,
        `<form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"> </p>
        <p>
        <textarea name="description" placeholder="description"></textarea>
        </p>
      <p>
        <input type="submit">
      </p>
      </form>
      `,' ');
      response.writeHead(200);
      response.end(template);
    });
  }
  else if(pathname==='/create_process'){
    var body = '';
    request.on('data', function(data){
      body = body+data; //data save
    });
    request.on('end', function(){
      var post = qs.parse(body); //qs객체에서 body부분을 parse해서 post로 반환
      var title = post.title;
      var description = post.description;
      console.log(title);
      fs.writeFile(`data/${title}`, description, 'utf8',function(err){
        //redirection
        response.writeHead(302, {Location: `/?id=${title}`}); //page redirection
        response.end();
      })
    }); //데이터가 이제 안들어오는 경우
  }
  else if(pathname === '/update'){
    fs.readdir('./data', function(error, filelist){
      fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = templateList(filelist);
          var template = templateHTML(title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <p><input type="text" name="title" placeholder="title" value="${title}"></p>
              <p>
                <textarea name="description" placeholder="description">${description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(template);
      })
    });
  }
  else if(pathname === '/update_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id =post.id;
      var title = post.title;
      var description = post.description;
      fs.rename(`data/${id}`, `data/${title}`, function(err){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          response.writeHead(302, {Location: `/?id=${title}`});
          response.end();
        })
      })
    })
  }
  else if(pathname === '/delete_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      fs.unlink(`data/${id}`, function(err){
        //after delete
        response.writeHead(302, {Location: `/`});
        response.end();
      })
    });
  }
  else{
    response.writeHead(404);
    response.end('Not Found!');
  }
});
app.listen(3000);
