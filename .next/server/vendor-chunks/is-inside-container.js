"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-inside-container";
exports.ids = ["vendor-chunks/is-inside-container"];
exports.modules = {

/***/ "(rsc)/../node_modules/is-inside-container/index.js":
/*!****************************************************!*\
  !*** ../node_modules/is-inside-container/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ isInsideContainer)\n/* harmony export */ });\n/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:fs */ \"node:fs\");\n/* harmony import */ var is_docker__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! is-docker */ \"(rsc)/../node_modules/is-docker/index.js\");\n\n\n\nlet cachedResult;\n\n// Podman detection\nconst hasContainerEnv = () => {\n\ttry {\n\t\tnode_fs__WEBPACK_IMPORTED_MODULE_0__.statSync('/run/.containerenv');\n\t\treturn true;\n\t} catch {\n\t\treturn false;\n\t}\n};\n\nfunction isInsideContainer() {\n\t// TODO: Use `??=` when targeting Node.js 16.\n\tif (cachedResult === undefined) {\n\t\tcachedResult = hasContainerEnv() || (0,is_docker__WEBPACK_IMPORTED_MODULE_1__[\"default\"])();\n\t}\n\n\treturn cachedResult;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vbm9kZV9tb2R1bGVzL2lzLWluc2lkZS1jb250YWluZXIvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXlCO0FBQ1E7O0FBRWpDOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEVBQUUsNkNBQVc7QUFDYjtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRWU7QUFDZjtBQUNBO0FBQ0Esc0NBQXNDLHFEQUFRO0FBQzlDOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXh0anMtdHlwZXNjcmlwdC1yZWR1eC1zYW1wbGUvLi4vbm9kZV9tb2R1bGVzL2lzLWluc2lkZS1jb250YWluZXIvaW5kZXguanM/MjI5OCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZnMgZnJvbSAnbm9kZTpmcyc7XG5pbXBvcnQgaXNEb2NrZXIgZnJvbSAnaXMtZG9ja2VyJztcblxubGV0IGNhY2hlZFJlc3VsdDtcblxuLy8gUG9kbWFuIGRldGVjdGlvblxuY29uc3QgaGFzQ29udGFpbmVyRW52ID0gKCkgPT4ge1xuXHR0cnkge1xuXHRcdGZzLnN0YXRTeW5jKCcvcnVuLy5jb250YWluZXJlbnYnKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpc0luc2lkZUNvbnRhaW5lcigpIHtcblx0Ly8gVE9ETzogVXNlIGA/Pz1gIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgMTYuXG5cdGlmIChjYWNoZWRSZXN1bHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdGNhY2hlZFJlc3VsdCA9IGhhc0NvbnRhaW5lckVudigpIHx8IGlzRG9ja2VyKCk7XG5cdH1cblxuXHRyZXR1cm4gY2FjaGVkUmVzdWx0O1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/../node_modules/is-inside-container/index.js\n");

/***/ })

};
;