"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/native-duplexpair";
exports.ids = ["vendor-chunks/native-duplexpair"];
exports.modules = {

/***/ "(rsc)/../node_modules/native-duplexpair/index.js":
/*!**************************************************!*\
  !*** ../node_modules/native-duplexpair/index.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\nconst Duplex = (__webpack_require__(/*! stream */ \"stream\").Duplex);\n\nconst kCallback = Symbol('Callback');\nconst kOtherSide = Symbol('Other');\n\nclass DuplexSocket extends Duplex {\n  constructor(options) {\n    super(options);\n    this[kCallback] = null;\n    this[kOtherSide] = null;\n  }\n\n  _read() {\n    const callback = this[kCallback];\n    if (callback) {\n      this[kCallback] = null;\n      callback();\n    }\n  }\n\n  _write(chunk, encoding, callback) {\n    this[kOtherSide][kCallback] = callback;\n    this[kOtherSide].push(chunk);\n  }\n\n  _final(callback) {\n    this[kOtherSide].on('end', callback);\n    this[kOtherSide].push(null);\n  }\n}\n\nclass DuplexPair {\n  constructor(options) {\n    this.socket1 = new DuplexSocket(options);\n    this.socket2 = new DuplexSocket(options);\n    this.socket1[kOtherSide] = this.socket2;\n    this.socket2[kOtherSide] = this.socket1;\n  }\n}\n\nmodule.exports = DuplexPair;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vbm9kZV9tb2R1bGVzL25hdGl2ZS1kdXBsZXhwYWlyL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhO0FBQ2IsZUFBZSxvREFBd0I7O0FBRXZDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovL25leHRqcy10eXBlc2NyaXB0LXJlZHV4LXNhbXBsZS8uLi9ub2RlX21vZHVsZXMvbmF0aXZlLWR1cGxleHBhaXIvaW5kZXguanM/OWE0MCJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5jb25zdCBEdXBsZXggPSByZXF1aXJlKCdzdHJlYW0nKS5EdXBsZXg7XG5cbmNvbnN0IGtDYWxsYmFjayA9IFN5bWJvbCgnQ2FsbGJhY2snKTtcbmNvbnN0IGtPdGhlclNpZGUgPSBTeW1ib2woJ090aGVyJyk7XG5cbmNsYXNzIER1cGxleFNvY2tldCBleHRlbmRzIER1cGxleCB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgICB0aGlzW2tDYWxsYmFja10gPSBudWxsO1xuICAgIHRoaXNba090aGVyU2lkZV0gPSBudWxsO1xuICB9XG5cbiAgX3JlYWQoKSB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSB0aGlzW2tDYWxsYmFja107XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICB0aGlzW2tDYWxsYmFja10gPSBudWxsO1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cblxuICBfd3JpdGUoY2h1bmssIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgIHRoaXNba090aGVyU2lkZV1ba0NhbGxiYWNrXSA9IGNhbGxiYWNrO1xuICAgIHRoaXNba090aGVyU2lkZV0ucHVzaChjaHVuayk7XG4gIH1cblxuICBfZmluYWwoY2FsbGJhY2spIHtcbiAgICB0aGlzW2tPdGhlclNpZGVdLm9uKCdlbmQnLCBjYWxsYmFjayk7XG4gICAgdGhpc1trT3RoZXJTaWRlXS5wdXNoKG51bGwpO1xuICB9XG59XG5cbmNsYXNzIER1cGxleFBhaXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5zb2NrZXQxID0gbmV3IER1cGxleFNvY2tldChvcHRpb25zKTtcbiAgICB0aGlzLnNvY2tldDIgPSBuZXcgRHVwbGV4U29ja2V0KG9wdGlvbnMpO1xuICAgIHRoaXMuc29ja2V0MVtrT3RoZXJTaWRlXSA9IHRoaXMuc29ja2V0MjtcbiAgICB0aGlzLnNvY2tldDJba090aGVyU2lkZV0gPSB0aGlzLnNvY2tldDE7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEdXBsZXhQYWlyO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/../node_modules/native-duplexpair/index.js\n");

/***/ })

};
;