(() => {
  // SELECTEURS CORRIGÉS - correspond à ton HTML
  const listNumbers = document.querySelectorAll("button:not(.operator)");
  const listOperators = document.querySelectorAll("button.operator:not(.equalSign)");
  const listOptions = document.querySelectorAll(".control-btn");
  const resultElem = document.getElementById("inner-result");
  const quitButton = document.querySelector(".quit");
  const reduceButton = document.querySelector(".reduce");
  const increaseButton = document.querySelector(".increase");
  const equalSign = document.querySelector(".equalSign");
  
  // CORRECTION: Nettoyage des sélecteurs pour éviter les doublons
  const allButtons = document.querySelectorAll("button");
  
  // ÉTAT
  let firstNumber = "";
  let secondNumber = "";
  let currentOperator = "";
  let shouldResetScreen = false;
  let isPercentageMode = false;

  // OPÉRATIONS CORRIGÉES - % maintenant fonctionnel
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
    // CORRECTION: % maintenant fonctionne correctement
    "%": (a, b) => {
      // Calcul du pourcentage: a % de b
      return (a * b) / 100;
    },
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
    increaseButton.style.display = "block";
    document.getElementById("calculatrice").style.width = "260px";
  });

  increaseButton.addEventListener("click", () => {
    document.querySelector(".buttons-grid").style.display = "grid";
    document.querySelector(".footer").style.display = "block";
    reduceButton.style.display = "block";
    increaseButton.style.display = "none";
    document.getElementById("calculatrice").style.width = "320px";
  });

  // CORRECTION: Gestion unifiée des boutons
  allButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Animation
      animateButton(btn);
      
      // Gestion selon le type de bouton
      if (btn.classList.contains("operator")) {
        if (btn.textContent === "=") {
          calculate();
        } else {
          handleOperator(btn.textContent);
        }
      } else {
        handleNumber(btn.textContent);
      }
    });
  });

  // Animation des boutons
  const animateButton = btn => {
    btn.classList.add("pressed");
    setTimeout(() => btn.classList.remove("pressed"), 200);
  };

  // CORRECTION: Gestion améliorée des nombres
  const handleNumber = value => {
    if (value === "AC") {
      resetCalculator();
      return;
    }

    if (value === "," || value === ".") {
      addDecimal();
      return;
    }

    // Gestion spéciale pour +/- (changement de signe)
    if (value === "+/-") {
      toggleSign();
      return;
    }

    if (shouldResetScreen) {
      firstNumber = "";
      shouldResetScreen = false;
    }

    if (!currentOperator) {
      // Pas d'opérateur sélectionné
      if (firstNumber === "0" && value === "0") return;
      if (firstNumber === "0") {
        firstNumber = value;
      } else {
        firstNumber += value;
      }
      updateDisplay(firstNumber);
    } else {
      // Opérateur sélectionné, on ajoute au deuxième nombre
      if (secondNumber === "0" && value === "0") return;
      if (secondNumber === "0") {
        secondNumber = value;
      } else {
        secondNumber += value;
      }
      updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber}`);
    }
  };

  // CORRECTION: Gestion améliorée des opérateurs
  const handleOperator = operator => {
    console.log("Operator clicked:", operator);
    
    if (operator === "AC") {
      resetCalculator();
      return;
    }

    // Gestion spéciale pour % (mode pourcentage)
    if (operator === "%") {
      handlePercentage();
      return;
    }

    // Si +/- est pressé sans nombre
    if (operator === "+/-" && !firstNumber) {
      firstNumber = "-";
      updateDisplay(firstNumber);
      return;
    }

    // Si on a déjà un premier nombre
    if (firstNumber && firstNumber !== "-" && firstNumber !== ",") {
      // Si on a déjà un deuxième nombre et un opérateur, on calcule d'abord
      if (secondNumber && currentOperator) {
        calculate();
      }
      
      // Nouvel opérateur
      currentOperator = operator;
      shouldResetScreen = false;
      
      // Afficher l'opération en cours
      updateDisplay(`${firstNumber} ${currentOperator}`);
    }
  };

  // NOUVEAU: Gestion du pourcentage
  const handlePercentage = () => {
    if (!firstNumber || firstNumber === "-" || firstNumber === ",") return;
    
    const num = parseFloat(firstNumber.replace(",", "."));
    
    if (currentOperator && secondNumber) {
      // Calcul du pourcentage dans le contexte d'une opération
      const secondNum = parseFloat(secondNumber.replace(",", "."));
      let percentageValue;
      
      switch(currentOperator) {
        case "+":
        case "-":
          percentageValue = (num * secondNum) / 100;
          break;
        case "×":
        case "÷":
          percentageValue = secondNum / 100;
          break;
        default:
          percentageValue = num / 100;
      }
      
      secondNumber = percentageValue.toString().replace(".", ",");
      updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber}`);
    } else {
      // Simple pourcentage
      const percentage = num / 100;
      firstNumber = percentage.toString().replace(".", ",");
      updateDisplay(firstNumber);
    }
    
    isPercentageMode = true;
  };

  // NOUVEAU: Changement de signe
  const toggleSign = () => {
    if (!currentOperator) {
      if (firstNumber) {
        firstNumber = firstNumber.startsWith("-") ? 
                     firstNumber.substring(1) : `-${firstNumber}`;
        updateDisplay(firstNumber);
      }
    } else if (secondNumber) {
      secondNumber = secondNumber.startsWith("-") ? 
                    secondNumber.substring(1) : `-${secondNumber}`;
      updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber}`);
    }
  };

  // Point décimal
  const addDecimal = () => {
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

  // CORRECTION: Calcul avec % fonctionnel
  const calculate = () => {
    if (!firstNumber || !currentOperator || !secondNumber) return;

    const num1 = parseFloat(firstNumber.replace(",", "."));
    const num2 = parseFloat(secondNumber.replace(",", "."));
    
    if (isNaN(num1) || isNaN(num2)) {
      showError("Erreur");
      return;
    }

    const operation = operations[currentOperator];
    if (!operation) return;

    const result = operation(num1, num2);
    
    if (result === "Erreur") {
      showError("Division par 0");
      return;
    }

    const formattedResult = result.toString().replace(".", ",");
    
    // Animation du résultat
    resultElem.style.opacity = "0";
    resultElem.style.transform = "translateY(10px)";
    
    setTimeout(() => {
      resultElem.textContent = formattedResult;
      resultElem.style.opacity = "1";
      resultElem.style.transform = "translateY(0)";
      resultElem.style.color = "#00ffc6";
    }, 150);

    // Préparer pour la prochaine opération
    firstNumber = formattedResult;
    secondNumber = "";
    currentOperator = "";
    shouldResetScreen = true;
    isPercentageMode = false;
  };

  // Mise à jour de l'affichage
  const updateDisplay = (value) => {
    resultElem.textContent = value;
    
    // Effet de frappe
    resultElem.style.transform = "scale(1.02)";
    resultElem.style.transition = "transform 0.1s ease";
    
    setTimeout(() => {
      resultElem.style.transform = "scale(1)";
    }, 100);
  };

  // Réinitialisation
  const resetCalculator = () => {
    firstNumber = "";
    secondNumber = "";
    currentOperator = "";
    shouldResetScreen = false;
    isPercentageMode = false;
    resultElem.textContent = "0";
    resultElem.style.color = "#00ffc6";
    resultElem.style.opacity = "1";
    resultElem.style.transform = "scale(1)";
  };

  // Affichage d'erreur
  const showError = (message) => {
    const originalColor = resultElem.style.color;
    resultElem.textContent = message;
    resultElem.style.color = "#ff4444";
    
    setTimeout(() => {
      resetCalculator();
      resultElem.style.color = originalColor;
    }, 1500);
  };

  // CORRECTION: Support clavier amélioré
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    
    // Empêcher le comportement par défaut
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
    } else if (key === "Backspace") {
      // Supprimer le dernier caractère
      if (!currentOperator) {
        if (firstNumber.length > 0) {
          firstNumber = firstNumber.slice(0, -1);
          updateDisplay(firstNumber || "0");
        }
      } else if (secondNumber.length > 0) {
        secondNumber = secondNumber.slice(0, -1);
        updateDisplay(`${firstNumber} ${currentOperator} ${secondNumber || ""}`);
      }
    }
  });

  // Initialisation
  resetCalculator();
  
  // EFFET DE CHARGEMENT
  window.addEventListener("load", () => {
    const calc = document.getElementById("calculatrice");
    calc.style.opacity = "0";
    calc.style.transform = "translateY(20px)";
    
    setTimeout(() => {
      calc.style.transition = "opacity 0.5s ease, transform 0.5s ease";
      calc.style.opacity = "1";
      calc.style.transform = "translateY(0)";
    }, 100);
  });
})();