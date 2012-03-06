
#Console Documentation

##Purpose of Project

For my final project, I decided to make a console environment for the web.

This console is much like a unix console in that it has an input prompt and a number of commands to run.


##What can it do?

The console has a number of useful commands such as:

* A calculator

* Filesystem browser

* Google mapping tool

* Print tool


###The Calculator

<p>
The calculator accepts arithmetic expressions in <strong>parenthesized infix
notation</strong>, much like expressions in lisp or scheme. For example,
the following expression (* (+ 2 2) 3 ) will evaluate to 12.
</p>
<p>
If an expression is entered incorrectly or it is invalid, the calculator
will print an error.
</p>

####Examples:

    calc (+ 1 2)
    calc (* (- 20 5) 3)
    calc (+ 3 (* 2 3) 8)
    calc (+ 3 (+ 1 2) 2)
    calc (- 3 6)
    calc (* 3 8 (* 2 3) (/ 3 3))
    calc (+ (+ (- (+ 1 1) 3) 4) 4)


<p>
<strong>**Note that there are a few bugs in the evaluator. </strong>
</p>

###The Filesystem Browser
<p>
The console has the ability to browse the server directory tree much like
a unix command line can. Following the spirit of a unix command line, the
commands to list files and folders in a directory and to change directories
are the same in the web console as in unix. To list the contents of the current directory
type <strong>ls</strong>. To change the working directory to a new directory type
<strong>cd</strong> followed by a directory name. To move back one directory,
type <strong>'cd ..'</strong>.
</p>

<p>
One feature of the filesystem browser that is currently in beta is the ability to open a file in the working
directory by typing <strong>open</strong> followed the filename. At this time, the feature <strong>does not work</strong>.
That may be remedied by the time it is graded.
</p>

###Google Mapping Tool

<p>
To display a google map in the console, type the command <strong>map</strong> followed by an <strong>address</strong>.
Following typical google maps conventions, the address can be as simple as <strong>bos</strong> for Boston or
<strong>ny</strong> for New York and can also be as complex as a full street address. Google's address lookup service
also accounts for mispellings such as <strong>bostn</strong> for Boston.
</p>

###Print Tool

<p>
The print tool, at the moment, does noting spectacular. It simply brings up a print dialog box.
If I get to it, which I most likely will not, I would like to have the screen print with a special
print stylesheet. Currently, when the site is printed, the google maps are too large for the page. Using
a special stylesheet would remedy that.
</p>

###Useful Information

<p>
The console has history that can be accessed by pressed the up and down arrow keys. The history stores commands
entered in a console session.
</p>

##How was it built?

<p>
For this project, I used very little server-side code. Almost the entire console application was built 
using javascript and jquery. In the experiments section, you can see the first prototype console that I
build using ASP.NET web forms. It was a good proof of concept, but it was not really something that was
going to be very useful for anything complicated.
</p>

<p>
The first version of the console I hacked together in about a day. It was very rudimentry at this point and basically had a command just
to echo user input. The development of this console basically constitues the majority of my jquery and css experiments. Instead of formally
wrapping all the experiments into a story, I experimented as I was building and thus the console is sort of the ultimate experiment.
I had no knowledge of JQuery before starting this project but I feel that I've learned a great deal over the past few weeks.
</p>

<p>
The structure of the application reflects my inexperience with programming in a language with a prototypal object system. Thus
there is sort of a mismatch between object oriented parts of the code and basically procedural parts. Given the scope of the project,
however, I do feel this is that bad.
</p>

<p>
As I began writing more and more commands, I realized the need to create some sort of abstraction in order to better
organize the way that commands were implemented. I created a <strong>command object</strong> that stores the <em>name</em>,
the <em>arguments</em>. and the <em>function</em> that dictates what a command actually does. On startup, all of the commands
are initialized and they are required to register themselves with the <strong>command hash table</strong>. This hash table makes the lookup
of a command very easy to do and greatly simplifies the code needed to execute a given command.
</p>

<p>
In this way, the console application is easily extensible.
</p>
<p>
In order to write a new command, all you have to do is create a new command object:
</p>
<pre>
function createCommand() {
	var name = "command";

	var command = commandConstructor(name);

	command.run = function () { *** Command function goes here *** };

	register(command);
}
</pre>
<p>
When the application is loaded for the first time, the register commands function is called. This function will ask all listed commands to register
themselves in the command hash table.
</p>
<p>
The code looks like this:
</p>
<pre>
function registerCommands() {
	createEcho();
	createCalc();
	createMap();
	createHelp();
	createClear();
	createBlank();
	createBackground();
	createLoad();
}

function register(command) {
	commandTable[command.name] = command;
}
</pre>
<p>
When a command is entered, it is parsed into two substrings. The first string is the command and the second string is it arguments.
</p>
<p>
A function checks to see if the entered command is registed in the command table. If it exists, the command's run function is called.
</p>
<p>
If the command is not found, the console lets the user know that the command they entered was invalid.
</p>
<p>
If the command executed successfully, the user will see the results of the function under the old command prompt.
</p>

###Backend
<p>
There are two ASP.NET Web Services that enable browsing of the server's filesystem. These web services are in the FileServices.cs
file in the app_code directory. They are call through ajax commands when <strong>ls</strong> and <strong>cd</strong> are called.
</p>

##Known Issues

* Focusing the input field does not work in Internet Explorer even though I am using a jQuery method. It works in Chrome, Firefox, Safari, and Opera though.
* Opera does some weird things with keys. If you look through your history with up and down arrow keys, the browser captures this as windows scrolling commands.
* Safari does weird things with the help box. The width and height are not correct.






