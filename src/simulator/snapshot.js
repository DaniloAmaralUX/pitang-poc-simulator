/* Project metadata is data, including when it contains HTML-like text. */
(function(root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.PocSnapshot = factory();
})(typeof self !== "undefined" ? self : this, function() {
  "use strict";
  return { serialize(project) {
    return JSON.stringify(project).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  } };
});
