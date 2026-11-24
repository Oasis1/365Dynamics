var RBKC = window.RBKC || {};

RBKC.HeatNetworkPSR = (function () {
    "use strict";

    // =============================================
    // FIELD CONFIGURATION
    // =============================================

    // Contact - Property lookup
    const PROPERTY_LOOKUP = "kct_property";

    // Related Property entity
    const PROPERTY_ENTITY = "esu_property";

    // Property - Heat Network (Two Options)
    const HEAT_NETWORK_FIELD = "cr6c3_heatnetwork";

    // Contact - PSR Registration Status (Choice)
    const CONTACT_PSR_STATUS =
        "rbkc_heatnetworkpriorityservicesregisterstatus";

    // =============================================
    // CHOICE VALUES
    // =============================================

    const NOT_APPLICABLE = 226010004;
    const REGISTERED_PERMANENT = 226010000;

    // Prevent outdated asynchronous requests
    let requestSequence = 0;

    // =============================================
    // MAIN FUNCTION
    // =============================================

    async function checkHeatNetwork(executionContext) {

        var formContext = executionContext.getFormContext();

        var propertyLookup =
            formContext.getAttribute(PROPERTY_LOOKUP);

        var psrStatus =
            formContext.getAttribute(CONTACT_PSR_STATUS);

        // Check required Contact fields
        if (!propertyLookup || !psrStatus) {

            console.warn(
                "Heat Network PSR: Required Contact fields not found."
            );

            return;
        }

        // Identify the current request
        var requestId = ++requestSequence;

        // Retrieve linked Property from Contact
        var propertyValue = propertyLookup.getValue();

        // No Property linked to Contact
        if (!propertyValue || propertyValue.length === 0) {

            console.log(
                "Heat Network PSR: No Property linked to Contact."
            );

            return;
        }

        // Retrieve Property GUID
        var propertyId = propertyValue[0].id
            .replace(/[{}]/g, "")
            .toLowerCase();

        try {

            // =============================================
            // RETRIEVE HEAT NETWORK FROM PROPERTY
            // =============================================

            var property = await Xrm.WebApi.retrieveRecord(
                PROPERTY_ENTITY,
                propertyId,
                "?$select=" + HEAT_NETWORK_FIELD
            );

            // Ignore outdated requests
            if (requestId !== requestSequence) {
                return;
            }

            // Confirm Contact still references
            // the same Property
            var currentProperty = propertyLookup.getValue();

            if (
                !currentProperty ||
                currentProperty.length === 0
            ) {
                return;
            }

            var currentPropertyId = currentProperty[0].id
                .replace(/[{}]/g, "")
                .toLowerCase();

            if (currentPropertyId !== propertyId) {
                return;
            }

            // Get Property Heat Network value
            var heatNetwork =
                property[HEAT_NETWORK_FIELD];

            // Get current Contact Registration Status
            var currentStatus =
                psrStatus.getValue();

            // =============================================
            // RULE 1
            // HEAT NETWORK = NO
            //
            // Set Contact PSR Registration Status
            // to NOT APPLICABLE (226010004)
            // =============================================

            if (heatNetwork === false) {

                if (currentStatus !== NOT_APPLICABLE) {

                    psrStatus.setValue(NOT_APPLICABLE);

                    // Trigger registered OnChange events
                    psrStatus.fireOnChange();

                    console.log(
                        "Heat Network = No. " +
                        "Contact PSR Registration Status " +
                        "set to Not Applicable."
                    );

                } else {

                    console.log(
                        "Contact PSR Registration Status " +
                        "is already Not Applicable."
                    );
                }

                return;
            }

            // =============================================
            // RULE 2
            // HEAT NETWORK = YES
            //
            // Set Contact PSR Registration Status
            // to REGISTERED (PERMANENT) (226010000)
            //
            // PSR Eligibility is NOT checked.
            // =============================================

            if (heatNetwork === true) {

                if (currentStatus !== REGISTERED_PERMANENT) {

                    psrStatus.setValue(
                        REGISTERED_PERMANENT
                    );

                    // Trigger registered OnChange events
                    psrStatus.fireOnChange();

                    console.log(
                        "Heat Network = Yes. " +
                        "Contact PSR Registration Status " +
                        "set to Registered (Permanent)."
                    );

                } else {

                    console.log(
                        "Contact PSR Registration Status " +
                        "is already Registered (Permanent)."
                    );
                }

                return;
            }

            // =============================================
            // RULE 3
            // HEAT NETWORK IS BLANK / NULL
            // NO UPDATE REQUIRED
            // =============================================

            console.log(
                "Heat Network is blank or undefined. " +
                "No PSR Registration Status update required."
            );

        } catch (error) {

            // Ignore outdated requests
            if (requestId !== requestSequence) {
                return;
            }

            console.error(
                "Heat Network PSR Error:",
                error.message
            );

            Xrm.Navigation.openAlertDialog({
                text:
                    "Unable to retrieve Heat Network " +
                    "information from the related Property.\n" +
                    error.message
            });
        }
    }

    // =============================================
    // CONTACT FORM ONLOAD
    // =============================================

    function onLoad(executionContext) {

        var formContext = executionContext.getFormContext();

        var propertyLookup =
            formContext.getAttribute(PROPERTY_LOOKUP);

        var psrStatus =
            formContext.getAttribute(CONTACT_PSR_STATUS);

        if (!propertyLookup || !psrStatus) {

            console.warn(
                "Heat Network PSR: Required Contact " +
                "fields are not available on the form."
            );

            return;
        }

        // Prevent duplicate event registrations
        propertyLookup.removeOnChange(checkHeatNetwork);

        // Re-check when Property lookup changes
        propertyLookup.addOnChange(checkHeatNetwork);

        // Check when Contact form opens
        checkHeatNetwork(executionContext);
    }

    // =============================================
    // PUBLIC FUNCTIONS
    // =============================================

    return {
        onLoad: onLoad,
        checkHeatNetwork: checkHeatNetwork
    };

})();

