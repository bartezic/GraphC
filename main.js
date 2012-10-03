$(function() {
  $('.countOfVertices').change(function(){
    var tr, td, cont, table = $('.tableForMatrix').empty();
    for (var i = 0; i <= $(this).val(); i++){
      tr = document.createElement("tr");
      for (var j = 0; j <= $(this).val(); j++){
        if(i === 0 && j === 0){
          cont = ''; td = 'th';
        } else if(i === 0){
          cont = j; td = 'th';
        } else if(j === 0){
          cont = i; td = 'th';
        } else {
          cont = ''; td = 'td';
        }
        cont = document.createTextNode(cont);
        td = document.createElement(td);
        if(i === j && i !== 0){
          td.setAttribute('class', 'uncheckeble');
        }
        td.setAttribute('data-rel', '{"s":'+(i-1)+',"t":'+(j-1)+'}');
        td.setAttribute('data-index', (i>j? i+'_'+j:j+'_'+i));
        td.appendChild(cont);
        tr.appendChild(td);
      }
      table.append(tr);
    }
    count = $(this).val();
    buildJson();
  });

  $('table').on('click', 'td', function () {
    $("td[data-index='" + $(this).data('index') +"']").toggleClass('checked');
    buildJson();
  });
});

function counter(){
  return parseInt($('.countOfVertices').val());
}


function mainDraw(json) {
  $('#chart').empty();
  var width = 670, height = 670;
  var color = d3.scale.category20();
  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(60)
      .size([width, height]);

  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height);

  force
      .nodes(json.nodes)
      .links(json.links)
      .start();

  var link = svg.selectAll("line.link")
      .data(json.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll("circle.node")
      .data(json.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .call(force.drag);;

  node.append("circle")
      .attr("r", 15)
      .style("fill", function(d) { return color(d.group); });

  node.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  });
};

function buildJson(){
  var json = {"nodes":[],"links":[]};
  var count = counter(), rel, arr = [], colors, ff = false;

  for (var i = 0; i <= count-1; i++){
    arr[i] = [];
    for (var j = 0; j <= count-1; j++){
      arr[i][j] = 0;
    }
  }

  $('.checked').each(function(a){
    rel = $(this).data('rel');
    ff = true;
    arr[parseInt(rel.s)][parseInt(rel.t)] = 1;
    json.links.push({"source":rel.s,"target":rel.t});
  });
  //colorizing(arr)
  colors = ff ? colorizing([
  [0, 1, 1, 0, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 0, 0],
  [0, 1, 0, 1, 1, 0, 0]
]) : arr[0];
  console.log(colors)

  for (var i = 1; i <= count; i++){
    json.nodes.push({"name":i,"group":colors[i-1]});
  }

  mainDraw(json);
};

function colorizing(a){
  var color = new Array(a.length);
  var degree = new Array(a.length);
  var NN = new Array(a.length);
  var NNCount = 0;
  var unprocessed = a.length;

  for (var i=0; i<a.length; i++){
    color[i] = 0;
    degree[i] = 0;
    for (var j = 0; j<a.length; j++){
      if (a[i][j] == 1){
        degree[i] ++;
      }
    }
  }

  // this function finds the unprocessed vertex of which degree is maximum
  var MaxDegreeVertex = function(){
    var max = -1;
    var max_i;
    for (var i =0; i<a.length; i++){
      if (color[i] == 0){
        if (degree[i]>max){
          max = degree[i];
          max_i = i;
        }
      }
    }
    return max_i;
  };

  // this function updates NN array
  var UpdateNN = function(ColorNumber){
    NNCount = 0;
    for (var i=0; i<a.length; i++){
      if (color[i] == 0){
        NN[NNCount] = i;
        NNCount ++;
      }
    }
    for (var i=0; i<a.length; i++){
      if (color[i] == ColorNumber){
        for (var j=0; j<NNCount; j++){
          while (a[i][NN[j]] == 1){
            NN[j] = NN[NNCount - 1];
            NNCount --;
          }
        }
      }
    }
  };
  // this function will find suitable y from NN
  var FindSuitableY = function(ColorNumber,VerticesInCommon){
    var temp,tmp_y,y = 0,ColorNumber;
    var scanned = new Array(a.length);
    VerticesInCommon = 0;
    for (var i=0; i<NNCount; i++) {
      tmp_y = NN[i];
      temp = 0;
      // this function is for UpdateNN function
      // it reset the value of scanned array
      for (var i=0; i<a.length; i++){
        scanned[i] = 0;
      };
      for (var x=0; x<a.length; x++){
        if (color[x] == ColorNumber){
          for (var k=0; k<a.length; k++){
            if (color[k] == 0 && scanned[k] == 0){
              if (a[x][k] == 1 && a[tmp_y][k] == 1){
                temp ++;
                scanned[k] = 1;
              }
            }
          }
        }
      }
      if (temp > VerticesInCommon){
        VerticesInCommon = temp;
        y = tmp_y;
      }
    }
    return [y,VerticesInCommon];
  };
  // find the vertex in NN of which degree is maximum
  var MaxDegreeInNN = function(){
    var tmp_y = 0;
    var temp, max = 0;
    for (var i=0; i<NNCount; i++){
      temp = 0;
      for (var j=0; j<a.length; j++){
        if (color[NN[j]] == 0 && a[i][NN[j]] == 1){
          temp ++;
        }
      }
      if (temp>max){
        max = temp;
        tmp_y = NN[i];
      }
    }
    return tmp_y;
  };
  // processing function
  var Coloring = function(){
    var x,y;
    var result;
    var ColorNumber = 0;
    var VerticesInCommon = 0;
    while (unprocessed>0){
      x = MaxDegreeVertex();
      ColorNumber ++;
      color[x] = ColorNumber;
      unprocessed --;
      UpdateNN(ColorNumber);
      while (NNCount>0){
        result = FindSuitableY(ColorNumber, VerticesInCommon);
        y = result[0];
        VerticesInCommon = result[1];
        if (VerticesInCommon == 0){
          y = MaxDegreeInNN();
        }
        color[y] = ColorNumber;
        unprocessed --;
        UpdateNN(ColorNumber);
      }
    }
  };
  // print out the output
  var PrintOutput = function(){
    for (var i=0; i<a.length; i++){
      console.log("Vertex " + (i+1) + " is colored " + color[i]);
    }
  };
  //console.log(a)

  Coloring();
  PrintOutput();
  return color
};

/*colorizing([
  [0, 1, 1, 0, 1, 1, 0],
  [1, 0, 0, 1, 0, 1, 1],
  [1, 0, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 0, 1, 1],
  [1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 0, 0],
  [0, 1, 0, 1, 1, 0, 0]
])*/