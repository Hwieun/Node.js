var fs = require('fs'); //fs 모듈 사용가능
var testFolder='./web1_html_internet-master/data';

fs.readdir(testFolder, function(error, filelist){
  console.log(filelist);
})
