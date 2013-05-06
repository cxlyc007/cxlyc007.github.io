  var charImp; //特性阻抗值
  var waveLength;//波长
  var distance;//任意移动距离d
  var loadImp = new Array; //负载归一化后阻抗点
  var loadAdmittance = new Array; //负载归一化后的导纳点
  var loadReflection = new Array; //负载归一化导纳点对应的反射系数点
  var pointBAdmittance = new Array;//移动d距离后的导纳点
  var pointBReflection = new Array;//移动d距离后导纳点对应的反射系数点
  var pointBbAdmittance = new Array;//旋转到对应的导纳点
  var pointBbReflection = new Array;//旋转到对应导纳点对应的反射系数点
  var pointCAdmittance = new Array;//旋转3lamda/8后的导纳点
  var pointCReflection = new  Array;//旋转3lamda/8后导纳点的反射系数点
  var offset = 250;
  var radius = 240;
  var tabNum;
  var percentForEach;
  var currentPercent;

  $().ready(function(){
    plotBackground();
    tabNum = $(".tab-pane").length;
    percentForEach = accDiv(630,tabNum);
    currentPercent = percentForEach;
    var widthStr = currentPercent.toString() + "px";
    $("#prog .bar").css("width",widthStr);
    $("#btn0").click(step0);
    $("#btn1").click(step1);
    $("#btn2").click(step2);
    $("#btn3").click(step3);
    $("#btn4").click(step4);
    $("#btn5").click(step5);
    $("#bbtn2").click(step0);
    $("#bbtn3").click(step1);
    $("#bbtn4").click(step2);
    $("#bbtn5").click(step3);
    $("#bbtn6").click(step4);
    $(".addBtn").click(controlStateForward);
    $(".backBtn").click(controlStateBacward);
    $(".resetBtn").click(resetAll);
  });


//高精度除法
function accDiv(arg1,arg2){
    var t1=0,t2=0,r1,r2;
    try{t1=arg1.toString().split(".")[1].length}catch(e){}
    try{t2=arg2.toString().split(".")[1].length}catch(e){}
    with(Math){
        r1=Number(arg1.toString().replace(".",""));
        r2=Number(arg2.toString().replace(".",""));
        return (r1/r2)*pow(10,t2-t1);
    }
}

//高精度乘法
function accMul(arg1,arg2)
{
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}

//高精度复数除法
function complexDiv(arg1,arg2)
{
  var result = new Array;
  result[0] = accDiv(accMul(arg1[0],arg2[0])+accMul(arg1[1],arg2[1]),accMul(arg2[0],arg2[0])+accMul(arg2[1],arg2[1]));
  result[1] = accDiv(accMul(arg1[1],arg2[0])-accMul(arg1[0],arg2[1]),accMul(arg2[0],arg2[0])+accMul(arg2[1],arg2[1]));
  return result;
}

//生成标准的复数表达式
function generateComplexString(arg)
{
  var params = arg.slice();
  if (params[1] <0) 
    return params[0].toFixed(4).toString() + params[1].toFixed(4).toString() + "j";
  else
    return params[0].toFixed(4).toString() + "+" + params[1].toFixed(4).toString() + "j";
}

function admittance2Reflection(arg)
{
  var tmp1 = arg.slice();
  var tmp2 = arg.slice();
  tmp1[0] -= 1;
  tmp2[0] += 1;
  return complexDiv(tmp1,tmp2);
}

function reflection2Admittance(arg)
{
  var admittance = new Array;
  admittance[0] = accDiv(1-Math.pow(arg[0],2)-Math.pow(arg[1],2),Math.pow(1-arg[0],2)+Math.pow(arg[1],2));
  admittance[1] = accDiv(accMul(2,arg[1]),Math.pow(1-arg[0],2)+Math.pow(arg[1],2));
  return admittance;
}

function getCircle1ParamsFromReflectionParams(arg)
{
  var rValue = reflection2Admittance(arg)[0];
  var params = new Array;
  params[0] = accDiv(rValue,rValue+1);
  params[1] = 0;
  params[2] = accDiv(1,rValue+1);
  return  params;
}

function getCircle2ParamsFromReflectionParams(arg)
{
  var rValue = Math.sqrt(Math.pow(arg[0],2)+Math.pow(arg[1],2));
  var params = new Array;
  params[0] = 0;
  params[1] = 0;
  params[2] = rValue;
  return  params;
}

function plotDot(arg,color)
{
  var params = new Array;
  var style = "fill:" + color + ";"
  params[0] = accMul(arg[0],radius) + offset;
  params[1] = accMul(-1,accMul(arg[1],radius)) + offset;
  d3.select("svg").append("circle")
          .attr("cx",params[0])
          .attr("cy",params[1])
          .attr("r",5)
          .attr("style",style);
}

function plotCircle(arg,color)
{
  var params = new Array;
  var style = "fill:" + color + ";stroke:black;stroke-width:1px;"
  params[0] = accMul(arg[0],radius) + offset;
  params[1] = accMul(-1,accMul(arg[1],radius)) + offset;
  params[2] = accMul(arg[2],radius);
  d3.select("svg").append("circle")
          .attr("cx",params[0])
          .attr("cy",params[1])
          .attr("r", params[2])
          .attr("style",style);
}

function plotLine(arg1,arg2)
{
  var params = new Array;
  params[0] = accMul(arg1[0],radius) + offset;
  params[1] = accMul(-1,accMul(arg1[1],radius)) + offset;
  params[2] = accMul(arg2[0],radius) + offset;
  params[3] = accMul(-1,accMul(arg2[1],radius)) + offset;
  d3.select("svg").append("line")
          .attr("x1",params[0])
          .attr("y1",params[1])
          .attr("x2",params[2])
          .attr("y2",params[3])
          .attr("style","stroke:black;stroke-width:1px;");
}

function plotBackground()
{
  var svg = d3.select("#left-block").append("svg")
      .attr("width", "500px")
      .attr("height", "500px")
      .append("g")
      .attr("id","background");

    var coord = [radius*0+offset,radius*0+offset,radius];
    svg.selectAll("circle")
    .data([coord])
    .enter().append("circle")
    .attr("cx", function(d) { return d[0]; })
    .attr("cy", function(d) { return d[1]; })
    .attr("r", function(d) { return d[2]; })
    .attr("style","fill:none;stroke:grey;stroke-width:1px;");
}

function clearPlot()
{
  $("svg").remove();
}

function step0()
{ 
    clearPlot();
    plotBackground();
    charImp = $("#input1").val();
    loadImp[0] =$("#input2").val();
    loadImp[1] = $("#input3").val();
    waveLength = $("#input4").val();
    distance = $("#input5").val();
    if(charImp == "")
        charImp = 75;
    if(loadImp[0] == "")
      loadImp[0] = 109.5;
    if(loadImp[1] == "")
      loadImp[1] = -120;
    if(waveLength == "")
      waveLength = 1;
    if(distance == "")
      distance = 0.067;
    loadImp[0] = accDiv(loadImp[0],charImp);
    loadImp[1] = accDiv(loadImp[1],charImp);
   // var echoStr1 = "<p>" + "归一化负载阻抗为：" + generateComplexString(loadImp) + "</p>";
    var tempComplex = new Array;
    tempComplex[0] = 1;
    tempComplex[1] = 0;
    loadAdmittance = complexDiv(tempComplex,loadImp);
    loadReflection = admittance2Reflection(loadAdmittance);
    plotDot(loadReflection,"blue");
    //setTimeout(function(){$("#echoArea2").append(echoStr2);}, 500);
    plotCircle(getCircle1ParamsFromReflectionParams(loadReflection),"none");
    var echoStr2 = '<h3 style="color:blue;">' + "归一化负载导纳为：" + generateComplexString(loadAdmittance) + "</h3>";
    $("#echoArea2").remove();
    $("#tab2").prepend('<div id="echoArea2" class="echoArea" style="height:80%;"></div>')
    $("#echoArea2").append(echoStr2);
}

function step1()
{
    clearPlot();
    plotBackground();
    plotDot(loadReflection,"blue");
    plotCircle(getCircle2ParamsFromReflectionParams(loadReflection),"none");
    var tmp = accDiv(accDiv(distance,waveLength),0.5);
    var theta = accMul(accMul(tmp-Math.floor(tmp),2),Math.PI);
    pointBReflection[0] = accMul(loadReflection[0],Math.cos(theta)) + accMul(loadReflection[1],Math.sin(theta));
    pointBReflection[1] = accMul(loadReflection[1],Math.cos(theta)) - accMul(loadReflection[0],Math.sin(theta));
    pointBAdmittance = reflection2Admittance(pointBReflection);
    setTimeout(function(){plotDot(pointBReflection,"red");},300);
    setTimeout(function(){plotDot([0,0])},600)
    setTimeout(function(){plotLine([0,0],loadReflection);},900);
    setTimeout(function(){plotLine([0,0],pointBReflection);},1200);
    $("#echoArea3").remove();
    $("#tab3").prepend('<div id="echoArea3" class="echoArea" style="height:80%;"></div>')
    var echoStr1 = '<h3 style="color:red;">' + "沿源方向移动d距离后导纳为：" + generateComplexString(pointBAdmittance) + "</h3>";
    $("#echoArea3").append(echoStr1);
}

function step2()
{
    clearPlot();
    plotBackground();
    var parmas = getCircle1ParamsFromReflectionParams(pointBReflection);
    var tmpA = accDiv(Math.pow(parmas[0],2)-Math.pow(parmas[2],2)+Math.pow(parmas[1],2),accMul(2,parmas[0]));
    var tmpB = accDiv(accMul(2,parmas[1])+1,accMul(2,parmas[0]));
    var delta = Math.pow(1-accMul(2,accMul(tmpA,tmpB)),2)-accMul(4,accMul(Math.pow(tmpA,2),Math.pow(tmpB,2)+1));
    pointBbReflection[1] = accDiv(accMul(2,accMul(tmpA,tmpB))-1+Math.sqrt(delta),accMul(2,Math.pow(tmpB,2)+1));
    pointBbReflection[0] = tmpA - accMul(tmpB,pointBbReflection[1]);
    pointBbAdmittance = reflection2Admittance(pointBbReflection);
    plotDot(pointBReflection,"red");
    setTimeout(function(){plotCircle(getCircle1ParamsFromReflectionParams(pointBReflection),"none");},300);
    setTimeout(function(){plotCircle([0,-0.5,0.5],"none");},600);
    setTimeout(function(){plotDot(pointBbReflection,"darkturquoise");},900);
    $("#echoArea4").remove();
    $("#tab4").prepend('<div id="echoArea4" class="echoArea" style="height:80%;"></div>')
    var echoStr1 = "<h3 style='color:darkturquoise;'>" + "旋转后的导纳为：" + generateComplexString(pointBbAdmittance) + "</h3>";
    $("#echoArea4").append(echoStr1);
}

function step3()
{
    clearPlot();
    plotBackground();
    plotDot(pointBReflection,"red");
    plotCircle(getCircle1ParamsFromReflectionParams(pointBReflection),"none")
    plotCircle([0,-0.5,0.5],"none");
    plotDot(pointBbReflection,"darkturquoise");
    var tmpAdmittance = new Array;
    tmpAdmittance[0] = 0;
    tmpAdmittance[1] = pointBbAdmittance[1]-pointBAdmittance[1];
    var tmpReflection = admittance2Reflection(tmpAdmittance);
    var theta = Math.acos(accDiv(tmpReflection[0],Math.sqrt(Math.pow(tmpReflection[0],2)+Math.pow(tmpReflection[1],2))));
    var length1;
    if(tmpReflection[1] <= 0)
      length1 = accDiv(accMul(theta,accMul(0.5,waveLength)),accMul(2,Math.PI));
    else
      length1 = accMul(accMul(0.5,waveLength),1-accDiv(theta,accMul(2,Math.PI)));
    plotDot([0,0],"black");
    setTimeout(function(){plotDot([1,0],"black");},300);
    setTimeout(function(){plotDot(tmpReflection,"black");},600);
    setTimeout(function(){plotLine([0,0],[1,0]);},900);
    setTimeout(function(){plotLine([0,0],tmpReflection);},1200);
    $("#echoArea5").remove();
    $("#tab5").prepend('<div id="echoArea5" class="echoArea" style="height:80%;"></div>')
    var echoStr1 = "<h3>" + "第一个枝节的长度为：" + length1.toFixed(4).toString() + "m" + "</h3>";
    $("#echoArea5").append(echoStr1);
}

function step4()
{
    clearPlot();
    plotBackground();
    var theta = accDiv(accMul(3,Math.PI),2);
    pointCReflection[0] = accMul(pointBbReflection[0],Math.cos(theta)) + accMul(pointBbReflection[1],Math.sin(theta));
    pointCReflection[1] = accMul(pointBbReflection[1],Math.cos(theta)) - accMul(pointBbReflection[0],Math.sin(theta));
    pointCAdmittance = reflection2Admittance(pointCReflection);
    plotDot(pointBbReflection,"darkturquoise");
    setTimeout(function(){plotCircle([0,-0.5,0.5],"none");},300);
    setTimeout(function(){plotCircle([0.5,0,0.5],"none");},600);
    setTimeout(function(){plotDot(pointCReflection,"darkviolet");},900);
    $("#echoArea6").remove();
    $("#tab6").prepend('<div id="echoArea6" class="echoArea" style="height:80%;"></div>')
    var echoStr1 = "<h3 style='color:darkviolet;'>" + "旋转3&lambda;\/8后的导纳为：" + generateComplexString(pointCAdmittance) + "</h3>";
    $("#echoArea6").append(echoStr1);
}

function step5()
{
    clearPlot();
    plotBackground();
    plotDot(pointCReflection,"darkviolet");
    plotCircle([0.5,0,0.5],"none");
    var tmpAdmittance = new Array;
    tmpAdmittance[0] = 0;
    tmpAdmittance[1] = accMul(-1,pointCAdmittance[1]);
    var tmpReflection = admittance2Reflection(tmpAdmittance);
    var theta = Math.acos(accDiv(tmpReflection[0],Math.sqrt(Math.pow(tmpReflection[0],2)+Math.pow(tmpReflection[1],2))));
    var length1;
    if(tmpReflection[1] <= 0)
      length1 = accDiv(accMul(theta,accMul(0.5,waveLength)),accMul(2,Math.PI));
    else
      length1 = accMul(accMul(0.5,waveLength),1-accDiv(theta,accMul(2,Math.PI)));
    plotDot([0,0],"black");
    setTimeout(function(){plotDot([1,0],"black");},300);
    setTimeout(function(){plotDot(tmpReflection,"black");},600);
    setTimeout(function(){plotLine([0,0],[1,0]);},900);
    setTimeout(function(){plotLine([0,0],tmpReflection);},1200);
    $("#echoArea7").remove();
    $("#tab7").prepend('<div id="echoArea7" class="echoArea" style="height:80%;"></div>')
    var echoStr1 = "<h3>" + "第二个枝节的长度为：" + length1.toFixed(4).toString() + "m" + "</h3>";
    $("#echoArea7").append(echoStr1);
  }

  function controlStateForward()
  {
    $(".active").removeClass("active").next().addClass("active");
    currentPercent  += percentForEach;
    var widthStr = currentPercent.toString() + "px";
    $("#prog .bar").css("width",widthStr);
    $(".nav-tabs li").addClass("disabled");
    $(".active").removeClass("disabled");
  }

  function controlStateBacward()
  {
    $(".active").removeClass("active").prev().addClass("active");
    currentPercent  -= percentForEach;
    var widthStr = currentPercent.toString() + "px";
    $("#prog .bar").css("width",widthStr);
    $(".nav-tabs li").addClass("disabled");
    $(".active").removeClass("disabled");
  }

  function resetAll()
  {
      charImp = ""; 
      waveLength = "";
      distance = "";
      loadImp[0] = "";
      loadImp[1] = "";
      loadAdmittance[0] = 0;
      loadAdmittance[1] = 0; 
      loadReflection[0] = 0;
      loadReflection[1] = 0;
      pointBAdmittance[0] = 0; 
      pointBAdmittance[1] = 0;
      pointBReflection[0] = 0;
      pointBReflection[1] = 0; 
      pointBbAdmittance[0] = 0;
      pointBbAdmittance[1] = 0;
      pointBbReflection[0] = 0;
      pointBbReflection[1] = 0; 
      pointCAdmittance[0] = 0;
      pointCAdmittance[1] = 0; 
      pointCReflection[0] = 0;
      pointCReflection[1] = 0;
      $("#input1").val("");
      $("#input2").val("");
      $("#input3").val("");
      $("#input4").val("");
      $("#input5").val("");
      offset = 250;
      radius = 240;
      clearPlot();
      plotBackground();
      currentPercent = percentForEach;
      var widthStr = currentPercent.toString() +"px";
      $("#prog .bar").css("width",widthStr);
      $(".active").removeClass("active");
      $(".nav-tabs").children("li").eq(0).addClass("active");
      $(".tab-pane").eq(0).addClass("active");
      $(".nav-tabs li").addClass("disabled");
      $(".active").removeClass("disabled");
}