"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-wsl";
exports.ids = ["vendor-chunks/is-wsl"];
exports.modules = {

/***/ "(rsc)/../node_modules/is-wsl/index.js":
/*!***************************************!*\
  !*** ../node_modules/is-wsl/index.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__)\n/* harmony export */ });\n/* harmony import */ var node_process__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! node:process */ \"node:process\");\n/* harmony import */ var node_os__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! node:os */ \"node:os\");\n/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! node:fs */ \"node:fs\");\n/* harmony import */ var is_inside_container__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! is-inside-container */ \"(rsc)/../node_modules/is-inside-container/index.js\");\n\n\n\n\n\nconst isWsl = () => {\n\tif (node_process__WEBPACK_IMPORTED_MODULE_0__.platform !== 'linux') {\n\t\treturn false;\n\t}\n\n\tif (node_os__WEBPACK_IMPORTED_MODULE_1__.release().toLowerCase().includes('microsoft')) {\n\t\tif ((0,is_inside_container__WEBPACK_IMPORTED_MODULE_3__[\"default\"])()) {\n\t\t\treturn false;\n\t\t}\n\n\t\treturn true;\n\t}\n\n\ttry {\n\t\treturn node_fs__WEBPACK_IMPORTED_MODULE_2__.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft')\n\t\t\t? !(0,is_inside_container__WEBPACK_IMPORTED_MODULE_3__[\"default\"])() : false;\n\t} catch {\n\t\treturn false;\n\t}\n};\n\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (node_process__WEBPACK_IMPORTED_MODULE_0__.env.__IS_WSL_TEST__ ? isWsl : isWsl());\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vbm9kZV9tb2R1bGVzL2lzLXdzbC9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFtQztBQUNWO0FBQ0E7QUFDMkI7O0FBRXBEO0FBQ0EsS0FBSyxrREFBZ0I7QUFDckI7QUFDQTs7QUFFQSxLQUFLLDRDQUFVO0FBQ2YsTUFBTSwrREFBaUI7QUFDdkI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyxpREFBZTtBQUN4QixNQUFNLCtEQUFpQjtBQUN2QixHQUFHO0FBQ0g7QUFDQTtBQUNBOztBQUVBLGlFQUFlLDZDQUFXLGtDQUFrQyxFQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmV4dGpzLXR5cGVzY3JpcHQtcmVkdXgtc2FtcGxlLy4uL25vZGVfbW9kdWxlcy9pcy13c2wvaW5kZXguanM/MzcxOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IG9zIGZyb20gJ25vZGU6b3MnO1xuaW1wb3J0IGZzIGZyb20gJ25vZGU6ZnMnO1xuaW1wb3J0IGlzSW5zaWRlQ29udGFpbmVyIGZyb20gJ2lzLWluc2lkZS1jb250YWluZXInO1xuXG5jb25zdCBpc1dzbCA9ICgpID0+IHtcblx0aWYgKHByb2Nlc3MucGxhdGZvcm0gIT09ICdsaW51eCcpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRpZiAob3MucmVsZWFzZSgpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ21pY3Jvc29mdCcpKSB7XG5cdFx0aWYgKGlzSW5zaWRlQ29udGFpbmVyKCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0cmV0dXJuIGZzLnJlYWRGaWxlU3luYygnL3Byb2MvdmVyc2lvbicsICd1dGY4JykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnbWljcm9zb2Z0Jylcblx0XHRcdD8gIWlzSW5zaWRlQ29udGFpbmVyKCkgOiBmYWxzZTtcblx0fSBjYXRjaCB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBwcm9jZXNzLmVudi5fX0lTX1dTTF9URVNUX18gPyBpc1dzbCA6IGlzV3NsKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/../node_modules/is-wsl/index.js\n");

/***/ })

};
;