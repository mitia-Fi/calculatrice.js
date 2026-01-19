(() => {
  // Sélecteurs
  const listNumbers = document.querySelectorAll("button:not(.operator):not(.equalSign)");
  const listOperators = document.querySelectorAll("button.operator:not(.equalSign)");
  const listOptions = document.querySelectorAll("span.action");
  const resultElem = document.getElementById("inner-result");
  const quitButton = document.querySelector(".quit");
  const reduceButton = document.querySelector(".reduce");
  const increaseButton = document.querySelector(".increase");
  const equalSign = document.querySelector(".equalSign");
  const buttonsContainer = document.querySelector(".buttons");

  // État
  let displayValue = "0";
  let firstOperand = null;
  let currentOperator = null;
  let waitingForSecondOperand = false;

  // Opérations
  const operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "×": (a, b) => a * b,
    "÷": (a, b) => {
      if (b === 0) {
        showError("Division par zéro");
        return null;
      }
      return a / b;
    },
    "%": (a, b) => a * (b / 100)   // ← vrai pourcentage (50 % 200 = 100)
  };

  // Formatage du résultat affiché
  function formatResult(num) {
    if (Math.abs(num) > 1e12) return num.toExponential(6);
    if (Number.isInteger(num)) return num.toString();
    return Number(num.toFixed(8)).toString().replace(".", ",");
  }

  // Mise à jour affichage
  function updateDisplay() {
    resultElem.textContent = displayValue;
  }

  // Animation boutons
  function animateButton(btn) {
    btn.style.transform = "scale(0.92)";
    setTimeout(() => btn.style.transform = "", 100);
  }

  // Gestion des chiffres
  function handleNumber(value) {
    if (value === "AC") {
      resetCalculator();
      return;
    }

    if (waitingForSecondOperand) {
      displayValue = value;
      waitingForSecondOperand = false;
    } else {
      if (displayValue === "0" && value !== ",") {
        displayValue = value;
      } else {
        displayValue += value;
      }
    }

    updateDisplay();
  }

  // Gestion de la virgule
  function handleDecimal() {
    if (waitingForSecondOperand) {
      displayValue = "0,";
      waitingForSecondOperand = false;
    } else if (!displayValue.includes(",")) {
      displayValue += displayValue === "" ? "0," : ",";
    }
    updateDisplay();
  }

  // Gestion des opérateurs
  function handleOperator(operator) {
    if (operator === "AC") {
      resetCalculator();
      return;
    }

    // Cas +/- (inversion signe)
    if (operator === "+/-") {
      if (displayValue === "0") return;
      displayValue = displayValue.startsWith("-")
        ? displayValue.substring(1)
        : "-" + displayValue;
      updateDisplay();
      return;
    }

    const currentValue = parseFloat(displayValue.replace(",", "."));

    if (currentOperator && !waitingForSecondOperand) {
      // On a déjà un calcul en attente → on le termine d'abord
      const result = calculate(currentValue);
      if (result === null) return;
      displayValue = formatResult(result);
      firstOperand = result;
    } else {
      firstOperand = currentValue;
    }

    currentOperator = operator;
    waitingForSecondOperand = true;
    updateDisplay(); // on pourrait aussi afficher "first op" ici si tu veux
  }

  // Calcul effectif
  function calculate(secondValue) {
    if (firstOperand === null || currentOperator === null) return null;

    const result = operations[currentOperator](firstOperand, secondValue);

    if (result === null) return null;

    currentOperator = null;
    waitingForSecondOperand = true;
    return result;
  }

  // Bouton =
  function handleEqual() {
    if (!currentOperator || waitingForSecondOperand) return;

    const secondValue = parseFloat(displayValue.replace(",", "."));
    if (isNaN(secondValue)) return;

    const result = calculate(secondValue);
    if (result === null) return;

    displayValue = formatResult(result);
    updateDisplay();
  }

  // Réinitialisation complète
  function resetCalculator() {
    displayValue = "0";
    firstOperand = null;
    currentOperator = null;
    waitingForSecondOperand = false;
    resultElem.style.color = "";
    updateDisplay();
  }

  // Affichage erreur temporaire
  function showError(message) {
    const originalColor = resultElem.style.color;
    resultElem.textContent = message;
    resultElem.style.color = "#ef4444";

    setTimeout(() => {
      resetCalculator();
      resultElem.style.color = originalColor;
    }, 1800);
  }

  // ---------------- Événements ----------------

  // Chiffres
  listNumbers.forEach(btn => {
    btn.addEventListener("click", () => {
      animateButton(btn);
      const val = btn.textContent.trim();
      if (val === ",") handleDecimal();
      else handleNumber(val);
    });
  });

  // Opérateurs
  listOperators.forEach(op => {
    op.addEventListener("click", () => {
      animateButton(op);
      handleOperator(op.textContent.trim());
    });
  });

  // =
  equalSign.addEventListener("click", () => {
    animateButton(equalSign);
    handleEqual();
  });

  // Tooltips + hover
  listOptions.forEach(opt => {
    opt.dataset.tooltip = opt.classList.contains("quit") ? "Fermer" :
                         opt.classList.contains("reduce") ? "Réduire" :
                         "Agrandir";

    opt.addEventListener("mouseover", () => {
      opt.children[0]?.classList.add("text-opacity");
      opt.style.transform = "scale(1.3)";
    });

    opt.addEventListener("mouseout", () => {
      opt.children[0]?.classList.remove("text-opacity");
      opt.style.transform = "scale(1)";
    });
  });

  // Fermer
  quitButton.addEventListener("click", () => {
    const calc = document.getElementById("calculatrice");
    calc.style.transform = "scale(0.9)";
    calc.style.opacity = "0";

    setTimeout(() => {
      calc.style.display = "none";
      document.body.innerHTML = `
        <div style="text-align:center; padding:50px; color:white; font-family:system-ui; font-size:18px;
                    background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); height:100vh;
                    display:flex; align-items:center; justify-content:center;">
          <div>
            <div style="font-size:48px; margin-bottom:20px;">👋</div>
            <div>Calculatrice fermée</div>
            <div style="font-size:14px; opacity:0.7; margin-top:10px;">
              Actualise la page pour recommencer
            </div>
          </div>
        </div>
      `;
    }, 300);
  });

  // Réduire / Agrandir
  reduceButton.addEventListener("click", () => {
    buttonsContainer.classList.add("hide");
    reduceButton.style.display = "none";
    increaseButton.style.display = "block";
    document.getElementById("calculatrice").style.width = "260px";
  });

  increaseButton.addEventListener("click", () => {
    buttonsContainer.classList.remove("hide");
    reduceButton.style.display = "block";
    increaseButton.style.display = "none";
    document.getElementById("calculatrice").style.width = "320px";
  });

  // Clavier
  document.addEventListener("keydown", e => {
    if ("0123456789/*-+.,Enter= EscapeDelete%".includes(e.key)) {
      e.preventDefault();
    }

    if (/[0-9]/.test(e.key)) handleNumber(e.key);
    else if (e.key === "," || e.key === ".") handleDecimal();
    else if (["+", "-", "*", "/"].includes(e.key)) {
      const map = { "+": "+", "-": "-", "*": "×", "/": "÷" };
      handleOperator(map[e.key]);
    }
    else if (e.key === "Enter" || e.key === "=") handleEqual();
    else if (e.key === "Escape" || e.key === "Delete") resetCalculator();
    else if (e.key === "%") handleOperator("%");
  });

  // Initialisation
  resetCalculator();

  // Petit effet d'apparition
  window.addEventListener("load", () => {
    const calc = document.getElementById("calculatrice");
    if (calc) {
      calc.style.opacity = "0";
      setTimeout(() => {
        calc.style.transition = "opacity 0.5s ease";
        calc.style.opacity = "1";
      }, 100);
    }
  });
})();
