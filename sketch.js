var difficulty = 0.2; // between 0 and 1
var cols = 40;
var rows = 40;
var grid = new Array(cols);
var startTime = 0;
var endTime = 0;

// sets are global only for demo purposes
var openSet = [];
var closedSet = [];
var start;
var end;
var w, h;
var path = [];

function removeFromArray (arr, ele) {
	// inefficient
	for (var i = arr.length - 1; i >= 0; i--) {
		if (arr[i] == ele) {
			arr.splice(i, 1);
		}
	}
}

function heuristic (a, b) {
	// euclidian distance
   //return dist(a.x, a.y, b.x, b.y);
   // manhattan distance
   return (abs(a.x - b.x) + abs(a.y - b.y));
}

function Cell(_x, _y) {
	this.x = _x;
	this.y = _y;
	this.f = 0;
	this.g = 0;
	this.h = 0;
   this.neighbors = [];
   this.previous = undefined;
   // randomly set cells to be walls
   this.wall = false;
   if (random(1) < difficulty) {
      this.wall = true;
   }
	this.show = function(colr) {
      fill(colr);
      if (this.wall) {
         fill(0)
      }
		noStroke();
		rect(this.x * w, this.y * h, w - 1, h - 1);
	}
	this.addNeighbours = function(grid) {
		if (this.x < cols - 1) {
			this.neighbors.push(grid[this.x + 1][this.y]);
		}
		if (this.x > 0) {
			this.neighbors.push(grid[this.x - 1][this.y]);
		}
		if (this.y < rows - 1) {
			this.neighbors.push(grid[this.x][this.y + 1]);
		}
		if (this.y > 0) {
			this.neighbors.push(grid[this.x][this.y - 1]);
		}
	}
}

function setup() {
   startTime = millis();
	createCanvas(370, 370);
	// set dimentions for drawing
	w = width / cols;
	h = height / rows;
	// Make a 2d array of Cells
	for (var i = 0; i < cols; i++) {
		grid[i] = new Array(rows);
	}
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j] = new Cell(i,j);
		}
	}
	for (var i = 0; i < cols; i++) { // soo inefficient
		for (var j = 0; j < rows; j++) {
			grid[i][j].addNeighbours(grid);
		}
	}
	// arbitrary start and end points
	start = grid[floor(random(rows))][floor(random(cols))];
   end = grid[floor(random(rows))][floor(random(cols))];
   // haxx
   start.wall = false;
   end.wall = false;
	// start at the start Cell
	openSet.push(start);

	console.log(grid);
}

function draw() {
	background(0);
	// utilizing draw for a* loop
	if (openSet.length > 0) {
		// keep going
		var lowestIndex = 0;
		// find cell with lowest f score
		for (var i = 0; i < openSet.length; i++) {
			if (openSet[i].f < openSet[lowestIndex].f) {
				lowestIndex = i;
			}
		}
		var current = openSet[lowestIndex];
		// if the best f score is the end, optimal path found
		if (current == end) {
         noLoop();
         endTime = millis();
         var runTime = endTime - startTime;
         console.log("DONE!")
         console.log("It took " + runTime + "ms.")
		}
		// update sets
		removeFromArray(openSet, current);
		closedSet.push(current);
		// check every neighbor
		var neighbors = current.neighbors;
		for (var i = 0; i < neighbors.length; i++) {
			var neighbor = neighbors[i];
			// if neighbor has not already been evaluated
			if (!closedSet.includes(neighbor) && !neighbor.wall) {
            var tempG = current.g + 1;
            var newPath = false;
				// check if already eval with lower g score
				if (openSet.includes(neighbor)) {
					if (tempG < neighbor.g) {
                  neighbor.g = tempG;
                  newPath = true;
					}
				}
				// in not in either set, add to open set
				else {
               neighbor.g = tempG;
               newPath = true;
					openSet.push(neighbor);
				}
				// TODO: refactor these into if above
            // this is the current best path, record it
            if (newPath) {
               neighbor.h = heuristic(neighbor, end);
               neighbor.f = neighbor.g + neighbor.h;
               neighbor.previous = current;
            }
			}
			
		}
	} else {
      // no solution
      console.log("No solution")
      noLoop();
      return;
	}
	// color cells initially as background
	for (var i = 0; i < cols; i++) {
		for (var j = 0; j < rows; j++) {
			grid[i][j].show(color(19,17,25));
		}
	}
	// color cells in closed set red
	for (var i = 0; i < closedSet.length; i++) {
		closedSet[i].show(color(150,30,40))
	}
	// color cells in open set green
	for (var i = 0; i < openSet.length; i++) {
		openSet[i].show(color(20,120,40))			
   }
   start.show(255);
   end.show(255);
   // find the path
   path = [];
   var temp = current;
   path.push(temp);
   while (temp.previous) {
      path.push(temp.previous);
      temp = temp.previous;
   }
   for (var i = 0; i < path.length; i++) {
      path[i].show(color(20, 40, 120));
   }
}