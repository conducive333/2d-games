//Game variables
var [xv, yv] = [0, 0];	//player's x and y velocities
var [player_x_pos, player_y_pos] = [10, 10];
var [apple_x_pos, apple_y_pos] = [15, 15];
var [grid_size, tile_count] = [0, 0];
var trail = [];
var tail = 5;
var longest_tail = 5;
var winning_length = 20;
var lives = 3;
var repeat_mode = false;
var snake_color = '#42bcf4';
var apple_color = '#fff';
var game_over_msg = "Game over!";
var win_msg = "You win!";
var updated = false;
var paused = true;

//Initialzes the game
$(document).ready(function(){
	canvas = document.getElementById("snake_game_canvas");
	context = canvas.getContext('2d');
	grid_size = Math.sqrt(canvas.width);
	tile_count = Math.sqrt(canvas.height);
	refresh_game_data();
	interval = setInterval(update, 1000/15);
	document.addEventListener('keydown', keyPush); //Start game on keydown
	//Pause or resume game
	$("#snake_continuity_btn").on('click', function () {
		if(!$("#snake_start_msg").is(":visible") && $("#snake_game_text").text() != game_over_msg && $("#snake_game_text").text() != win_msg) { //The user shouldn't be able to pause or resume when the game is over
			if(paused) {
				$("#snake_game_text").text("");
				paused = false;
				interval = setInterval(update, 1000/15);
			}
			else {
				$("#snake_game_text").text("Paused").show();
				paused = true;
				clearInterval(interval);
			}
		}
	});
	//Update game variables with user's input when the update button is clicked
	$("#snake_update_btn").on('click', function () {
		updated = true;
		print("snake_game_text", "Updated!");
        init_winning_length = check_int(parseInt($(".snake_win_len").val()), 20, 0);
        winning_length = init_winning_length;
		init_lives = check_int(parseInt($("#snake_user_lives").val()), 3, 0);
		lives = init_lives;
        init_tail = check_int(parseInt($("#snake_len").val()), 5, 0);
        tail = init_tail;
        init_snake_color = check_hex_code($("#snake_color").val(), snake_color);
        snake_color = init_snake_color;
        init_apple_color = check_hex_code($("#apple_color").val(), apple_color);
        apple_color = init_apple_color;
        repeat_mode = $("input[name=tail_repeat]:checked").val() == "true";
    	refresh_game_data();
	});
	//Restore game variables to original values
	$("#snake_default_btn").on('click', function () {
		print("snake_game_text", "Updated!");
		winning_length = 20;
		lives = 3;
		tail = 5;
		snake_color = '#42bcf4';
		apple_color	= '#fff';
		$("input[type=text], textarea").val("");
		$("input[name=tail_repeat]").prop("checked", false);
	});
	//Clear all input fields
	$("#snake_clear_btn").on('click', function () {
		$("input[type=text], textarea").val("");
		$("input[name=tail_repeat]").prop("checked", false);
	});
	//Reset the game with user's settings. If the user hasn't changed any settings, use the current settings. This doesn't reset the longest recorded length or repeat mode.
	$("#snake_reset_btn").on('click', function () {
		$("#snake_game_text").text("");
		$("#snake_start_msg").show();
		[xv, yv] = [0, 0];
		[player_x_pos, player_y_pos] = [10, 10];
		[apple_x_pos, apple_y_pos] = [15, 15];
		trail = [];
		tail = updated ? init_tail : 5;
		winning_length = updated ? init_winning_length : 20;
		lives = updated ? init_lives : 3;
		snake_color = updated ? init_snake_color : snake_color;
		apple_color = updated ? init_apple_color : apple_color;
		paused = true;
		//Refresh game
		refresh_game_data();
		draw();
		clearInterval(interval);
		interval = setInterval(update, 1000/15);
	});
});

//Ends the game
function game_over(msg) {
	$("#snake_game_text").text(msg.toString()).show();
	paused = true;
	clearInterval(interval);
}

//Primary game mechanics
function update() {
	//Adjusts player speed
	player_x_pos += xv;
	player_y_pos += yv;
	//Handles the situation in which the player falls off the board
	if(player_x_pos < 0) {
		player_x_pos = tile_count - 1;
	}
	if(player_x_pos > tile_count - 1) {
		player_x_pos = 0;
	}
	if(player_y_pos < 0) {
		player_y_pos = tile_count - 1;
	}
	if(player_y_pos > tile_count - 1) {
		player_y_pos = 0;
	}
	//Creates game board
	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);
	//Snake mechanics
	context.fillStyle = snake_color;
	for(var i = 0; i < trail.length; i++) {
		context.fillRect(trail[i].x*grid_size, trail[i].y*grid_size, grid_size - 2, grid_size - 2);
		if($("#snake_start_msg").is(":hidden") && trail[i].x == player_x_pos && trail[i].y == player_y_pos) {	//If the snake eats itself
			if(repeat_mode) {
				tail = 5;		//reset tail length to 5 on repeat mode
			} 
			else {
				lives -= 1;
				if(lives <= 0) {																					
					game_over(game_over_msg);
				}
			}
		}
	}
	trail.push({x : player_x_pos, y : player_y_pos});
	while(trail.length > tail) {
		trail.shift();
	}
	//If the player eats the apple
	if(player_x_pos == apple_x_pos && player_y_pos == apple_y_pos) {
		tail++;												//Increase tail length
		if(longest_tail < tail) {							//Update longest recorded length if necessary
			longest_tail = tail;
		}
		if(tail >= winning_length) {
			game_over(win_msg);
		}
		apple_x_pos = Math.floor(Math.random()*tile_count);	//Select a new and random x-coord for the apple
		apple_y_pos = Math.floor(Math.random()*tile_count); //Select a new and random y-coord for the apple
	}
	//Prints the apple
	context.fillStyle = apple_color;
	context.fillRect(apple_x_pos*grid_size, apple_y_pos*grid_size, grid_size - 2, grid_size - 2);
	refresh_game_data();
	//Prints game data on the board
	// context.fillText("Current length: " + tail.toString(), 25, 25);
	// context.fillText("Longest length: " + longest_tail.toString(), 25, 40);
	// context.fillText("Lives: " + lives.toString(), 25, 55);
}

//Snake directions
function keyPush(event) {
	if(event.keyCode >= 37 && event.keyCode <= 40) {
		$("#snake_start_msg").hide();
		paused = false;
		switch(event.keyCode) {
			case 37:
				if(xv === 1){
					break;
				}
				xv = -1;
				yv = 0;
				break;
			case 38:
				if(yv === 1){
					break;
				}
				xv = 0;
				yv = -1;
				break;
			case 39:
				if(xv === -1){
					break;
				}
				xv = 1;
				yv = 0;
				break;
			case 40:
				if(yv === -1){
					break;
				}
				xv = 0;
				yv = 1;
				break;
		}
	}
}

//Re-draw player and apple at their starting positions
function draw() {
	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = snake_color;
	context.fillRect(player_x_pos*grid_size, player_y_pos*grid_size, grid_size - 2, grid_size - 2);
	context.fillStyle = apple_color;
	context.fillRect(apple_x_pos*grid_size, apple_y_pos*grid_size, grid_size - 2, grid_size - 2);
}

//Error checking for input boxes
function check_hex_code(input, default_val) {
	if(input.match(/^#[0-9a-fA-f]{3,6}$/g) != null) {
		return input;
	}
	else {
		return default_val;
	}
}

//Error checking for input boxes
function check_int(input, default_val, noninclusive_lower_bound=Number.NEGATIVE_INFINITY, noninclusive_upper_bound=Number.POSITIVE_INFINITY) {
	if(!isNaN(input) && input > noninclusive_lower_bound && input < noninclusive_upper_bound) {
		return input;
	}
	else {
		return default_val;
	}
}

//Prints a temporary message on top of the game board
function print(id, msg, duration=500) {
	$("#" + id.toString()).stop(true, true);
	$("#" + id.toString()).text(msg);
	$("#" + id.toString()).fadeIn(duration);
	$("#" + id.toString()).fadeOut(duration);
}

//Refreshes game data in the right-hand box
function refresh_game_data() {
	$("#snake_current_len").text(tail);
	$("#snake_lives").text(lives);
	$("#snake_longest_len").text(longest_tail);
	$(".snake_win_len").text(winning_length);
}