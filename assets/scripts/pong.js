//Game variables
var [p1y, p2y] = [40, 40];			//y-positions of paddles
var pt = 10;						//paddle thickness
var ph = 100;						//paddle starting height
var [bx, by] = [50, 50]; 			//ball position
var bd = 6;							//ball "diameter"
var [xv, yv] = [15, 15];			//ball velocity
var [score1, score2] = [0, 0];		//player scores
var [points1, points2] = [0, 0];	//player points
var score_threshold = 3;			//determines what the score must be for the game to end
var point_threshold = 5; 			//determines how many points you need to increment your score
var ais = 10;    					//AI speed
var ball_color = '#42bcf4';
var paddle_colors = '#42bcf4';
var total_player_wins = 0;
var total_ai_wins = 0;
var game_over_msg = "Game over!";
var win_msg = "You win!";
var updated = false;
var paused = true;
var interval = false;

//Initializes the game
$(document).ready(function() {
	canvas = document.getElementById("pong_game_canvas");
	canvas_context = canvas.getContext("2d");
	draw();
	//Pause or resume game
	$("#pong_continuity_btn").on('click', function () {
		if(score2 < score_threshold && score1 < score_threshold) {
			if(paused) {
				$("#pong_game_text").text("");;
				paused = false;
				start_game();
			}
			else {
				$("#pong_game_text").text("Paused");
				paused = true;
				clearInterval(interval);
			}
		}
	});
	//Update game variables with user's input when the update button is clicked
	$("#pong_update_btn").on('click', function () {
		updated = true;
		print("pong_game_text", "Updated!");
        init_score_threshold = check_int(parseInt($("#pong_score").val()), 3, 0);
        score_threshold = init_score_threshold;
		init_point_threshold = check_int(parseInt($("#pong_points").val()), 5, 0);
		point_threshold = init_point_threshold;
        init_xv = check_int(parseInt($("#pong_speed").val()), 20, 0, 50);
        xv = init_xv;
        yv = init_xv;
        init_ball_color = check_hex_code($("#pong_ball_color").val(), ball_color);
        ball_color = init_ball_color;
        init_paddle_colors = check_hex_code($("#pong_paddle_colors").val(), paddle_colors);
        paddle_colors = init_paddle_colors;
        init_ais = check_int(parseInt($("#pong_AI_speed").val()), 10, -1, 51);
        ais = init_ais;
        draw();
	});
	//Restore game variables to original values
	$("#pong_default_btn").on('click', function () {
		print("pong_game_text", "Updated!");
		xv = 20;
		yv = 20;			
		score_threshold = 3;
		point_threshold = 5;
		ais = 10;    						
		ball_color = '#42bcf4';
		paddle_colors = '#42bcf4';
		$("input[type=text], textarea").val("");
		draw();
	});
	//Clear all input fields
	$("#pong_clear_btn").on('click', function () {
		$("input[type=text], textarea").val("");
	});
	//This will reset all positions, scores, and points
	$("#pong_reset_btn, #pong_easy_btn, #pong_med_btn, #pong_hard_btn").on('click', function () {
		p1y = 40;
		p2y = 40;
		pt = 10;
		ph = 100;
		bx = 50;
		by = 50;
		score1 = 0;
		score2 = 0;
		points1 = 0;
		points2 = 0;
		paused = true;
		draw();
		if(interval != false)
			clearInterval(interval);
	});
	//Reset the game with user's settings. If the user hasn't changed any settings, use the current settings.
	$("#pong_reset_btn").on('click', function () {
		xv = updated ? init_xv : xv;
		yv = updated ? init_xv : yv;			
		score_threshold = updated ? init_score_threshold : score_threshold;
		point_threshold = updated ? init_point_threshold : point_threshold;
		ais = updated ? init_ais : ais;		
		ball_color = updated ? init_ball_color : ball_color;
		paddle_colors = updated ? init_paddle_colors : paddle_colors;
		$("#pong_game_text").text("");
		$("#pong_player_wins").text(total_player_wins);
		$("#pong_ai_wins").text(total_ai_wins);
	});
	//Reset the game on easy mode
	$("#pong_easy_btn").on('click', function () {
		print("pong_game_text", "Updated!");
		xv = 15;
		yv = 15;			
		score_threshold = 3;
		point_threshold = 1;
		ais = 3;		
	});
	//Reset the game on medium mode
	$("#pong_med_btn").on('click', function () {
		print("pong_game_text", "Updated!");
		xv = 20;
		yv = 20;			
		score_threshold = 5;
		point_threshold = 1;
		ais = 9;		
	});
	//Reset the game on hard mode
	$("#pong_hard_btn").on('click', function () {
		print("pong_game_text", "Updated!");
		xv = 30;
		yv = 30;			
		score_threshold = 10;
		point_threshold = 1;
		ais = 15;		
	});
});

//Animates and implements the game
function start_game() {
	interval = setInterval(update, 1000/30);
	canvas.addEventListener('mousemove', function(event) {
		p1y = event.clientY-ph*2.5; //Adjusts where the mouse "grips" the paddle
	});
}

//Ends the game
function game_over(msg) {
	$("#pong_game_text").text(msg.toString()).show();
	$("#pong_player_wins").text(total_player_wins);
	$("#pong_ai_wins").text(total_ai_wins);
	paused = true;
	clearInterval(interval);
}

//Place the ball at the center of the canvas after a player scores
function reset() {
	bx = canvas.width/2;
	by = canvas.height/2;
	xv = -xv;
	yv = 3;
}

//Primary game mechanics
function update() {
	//Adjusts ball speed
	bx += xv;
	by += yv;
	//Bounces the ball off the top and bottom walls of the canvas
	if(by < 0 && yv < 0) {
		yv = -yv;
	}
	if(by > canvas.height && yv > 0) {
		yv = -yv;
	}
	//If the ball's x position is on the player's side
	if(bx < 0) {
		if(by > p1y && by < p1y+ph) {	//Properly deals with ball reflection
			xv = -xv;
			dy = by-(p1y+ph/2);
			yv = dy*0.3; 
		} else {						//If the player doesn't hit the ball, the AI scores a point
			points2++;
			if(points2%point_threshold == 0) {
				score2 += 1;
				if(score2 >= score_threshold) {
					++total_ai_wins;
					game_over(game_over_msg);
				}
			}
			reset();
		}		
	}
	//If the ball's x position is on the AI's side
	if(bx > canvas.width) {
		if(by > p2y && by < p2y+ph) {	//Properly deals with ball reflection
			xv = -xv;
			dy = by-(p2y+ph/2);
			yv = dy*0.3; 
		} else {						//If the AI doesn't hit the ball, the player scores a point
			points1++;
			if(points1%point_threshold == 0) {
				score1 += 1;
				if(score1 >= score_threshold) {
					++total_player_wins;
					game_over(win_msg);
				}
			}
			reset();
		}
	}
	//AI controls
	if(p2y+ph/2 < by) {
		p2y += ais;
	} else {
		p2y -= ais;
	}
	draw();
}

//Draws the game board
function draw() {
	canvas_context.fillStyle = 'black';
	canvas_context.fillRect(0, 0, canvas.width, canvas.height);
	canvas_context.fillStyle = paddle_colors;
	canvas_context.fillRect(0, p1y, pt, ph);
	canvas_context.fillRect(canvas.width-pt, p2y, pt, ph);
	canvas_context.fillStyle = ball_color;
	canvas_context.fillRect(bx-bd/2, by-bd/2, bd, bd);
	canvas_context.fillStyle = '#fff';
	canvas_context.fillText("Score: " + score1.toString(), 100, 50);
	canvas_context.fillText("Points: " + points1, 100, 90);
	canvas_context.fillText("Score: " + score2.toString(), canvas.width-150, 50);
	canvas_context.fillText("Points: " + points2, canvas.width-150, 90);
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