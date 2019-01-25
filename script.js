const _gridWidthDefault = 30;
var _gridWidth = _gridWidthDefault;
const _gridHeightDefault = 15;
var _gridHeight = _gridHeightDefault;
const _nodeSizeDefault = 25;
var _nodeSize = _nodeSizeDefault;
const _opTimeDefault = 2000;
var _opTime = _opTimeDefault;

var _breakAnimation = false;
var _animationRunning = false;
var _frameList = [];

//////////

var materialTypes = {
	"air": {
		name: "air",
		color: "none",
		rarity: 1
	},
	"rock": {
		name: "rock",
		color: "#777",
		rarity: .2
	},
	"dirt": {
		name: "dirt",
		color: "f94",
		rarity: .2
	},
	"ore": {
		name: "ore",
		color: "f44",
		rarity: .05
	},
	"water": {
		name: "water",
		color: "#66f",
		rarity: .1
	}
}

var _env = {	//Frame template for the playing environment
	_frameType: "env",
	grid: [],
	fill: function(){
		grid = [];
		for(var y = 0; y < _gridHeight; y++){
			this.grid.push([]);
			for(var x = 0; x < _gridWidth; x++){
				this.grid[y].push([]);

				let keys = Object.keys(materialTypes);

				do{
					var index = Math.floor(Math.random() * keys.length);
					var randV = Math.random();
					var mat = materialTypes[keys[index]];
				}while(randV >= mat.rarity);

				this.grid[y][x] = mat;
			}
		}

		this.grid[_gridHeight-1][_gridWidth-1] = materialTypes.air;

		_queue(this);
		_animate();
	}
}

var _ui = {	//Frame template for the console, inventory
	_frameType: "io",
	console: "",	//Text TO BE ADDED on next frame, not the live total
	wipeConsole: function(){
		$("#console").empty();
	},
	inventory: {
	},
	wipeInv: function(){
		for(var name in materialTypes){
			if(name == "air") continue;
			_ui.inventory[name] = {
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

function Turtle(){	//Turtle constructor (and frame template)
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
		_pos: {
			x: _gridWidth-1,
			y: _gridHeight-1,
			d: 0,
		},
		x: function(){
			return this._pos.x;
		},
		y: function(){
			return this._pos.y;
		},
		d: function(){
			return _normDir(this._pos.d);
		},
		r: function(num){
			for(var i = 0; i < (num || 1); i++){
				this._pos.d++;
				_queue(this);
			}
		},
		l: function(num){
			for(var i = 0; i < (num || 1); i++){
				this._pos.d--;
				_queue(this);
			}
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
		face: function(side){
			side = _normDir(side);
			if(side == this.d()) return;

			var diff = side - this.d();

			if(diff > 2){
				this._pos.d--;
			} else{
				this._pos.d += diff;
			}
			_queue(this);
		},
		dig: function(){
			var t = this.inspect(0);

			try{
				if(t.name == "wall") throw new Error("");

				_ui.inventory[t.name].quantity++;
				_env.grid[t.y][t.x] = materialTypes.air;

				_queue(_ui);

			} catch(e){
				// console.log(e);
				// console.log("Couldn't dig " + ty + "," + tx + " " + e);	//If out of bounds
			}

			_queue(_env);
		},
		inspect: function(side){	//Get the node from a position and direction, given a query side
			var mat;
			var ty = this._pos.y;
			var tx = this._pos.x;

			var points = [
				{x: 0,y: -1},
				{x: 1,y: 0},
				{x: 0,y: 1},
				{x: -1,y: 0}
			]

			var actual = _normDir(side + this.d());

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
		put: function(name){
			var t = this.inspect(0);
			if(t.name != "air") return false;
			else _env.grid[t.y][t.x] = materialTypes[t.name];
		}
	}

	return turtle;
}

$("#run").click(async function(){
	if(_animationRunning){
		_print("Already Running");
		return;
	} else{
		_animationRunning = true;

		_frameList = [];

		$(".turtle").remove();

		_ui.wipeConsole();
		_ui.wipeInv();

		_print("Starting");

		eval($("#input").val());	//TODO: Can this be asyncrhonous?

		// console.log("Evaluation complete. Starting animation...");
		_indicateAnimationActive(true);	//Wait until parsing has completed to change (held green: parsing, grey: running)

		_animate();
	}
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

	const lastDir = 0;
	while(_frameList.length > 0){
		var frame = _frameList.shift();

		switch(frame._frameType){
			case "turtle":

				frame.obj.animate({
					deg: frame._pos.d * 90,
					top: frame._pos.y * _nodeSize,
					left: frame._pos.x * _nodeSize,
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
				$("#console").html($("#console").html() + frame.console);
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

function _mv(direction, obj){	//Move a turtle
	var succ;

	var side;
	if(direction == 1) side = 0;
	if(direction == -1) side = 2;

	var target = obj.inspect(side);

	if(target.name == "air"){
		obj._pos.x = target.x;
		obj._pos.y = target.y;
	} else{
		succ = false;
	}

	_queue(obj);

	return succ;
}

//////// Misc

function _queue(obj){
	var deref = _clone(obj);

	_frameList.push(deref);
}

function _clone(obj){	//TODO: Make sure this is an actual static deep copy
	return $.extend(true, {}, obj)
}

function _delay(ms){	//Use in async (duh)
	return new Promise(function(res, rev){
		setTimeout(function(){
			res();
		}, ms);
	});
}

function _normDir(d){
	a = d % 4;
	if(a < 0) a += 4;

	return a;
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
