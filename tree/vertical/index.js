;(function() {

  'use strict';

  var margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
  };
  var width = 960 - margin.right - margin.left;
  var height = 800 - margin.top - margin.bottom;
  var i = 0, duration = 750, root;

  var tree = d3.layout.tree()
    .size([height, width]);

  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

  var svg = d3.select("body").append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    // .attr("width", width + margin.right + margin.left)
    // .attr("height", height + margin.top + margin.bottom)
    .attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    // .attr("transform", "translate(" + margin.left + ", 40" + ")");
    .attr("transform", "translate(0, 40)");
    // .attr("transform", "translate(0, 50%)");


  var data = {
    "fname": "Rachel",
    "lname": "Rogers",
    "title": "CEO",
    "photo": "http://lorempixel.com/60/60/cats/1",
    "children": [{
      "fname": "Bob",
      "lname": "Smith",
      "title": "President",
      "photo": "http://lorempixel.com/60/60/cats/2",
      "children": [{
        "fname": "Mary",
        "lname": "Jane",
        "title": "Vice President",
        "photo": "http://lorempixel.com/60/60/cats/3",
        "children": [
          {
          "fname": "Bill",
          "lname": "August",
          "title": "Dock Worker",
          "photo": "http://lorempixel.com/60/60/cats/4"
          },
          {
          "fname": "Reginald",
          "lname": "Yoyo",
          "title": "Line Assembly",
          "photo": "http://lorempixel.com/60/60/cats/5"
          },
          {
            "fname": "Reginald",
            "lname": "Yoyo",
            "title": "Line Assembly",
            "photo": "http://lorempixel.com/60/60/cats/5"
          },
          {
            "fname": "Reginald",
            "lname": "Yoyo",
            "title": "Line Assembly",
            "photo": "http://lorempixel.com/60/60/cats/5"
          }
        ]
      }, {
        "fname": "Nathan",
        "lname": "Ringwald",
        "title": "Comptroller",
        "photo": "http://lorempixel.com/60/60/cats/6",
        "children": [{
            "fname": "Reginald",
            "lname": "Yoyo",
            "title": "Line Assembly",
            "photo": "http://lorempixel.com/60/60/cats/5"
          }]
      }]
    }]
  };

  root = data;
  root.x0 = height / 2;
  root.y0 = 0;

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // update the nodes
    var node = svg.selectAll('g.node')
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
      .on("click", click);

    // add picture
    nodeEnter
      .append('defs')
      .append('pattern')
      .attr('id', function(d) {
        return 'pic_' + d.fname + d.lname;
      })
      .attr('height',60)
      .attr('width',60)
      .attr('x',0)
      .attr('y',0)
      .append('image')
      .attr('xlink:href',function(d) {
        return d.photo;
      })
      .attr('height',60)
      .attr('width',60)
      .attr('x',0)
      .attr('y',0);

    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    var g = nodeEnter.append("g");

    g.append("text")
      .attr("x", function(d) { return d.children || d._children ? -35 : 35; })
      .attr("dy", "1.35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.fname + " " + d.lname; })
      .style("fill-opacity", 1e-6);

    g.append("text")
      .attr("x", function(d) { return d.children || d._children ? -35 : 35; })
      .attr("dy", "2.5em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.title; })
      .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    nodeUpdate.select("circle")
      .attr("r", 6)
      .style("fill", function(d,i){
        return 'url(#pic_' + d.fname + d.lname+')';
      });

    nodeUpdate.selectAll("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  root.children.forEach(collapse);
  update(root);

})();