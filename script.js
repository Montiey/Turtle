const _gridWidthDefault = 30;
var _gridWidth = _gridWidthDefault;
const _gridHeightDefault = 15;
var _gridHeight = _gridHeightDefault;
const _nodeSizeDefault = 25;
var _nodeSize = _nodeSizeDefault;
const _opTimeDefault = 500;
var _opTime = _opTimeDefault;

var _breakAnimation = false;
var _animationRunning = false;
var _frameList = [];

//////////

var _env = {
	_frameType: "env",
	grid: [],
	fill: function(){
		grid = [];
		for(var y = 0; y < _gridHeight; y++){
			this.grid.push([]);
			for(var x = 0; x < _gridWidth; x++){
				this.grid[y].push([]);

				var index = Math.floor(Math.random() * this.materialTypes.length);
				var randMat;
				if(Math.random() > .5){
					randMat = this.materialTypes[index];
				} else{
					randMat = {
						name: "air",
						color: "none"
					};
				}

				this.grid[y][x] = randMat;
			}
		}

		this.grid[_gridHeight-1][_gridWidth-1] = this.air;

		_queue(this);
		_animate();
	},
	materialTypes: [	//Solids only.
		{
			name: "rock",
			color: "#777"
		},
		{
			name: "dirt",
			color: "f94"
		},
		{
			name: "ore",
			color: "f44"
		},
		{
			name: "water",
			color: "#66f"
		}
	],
	air: {	//for reference
		name: "air",
		color: "none"
	}
}

var _ui = {
	_frameType: "io",
	console: "",	//Text TO BE ADDED on next frame, not the live total
	wipeConsole: function(){
		$("#console").empty();
	},
	inventory: {
	},
	wipeInv: function(){
		for(var mat of _env.materialTypes){
			_ui.inventory[mat.name] = {
				quantity: 0
			}
		}
		_queue(this);
		_animate();
	}
}

_env.fill();
_ui.wipeInv();
_inv(_ui.inventory);
_initNodes();

function _indicateAnimationActive(b){
	if(b){
		_animationRunning = true;
		$("#run").addClass("disabled");
	} else{
		_animationRunning = false;
		$("#run").removeClass("disabled");
	}
}

$("#input").val(localStorage.getItem("script"));
$("#input").change(function(){
	console.log("Saved!");
	_print("Saved");
	localStorage.setItem("script", $("#input").val());
});

function _initNodes(){
	$("#map").width(_nodeSize * _gridWidth);
	$("#map").css("min-width", _nodeSize * _gridWidth);
	$("#map").height(_nodeSize * _gridHeight);
	$("#map").css("background-size", _nodeSize);

	$("#start").width(_nodeSize);
	$("#start").height(_nodeSize);
	$("#start").css("top", _nodeSize * (_gridHeight-1));
	$("#start").css("left",  _nodeSize * (_gridWidth-1));
}

$("#speedSlider input").on("input", function(){
	var divisor = $("#speedSlider input").val();
	_opTime = _opTimeDefault / divisor;

	var text = "" + divisor;

	while(text.length < 2){
		text = "0" + text;
	}

	$("#speedSlider .sliderReadout").text(text + "x");
});

// $("#sizeSlider input").on("change", function(){
// 	var newSize = $("#sizeSlider input").val();
// 	_nodeSize = newSize;
//
// 	newSize = "" + newSize;
//
// 	while(newSize.length < 3){
// 		newSize = "0" + newSize;
// 	}
//
// 	$("#sizeSlider .sliderReadout").text(newSize + "px");
// 	_initNodes();
// });

$(document).delegate("#input", "keydown", function(e){	//Get tabs into the textarea
  var code = e.keyCode || e.which;
  if (code == 9) {
    e.preventDefault();
    var start = this.selectionStart;
    var end = this.selectionEnd;

    $(this).val(
		$(this).val().substring(0, start) + "\t" + $(this).val().substring(end)
	);

    this.selectionStart =
    this.selectionEnd = start + 1;
  }
});

////////////////////////////
////////////////////////////

function Turtle(){
	var createdTurtle = $(document.createElement("div"));
	createdTurtle.addClass("turtle");
	createdTurtle.width(_nodeSize);
	createdTurtle.height(_nodeSize);
	createdTurtle.css("top", _nodeSize* (_gridHeight-1));
	createdTurtle.css("left", _nodeSize * (_gridWidth-1));
	$("#map").append(createdTurtle);

	var turtle = {
		_frameType: "turtle",
		obj: createdTurtle,
		pos: {
			x: _gridWidth-1,
			y: _gridHeight-1,
			d: 0,
		},
		// rgb: function(){
		// 	this.color = "hsl(" + Math.floor(Math.random()*360) + ", 100%, 50%)";
		// 	_queue(this);
		// },
		r: function(num){
			for(var i = 0; i < (num || 1); i++){
				_rot(1, this);
			}
		},
		l: function(num){
			for(var i = 0; i < (num || 1); i++) _rot(-1, this);
		},
		f: function(num){
			var succ = true;
			for(var i = 0; i < (num || 1); i++){
				succ = _mv(1, this) && true;
			}
			return succ;
		},
		b: function(num){
			var succ = true;
			for(var i = 0; i < (num || 1); i++){
				succ = _mv(-1, this) && true;
			}
			return succ;
		},
		dig: function(){
			var tx = this.pos.x;
			var ty = this.pos.y;

			var reg = this.pos.d % 4;
			if(reg < 0) reg += 4;

			switch(reg){
				case 0:
					ty --;
					break;
				case 1:
					tx ++;
					break;
				case 2:
					ty ++;
					break;
				case 3:
					tx --;
					break;
				default:
					break;
			}

			try{
				var got = _env.grid[ty][tx];
				_ui.inventory[got.name].quantity++;
				_env.grid[ty][tx] = _env.air;

				_queue(_ui);

			} catch(e){
				// console.log("Couldn't dig " + ty + "," + tx + " " + e);	//If out of bounds
			}

			_queue(_env);
		},
		inspect: function(side){	//Given the turtle's position and diretion, do stuff (the basis for some other spatial logistics)
			var mat;
			var ty = this.pos.y;
			var tx = this.pos.x;

			var points = [
				{x: 0,y: -1,},
				{x: 1,y: 0},
				{x: 0,y: 1},
				{x: -1,y: 0}
			]

			var actual = (side+this.pos.d) % 4;
			if(actual < 0) actual += 4;

			// console.log("Turtle d: " + this.pos.d + " and query d: " + side + "..Getting from real side: " + actual);

			tx += points[actual].x;
			ty += points[actual].y;

			// console.log("Transformation: " + this.pos.y + "," + this.pos.x + "-" + this.pos.d + ": " + ty + "," + tx);

			try{
				mat = _env.grid[ty][tx].name;
				if(mat == undefined) throw new Error("Also wall, just a special kind.");
			} catch(e){
				mat = "wall";
			}

			return {
				name: mat,
				pos: {
					y: ty,
					x:tx,
				}
			}
		}
	}

	return turtle;
}

$("#run").click(async function(){
	if(_animationRunning){
		console.log("Already running");
		return;
	}

	_frameList = [];

	$(".turtle").remove();

	_ui.wipeConsole();
	_ui.wipeInv();

	function doEval(){
		eval($("#input").val());
	}
	doEval();
	console.log("Evaluation complete. Starting animation...");
	_indicateAnimationActive(true);	//Wait until parsing has completed (held green: parsing, grey: running)

	_animate();
});

$("#stop").click(function(){
	_indicateAnimationActive(false);
	_frameList = [];
	_env.fill();
	_ui.wipeInv();
	_ui.wipeConsole();

	$(".turtle").remove();
});

// Master Animation Function

async function _animate(){
	const totalFrames = _frameList.length;
	while(_frameList.length > 0){
		var frame = _frameList.shift();

		switch(frame._frameType){
			case "turtle":
				frame.obj.animate({
					deg: frame.pos.d * 90,
					top: frame.pos.y * _nodeSize,
					left: frame.pos.x * _nodeSize,
				}, {
					duration: _opTime,
					easing: "linear",
					step: function(now, fx){
						if(fx.prop == "deg") frame.obj.css("transform", "rotate(" + now + "deg)");
					}
				});

				await _delay(_opTime);

				frame.obj.finish();	//Otherwise, multiple .animate calls stack by a few millis each time, resulting in a significantly slow turtle
				break;
			case "env":
				$("#env").empty();
				for(var y = 0; y < _gridHeight; y++){
					for(var x = 0; x < _gridWidth; x++){
							var elem = $(document.createElement("div"));
							elem.addClass("materialNode");
							elem.css("top", y * _nodeSize);
							elem.css("left", x * _nodeSize);
							elem.css("width", _nodeSize);
							elem.css("height", _nodeSize);

							elem.css("background-color", frame.grid[y][x].color);

							$("#env").append(elem);
					}
				}
				break;
			case "io":
				$("#console").html(frame.console + $("#console").html());
				_inv(frame.inventory);
				break;
		}

		if(_breakAnimation){
			_breakAnimation = false;
			break;
		}
	}

	console.log(">>> Animated " + totalFrames + " frame(s)");

	_indicateAnimationActive(false);
}

// Turtle Logic Evaluation Functionset

function _rot(direction, obj){	//Rotate a turtle
	obj.pos.d += direction;	//Change the REAL turtle, then...
	_queue(obj);	//...save the state at this increment
}

function _mv(direction, obj){	//Move a turtle
	var reg = obj.pos.d % 4;
	if(reg < 0) reg += 4;

	var succ = true;

	var tx = obj.pos.x;
	var ty = obj.pos.y;

	switch(reg){
		case 0:
			ty -= direction;
			break;
		case 1:
			tx += direction;
			break;
		case 2:
			ty += direction;
			break;
		case 3:
			tx -= direction;
			break;
		default:
			break;
	}

	if(tx > _gridWidth-1){
		tx = _gridWidth-1;
		succ = false;
	} else if(tx < 0){
		tx = 0;
		succ = false;
	} else if(ty > _gridHeight-1){
		ty = _gridHeight-1;
		succ = false;
	} else if(ty < 0){
		ty = 0;
		succ = false;
	} else{
		if(_env.grid[ty][tx].name != _env.air.name){
			succ = false;
			tx = obj.pos.x;
			ty = obj.pos.y;
		}
	}

	obj.pos.x = tx;
	obj.pos.y = ty;

	_queue(obj);

	return succ;
}

//////// Misc

function _queue(obj){	//TODO: Make sure this is an actual static deep copy
	var deref = $.extend(true, {}, obj);

	_frameList.push(deref);
}

function _delay(ms){	//Use in async (duh)
	return new Promise(function(res, rev){
		setTimeout(function(){
			res();
		}, ms);
	});
}

function print(text){	//Queues text
	_ui.console = text + "<br>";
	_queue(_ui);
	_ui.console = "";	//Once queued, don't leave to be queued more than once
}

function _print(text){	//Immediately adds text
	$("#console").html($("#console").html() + ">>> <i>" + text + "</i><br>");
}

function _inv(inv){	//Adds DOM elements via inventory object
	$("#inventory").empty();
	for(var mat in inv){
		var elem = $(document.createElement("div"));
		elem.addClass("inventoryItem");
		elem.text(mat + ": " + inv[mat].quantity);

		$("#inventory").append(elem);
	}
}
