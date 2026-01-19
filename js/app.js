(() => {
  // SELECTEURS
  const listNumbers = document.querySelectorAll("button:not(.operator):not(.equalSign)");
  const listOperators = document.querySelectorAll("button.operator:not(.equalSign)");
  const listOptions = document.querySelectorAll("span.action");
  const resultElem = document.getElementById("inner-result");
  const quitButton = document.querySelector(".quit");
  const reduceButton = document.querySelector(".reduce");
  const increaseButton = document.querySelector(".increase");
  const equalSign = document.querySelector(".equalSign");
  const buttonsContainer = document.querySelector(".buttons");

  // ÉTAT
  let firstNumber = "";
  let secondNumber = "";
  let currentOperator = "";
  let shouldResetScreen = false;

  // OPÉRATIONS
  const operations = {
    "×": (a, b) => {
      const result = a * b;
      return Math.abs(result) > 1e12 ? result.toExponential(6) : 
             Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
    },
    "+": (a, b) => {
      const result = a + b;
      return Math.abs(result) > 1e12 ? result.toExponential(6) : 
             Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
    },
    "-": (a, b) => {
      const result = a - b;
      return Math.abs(result) > 1e12 ? result.toExponential(6) : 
             Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
    },
    "÷": (a, b) => {
      if (b === 0) {
        showError("Division par zéro");
        return null;
      }
      const result = a / b;
      return Math.abs(result) > 1e12 ? result.toExponential(6) : 
             Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
    },
    "%": (a, b) => a % b
  };

  // TOOLTIPS POUR LES CONTROLES
  listOptions.forEach(opt => {
    opt.dataset.tooltip = opt.classList.contains("quit") ? "Fermer" :
                         opt.classList.contains("reduce") ? "Réduire" : "Agrandir";
    
    opt.addEventListener("mouseover", () => {
      opt.children[0].classList.add("text-opacity");
      opt.style.transform = "scale(1.3)";
    });
    
    opt.addEventListener("mouseout", () => {
      opt.children[0].classList.remove("text-opacity");
      opt.style.transform = "scale(1)";
    });
  });

  // FERMER (avec animation)
  quitButton.addEventListener("click", () => {
    const calc = document.getElementById("calculatrice");
    calc.style.transform = "scale(0.9)";
    calc.style.opacity = "0";
    
    setTimeout(() => {
      calc.style.display = "none";
      document.body.innerHTML = `
        <div style="
          text-align: center;
          padding: 50px;
          color: white;
          font-family: system-ui;
          font-size: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div>
            <div style="font-size: 48px; margin-bottom: 20px;">👋</div>
            <div>Calculatrice fermée</div>
            <div style="font-size: 14px; opacity: 0.7; margin-top: 10px;">
              Actualise la page pour recommencer
            </div>
          </div>
        </div>
      `;
    }, 300);
  });

  // RÉDUIRE / AGRANDIR
  reduceButton.addEventListener("click", () => {
    buttonsContainer.classList.add("hide");
    reduceButton.style.display = "none";
    increaseButton.style.display = "block";
    document.getElementById("calculatrice").style.width = "260px";
    document.getElementById("calculatrice").style.transition = "width 0.3s ease";
  });

  increaseButton.addEventListener("click", () => {
    buttonsContainer.classList.remove("hide");
    reduceButton.style.display = "block";
    increaseButton.style.display = "none";
    document.getElementById("calculatrice").style.width = "320px";
  });

  // GESTION DES NOMBRES
  listNumbers.forEach(btn => {
    btn.addEventListener("click", () => {
      animateButton(btn);
      handleNumber(btn.textContent);
    });
  });

  // GESTION DES OPÉRATEURS
  listOperators.forEach(op => {
    op.addEventListener("click", () => {
      animateButton(op);
      handleOperator(op.textContent);
    });
  });

  // BOUTON ÉGAL
  equalSign.addEventListener("click", () => {
    animateButton(equalSign);
    calculate();
  });

  // ANIMATION DES BOUTONS
  function animateButton(btn) {
    btn.style.transform = "scale(0.95)";
    setTimeout(() => {
      btn.style.transform = "";
    }, 100);
  }

  // GESTION DES NOMBRES
  function handleNumber(value) {
    if (value === "AC") {
      resetCalculator();
      return;
    }

    if (value === "," || value === ".") {
      addDecimal();
      return;
    }

    if (shouldResetScreen) {
      firstNumber = "";
      shouldResetScreen = false;
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
  }

  // GESTION DES OPÉRATEURS
  function handleOperator(operator) {
    if (operator === "AC") {
      resetCalculator();
      return;
    }

    if (!firstNumber && operator !== "-") return;

    if (operator === "+/-" && firstNumber) {
      firstNumber = firstNumber.startsWith("-") ? 
                   firstNumber.substring(1) : `-${firstNumber}`;
      updateDisplay(firstNumber);
      return;
    }

    if (secondNumber && currentOperator) {
      calculate();
    }

    if (firstNumber) {
      currentOperator = operator;
      updateDisplay(`${firstNumber} ${currentOperator}`);
      shouldResetScreen = false;
    }
  }

  // POINT DÉCIMAL
  function addDecimal() {
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
  }

  // CALCUL
  function calculate() {
    if (!firstNumber || !currentOperator || !secondNumber) return;

    const num1 = parseFloat(firstNumber.replace(",", "."));
    const num2 = parseFloat(secondNumber.replace(",", "."));
    
    if (isNaN(num1) || isNaN(num2)) {
      showError("Erreur de saisie");
      return;
    }

    const operation = operations[currentOperator];
    if (!operation) return;

    const result = operation(num1, num2);
    
    if (result === null) return; // Erreur déjà gérée

    const formattedResult = result.toString().replace(".", ",");
    
    // Affichage avec effet
    resultElem.style.opacity = "0";
    resultElem.style.transform = "translateY(10px)";
    
    setTimeout(() => {
      resultElem.textContent = formattedResult;
      resultElem.style.opacity = "1";
      resultElem.style.transform = "translateY(0)";
      resultElem.style.transition = "all 0.3s ease";
    }, 150);

    firstNumber = formattedResult;
    secondNumber = "";
    currentOperator = "";
    shouldResetScreen = true;
  }

  // MISE À JOUR DE L'AFFICHAGE
  function updateDisplay(value) {
    resultElem.textContent = value;
    
    // Effet de frappe
    resultElem.style.transform = "scale(1.02)";
    setTimeout(() => {
      resultElem.style.transform = "scale(1)";
    }, 50);
  }

  // RÉINITIALISATION
  function resetCalculator() {
    firstNumber = "";
    secondNumber = "";
    currentOperator = "";
    shouldResetScreen = false;
    resultElem.textContent = "0";
    resultElem.style.color = "";
  }

  // AFFICHAGE D'ERREUR
  function showError(message) {
    const originalColor = resultElem.style.color;
    resultElem.textContent = message;
    resultElem.style.color = "#ef4444";
    
    setTimeout(() => {
      resultElem.textContent = "0";
      resultElem.style.color = originalColor;
      resetCalculator();
    }, 1500);
  }

  // SUPPORT CLAVIER
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    
    // Empêcher le comportement par défaut pour les touches de calculatrice
    if ("0123456789/*-+.,Enter= EscapeDelete%".includes(key)) {
      e.preventDefault();
    }
    
    if (key >= "0" && key <= "9") {
      handleNumber(key);
    } else if (key === "." || key === ",") {
      handleNumber(",");
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      const operatorMap = {
        "+": "+",
        "-": "-",
        "*": "×",
        "/": "÷"
      };
      handleOperator(operatorMap[key]);
    } else if (key === "Enter" || key === "=") {
      calculate();
    } else if (key === "Escape" || key === "Delete") {
      resetCalculator();
    } else if (key === "%") {
      handleOperator("%");
    }
  });

  // INITIALISATION
  resetCalculator();

  // EFFET DE CHARGEMENT
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("calculatrice").style.opacity = "0";
    setTimeout(() => {
      document.getElementById("calculatrice").style.transition = "opacity 0.5s ease";
      document.getElementById("calculatrice").style.opacity = "1";
    }, 100);
  });
})();
