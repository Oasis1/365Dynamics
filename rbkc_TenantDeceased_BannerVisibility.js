
var RBKC = window.RBKC || {};

RBKC.TenantDeceasedBanner = (function () {
    "use strict";

    // Contact table: Two Options (Yes/No) column.
    var FIELD_NAME = "rbkc_tenantdeceased";

    // The Name of the HTML CONTROL on the Contact form,
    // not its display label.
    var BANNER_CONTROL_NAME =
        "WebResource_rbkc_TenantDeceased_Banner";

    function updateBanner(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !== "function") {

            console.error(
                "RBKC Tenant Deceased: execution context is missing."
            );
            return;
        }

        var formContext =
            executionContext.getFormContext();

        var field =
            formContext.getAttribute(FIELD_NAME);

        var control =
            formContext.getControl(BANNER_CONTROL_NAME);

        if (!field) {
            console.error(
                "RBKC Tenant Deceased: field not on this form:",
                FIELD_NAME
            );
            return;
        }

        if (!control) {
            console.error(
                "RBKC Tenant Deceased: HTML control not found:",
                BANNER_CONTROL_NAME
            );
            return;
        }

        var section = control.getParent();

        if (!section ||
            typeof section.setVisible !== "function") {

            console.error(
                "RBKC Tenant Deceased: hosting section not found."
            );
            return;
        }

        // This section must contain ONLY
        // the deceased banner HTML web resource.
        var showBanner = field.getValue() === true;

        // Show or hide the entire section
        section.setVisible(showBanner);

        console.log(
            "RBKC Tenant Deceased:",
            showBanner ? "visible" : "hidden",
            "section:",
            section.getName()
        );
    }

    function onLoad(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !== "function") {

            console.error(
                "RBKC Tenant Deceased: pass execution context as first parameter."
            );
            return;
        }

        var formContext =
            executionContext.getFormContext();

        var field =
            formContext.getAttribute(FIELD_NAME);

        // Set visibility when Contact record opens
        updateBanner(executionContext);

        // Register checkbox changes
        if (field) {

            field.removeOnChange(updateBanner);
            field.addOnChange(updateBanner);

        }
    }

    return {
        onLoad: onLoad,
        updateBanner: updateBanner
    };

})();
