(() => {
  const listNumbers   = document.querySelectorAll("button:not(.operator):not(.equalSign):not(.action)");
  const listOperators = document.querySelectorAll("button.operator:not(.equalSign)");
  const listOptions   = document.querySelectorAll(".control-btn");
  const resultElem    = document.getElementById("inner-result");
  const quitButton    = document.querySelector(".quit");
  const reduceButton  = document.querySelector(".reduce");
  const increaseButton= document.querySelector(".increase");
  const equalSign     = document.querySelector(".equalSign");
  const calcDisplay   = document.querySelector(".calculation-display");

  let firstNumber = "";
  let secondNumber = "";
  let currentOperator = "";
  let calculationString = "";
  let lastResult = 0;

  const operations = {
    "×": (a, b) => {
      const result = a * b;
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
    },
    "+": (a, b) => {
      const result = a + b;
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
    },
    "-": (a, b) => {
      const result = a - b;
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
    },
    "÷": (a, b) => {
      if (b === 0) {
        return "Erreur";
      }
      const result = a / b;
      return Number.isInteger(result) ? result : parseFloat(result.toFixed(10));
    },
    "%": (a, b) => a % b,
  };

  // Tooltips pour les contrôles
  listOptions.forEach(opt => {
    opt.addEventListener("mouseover", () => showTooltip(opt));
    opt.addEventListener("mouseout", () => hideTooltip(opt));
  });

  const showTooltip = elem => {
    elem.style.transform = "scale(1.2)";
  };

  const hideTooltip = elem => {
    elem.style.transform = "scale(1)";
  };

  // Quitter
  quitButton.addEventListener("click", () => {
    document.getElementById("calculatrice").style.opacity = "0";
    document.getElementById("calculatrice").style.transform = "translateY(20px)";
    setTimeout(() => {
      document.getElementById("calculatrice").style.display = "none";
      document.body.innerHTML = '<div style="text-align:center;padding:50px;color:#888">Calculatrice fermée. Actualisez la page.</div>';
    }, 300);
  });

  // Réduire/Agrandir
  reduceButton.addEventListener("click", () => {
    document.querySelector(".buttons-grid").style.display = "none";
    document.querySelector(".footer").style.display = "none";
    reduceButton.style.display = "none";
    increaseButton.style.display = "flex";
    document.getElementById("calculatrice").style.width = "260px";
  });

  increaseButton.addEventListener("click", () => {
    document.querySelector(".buttons-grid").style.display = "grid";
    document.querySelector(".footer").style.display = "block";
    reduceButton.style.display = "flex";
    increaseButton.style.display = "none";
    document.getElementById("calculatrice").style.width = "320px";
  });

  // Nombres
  listNumbers.forEach(btn => {
    btn.addEventListener("click", () => {
      handleButtonPress(btn);
      handleNumberInput(btn.textContent);
    });
  });

  // Opérateurs
  listOperators.forEach(op => {
    op.addEventListener("click", () => {
      handleButtonPress(op);
      handleOperatorInput(op.textContent);
    });
  });

  // Bouton égal
  equalSign.addEventListener("click", () => {
    handleButtonPress(equalSign);
    calculateResult();
  });

  // Animation des boutons
  const handleButtonPress = btn => {
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 200);
  };

  // Gestion des nombres
  const handleNumberInput = value => {
    if (value === "AC") {
      resetCalculator();
      return;
    }

    if (value === "," || value === ".") {
      handleDecimalPoint();
      return;
    }

    if (!currentOperator) {
      if (firstNumber === "0" && value === "0") return;
      if (firstNumber === "0") firstNumber = value;
      else firstNumber += value;
      updateDisplay(firstNumber);
    } else {
      if (secondNumber === "0" && value === "0") return;
      if (secondNumber === "0") secondNumber = value;
      else secondNumber += value;
      updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber}`);
    }
  };

  // Gestion des opérateurs
  const handleOperatorInput = operator => {
    if (operator === "AC") {
      resetCalculator();
      return;
    }

    if (!firstNumber) return;

    if (secondNumber && currentOperator) {
      calculateResult();
    }

    currentOperator = operator;
    calculationString = `${firstNumber} ${currentOperator}`;
    calcDisplay.textContent = calculationString;
    resultElem.textContent = firstNumber;
  };

  // Point décimal
  const handleDecimalPoint = () => {
    if (!currentOperator) {
      if (!firstNumber.includes(",")) {
        firstNumber = firstNumber ? firstNumber + "," : "0,";
        updateDisplay(firstNumber);
      }
    } else {
      if (!secondNumber.includes(",")) {
        secondNumber = secondNumber ? secondNumber + "," : "0,";
        updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber}`);
      }
    }
  };

  // Calcul
  const calculateResult = () => {
    if (!firstNumber || !currentOperator || !secondNumber) return;

    const num1 = parseFloat(firstNumber.replace(",", "."));
    const num2 = parseFloat(secondNumber.replace(",", "."));
    
    const result = operations[currentOperator](num1, num2);
    
    if (result === "Erreur") {
      resultElem.textContent = "Erreur";
      resultElem.style.color = "#ff4444";
      setTimeout(() => {
        resetCalculator();
        resultElem.style.color = "#00ffc6";
      }, 1500);
      return;
    }

    lastResult = result;
    const formattedResult = result.toString().replace(".", ",");
    
    calcDisplay.textContent = `${firstNumber} ${currentOperator} ${secondNumber} =`;
    resultElem.textContent = formattedResult;
    
    firstNumber = formattedResult;
    secondNumber = "";
    currentOperator = "";
  };

  // Mise à jour de l'affichage
  const updateDisplay = (value) => {
    resultElem.textContent = value;
    resultElem.style.color = "#00ffc6";
  };

  // Réinitialisation
  const resetCalculator = () => {
    firstNumber = "";
    secondNumber = "";
    currentOperator = "";
    calculationString = "";
    resultElem.textContent = "0";
    calcDisplay.textContent = "";
    resultElem.style.color = "#00ffc6";
  };

  // Touches clavier
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    
    if (key >= "0" && key <= "9") {
      handleNumberInput(key);
    } else if (key === "." || key === ",") {
      handleNumberInput(",");
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      const operatorMap = {
        "+": "+",
        "-": "-",
        "*": "×",
        "/": "÷"
      };
      handleOperatorInput(operatorMap[key]);
    } else if (key === "Enter" || key === "=") {
      calculateResult();
    } else if (key === "Escape" || key === "Delete") {
      resetCalculator();
    } else if (key === "%") {
      handleOperatorInput("%");
    }
  });

  // Initialisation
  resetCalculator();
})();
