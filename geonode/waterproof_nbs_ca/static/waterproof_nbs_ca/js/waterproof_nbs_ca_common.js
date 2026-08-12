checkPercentage = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';

    commaNum = null;
    // Create regex based on language: dot for English (original), comma for Spanish
    let regexp = isSpanish ? /^\d+(\,\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        let splitedValue = value.split(decimalSep);
        let intNumber = parseInt(splitedValue[0]);
        if (intNumber >= 0 && intNumber <= 100)
            return true;
        else
            event.target.value = isSpanish ? "100,00" : "100.00";
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,2})\d*$/ : /^(\d+\.?\d{0,2})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits and correct decimal separator)
        let allowedChars = isSpanish ? /[^0-9\,]/g : /[^0-9\.]/g;
        value = value.replace(allowedChars, "");

        // Check for decimal separator
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = (value.match(sepPattern)).length;
            if (commaNum == 1) {
                let result = value.substring(0, value.indexOf(decimalSep));
                if (result == "") {
                    event.target.value = "";
                    return false;
                }
            }
        }
        if (commaNum !== null && commaNum > 1) {
            // Remove separator at start or end
            let cleanPattern = isSpanish ? /^,|,$/g : /^\.|\.$/g;
            value = value.replace(cleanPattern, '');
        }
        event.target.value = value;
        let splitedValue = value.split(decimalSep);
        let intNumber = parseInt(splitedValue[0]);
        if (intNumber >= 0 && intNumber <= 100)
            return true;
        else
            event.target.value = "";
    }
}

/**
 * Check percentage format allowing zero (0-100)
 * This function is specifically for fields like benefitTimePorc where 0 is valid
 */
checkPercentageWithZero = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';

    // Allow empty value during typing
    if (value === "") {
        return true;
    }

    commaNum = null;
    // Create regex based on language that explicitly allows 0
    let regexp = isSpanish ? /^(0|[0-9]\d*)(\,\d{1,2})?$/ : /^(0|[0-9]\d*)(\.\d{1,2})?$/;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        // Parse the number to check range
        let numValue = isSpanish ? parseFloat(value.replace(',', '.')) : parseFloat(value);
        if (numValue >= 0 && numValue <= 100) {
            return true;
        } else {
            event.target.value = isSpanish ? "100,00" : "100.00";
            return false;
        }
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,2})\d*$/ : /^(\d+\.?\d{0,2})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits and correct decimal separator)
        let allowedChars = isSpanish ? /[^0-9\,]/g : /[^0-9\.]/g;
        value = value.replace(allowedChars, "");

        // Check for multiple decimal separators
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = (value.match(sepPattern)).length;
            if (commaNum > 1) {
                // Remove extra separators - keep only the first one
                let parts = value.split(decimalSep);
                value = parts[0] + decimalSep + parts.slice(1).join('');
            }
        }

        event.target.value = value;

        // Validate the cleaned value
        if (value !== "") {
            let numValue = isSpanish ? parseFloat(value.replace(',', '.')) : parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                return true;
            }
        }
        return true; // Allow intermediate values while typing
    }
}
checkDecimalFormat = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';
    const otherSep = isSpanish ? '.' : ',';

    commaNum = null;
    // Create regex based on language: comma for Spanish, dot for English
    let regexp = isSpanish ? /^\d+(\,\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        return true;
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,2})\d*$/ : /^(\d+\.?\d{0,2})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits and correct decimal separator)
        let allowedChars = isSpanish ? /[^0-9\,]/g : /[^0-9\.]/g;
        value = value.replace(allowedChars, "");

        // Check for decimal separator
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = event.target.value.indexOf(otherSep);
            if (commaNum > 0) {
                let result = value.substring(0, value.indexOf(otherSep));
                if (result == "") {
                    event.target.value = "";
                    return false;
                }
            }
        }
        if (commaNum !== null && commaNum > 1) {
            // Remove separator at start or end
            let cleanPattern = isSpanish ? /^,|,$/g : /^\.|\.$/g;
            value = value.replace(cleanPattern, '');
        }
        event.target.value = value;
    }
}

checkDecimalFormatExtra = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';
    const otherSep = isSpanish ? '.' : ',';

    commaNum = null;
    // Create regex based on language: comma for Spanish, dot for English
    let regexp = isSpanish ? /^\d+(\,\d{1,3})?$/ : /^\d+(\.\d{1,3})?$/;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        return true;
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,3})\d*$/ : /^(\d+\.?\d{0,3})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits and correct decimal separator)
        let allowedChars = isSpanish ? /[^0-9\,]/g : /[^0-9\.]/g;
        value = value.replace(allowedChars, "");

        // Check for decimal separator
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = event.target.value.indexOf(otherSep);
            if (commaNum > 0) {
                let result = value.substring(0, value.indexOf(otherSep));
                if (result == "") {
                    event.target.value = "";
                    return false;
                }
            }
        }
        if (commaNum !== null && commaNum > 1) {
            // Remove separator at start or end
            let cleanPattern = isSpanish ? /^,|,$/g : /^\.|\.$/g;
            value = value.replace(cleanPattern, '');
        }
        event.target.value = value;
    }
}

afterCheckDecimal = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';

    // Create regex based on language: comma for Spanish, dot for English
    let regexp = isSpanish ? /^\d+(\,\d{1,2})?$/ : /^\d+(\.\d{1,2})?$/;
    valid = regexp.test(value);

    if (valid) {
        return true;
    }
    else {
        event.target.value = "";
        let test = gettext('Wrong decimal format');
        event.target.placeholder = test;
        event.target.focus();
    }
}

afterCheckDecimalExtra = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';

    // Create regex based on language: comma for Spanish, dot for English
    let regexp = isSpanish ? /^\d+(\,\d{1,3})?$/ : /^\d+(\.\d{1,3})?$/;
    let validFormat = regexp.test(value);

    if (validFormat) {
        // Parse number using correct decimal separator
        const numValue = isSpanish ? parseFloat(value.replace(',', '.')) : parseFloat(value);
        if (numValue <= 1 && numValue > 0) {
            return true;
        } else {
            event.target.value = "";
            let test = gettext('Must be between 0 and 1');
            event.target.placeholder = test;
            return false;
        }
    } else {
        event.target.value = "";
        let test = gettext('Wrong value');
        event.target.placeholder = test;
        return false;
    }
}

checkDecimalFormatZero = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';

    // Allow empty value during typing
    if (value === "") {
        return true;
    }

    commaNum = null;
    // Create regex based on language that allows positive numbers with up to 2 decimals
    // Allows: 1, 1.5, 1.50, 123.45, 0.01, etc.
    let regexp = isSpanish ?
        /^([0-9]+(\,[0-9]{1,2})?)$/ :
        /^([0-9]+(\.[0-9]{1,2})?)$/;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        // Allow intermediate values during typing (like "0" when typing "0.5")
        // Only validate > 0 when there's a decimal separator OR it's just a single digit
        if (value.includes(decimalSep)) {
            // Has decimal separator, validate the complete value
            let numValue = isSpanish ? parseFloat(value.replace(',', '.')) : parseFloat(value);
            if (numValue >= 0 && numValue <= 1000) {
                return true;
            } else {
                // Value is 0.0 or 0.00, clear it
                event.target.value = "";
                return false;
            }
        } else {
            // No decimal separator yet, allow any valid format (including "0" while typing)
            // Final validation will happen on focusout
            return true;
        }
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,2})\d*$/ : /^(\d+\.?\d{0,2})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits 0-9 and correct decimal separator)
        let allowedChars = isSpanish ? /[^0-9\,]/g : /[^0-9\.]/g;
        value = value.replace(allowedChars, "");

        // Check for multiple decimal separators
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = (value.match(sepPattern)).length;
            if (commaNum > 1) {
                // Remove extra separators - keep only the first one
                let parts = value.split(decimalSep);
                value = parts[0] + decimalSep + parts.slice(1).join('');
            }
        }

        event.target.value = value;

        // Allow intermediate values while typing
        return true;
    }
}

// Validate final value on focusout: must be > 0
afterCheckDecimalZero = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';

    // Allow empty value
    if (value === "" || value === null || value === undefined) {
        return true;
    }

    // Create regex based on language
    let regexp = isSpanish ? /^([0-9]+(\,[0-9]{1,2})?)$/ : /^([0-9]+(\.[0-9]{1,2})?)$/;
    let validFormat = regexp.test(value);

    if (validFormat) {
        // Parse number using correct decimal separator
        const numValue = isSpanish ? parseFloat(value.replace(',', '.')) : parseFloat(value);
        if (numValue > 0) {
            return true;
        } else {
            event.target.value = "";
            let test = gettext('Value must be greater than 0');
            event.target.placeholder = test;
            return false;
        }
    } else {
        event.target.value = "";
        let test = gettext('Wrong decimal format');
        event.target.placeholder = test;
        return false;
    }
}

// Only integers excluding 0
checkTimeBenefit = function (event, value) {
    let regexp = /^[1-9]+[0-9]*$/;
    valid = regexp.test(value);
    if (valid) {
        return true;
    }
    else {
        event.target.value = "";
    }
}

checkTime = function (event, value) {
    // Determine decimal separator based on language
    const isSpanish = typeof languageCode !== 'undefined' && languageCode === 'es-ES';
    const decimalSep = isSpanish ? ',' : '.';

    commaNum = null;
    // Create regex based on language: comma for Spanish, dot for English
    let regexp = isSpanish ?
        /^(?=.*[0-9])([0-9]{0,12}(?:,[0-9]{1,2})?)$/gm :
        /^(?=.*[0-9])([0-9]{0,12}(?:\.[0-9]{1,2})?)$/gm;
    valid = regexp.test(value);

    // Validate string
    if (valid) {
        let splitedValue = value.split(decimalSep);
        let intNumber = parseInt(splitedValue[0]);
        if (intNumber >= 0 && intNumber <= 200)
            return true;
        else
            event.target.value = "200";
    }
    else {
        // Remove extra decimals (using correct separator)
        let replacePattern = isSpanish ? /^(\d+,?\d{0,2})\d*$/ : /^(\d+\.?\d{0,2})\d*$/;
        value = value.replace(replacePattern, "$1");

        // Remove special symbols and letters (keeping only digits)
        value = value.replace(/[^0-9]/g, "");

        // Check for decimal separator
        let sepPattern = isSpanish ? /,/g : /\./g;
        if (value.match(sepPattern) !== null) {
            commaNum = (value.match(sepPattern)).length;
            if (commaNum == 1) {
                let result = value.substring(0, value.indexOf(decimalSep));
                if (result == "") {
                    event.target.value = "";
                    return false;
                }
            }
        }
        if (commaNum !== null && commaNum > 1) {
            // Remove separator at start or end
            let cleanPattern = isSpanish ? /^,|,$/g : /^\.|\.$/g;
            value = value.replace(cleanPattern, '');
        }
        event.target.value = value;
        let splitedValue = value.split(decimalSep);
        let intNumber = parseInt(splitedValue[0]);
        if (intNumber >= 0 && intNumber <= 200)
            return true;
        else
            event.target.value = "";
    }
};

/**
 * Validate that all enabled itemManning and itemInfiltration fields have values
 * @returns {Object} Object with isValid boolean and message string
 */
validateManningAndInfiltrationFields = function() {
    let emptyManningFields = [];
    let emptyInfiltrationFields = [];

    // Check all itemManning fields
    $('input[data-value="itemManning"]').each(function() {
        if (!$(this).prop('disabled') && $(this).val().trim() === "") {
            const fieldName = $(this).attr('name');
            emptyManningFields.push(fieldName);
        }
    });

    // Check all itemInfiltration fields
    $('input[data-value="itemInfiltration"]').each(function() {
        if (!$(this).prop('disabled') && $(this).val().trim() === "") {
            const fieldName = $(this).attr('name');
            emptyInfiltrationFields.push(fieldName);
        }
    });

    // Build error message
    let errorMessages = [];
    if (emptyManningFields.length > 0) {
        errorMessages.push(gettext('Please fill in the n-Manning Coefficient for') + ': ' + emptyManningFields.join(', '));
    }
    if (emptyInfiltrationFields.length > 0) {
        errorMessages.push(gettext('Please fill in the Infiltration rate for') + ': ' + emptyInfiltrationFields.join(', '));
    }

    return {
        isValid: emptyManningFields.length === 0 && emptyInfiltrationFields.length === 0,
        message: errorMessages.join('\n')
    };
};

// Mostrar nombre y tamaño del archivo seleccionado en restrictedArea
document.addEventListener('DOMContentLoaded', function() {
    var restrictedAreaInput = document.getElementById('restrictedArea');
    var fileInfoDiv = document.getElementById('restrictedAreaFileInfo');
    var fileNameSpan = document.getElementById('restrictedAreaFileName');
    var fileSizeSpan = document.getElementById('restrictedAreaFileSize');

    if (restrictedAreaInput) {
        restrictedAreaInput.addEventListener('change', function(event) {
            if (this.files && this.files.length > 0) {
                var file = this.files[0];
                var fileName = file.name;
                var fileSize = file.size;

                // Formatear el tamaño del archivo
                var formattedSize;
                if (fileSize < 1024) {
                    formattedSize = fileSize + ' bytes';
                } else if (fileSize < 1024 * 1024) {
                    formattedSize = (fileSize / 1024).toFixed(2) + ' KB';
                } else if (fileSize < 1024 * 1024 * 1024) {
                    formattedSize = (fileSize / (1024 * 1024)).toFixed(2) + ' MB';
                } else {
                    formattedSize = (fileSize / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
                }

                // Mostrar la información del archivo
                fileNameSpan.textContent = fileName;
                fileSizeSpan.textContent = formattedSize;
                fileInfoDiv.style.display = 'block';
            } else {
                // Ocultar la información si no hay archivo
                fileInfoDiv.style.display = 'none';
            }
        });
    }
});

// ==================== NBS Name Validation Functions ====================

/**
 * Validate if NBS name already exists for current user
 * @param {string} name - NBS name to validate
 * @param {number|null} excludeId - ID to exclude from search (for edit/clone)
 * @returns {Promise<{exists: boolean, message: string}>}
 */
async function validateNbsName(name, excludeId = null) {
    if (!name || name.trim().length < 2) {
        return { exists: false, message: '' };
    }

    try {
        const params = new URLSearchParams({ name: name.trim() });
        if (excludeId) {
            params.append('exclude_id', excludeId);
        }

        const response = await fetch(`/waterproof_nbs_ca/check-name/?${params.toString()}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error validating NBS name:', error);
        return { exists: false, message: '' };
    }
}

/**
 * Show or hide the NBS name exists indicator
 * @param {boolean} exists - Whether the name exists
 */
function showNbsNameExistsIndicator(exists) {
    const indicator = $('#nbs-name-exists-indicator');

    if (exists && indicator.length > 0) {
        // Show warning message (text is already localized in template)
        indicator.slideDown(300);
    } else if (indicator.length > 0) {
        // Hide indicator
        indicator.slideUp(300);
    }
}

/**
 * Enable or disable save button based on validation
 * @param {boolean} disable - Whether to disable button
 */
function toggleNbsSaveButton(disable) {
    const saveButton = $('#submit');

    if (saveButton.length > 0) {
        if (disable) {
            saveButton.prop('disabled', true).addClass('disabled');
        } else {
            saveButton.prop('disabled', false).removeClass('disabled');
        }
    }
}

// Debounce timer for name validation
let nbsNameValidationTimeout = null;

/**
 * Setup NBS name validation with debounce
 * Call this function on document ready to initialize validation
 * @param {number|null} excludeId - ID to exclude (for edit/clone scenarios)
 */
function setupNbsNameValidation(excludeId = null) {
    const nameInput = $('#nameNBS');

    if (nameInput.length === 0) {
        return; // Name input not found in this page
    }

    nameInput.on('input', function() {
        const name = $(this).val().trim();

        // Clear previous timeout
        if (nbsNameValidationTimeout) {
            clearTimeout(nbsNameValidationTimeout);
        }

        // If name is empty or too short, hide indicator and enable button
        if (name.length < 2) {
            showNbsNameExistsIndicator(false);
            toggleNbsSaveButton(false);
            return;
        }

        // Debounce validation (500ms)
        nbsNameValidationTimeout = setTimeout(async function() {
            const result = await validateNbsName(name, excludeId);

            // Update indicator visibility
            showNbsNameExistsIndicator(result.exists);

            // Disable/enable save button
            toggleNbsSaveButton(result.exists);
        }, 500);
    });

    // Also validate on blur for immediate feedback
    nameInput.on('blur', async function() {
        const name = $(this).val().trim();

        if (name.length >= 2) {
            const result = await validateNbsName(name, excludeId);
            showNbsNameExistsIndicator(result.exists);
            toggleNbsSaveButton(result.exists);
        }
    });
}