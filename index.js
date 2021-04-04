"use strict";
const keys = document.querySelector(".keys");
const display = document.querySelector(".display");
const clearButton = document.querySelector("[data-action=clear]");
const result = document.querySelector("span");
//   Result font size
const fontSize = window.getComputedStyle(result).fontSize; // or max font size

// Calculator state
let firstValue;
let previousKeyType;
let lastOperator;
let lastNumber;

keys.addEventListener("click", e => {
  // If element clicked isn't a button, return
  if (!(e.target instanceof HTMLButtonElement)) return;

  const key = e.target;
  const displayedNumber = result.textContent;

  updateVisuals(key, displayedNumber);
  result.textContent = createResult(key, displayedNumber).toString();
  updateState(key, displayedNumber);

  // Reduce display font size when it gets filled up
  let currentSize;
  while (result.offsetWidth > display.clientWidth) {
    currentSize = parseFloat(window.getComputedStyle(result).fontSize);
    result.style.fontSize = `${--currentSize}px`;
  }
});

/**
 * Blink the display
 */
const blinkResult = () => {
  result.style.opacity = "0";
  setTimeout(() => {
    result.style.opacity = "1";
  }, 50);
};

/**
 * Get key type
 * @param {HTMLButtonElement} key
 */
const getKeyType = key => {
  const { action, operator } = key.dataset;
  if (!action && !operator) return "number";
  if (operator) return "operator";
  return action;
};

/**
 * Update the effects from pressing a key
 * @param {HTMLButtonElement} key
 * @param {string} displayedNumber
 */
const updateVisuals = (key, displayedNumber) => {
  const { action, operator } = key.dataset;
  const keyType = getKeyType(key);
  if (keyType === "number" || keyType === "decimal") clearButton.textContent = "C";
  if (keyType === "percent") {
    if (displayedNumber.includes("e")) result.style.fontSize = fontSize;
  }
  if (keyType === "clear") {
    result.style.fontSize = fontSize;
    clearButton.textContent = "AC";
  }
  // Blink display when action or operator key is pressed
  if ((action && action !== "decimal") || operator) {
    blinkResult();
  }
};

/**
 * Create result string
 * @param {HTMLButtonElement} key
 * @param {string} displayedNumber
 * @returns
 */
const createResult = (key, displayedNumber) => {
  const keyType = getKeyType(key);

  // If any number key was pressed
  if (keyType === "number") {
    const number = key.textContent;
    return displayedNumber === "0" ||
      previousKeyType === "operator" ||
      previousKeyType === "equals" ||
      previousKeyType === "percent"
      ? number
      : displayedNumber + number;
  }

  // If any operator key was pressed
  if (keyType === "operator") {
    return firstValue &&
      lastOperator &&
      previousKeyType !== "operator" &&
      previousKeyType !== "equals" &&
      previousKeyType !== "plus-minus"
      ? calculate(firstValue, lastOperator, displayedNumber)
      : displayedNumber;
  }

  // If decimal key was pressed
  if (keyType === "decimal") {
    if (!displayedNumber.includes(".")) return displayedNumber + ".";
    if (
      previousKeyType === "operator" ||
      previousKeyType === "equals" ||
      previousKeyType === "percent"
    )
      return "0.";
  }

  // If plus-minus key was pressed
  if (keyType === "plus-minus") {
    if (displayedNumber === "0") return;
    if (displayedNumber.includes("-")) {
      const res = displayedNumber.split("-");
      return res[res.length - 1];
    }
    return `-${displayedNumber}`;
  }

  // If percent key was pressed
  if (keyType === "percent") {
    const n1 = parseFloat(firstValue);
    const n2 = parseFloat(displayedNumber);
    if (firstValue && lastOperator) return (n2 / 100) * n1;
    return n2 / 100;
  }

  // If clear key was pressed
  if (keyType === "clear") return "0";

  // If equals key was pressed
  if (keyType === "equals") {
    return firstValue && lastOperator
      ? previousKeyType === "equals"
        ? calculate(displayedNumber, lastOperator, lastNumber)
        : calculate(firstValue, lastOperator, displayedNumber)
      : displayedNumber;
  }
};

/**
 * Update calculator state
 * @param {HTMLButtonElement} key
 * @param {string} displayedNumber
 */
const updateState = (key, displayedNumber) => {
  const { operator } = key.dataset;
  const keyType = getKeyType(key);
  if (keyType === "plus-minus" && previousKeyType === "equals") return;
  if (keyType === "operator") {
    firstValue = displayedNumber;
    lastOperator = operator;
  }
  if (keyType === "clear") {
    firstValue = undefined;
    lastOperator = undefined;
    lastNumber = undefined;
  }
  if (keyType === "equals") {
    lastNumber =
      firstValue && lastOperator && previousKeyType === "equals"
        ? lastNumber
        : displayedNumber;
  }
  previousKeyType = keyType;
};

/**
 * Calculate final result
 * @param {string} firstValue
 * @param {string} operator
 * @param {string} secondValue
 */
const calculate = (firstValue, operator, secondValue) => {
  const n1 = parseFloat(firstValue);
  const n2 = parseFloat(secondValue);
  // let result;
  if (operator === "add") return n1 + n2;
  if (operator === "subtract") return n1 - n2;
  if (operator === "multiply") return n1 * n2;
  if (operator === "divide") return n1 / n2;
};
