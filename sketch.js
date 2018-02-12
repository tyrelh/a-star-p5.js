
var difficulty = 0.3; // between 0 and 1
var cols = 44;
var rows = 30;
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
	createCanvas(windowWidth, windowHeight);
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
         //console.log(grid[i][j]);
		}
	}
	for (var i = 0; i < cols; i++) { // soo inefficient
		for (var j = 0; j < rows; j++) {
			grid[i][j].addNeighbours(grid);
		}
	}
   // arbitrary start and end points
	//start = grid[floor(random(0, cols/2))][floor(random(0, rows/2))];
   //end = grid[floor(random(cols/2, cols))][floor(random(rows/2, rows))];
   // corner start and end points
   start = grid[2][2];
   end = grid[cols-2][rows-2]
   // haxx
   start.wall = false;
   end.wall = false;
   startNeighbors = start.neighbors;
   endNeighbors = end.neighbors;
   for (var i = 0; i < 4; i++) {
      startNeighbors[i].wall = false;
      endNeighbors[i].wall = false;
   }
	// start at the start Cell
	openSet.push(start);
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
			if (!neighbor.wall && !closedSet.includes(neighbor)) {
            var tempG = current.g + 1;
            var shorter = true;
				// check if already eval with lower g score
				if (openSet.includes(neighbor)) {
					if (tempG > neighbor.g) {
                  shorter = false;
					}
				}
				// in not in either set, add to open set
				else {
					openSet.push(neighbor);
				}
				// TODO: refactor these into if above
            // this is the current best path, record it
            if (shorter) {
               neighbor.g = tempG;
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
			grid[i][j].show(color(19, 17, 25));
		}
	}
	// color cells in closed set blue
   for (var i = 0; i < closedSet.length; i++) {
   	closedSet[i].show(color(35, 76, 115))
   }
	// // color cells in open set pink
	for (var i = 0; i < openSet.length; i++) {
		openSet[i].show(color(108, 47, 121))			
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
   // color cells of current path
   // for (var i = 0; i < path.length; i++) {
   //    path[i].show(color(20, 40, 120));
   // }
   // draw continuous shape along path
   noFill();
   stroke(255);
   strokeWeight(w/1.4);
   beginShape();
   for (var i = 0; i < path.length; i++) {
	   vertex(path[i].x * w + w / 2, path[i].y * h + h / 2);
   }
   endShape();
}
