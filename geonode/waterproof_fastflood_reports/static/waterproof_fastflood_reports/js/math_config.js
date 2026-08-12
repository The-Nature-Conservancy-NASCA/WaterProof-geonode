var MQ = MathQuill.getInterface(2);
var CostSelected = null;
var mathFieldSpan = document.getElementById('math-field');
//var latexSpan = document.getElementById('latex');
var mathField = MQ.MathField(mathFieldSpan, {
    spaceBehavesLikeTab: true,
    autoCommands: 'pi theta sqrt sum mod',
    autoOperatorNames: 'sin cos tan',
    restrictMismatchedBrackets: true,
    supSubsRequireOperand: true,
    handlers: {
        edit: function() {
            mathField.focus();

        }
    }
});

//logical input logical
var MQL1 = MathQuill.getInterface(2);
var CostSelected = null;
var mathFieldSpanLog1 = document.getElementById('math-fieldlogic1');
var mathFieldlog1 = MQL1.MathField(mathFieldSpanLog1, {
    spaceBehavesLikeTab: true,
    autoCommands: 'pi theta sqrt sum mod',
    autoOperatorNames: 'sin cos tan',
    restrictMismatchedBrackets: true,
    supSubsRequireOperand: true,
    handlers: {
        edit: function() {
            mathFieldlog1.focus();

        }
    }
});



//logical input expresion
var MQE1 = MathQuill.getInterface(2);
var CostSelected = null;
var mathFieldSpanE1 = document.getElementById('math-fieldex1');

var mathFieldE1 = MQE1.MathField(mathFieldSpanE1, {
    spaceBehavesLikeTab: true,
    autoCommands: 'pi theta sqrt sum mod',
    autoOperatorNames: 'sin cos tan',
    restrictMismatchedBrackets: true,
    supSubsRequireOperand: true,
    handlers: {
        edit: function() {
            mathFieldE1.focus();
        }
    }
});