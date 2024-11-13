// src/utils/cn.js

import classNames from "classnames";

/**
 * Utility function to conditionally join class names.
 * @param  {...any} classes - Class names or objects with boolean values.
 * @returns {string} - Joined class names.
 */
export const cn = (...classes) => {
  return classNames(...classes);
};
