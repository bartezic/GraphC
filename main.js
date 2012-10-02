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
    var count = counter(), rel;

    for (var i = 1; i <= count; i++){
      json.nodes.push({"name":i,"group":i});
    }
    $('.checked').each(function(a){
      rel = $(this).data('rel');
      json.links.push({"source":rel.s,"target":rel.t});
    });

    mainDraw(json);
  }
});