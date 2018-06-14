Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份 
    "d+": this.getDate(), //日 
    "h+": this.getHours(), //小时 
    "m+": this.getMinutes(), //分 
    "s+": this.getSeconds(), //秒 
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
    "S": this.getMilliseconds() //毫秒 
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

module.exports = function(projectName) {
  return function(content, u) {
    var time = new Date().format('yyyy-MM-dd hh:mm:ss:S');
    var prev = time + ' [' + projectName + '] ';
    if(u) {
      console.log(prev + '==========='+ u +'===========');
    }
    if(typeof content === 'string') {
      console.log(prev + content);
    }else{
      var type = Object.prototype.toString.call(content).slice(8, -1);
      console.log(prev + `[${type}] =>`);
      if(type === 'Object') {
        console.log(JSON.stringify(content, null, '  '));
      }else{
        console.dir(content);
      }
    }
  }
}
