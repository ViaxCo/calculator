"use strict";
const keys = document.querySelector(".keys");
const display = document.querySelector(".display");
const clearButton = document.querySelector("[data-action=clear]");
const result = document.querySelector("span");
//   Result font size
const fontSize = window.getComputedStyle(result).fontSize; // or max font size

let firstValue;
let previousKeyType;
let lastOperator;
let lastNumber;

keys.addEventListener("click", e => {
  // If element clicked isn't a button, return
  if (!(e.target instanceof HTMLButtonElement)) return;

  const key = e.target;
  const operator = key.dataset.operator;
  const action = key.dataset.action;
  const displayedNumber = result.textContent;

  // If any number key was pressed
  if (!operator && !action) {
    const number = key.textContent;
    clearButton.textContent = "C";
    if (
      displayedNumber === "0" ||
      previousKeyType === "operator" ||
      previousKeyType === "equals" ||
      previousKeyType === "percent"
    ) {
      result.textContent = number;
    } else {
      result.textContent += number;
    }
  }

  // Blink display when action or operator key is pressed
  if ((action && action !== "decimal") || operator) {
    blinkResult();
  }

  // If any operator key was pressed
  if (operator) {
    if (
      firstValue &&
      lastOperator &&
      previousKeyType !== "operator" &&
      previousKeyType !== "equals" &&
      previousKeyType !== "plus-minus"
    ) {
      result.textContent = calculate(firstValue, lastOperator, displayedNumber);
    }
    firstValue = result.textContent;
    lastOperator = operator;
  }

  // If any action key was pressed
  switch (action) {
    case "decimal": {
      if (!displayedNumber.includes(".")) {
        clearButton.textContent = "C";
        result.textContent += ".";
      }
      if (
        previousKeyType === "operator" ||
        previousKeyType === "equals" ||
        previousKeyType === "percent"
      ) {
        result.textContent = "0.";
      }
      break;
    }
    case "plus-minus": {
      if (displayedNumber === "0") break;
      if (displayedNumber.includes("-")) {
        const res = displayedNumber.split("-");
        result.textContent = res[res.length - 1];
        break;
      }
      result.textContent = `-${displayedNumber}`;
      break;
    }
    case "percent": {
      result.textContent = (parseFloat(displayedNumber) / 100).toString();
      if (firstValue && lastOperator) {
        result.textContent = (
          (parseFloat(displayedNumber) / 100) *
          parseFloat(firstValue)
        ).toString();
      }
      if (displayedNumber.includes("e")) {
        result.style.fontSize = fontSize;
      }
      break;
    }
    case "equals": {
      let secondValue = displayedNumber;
      if (firstValue && lastOperator) {
        if (previousKeyType === "equals") {
          firstValue = displayedNumber;
          secondValue = lastNumber;
        }
        result.textContent = calculate(firstValue, lastOperator, secondValue);
        lastNumber = secondValue;
      }
      break;
    }
    case "clear": {
      result.textContent = "0";
      result.style.fontSize = fontSize;
      clearButton.textContent = "AC";
      firstValue = undefined;
      lastOperator = undefined;
      lastNumber = undefined;
      break;
    }

    default:
      break;
  }

  if (action) {
    previousKeyType = action;
  }
  if (operator) {
    previousKeyType = "operator";
  }
  if (!action && !operator) {
    previousKeyType = "number";
  }

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
 * Calculate final result
 * @param {string} firstValue
 * @param {string} operator
 * @param {string} secondValue
 */
const calculate = (firstValue, operator, secondValue) => {
  const n1 = parseFloat(firstValue);
  const n2 = parseFloat(secondValue);
  let result;
  switch (operator) {
    case "add":
      result = n1 + n2;
      break;
    case "subtract":
      result = n1 - n2;
      break;
    case "multiply":
      result = n1 * n2;
      break;
    case "divide":
      result = n1 / n2;
      break;

    default:
      break;
  }
  return result.toString();
};
