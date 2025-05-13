import * as shell from "shelljs";

// Ensure dist/views and dist/public exist
shell.mkdir("-p", "dist/views", "dist/public");
// Copy entire folders
shell.cp("-R", "src/views/*", "dist/views/");
shell.cp("-R", "src/public/*", "dist/public/");
