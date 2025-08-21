class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.activeOperator = null;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = false;
        this.removeError();
        this.clearActiveOperator();
    }

    delete() {
        if (this.currentOperand === '0' || this.shouldResetDisplay) return;

        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '' || this.currentOperand === '-') {
            this.currentOperand = '0';
        }
        this.removeError();
    }

    appendNumber(number) {
        if (this.shouldResetDisplay) {
            this.currentOperand = '';
            this.shouldResetDisplay = false;
        }

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
        this.removeError();
    }

    appendDecimal() {
        if (this.shouldResetDisplay) {
            this.currentOperand = '0';
            this.shouldResetDisplay = false;
        }

        if (this.currentOperand.includes('.')) return;
        this.currentOperand = this.currentOperand.toString() + '.';
        this.removeError();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && operation !== '−') return;

        // Handle negative numbers
        if (this.currentOperand === '0' && operation === '−') {
            this.currentOperand = '-';
            return;
        }

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.shouldResetDisplay = true;
        this.setActiveOperator(operation);
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '−':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle very large or very small numbers
        if (!isFinite(computation)) {
            this.showError();
            return;
        }

        // Round to prevent floating point errors
        computation = Math.round(computation * 1000000000000) / 1000000000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetDisplay = true;
        this.clearActiveOperator();
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            this.previousOperandElement.textContent =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    setActiveOperator(operation) {
        this.clearActiveOperator();
        const operatorButton = [...document.querySelectorAll('[data-operator]')]
            .find(button => button.textContent === operation);
        if (operatorButton) {
            operatorButton.classList.add('active');
            this.activeOperator = operatorButton;
        }
    }

    clearActiveOperator() {
        if (this.activeOperator) {
            this.activeOperator.classList.remove('active');
            this.activeOperator = null;
        }
    }

    showError() {
        this.currentOperand = 'Error';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetDisplay = true;
        this.currentOperandElement.classList.add('error');
        this.clearActiveOperator();

        setTimeout(() => {
            this.clear();
            this.updateDisplay();
        }, 2000);
    }

    removeError() {
        this.currentOperandElement.classList.remove('error');
    }
}

// Initialize calculator
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.textContent);
        calculator.updateDisplay();
    });
});

// Operator buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.textContent);
        calculator.updateDisplay();
    });
});

// Equals button
document.querySelector('[data-equals]').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Clear button
document.querySelector('[data-clear]').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Delete button
document.querySelector('[data-delete]').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Decimal button
document.querySelector('[data-decimal]').addEventListener('click', () => {
    calculator.appendDecimal();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    // Prevent default behavior for calculator keys
    if (/[0-9+\-*/.=\r\n\b\x1B]/.test(e.key)) {
        e.preventDefault();
    }

    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();

        // Visual feedback for keyboard input
        const button = [...document.querySelectorAll('[data-number]')]
            .find(btn => btn.textContent === e.key);
        if (button) {
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
            setTimeout(() => {
                button.style.transform = '';
                button.style.boxShadow = '';
            }, 150);
        }
    }

    if (e.key === '.') {
        calculator.appendDecimal();
        calculator.updateDisplay();
    }

    if (e.key === '+') {
        calculator.chooseOperation('+');
        calculator.updateDisplay();
    }

    if (e.key === '-') {
        calculator.chooseOperation('−');
        calculator.updateDisplay();
    }

    if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }

    if (e.key === '/') {
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }

    if (e.key === '=' || e.key === 'Enter') {
        calculator.compute();
        calculator.updateDisplay();
    }

    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }

    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
});

// Initial display update
calculator.updateDisplay();