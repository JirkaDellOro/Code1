# Troubleshooting

- Is the correct script file linked in the HTML file? The JS file should be linked, NOT the TS file.
- Is the script tag `defer` or are you using any other method to wait for the DOM to be loaded?
- Does the select for `canvas` or `context` work?
- Is the JS file current? Is `tsc --watch` running?
- Are you drawing anything over the thing you expect to see?
