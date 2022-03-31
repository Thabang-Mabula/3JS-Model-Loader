# 3JS-Model-Loader

This is code loads and renders 3D models to the browser.

This was written for client I worked with when I worked as a freelancer. The client was struggling
with importing and rendering models in their project. This code gave the client a starting point using the
three.js library as well as helpful functions that I wrote for them.

## Launch Instructions

The home page can be accessed by opening the `home.html` file.

To avoid issues with the use of three.js and other modules,
please open the webpage using a web server. As a suggestion, you can use "live-server" to quickly and
easily view the webpage via a server. For installation instructions, please visit:

https://www.npmjs.com/package/live-server

Simply navigate to the base folder where this repo is saved and run this command in your terminal:
`live-server`

## Usage

Models can be added to `/model` folder. To select a specific model, simply specify the file
name in `home.js` on line 4.
