(() => {
  const listNumbers   = document.querySelectorAll("button:not(.operator):not(.equalSign)");
  const listOperators = document.querySelectorAll("button.operator");
  const listOptions   = document.querySelectorAll("span.action");
  const resultElem    = document.getElementById("inner-result");
  const quitButton    = document.querySelector(".quit");
  const reduceButton  = document.querySelector(".reduce");
  const increaseButton= document.querySelector(".increase");
  const equalSign     = document.querySelector(".equalSign");

  let firstNumber = "";
  let secondNumber = "";
  let currentOperator = "";
  let result = 0;

  const calcul = {
    "x": (a, b) => (a * b).toFixed(2),
    "+": (a, b) => (a + b).toFixed(2),
    "-": (a, b) => (a - b).toFixed(2),
    "/": (a, b) => (a / b).toFixed(2),
    "%": (a, b) => (a % b).toFixed(2),
  };

  // Options hover
  listOptions.forEach(opt => {
    opt.addEventListener("mouseover", () => showOptions(opt));
    opt.addEventListener("mouseout", () => hideOptions(opt));
  });

  const showOptions = elem => elem.children[0].classList.add("text-opacity");
  const hideOptions = elem => elem.children[0].classList.remove("text-opacity");

  // Quit
  quitButton.addEventListener("click", () => {
    document.getElementById("calculatrice").style.display = "none";
  });

  // Reduce / Increase
  reduceButton.addEventListener("click", () => {
    document.querySelector(".buttons").classList.toggle("hide");
    reduceButton.style.display = "none";
    increaseButton.style.display = "block";
  });

  increaseButton.addEventListener("click", () => {
    document.querySelector(".buttons").classList.toggle("hide");
    reduceButton.style.display = "block";
    increaseButton.style.display = "none";
  });

  // Numbers
  listNumbers.forEach(btn => {
    btn.addEventListener("click", () => {
      animationOnbuttons(btn);
      showValueOnScreen(btn.innerHTML);
    });
  });

  // Operators
  listOperators.forEach(op => {
    op.addEventListener("click", () => {
      animationOnbuttons(op);
      selectOperator(op.innerHTML);
    });
  });

  const animationOnbuttons = btn => {
    btn.style.opacity = 0.6;
    setTimeout(() => btn.style.opacity = 1, 100);
  };

  // Calculation
  const makeCalculation = () => {
    if (firstNumber && secondNumber && currentOperator) {
      result = calcul[currentOperator](
        parseFloat(firstNumber.replace(",", ".")),
        parseFloat(secondNumber.replace(",", "."))
      );
      resultElem.textContent = result;
      firstNumber = result.toString();
      secondNumber = "";
    }
  };

  const showValueOnScreen = (value, isOperator = false) => {
    if (isOperator) {
      if (currentOperator && !secondNumber) {
        resultElem.textContent = `${firstNumber} ${currentOperator} `;
      }
    } else {
      if (!currentOperator) {
        firstNumber = checkStartingValue(firstNumber, value);
        resultElem.textContent = firstNumber;
      } else {
        secondNumber = checkStartingValue(secondNumber, value);
        resultElem.textContent = `${firstNumber} ${currentOperator} ${secondNumber}`;
      }
    }
  };

  const checkStartingValue = (number, value) => {
    if (number === "0") {
      return value === "," ? number + value : value;
    } else if (number === ",") {
      return "0" + number;
    } else {
      return number + value;
    }
  };

  const selectOperator = operator => {
    if (operator !== "AC") {
      if (firstNumber !== "," && secondNumber !== ",") {
        makeCalculation();
        resultElem.textContent = `${firstNumber} ${currentOperator} ${secondNumber} = ${result}`;
      }
      currentOperator = operator !== "=" ? operator : "";
      showValueOnScreen("", true);
    } else {
      reset();
    }
  };

  const reset = () => {
    resultElem.textContent = "0";
    firstNumber = "";
    secondNumber = "";
    currentOperator = "";
  };

  // Equal sign
  equalSign.addEventListener("click", () => {
    if (firstNumber !== "," && secondNumber !== ",") {
      makeCalculation();
    }
  });
})();
