var gameMatrix, oldGameMatrix;

var height     = 500; // 500 px
var cubeHeight = 28;  // 28 px
var cubeWidth  = cubeHeight;
var rowCount   = Math.round(height / cubeHeight);
var colCount   = 10;

var timer_interval = null;

function startNewGame() {

    var cubeTypeCount = parseInt($('#difficulty_level').val(), 10);

    timer_value = 0;
    clearInterval(timer_interval);
    timer_interval = setInterval(update_timer, 1000);

    // Fill gameMatrix with random cubes
    gameMatrix = _.range(rowCount).map(function(){
        return _.range(colCount).map(function(){
            return _.random(1, cubeTypeCount);
        });
    });

    oldGameMatrix = gameMatrix.slice(0);
    draw_from_gameMatrix();

}

function draw_from_gameMatrix() {

    var html = "<table>";

    for (i = 0; i < rowCount; i++) {

        html += "<tr>";
        var cur_row = gameMatrix[i];

        for (j = 0; j < colCount; j++) {

            var cur_index = cur_row[j]
            var cube_class = "cube" + cur_index;

            html += "<td class='cube " + cube_class + "' data-cube_index='" + cur_index + "' data-row='" + i + "' data-col='" + j + "'>&nbsp;</td>";

        }

        html += "</tr>";
    }

    html += "</table>";

    $('#game_area').html(html);
}

// When I click on a cube
var cubes_to_be_processed = [];
var cube_index_to_remove = "";

$('#game_area').on('click', '.cube', function() {
    var cube_index = $(this).data('cube_index');
    var row = $(this).data('row');
    var col = $(this).data('col');

    // Check if it has valid neighbours
    var neighbour_found = check_if_neighbour_exists(row, col, cube_index);

    if (neighbour_found) {
        // oldGameMatrix = gameMatrix.slice(0);
        mark_cube_to_remove(row, col);
        cube_index_to_remove = cube_index;
        process_cubes_to_remove();
    } else {
        // Wrong - No cells
    }

    check_if_move_exists();

});


// Check if it has similar neighbours
function check_if_neighbour_exists(row, col, cube_index) {

    if(!cube_index) {
        return false;
    }

    // where can we find neighbours?
    var positions = [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]];


    // don't consider cells outside the board
    positions = _.filter(positions, function(p){
        return p[0] >=0 && p[1] >= 0 && p[0] < rowCount && p[1] < colCount;
    });

    return _.any(positions, function(p){
        return gameMatrix[p[0]][p[1]] === cube_index;
    })

}

function check_if_move_exists() {

    valid_move_exists = false;
    non_white_exists = false;
    non_white = 0;

    for (i = 0; i < rowCount; i++) {
        for (j = 0; j < colCount; j++) {

            if (gameMatrix[i][j] != 0) {
                non_white_exists = true;
                non_white += 1;
            }

            if(check_if_neighbour_exists(i, j, gameMatrix[i][j])) {
                valid_move_exists = true;
                // break;
            }
        }

        if(valid_move_exists) {
            // break;
        }
    }

    if (non_white_exists == true && valid_move_exists == false) {
        show_game_over(false);
        return;
    } else if (non_white_exists == false && valid_move_exists == false) {
        show_game_over(true);
        return;
    }

    score = ((rowCount * colCount) - non_white);
    $('#score_value').text(score + " / " + (rowCount * colCount));

    return valid_move_exists;

}

function show_game_over(victory) {

    if (victory) {
        alert("You Win");
    } else {
        alert("Game Over");
    }

    clearInterval(timer_interval);
}

function process_cubes_to_remove() {
    while (cubes_to_be_processed.length != 0) {

        var cube_index = cube_index_to_remove;
        var cur_cube = cubes_to_be_processed.shift();
        var row = cur_cube['row'];
        var col = cur_cube['col'];

        if (row > 0) {
            if(gameMatrix[row - 1][col] == cube_index) {
                mark_cube_to_remove(row - 1, col);
            }
        }

        if (col > 0) {
            if(gameMatrix[row][col - 1] == cube_index) {
                mark_cube_to_remove(row, col - 1);
            }
        }

        if (row < rowCount - 1) {
            if(gameMatrix[row + 1][col] == cube_index) {
                mark_cube_to_remove(row + 1, col);
            }
        }

        if (col < colCount - 1) {
            if(gameMatrix[row][col + 1] == cube_index) {
                mark_cube_to_remove(row, col + 1);
            }
        }

        gameMatrix[row][col] = -1;
    }

    remove_marked_cubes();
}

function remove_marked_cubes() {
    for (i = 0; i < colCount; i++) {
        for (j = rowCount - 1; j >= 0; j--) {
            if (gameMatrix[j][i] == -1 && j != 0) {

                for (k = j; k >= 0; k--) {
                    if (k != 0) {
                        gameMatrix[k][i] = gameMatrix[k - 1][i]
                    } else {
                        gameMatrix[k][i] = 0;
                    }
                }

                j++;

            } else if (gameMatrix[j][i] == -1 && j == 0) {
                gameMatrix[j][i] = 0;
            }
        }
    }

    // Check the last row
    for (j = 0; j < colCount - 1; j++) {
        if (gameMatrix[rowCount - 1][j] == 0) {
            // Shift all to the left
            for (m = j; m < colCount - 1; m++) {
                for (n = 0; n < rowCount; n++) {
                    gameMatrix[n][m] = gameMatrix[n][m + 1];
                    gameMatrix[n][m + 1] = 0;
                }
            }
        }
    }

    draw_from_gameMatrix();
}

function mark_cube_to_remove(row, col) {
    cubes_to_be_processed.push({"row": row, "col": col});
}

$(document).ready(function() {
    startNewGame();
});

$('#btn_undo').on('click', function() {
    gameMatrix = oldGameMatrix.slice(0);
    draw_from_gameMatrix();
});

$('#btn_new_game').on('click', function() {
    startNewGame();
});

$('.show_help').on('click', function() {
    $('.modal').modal('show');
});

timer_value = 0;
function update_timer() {
    timer_value += 1;

    min = Math.floor(timer_value / 60);
    sec = timer_value % 60;

    if (min < 10) {
        min = "0" + min;
    }

    if (sec < 10) {
        sec = "0" + sec;
    }

    $('#timer_value').text(min + " : " + sec);
}
