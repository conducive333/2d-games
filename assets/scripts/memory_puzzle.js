//Game variables
var seq = generate_seq();
var input = [];
var id_num = 0;
var winning_length = 6;
var tries = 3;
var highest = 0;
var updated = false;
var [s0_color, s1_color, s2_color, s3_color] = ["#f44242", "#42bcf4", "#50f441", "#f4f141"];

$(document).ready(function(){
	refresh_game_data(winning_length, seq.length, tries, highest);
	//Starts the game
	$("#memory_start_button").click(function () {
		tries = updated ? init_tries : 3;
		refresh_game_data(updated ? init_winning_length : winning_length, seq.length, tries, highest);
		$(this).hide();
		$("#memory_game_text").hide();
		display_squares(true, updated ? [init_s0_color, init_s1_color, init_s2_color, init_s3_color] : [s0_color, s1_color, s2_color, s3_color]);
		console.log(seq);
		show_seq(seq, 300);
	});
	//Update game variables with user's input when the update button is clicked
	$("#memory_update_btn").click(function () {
		updated = true;
		print("memory_game_text", "Updated!");
        init_winning_length = check_int(parseInt($("#memory_score").val()), 6, 0);
        winning_length = init_winning_length;
		init_tries = check_int(parseInt($("#memory_tries").val()), 3, 0);
		tries = init_tries;
        init_s0_color = check_hex_code($("#memory_s0_color").val(), '#f44242');
        s0_color = init_s0_color;
        init_s1_color = check_hex_code($("#memory_s1_color").val(), '#42bcf4');
        s1_color = init_s1_color;
        init_s2_color = check_hex_code($("#memory_s2_color").val(), '#50f441');
        s2_color = init_s2_color;
        init_s3_color = check_hex_code($("#memory_s3_color").val(), '#f4f141');
        s3_color = init_s3_color;
        display_squares(true, [s0_color, s1_color, s2_color, s3_color]);
        refresh_game_data(winning_length, seq.length, tries, highest);
	});
	//Restore game variables to original values.
	$("#memory_default_btn").click(function () {
		print("memory_game_text", "Updated!");
		winning_length = 6;
		tries = 3;
		display_squares(true);
		$("input[type=text], textarea").val("");
		refresh_game_data(winning_length, seq.length, tries, highest);
	});
	//Clear all input fields
	$("#memory_clear_btn").on('click', function () {
		$("input[type=text], textarea").val("");
	});
});

//Refreshes game data in the right-hand box
function game_over(msg) {
	$("#memory_game_text").text(msg.toString()).show();
	display_squares(false);
	$("#memory_start_button").text("Play again").show();
}

//Checks if the user's sequence is correct or incorrect and takes the appropriate action
function game(correct) {
	input = [];
	if(correct == true) {
		++highest;
		if(seq.length >= winning_length) {
			game_over("You win!");
		}
		else {
			seq = generate_seq(seq.length+1);
			refresh_game_data(winning_length, seq.length, tries, highest);
			print("memory_game_text", "Correct!", 500);
			setTimeout(function () { show_seq(seq, 300) }, 1000);
		}
	} else {
		tries -= 1;
		refresh_game_data(winning_length, seq.length, tries, highest);
		if(tries <= 0) {
			game_over("Game over!");
		}
		else {
			print("memory_game_text", "Incorrect!", 500);
			setTimeout(function () { show_seq(seq, 300) }, 1000);
		}
	}
}

//Handles square clicking mechanics
function turn_on_square_mechanics() {
	if($("#memory_start_button").is(":hidden")) {
		$("#s0, #s1, #s2, #s3").on('click', function () {
			id_num = parseInt($(this).attr('id').toString()[1], 10);
			show_seq([id_num], 100);
			input.push(id_num);
			console.log(input);
			if(input.length == seq.length)
				game(confirm(input, seq));
		});
	}
}

//Indicates which tiles are selected
function show_seq(seq, duration) {
	//Disables clicking while the sequence is showing to prevent cheating
	$("#s0, #s1, #s2, #s3").off("click");
  	function helper(seq, index=0) {
  		if(seq.length == 0) {
  			return turn_on_square_mechanics();
    	} 
    	else {
    		$("#s"+seq[0].toString()).delay(index*duration).animate({"opacity": "0.2"}, duration).animate({"opacity":"1"}, duration, function () {
    			helper(seq.slice(1), index+1);
    		});
    	}
    }
    helper(seq);
}

//Generates a random pattern
function generate_seq(len = 3) {
	let seq = [];
	for(var i = 0; i < len; i++) {
		seq.push(Math.floor(Math.random() * 4)); //returns a random int in the range [0, 3] 
	}
	return seq;
}

//Checks if the user's sequence matches the correct sequence
function confirm(seq1, seq2) {
	for(var i = 0; i < seq1.length; i++) {
		if(seq1[i] != seq2[i])
			return false;
	}
	return true;
}

//Refreshes game data in the right-hand box
function refresh_game_data(win_len, seq_len, tries_left, high_score) {
	$("#memory_game_text").hide();
	$("#memory_win_len").text(win_len);
	$("#memory_current_len").text(seq_len);
	$("#memory_tries_left").text(tries_left);
	$("#memory_highest_score").text(high_score);
}

//Hide or show all squares
function display_squares(show, colors=["#f44242", "#42bcf4", "#50f441", "#f4f141"]) {
//colors = [top-left color, top-right color, bottom-left color, bottom-right color]
	if(show) {
		for(var i = 0; i < 4; i++) {
			$("#s"+i.toString()).css("background-color", colors[i]);
			$("#s"+i.toString()).show();
		}
	}
	else {
		for(var i = 0; i < 4; i++) {
			$("#s"+i.toString()).hide();
		}
	}
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