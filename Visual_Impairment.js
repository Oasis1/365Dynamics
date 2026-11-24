
var RBKC = window.RBKC || {};

RBKC.VisualImpairment = (function () {
    "use strict";

    // ============================================
    // FIELD CONFIGURATION
    // ============================================

    const MULTI_SELECT_FIELD =
        "rbkc_doestheresidenthaveavisualimpairment";

    const YES_NO_FIELD =
        "rbkc_visualimpairment";

    // ============================================
    // UPDATE VISUAL IMPAIRMENT
    // ============================================

    function updateVisualImpairment(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !== "function") {
            console.error(
                "RBKC Visual Impairment: Execution context missing."
            );
            return;
        }

        var formContext = executionContext.getFormContext();

        var multiSelectAttribute =
            formContext.getAttribute(MULTI_SELECT_FIELD);

        var yesNoAttribute =
            formContext.getAttribute(YES_NO_FIELD);

        // Check both fields exist on the form
        if (!multiSelectAttribute || !yesNoAttribute) {
            console.warn(
                "RBKC Visual Impairment: Required fields not found."
            );
            return;
        }

        // Get the selected option values
        var selectedOptions =
            multiSelectAttribute.getValue();

        // Multi-select Choices returns an array
        // Null or empty array means no selection
        var hasSelection =
            Array.isArray(selectedOptions) &&
            selectedOptions.length > 0;

        // Yes = true
        // No  = false
        var newValue = hasSelection;

        var currentValue = yesNoAttribute.getValue();

        // Only update when the value is different
        if (currentValue !== newValue) {

            yesNoAttribute.setValue(newValue);

            // Notify other handlers of the change
            yesNoAttribute.fireOnChange();

            console.log(
                "RBKC Visual Impairment updated to: " +
                (newValue ? "Yes" : "No")
            );
        }
    }

    // ============================================
    // PUBLIC FUNCTIONS
    // ============================================

    return {
        updateVisualImpairment: updateVisualImpairment
    };

})();
