
var RBKC = window.RBKC || {};

RBKC.TenantDeceasedBanner = (function () {
    "use strict";

    // Contact table field
    var FIELD_NAME = "rbkc_tenantdeceased";

    // Unique notification identifier
    var NOTIFICATION_ID = "RBKC_TENANT_DECEASED";

    // Banner message
    var MESSAGE = "*** RESIDENT TENANT DECEASED ***";

    function updateBanner(executionContext) {

        var formContext =
            executionContext.getFormContext();

        var field =
            formContext.getAttribute(FIELD_NAME);

        if (!field) {
            // Remove any existing notification
            formContext.ui.clearFormNotification(
                NOTIFICATION_ID
            );

            console.warn(
                "RBKC: Field not found: " + FIELD_NAME
            );
            return;
        }

        var value = field.getValue();

        if (value === true) {

            // Display warning
            formContext.ui.setFormNotification(
                MESSAGE,
                "WARNING",
                NOTIFICATION_ID
            );

        } else {

            // Remove warning
            formContext.ui.clearFormNotification(
                NOTIFICATION_ID
            );
        }
    }

    function onLoad(executionContext) {

        var formContext =
            executionContext.getFormContext();

        var field =
            formContext.getAttribute(FIELD_NAME);

        // Check current value on opening record
        updateBanner(executionContext);

        // Automatically update when checkbox changes
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
