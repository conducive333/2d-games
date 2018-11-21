//Game variables
var ball_x_velocity = 0;
var ball_diameter = 20;
var obstacle_diameter = ball_diameter/2;
var zapper_width = 6;
var death_x_coordinate = zapper_width + ball_diameter/2 - 2;
var lives = 3;
var score = 0;
var high_score = 0;
var num_of_obstacles = 20;
var game_time = 0;
var max_accel = 0.5;
var obstacle_reset_time = 75/max_accel; //This adjusts how often the obstacles drop. Modify if necessary.
var obstacle_x_positions = [];
var obstacle_y_positions = [];
var obstacle_accelerations = [];
var obstacle_velocities = [];
var winning_score = 5;
var player_speed = 4;
var stack = 0;
var game_over_msg = "Game over!";
var win_msg = "You win!";
var updated = false;
var paused = true;
var interval = false;

//Initialize game
$(document).ready(function() {
	canvas = document.getElementById("dodge_game_canvas");
	canvas_context = canvas.getContext('2d');
	x_pos = canvas.width/2;
	y_pos = canvas.height - ball_diameter/2 + 1;
	initialize_obstacles(stack, max_accel);
	draw();
	//Pause or resume game
	$("#dodge_continuity_btn").on('click', function () {
		if(lives > 0 && score < winning_score) { //The user shouldn't be able to pause or resume when the game is over
			if(paused) {
				$("#dodge_game_text").hide();
				paused = false;
				start_game();
			}
			else {
				$("#dodge_game_text").text("Paused").show();
				paused = true;
				clearInterval(interval);
			}
		}
	});
	//Update game variables with user's input when the update button is clicked
	$("#dodge_update_btn").on('click', function () {
		updated = true;
		print("dodge_game_text", "Updated!");
        init_winning_score = check_input($("#dodge_score").val(), 5, parseInt, 10, 0);
        winning_score = init_winning_score;
		init_lives = check_input($("#dodge_player_lives").val(), 3, parseInt, 10, 0);
		lives = init_lives;
        init_player_speed = check_input($("#dodge_player_speed").val(), 4, parseInt, 10, 0, 31);
        player_speed = init_player_speed;
        init_max_accel = check_input($("#dodge_obstacle_accel").val(), 0.5, parseFloat, 10, 0, 21);
        max_accel = init_max_accel;
        init_obs_num = check_input($("#dodge_obstacle_num").val(), 20, parseInt, 10, 0, 51);
        num_of_obstacles = init_obs_num;
        init_stack = check_input($("#dodge_obstacle_stack").val(), 0, parseInt, 10, -1, 21);
        stack = init_stack;
        draw();
	});
	//Restore game variables to original values.
	$("#dodge_default_btn").on('click', function () {
		print("dodge_game_text", "Updated!");
		lives = 3;
		score = 0;
		num_of_obstacles = 20;
		max_accel = 0.5;
		obstacle_reset_time = 75/max_accel;
		winning_score = 5;
		player_speed = 4;
		stack = 0;
		$("input[type=text], textarea").val("");
		draw();
	});
	//Clear all input fields
	$("#dodge_clear_btn").on('click', function () {
		$("input[type=text], textarea").val("");
	});
	//This will reset all positions, scores, and points
	$("#dodge_reset_btn, #dodge_easy_btn, #dodge_med_btn, #dodge_hard_btn").on('click', function () {
		$("#dodge_game_text").hide();
		score = 0;
		game_time = 0;
		obstacle_x_positions = [];
		obstacle_y_positions = [];
		obstacle_accelerations = [];
		obstacle_velocities = [];
		x_pos = canvas.width/2;
		y_pos = canvas.height - ball_diameter/2 + 1;
		paused = true;
		initialize_obstacles(stack, max_accel);
		draw();
		if(interval != false)
			clearInterval(interval);
	});
	//Reset the game with user's settings. If the user hasn't changed any settings, use the current settings.
	$("#dodge_reset_btn").on('click', function () {
		lives = updated ? init_lives : 3;
		num_of_obstacles = updated ? init_obs_num : 20;
		max_accel = updated ? init_max_accel : 0.5;
		obstacle_reset_time = Math.floor(75/max_accel);
		winning_score = updated ? init_winning_score : 5;
		player_speed = updated ? init_player_speed : 4;
		stack = updated ? init_stack : 0;
	});
	//Reset the game on easy mode
	$("#dodge_easy_btn").on('click', function () {
		lives = 10;
		num_of_obstacles = 20;
		max_accel = 0.5;
		obstacle_reset_time = Math.floor(75/max_accel);
		winning_score = 5;
		player_speed = 15;
		stack = 0;
	});
	//Reset the game on medium mode
	$("#dodge_med_btn").on('click', function () {
		lives = 5;
		num_of_obstacles = 20;
		max_accel = 3;
		obstacle_reset_time = 75;
		winning_score = 10;
		player_speed = 10;
		stack = 1;
	});
	//Reset the game on hard mode
	$("#dodge_hard_btn").on('click', function () {
		lives = 3;
		num_of_obstacles = 20;
		max_accel = 5;
		obstacle_reset_time = 75;
		winning_score = 10;
		player_speed = 5;
		stack = 5;
	});
});

//Begins the game
function start_game() {
	document.addEventListener('keydown', keyPush);
	interval = setInterval(game, 1000/15);
}

//Ends the game
function game_over(msg) {
	$("#dodge_game_text").text(msg.toString()).show();
	paused = true;
	clearInterval(interval);
}

//Reset the ball after the player dies
function reset() {
	//Place the ball at the center of the canvas
	x_pos = canvas.width/2;
	y_pos = canvas.height - ball_diameter/2 + 1;
}

//Animates and implements the game
function game() {
	game_time++;
	//Updates the locations of all the obstacles
	update_obstacles();
	//Updates the ball's location using its velocity and ensures the ball stays in the canvas
	if((x_pos + ball_diameter/2) < canvas.width) {
		x_pos += -2 + ball_x_velocity;
	} else {
		x_pos += -2 + (ball_x_velocity < 0 ? ball_x_velocity : 0);
	}
	//If the player touches the zapper or dies from a collision
	if(x_pos < death_x_coordinate || test_collision()) {
		lives -= 1;
		if(lives <= 0) {
			game_over(game_over_msg);
		} 
		else { 
			reset();					//Place the ball back at the center of the canvas
		}
	}
	//Keep updating graphics
	draw();
}

//Controls obstacle physics
function update_obstacles() {
	for(var i = 0; i < num_of_obstacles; i++) {
		obstacle_velocities[i] += obstacle_accelerations[i];
		obstacle_y_positions[i] += obstacle_velocities[i];
	}
	if(game_time%obstacle_reset_time == 0) {
		initialize_obstacles(stack, max_accel);
		score += 1;
		if(high_score < score) {
			high_score = score;
		}
		if(score >= winning_score) {
			game_over(win_msg);
		}
	}
}

//Give each bomb a velocity, acceleration and a (x, y) position
function initialize_obstacles(stack=0, max_acceleration=0.5, spread=0.01) {
	//stack determines how many obstacles will appear each round, so if stack = 5 and there are 20 on the first round, there will be 25 on the next, 30 after that, etc.
	//The larger the spread, the more varied the speeds of each obstacle will be
	//max_acceleration places a cap on the acceleration of the fastest obstacle
	obstacle_accelerations = [];
	obstacle_velocities = [];
	obstacle_x_positions = [];
	obstacle_y_positions = [];
	for(var i = 0; i < num_of_obstacles; i++) {
		obstacle_accelerations.push(Math.random() * (max_acceleration - spread) + spread);
		obstacle_velocities.push(Math.floor(Math.random(5)));
		obstacle_x_positions.push(zapper_width+ball_diameter/2 + Math.floor(Math.random() * canvas.width));
		obstacle_y_positions.push(-20 + Math.floor(Math.random() * (-ball_diameter/2)));
	}
	num_of_obstacles = num_of_obstacles + stack;
}

//Obstacle collision detection mechanics
function test_collision() {
	var death_range = (ball_diameter+obstacle_diameter)/2 - 1;
	var dist = function (x0, y0, x1, y1) { return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2)) };
	for(var i = 0; i < num_of_obstacles; i++) {
		if(dist(x_pos, y_pos, obstacle_x_positions[i], obstacle_y_positions[i]) < death_range) {
			return true;
		}
	}
	return false;
}

//Handles user input
function keyPush(event) {
	paused = false;
	switch(event.keyCode) {
		//Adjusts player speed
		case 37:
			ball_x_velocity = -player_speed;
			break;
		case 39:
			ball_x_velocity = player_speed;
			break;
	}
}

//Game board graphics
function draw() {
	canvas_context.fillStyle = 'black';
	canvas_context.fillRect(0, 0, canvas.width, canvas.height);
	canvas_context.fillStyle = '#42bcf4';
	canvas_context.fillRect(0, 0, zapper_width, canvas.height);
	draw_circle(x_pos, y_pos, ball_diameter/2, '#42bcf4');
	draw_obstacles(obstacle_x_positions, obstacle_y_positions, obstacle_x_positions.length, obstacle_diameter/2);
	//Prints the winning score
	$("#dodge_win_score").text(winning_score);
	//Prints the number of rounds that the player has survived
	//canvas_context.fillText("Score: " + score.toString(), canvas.width-150, 50);
	$("#dodge_current_score").text(score);
	//Prints the number of lives left
	//canvas_context.fillText("Lives: " + lives.toString(), 100, 50);
	$("#dodge_current_lives").text(lives);
	//Prints the player's highest score
	$("#dodge_highest_score").text(high_score);
}

//Draws a circle on the canvas
function draw_circle(x_coord, y_coord, radius, color="#fff") {
	canvas_context.beginPath();
	canvas_context.ellipse(x_coord, y_coord, radius, radius, 0, 0, 2*Math.PI);
	canvas_context.fillstyle = color;
	canvas_context.fill();
	canvas_context.stroke();
}

//Draws multiple circles on the canvas
function draw_obstacles(x_positions=[], y_positions=[], amount=0, radius=ball_diameter/4, color="#fff") {
	for(var i = 0; i < amount; i++) {
		draw_circle(x_positions[i], y_positions[i], radius);
	}
}

//Error checking for input boxes
function check_input(input, default_val, parse_func, base=10, noninclusive_lower_bound=Number.NEGATIVE_INFINITY, noninclusive_upper_bound=Number.POSITIVE_INFINITY) {
	if(!isNaN(parse_func(input, base)) && parse_func(input, base) > noninclusive_lower_bound && parse_func(input, base) < noninclusive_upper_bound) {
		return parse_func(input, base);
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