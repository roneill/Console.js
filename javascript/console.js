
// Global Variables /////////////////////////////////////////////////////////////

/* The hash table for all registered command objects */
var commandTable = [];

/* Stores all previously entered commands*/
var historyArray = [];
var historyIndex = 0;

/* Stores the directory structure for the file system browser */
var directoryStack = []
directoryStack.push("");

// Object Utilities  /////////////////////////////////////////////////////////////

/* Object creator - taken directly from Douglass Crockford*/
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() { }
        F.prototype = o;
        return new F();
    };
}

/* An empty command object */
var command = {
    name: "Not Implemented",
    args: "Not Implemented",
    getName: function () {
        return this.name;
    },
    getArgs: function () {
        return this.args;
    },
    run: function () {
        return "Not Implemented"
    }
}

/* Creates a new command object with specified name */
function commandConstructor(name) {

    var newCommand = Object.create(command);
    newCommand.name = name;

    return newCommand;
}

/* Inserts a command object into the command table */
function register(command) {
    commandTable[command.name] = command;
}

// Command Definitions  /////////////////////////////////////////////////////////////

/* Creates the echo command */
function createEcho() {
    var name = "echo";
    var echo = commandConstructor(name);

    echo.run = function () { $('.old_input').last().append('<p>' + echo.args + '</p>'); };

    register(echo);
}

/* Creates a lisp-style calculator command */
function createCalc() {
    var name = "calc";

    var calc = commandConstructor(name);

    calc.run = function () { $('.old_input').last().append('<p>' + run(calc.args) + '</p>'); };

    register(calc);
}

/* Creates a command to display a google map of a given location */
function createMap() {
    var name = "map";

    var map = commandConstructor(name);

    map.run = function () {
        var mapNumber = "map_canvas" + $('.map').length;
        $('.old_input').last()
						.append('<p><div class="map" id="' + mapNumber + '"></div></p>');
        loadMap(map.args);
    };

    register(map);
}
/* Helper function for createMap() */
function loadMap(location) {

    var geocoder = new google.maps.Geocoder();
    var latlng = null; // initial map is null, we need to wait for lookup

    geocoder.geocode({ 'address': location },
			function (results, status) {
			    if (status == google.maps.GeocoderStatus.OK) {
			        map.setCenter(results[0].geometry.location);
			    }
			    else {
			        $('.old_input').last().append('<p>Not a valid location.</p>');
			    }
			});

    var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var mapLength = $('.map').length - 1;
    var mapName = "map_canvas" + mapLength;
    var map = new google.maps.Map(document.getElementById(mapName), myOptions);
}

/* Creates the clear command which clears the screen of all input and output*/
function createClear() {
    var name = "clear";
    var clear = commandConstructor(name);

    clear.run = function () { $('.old_input').remove(); };

    register(clear);
}

/* Displays a dialog box with user command documentation*/
function createHelp() {
    var name = "help";
    var help = commandConstructor(name);

    help.run = function () {
        $('.old_input').last().append('<p>Tip: The help box is draggable.</p>');
        $('#draggable').show();
        $.get('help.html', function (data) {
            $('#draggable').html(data);
        });
    }

    register(help);
}

/* Prints the screen */
function createPrint() {
    var name = "print";
    var print = commandConstructor(name);

    print.run = function () {
        $('.old_input').last().append('<p></p>');
        window.print();
    };

    register(print);
}

/* Lists the current directory of the server */
function createLs() {
    var name = "ls";
    var ls = commandConstructor(name);

    ls.run = function () {
        $('.old_input').last().append('<p></p>');

        var directoryString = directoryStack.toString();
        directoryString = directoryString.replace(/,/g, "");
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "FileServices.asmx/ListDirectory",
            data: '{ strTitle: "' + directoryString + '" }',
            dataType: "json",
            success: function (msg) {
                var t = msg.d;
                $('.old_input').last().append('<p>' + $.parseJSON(t) + '</p>');
                $(document).scrollTop(1000000);
            }
        });
    };

    register(ls);
}

/* Changes directories to specified directory */
function createCd() {
    var name = "cd";
    var cd = commandConstructor(name);

    cd.run = function () {
        var trimmedArgs = $.trim(cd.args);
        var directoryString = directoryStack.toString();
        directoryString = directoryString.replace(/,/g, "");
        directoryString += "\\\\" + trimmedArgs;

        if (trimmedArgs === ".." && directoryStack.length <= 1) {
            $('.old_input').last().append("<p style='color:red'>At root directory!</p>");
            $(document).scrollTop(1000000);
        }
        else if (trimmedArgs === ".." && directoryStack.length > 1) {
            directoryStack.pop();
            $('.old_input').last().append('<p>Moved back one directory</p>');
            $(document).scrollTop(1000000);
        }
        else {
            $('.old_input').last().append('<p></p>');
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "FileServices.asmx/DirectoryExists",
                data: '{ strTitle: "' + directoryString + '" }',
                dataType: "json",
                success: function (msg) {
                    var t = msg.d;
                    if ($.parseJSON(t)) {
                        directoryStack.push("\\\\" + $.trim(trimmedArgs));
                        $('.old_input').last().append('<p>Moved to ' + trimmedArgs + '</p>');
                        $(document).scrollTop(1000000);
                    }
                    else {
                        $('.old_input').last().append('<p>Directory does not exist</p>');
                        $(document).scrollTop(1000000);
                    }
                }
            });
        };
    }

    register(cd);
}

/* Opens a specified file */
function createOpen() {
    var name = "open";
    var open = commandConstructor(name);

    open.run = function () {
        $('.old_input').last().append('<p></p>');

        var trimmedArgs = $.trim(open.args);
        var directoryString = directoryStack.toString();
        directoryString = directoryString.replace(/,/g, "");
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "FileServices.asmx/getUrl",
            data: '{ strTitle: "' + directoryString + "#" + trimmedArgs + '" }',
            dataType: "json",
            success: function (msg) {
                var t = msg.d;
                var thing = $.parseJSON(t);
                $('.old_input').last().append('<p>' + thing + '</p>');
                window.open(thing);
                $.print(t);
                $.print(thing);
                $(document).scrollTop(1000000);
            }
        });
    };

    register(open);
}

/* Displays a new command line */
function createBlank() {
    var name = "";
    var blank = commandConstructor(name);

    blank.run = function () { $('.old_input').last().append('<br />'); };

    register(blank);
}

/* Creates all specified commands */
function registerCommands() {
    createEcho();
    createCalc();
    createMap();
    createHelp();
    createClear();
    createBlank();
    createPrint();
    createLs();
    createCd();
    createOpen();
}

// Event Handlers /////////////////////////////////////////////////////////////

/* The main key event handler for the console*/
function handleKeyPress(e) {

    /* Lookup history on keyup*/
    if (e.which === 38)
        handleKeyUp(e);

    /* Clear line on keydown*/
    if (e.which === 40)
        handleKeyDown(e);

    /* Execute command on enter */
    if (e.which === 13)
        handleEnter(e);
}

/* Traverses the historyArray and displays contents in input field */
function handleKeyUp(e) {
    historyArray.reverse(); // hack to make history appear the correct way

    if (historyIndex <= historyArray.length - 1) {
        $('.command_line').last().val(historyArray[historyIndex]);
        historyIndex++;
    }
    else
        $('.command_line').last().val(historyArray[historyIndex - 1]);

    historyArray.reverse();
}

/* Traverses the historyArray and displays contents in input field */
function handleKeyDown(e) {
    historyArray.reverse();

    if (historyIndex >= 0) {
        historyIndex--;
        $('.command_line').last().val(historyArray[historyIndex]);
    }
    else
        $('.command_line').last().val("");

    historyArray.reverse();
}

/* Handles the logic for when a user exectues a command*/
function handleEnter(e) {

    if (e.which === 13) {
        var command = $('input').last().val();

        /* If a command was entered, add it to the command history */
        if (command !== "")
            historyArray.push(command);

        /* Reset the history index */
        historyIndex = 0;

        /* Parse and return entered command */
        var parsedCommand = parseInput(command);

        /* Remove input field after command is executed */
        removeInputPrompt(command);

        /* Display the output of the executed command */
        executeCommand(parsedCommand);

        /* Add a new input prompt */
        addInputPrompt();

        /* Focuses the current input prompt */
        focusCommandLine();

        /* Scroll to bottom of page */
        $(document).scrollTop(1000000);
    }
}

// Event Handler Utilities  /////////////////////////////////////////////////////////////

/* Parses an input string into a command string and an argument string */
function parseInput(input) {
    var args = [];
    var trimmedInput = $.trim(input);
    var command = "";
    var argument = "";
    var d;

    /* Parse command out of input string */
    for (d = 0; d < trimmedInput.length; d++) {
        var character = trimmedInput.charAt(d);

        if (character === ' ') { break; }

        command += character;
    }

    args.push(command);

    /* Parse arguments out of input string */
    while (d < trimmedInput.length) {
        argument += trimmedInput.charAt(d);
        d++;
    }

    args.push(argument);

    return args;
}

/* Removes the last used input field and replaces it with non-editable text */
function removeInputPrompt(command) {
    $('.input').replaceWith('<span class="old_input">' + 'bob@console:~$ '
                                 + '<span class="old_text">'
                                 + command +
								'</span> <input style="width:0;border:0;outline:none;visible:false;" /></span>');
}

/* Adds a new input field to the console */
function addInputPrompt() {
    $('.prompt').append('<span class="input">bob@console:~$ <input class="command_line"/></span>');
}

/* Calls the run method of an entered command, if it exists, otherwise, informs the user that command does not exist */
function executeCommand(parsedCommand) {
    var commandName = parsedCommand[0];
    var args = parsedCommand[1];

    var retrievedCommand = commandTable[commandName];

    if (typeof retrievedCommand !== 'undefined') {
        retrievedCommand.args = args;
        retrievedCommand.run();
    }
    else
        $('.old_input').last().append('<p>' + "Command not recognized: " + commandName + '</p>');
}

/* Focuses the current input field */
function focusCommandLine() {
    $('.command_line').last().focus();
}

// Page Initialization  /////////////////////////////////////////////////////////////

/* Creates all commands, registers keypress handler, and focuses input field on startup */
function initialize() {
    registerCommands();
    $(document).keydown(handleKeyPress);
    focusCommandLine();
}

$(initialize);
