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

				do{
					var index = Math.floor(Math.random() * this.materialTypes.length);
					var randV = Math.random();
					var mat = this.materialTypes[index];
				}while(randV >= mat.rarity);

				this.grid[y][x] = mat;
			}
		}

		this.grid[_gridHeight-1][_gridWidth-1] = this.materialTypes[0];

		_queue(this);
		_animate();
	},
	materialTypes: [	//Solids only.
		{
			name: "air",
			color: "none",
			rarity: 1
		},
		{
			name: "rock",
			color: "#777",
			rarity: .2
		},
		{
			name: "dirt",
			color: "f94",
			rarity: .2
		},
		{
			name: "ore",
			color: "f44",
			rarity: .05
		},
		{
			name: "water",
			color: "#66f",
			rarity: .1
		}
	]
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
			if(mat.name == "air") continue;
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
	var elem = $("#speedSlider input");
	var divisor = elem.val();
	_opTime = _opTimeDefault / divisor;

	var text = "" + divisor;

	while(text.length < 2){
		text = "0" + text;
	}

	if(parseInt(text) == elem.attr("max")){
		text = "&nbsp;&infin;&nbsp;";
		_opTime = 0;
	} else{
		text += "X";
	}

	$("#speedSlider .sliderReadout").html(text);
});

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

function Turtle(){	//Turtle constructor
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
			d: 0,	//unbounded - may be > 3 or < 0
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
			var t = this.inspect(0);

			try{
				if(t.name == "wall") throw new Error("");

				_ui.inventory[t.name].quantity++;
				_env.grid[t.y][t.x] = _env.materialTypes[0];

				_queue(_ui);

			} catch(e){
				// console.log(e);
				// console.log("Couldn't dig " + ty + "," + tx + " " + e);	//If out of bounds
			}

			_queue(_env);
		},
		inspect: function(side){	//Get the node from a position and direction, given a query side
			var mat;
			var ty = this.pos.y;
			var tx = this.pos.x;

			var points = [
				{x: 0,y: -1},
				{x: 1,y: 0},
				{x: 0,y: 1},
				{x: -1,y: 0}
			]

			var actual = (side+this.pos.d) % 4;
			if(actual < 0) actual += 4;

			tx += points[actual].x;
			ty += points[actual].y;

			try{
				mat = _env.grid[ty][tx].name;
				if(mat == undefined) throw new Error("Also wall, just a special kind.");
			} catch(e){
				mat = "wall";
			}

			return {
				name: mat,
				y: ty,
				x: tx
			}
		},
		put: function(){

		}
	}

	return turtle;
}

$("#run").click(async function(){
	if(_animationRunning){
		// console.log("Already running");
		return;
	}

	_frameList = [];

	$(".turtle").remove();

	_ui.wipeConsole();
	_ui.wipeInv();

	eval($("#input").val());	//TODO: Can this be asyncrhonous?

	// console.log("Evaluation complete. Starting animation...");
	_indicateAnimationActive(true);	//Wait until parsing has completed to change (held green: parsing, grey: running)

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
						var node = frame.grid[y][x];
						var elem = $(document.createElement("div"));
						elem.addClass("materialNode");

						elem.css("top", y * _nodeSize);		//Known at runtime
						elem.css("left", x * _nodeSize);	//
						elem.css("width", _nodeSize);		//
						elem.css("height", _nodeSize);		//

						elem.css("background-color", node.color);

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

	// console.log(">>> Animated " + totalFrames + " frame(s)");

	_indicateAnimationActive(false);
}

// Turtle Logic Evaluation Functionset

function _rot(direction, obj){	//Rotate a turtle
	obj.pos.d += direction;
	_queue(obj);
}

function _mv(direction, obj){	//Move a turtle
	var succ;

	var side;
	if(direction == 1) side = 0;
	if(direction == -1) side = 2;

	var target = obj.inspect(side);

	if(target.name == "air"){
		obj.pos.x = target.x;
		obj.pos.y = target.y;
	} else{
		succ = false;
	}

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
