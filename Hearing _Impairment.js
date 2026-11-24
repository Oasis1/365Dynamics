
var RBKC = window.RBKC || {};

RBKC.MultiSelectRule = (function () {
    "use strict";

    // Replace these with your actual Dataverse column names
    const MULTI_SELECT_FIELD = "rbkc_doestheresidenthaveahearingimpairment";
    const YES_NO_FIELD = "rbkc_hearingimpairment";

    function updateYesNo(executionContext) {
        var formContext = executionContext.getFormContext();

        var multiSelect = formContext.getAttribute(
            MULTI_SELECT_FIELD
        );

        var yesNo = formContext.getAttribute(
            YES_NO_FIELD
        );

        if (!multiSelect || !yesNo) {
            console.warn("Required field not found on form.");
            return;
        }

        var selectedOptions = multiSelect.getValue() || [];

        // One or more selections = Yes
        // No selections = No
        var result = selectedOptions.length > 0;

        if (yesNo.getValue() !== result) {
            yesNo.setValue(result);
            yesNo.fireOnChange();
        }
    }

    return {
        updateYesNo: updateYesNo
    };
})();
