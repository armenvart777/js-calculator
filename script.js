class Calculator {
    constructor() {
        this.expression = '';
        this.result = '0';
        this.shouldReset = false;

        this.expressionEl = document.getElementById('expression');
        this.resultEl = document.getElementById('result');

        this.init();
    }

    init() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleButton(btn));
        });

        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    handleButton(btn) {
        const action = btn.dataset.action;
        const value = btn.dataset.value;

        if (action === 'clear') return this.clear();
        if (action === 'backspace') return this.backspace();
        if (action === 'percent') return this.percent();
        if (action === 'equals') return this.calculate();
        if (value) return this.appendValue(value);
    }

    handleKeyboard(e) {
        const key = e.key;
        if (key >= '0' && key <= '9') this.appendValue(key);
        else if (key === '.') this.appendValue('.');
        else if (['+', '-', '*', '/'].includes(key)) this.appendValue(key);
        else if (key === 'Enter' || key === '=') this.calculate();
        else if (key === 'Backspace') this.backspace();
        else if (key === 'Escape') this.clear();
        else if (key === '%') this.percent();
    }

    appendValue(value) {
        const operators = ['+', '-', '*', '/'];

        if (this.shouldReset && !operators.includes(value)) {
            this.expression = '';
            this.shouldReset = false;
        }

        if (operators.includes(value)) {
            this.shouldReset = false;
            const lastChar = this.expression.slice(-1);
            if (operators.includes(lastChar)) {
                this.expression = this.expression.slice(0, -1) + value;
            } else if (this.expression === '' && value !== '-') {
                return;
            } else {
                this.expression += value;
            }
        } else if (value === '.') {
            const parts = this.expression.split(/[+\-*/]/);
            const current = parts[parts.length - 1];
            if (current.includes('.')) return;
            this.expression += value;
        } else {
            this.expression += value;
        }

        this.updateDisplay();
        this.liveCalculate();
    }

    liveCalculate() {
        try {
            const expr = this.expression.replace(/[^0-9+\-*/.]/g, '');
            if (!expr || /[+\-*/.]$/.test(expr)) return;
            const result = Function(`"use strict"; return (${expr})`)();
            if (isFinite(result)) {
                this.result = this.formatNumber(result);
                this.resultEl.textContent = this.result;
            }
        } catch {
            // ignore parse errors during live calculation
        }
    }

    calculate() {
        try {
            const expr = this.expression.replace(/[^0-9+\-*/.]/g, '');
            if (!expr) return;
            const result = Function(`"use strict"; return (${expr})`)();

            if (!isFinite(result)) {
                this.result = 'Error';
            } else {
                this.result = this.formatNumber(result);
            }

            this.expressionEl.textContent = this.expression + ' =';
            this.resultEl.textContent = this.result;
            this.expression = String(result);
            this.shouldReset = true;
        } catch {
            this.result = 'Error';
            this.resultEl.textContent = this.result;
        }
    }

    clear() {
        this.expression = '';
        this.result = '0';
        this.shouldReset = false;
        this.updateDisplay();
    }

    backspace() {
        if (this.shouldReset) return this.clear();
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
        if (this.expression) this.liveCalculate();
        else {
            this.result = '0';
            this.resultEl.textContent = '0';
        }
    }

    percent() {
        try {
            const expr = this.expression.replace(/[^0-9+\-*/.]/g, '');
            if (!expr) return;
            const result = Function(`"use strict"; return (${expr})`)();
            this.expression = String(result / 100);
            this.result = this.formatNumber(result / 100);
            this.updateDisplay();
        } catch {
            // ignore
        }
    }

    formatNumber(num) {
        if (Number.isInteger(num)) return num.toLocaleString('en-US');
        const fixed = parseFloat(num.toFixed(8));
        return fixed.toLocaleString('en-US', { maximumFractionDigits: 8 });
    }

    updateDisplay() {
        const displayExpr = this.expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷');
        this.expressionEl.textContent = displayExpr;
        this.resultEl.textContent = this.result;
    }
}

new Calculator();
