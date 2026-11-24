
var RBKC = window.RBKC || {};

RBKC.MultiSelectManager = (function () {
    "use strict";

    // ============================================
    // RBKC MULTI-SELECT CHOICES MANAGER
    // Dynamics 365 / Dataverse Contact Form
    //
    // One or more selections = Yes (true)
    // No selections = No (false)
    //
    // Supports multiple independent field pairs.
    // ============================================

    // ============================================
    // 1. FIELD CONFIGURATION
    // ============================================

    var FIELD_MAPPINGS = [

        // 1. HEARING IMPAIRMENT
        {
            multiSelect:
                "rbkc_doestheresidenthaveahearingimpairment",
            yesNo:
                "rbkc_hearingimpairment"
        },

        // 2. VISUAL IMPAIRMENT
        {
            multiSelect:
                "rbkc_doestheresidenthaveavisualimpairment",
            yesNo:
                "rbkc_visualimpairment"
        },

        // 3. DIFFICULTY WITH ENGLISH
        {
            multiSelect:
                "rbkc_arethereanydifficultieswithwrittenorspoke",
            yesNo:
                "rbkc_ifnotfirstlanguagedifficultywithenglish"
        },

        // 4. MOBILITY IMPAIRMENT
        {
            multiSelect:
                "rbkc_doestheresidenthaveimpairedmobility",
            yesNo:
                "rbkc_mobilityimpairment"
        },

        // 5. PHYSICAL IMPAIRMENT
        {
            multiSelect:
                "rbkc_doestheresidenthaveanyphysicalrestriction",
            yesNo:
                "rbkc_physicalimpairment"
        },

        // 6. WHEELCHAIR USER
        {
            multiSelect:
                "rbkc_doestheresidentuseawheelchair",
            yesNo:
                "rbkc_wheelchairuser"
        },

        // 7. OTHER HEARING INFORMATION / EQUIPMENT
        {
            multiSelect:
                "rbkc_doestheresidenthaveanyotherphysicalhealth",
            yesNo:
                "rbkc_otherhearinginformationandequipment"
        },

        // 8. MEDICAL EQUIPMENT REQUIRING ELECTRICITY
        {
            multiSelect:
                "rbkc_doestheresidentusemedicalequipmentthatreq",
            yesNo:
                "rbkc_medicalequipreqelecsupply"
        },

        // 9. CONDITION AFFECTED BY TEMPERATURE
        {
            multiSelect:
                "rbkc_doestheresidenthaveahealthconditionthatis",
            yesNo:
                "rbkc_conditionaffectedbytemperature"
        },

        // 10. MENTAL HEALTH CONDITION
        {
            multiSelect:
                "rbkc_doestheresidenthaveanymentalhealthconditi",
            yesNo:
                "rbkc_mentalhealthcondition"
        },

        // 11. LEARNING DIFFICULTIES
        {
            multiSelect:
                "rbkc_doestheresidenthaveanylearningdifficultie",
            yesNo:
                "rbkc_learningdifficulties"
        },

        // 12. COGNITIVE NEEDS
        {
            multiSelect:
                "rbkc_doestheresidenthaveanymemorylossordementi",
            yesNo:
                "rbkc_cognitiveneeds"
        },

        // 13. SUPPORT WORKER
        {
            multiSelect:
                "rbkc_doestheresidenthaveasupportworkerorinvolv",
            yesNo:
                "cr6c3_supportworker"
        },

        // 14. CARE LEAVER
        {
            multiSelect:
                "rbkc_istheresidentacareleaver",
            yesNo:
                "rbkc_careleaver"
        },

        // 15. TEMPORARY HEALTH CONDITION
        {
            multiSelect:
                "rbkc_doestheresidenthaveatemporaryhealthcondit",
            yesNo:
                "rbkc_tempcondition"
        }
    ];

    // ============================================
    // 2. TRACK REGISTERED EVENT HANDLERS
    // ============================================

    var registeredAttributes = new WeakSet();

    // ============================================
    // 3. UPDATE A SINGLE FIELD PAIR
    // ============================================

    function updateFieldPair(formContext, mapping) {

        var multiSelectAttribute =
            formContext.getAttribute(mapping.multiSelect);

        var yesNoAttribute =
            formContext.getAttribute(mapping.yesNo);

        // Check both fields are on the form
        if (!multiSelectAttribute || !yesNoAttribute) {

            console.warn(
                "RBKC MultiSelectManager: Missing field pair:",
                mapping.multiSelect,
                mapping.yesNo
            );

            return;
        }

        // Get selected multi-select values
        var selectedOptions =
            multiSelectAttribute.getValue();

        // One or more selections = true
        // Null or empty array = false
        var newValue =
            Array.isArray(selectedOptions) &&
            selectedOptions.length > 0;

        var currentValue =
            yesNoAttribute.getValue();

        // Only update if the value has changed
        if (currentValue !== newValue) {

            yesNoAttribute.setValue(newValue);

            // Notify other registered event handlers
            yesNoAttribute.fireOnChange();

            console.log(
                "RBKC MultiSelectManager: " +
                mapping.yesNo +
                " updated to " +
                (newValue ? "Yes" : "No")
            );
        }
    }

    // ============================================
    // 4. UPDATE ALL FIELD PAIRS
    // ============================================

    function updateAll(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !==
                "function") {

            console.error(
                "RBKC MultiSelectManager: " +
                "Execution context missing."
            );

            return;
        }

        var formContext =
            executionContext.getFormContext();

        FIELD_MAPPINGS.forEach(function (mapping) {

            updateFieldPair(
                formContext,
                mapping
            );

        });
    }

    // ============================================
    // 5. AUTOMATIC ONCHANGE REGISTRATION
    // ============================================

    function onLoad(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !==
                "function") {

            console.error(
                "RBKC MultiSelectManager: " +
                "Execution context missing."
            );

            return;
        }

        var formContext =
            executionContext.getFormContext();

        FIELD_MAPPINGS.forEach(function (mapping) {

            var multiSelectAttribute =
                formContext.getAttribute(
                    mapping.multiSelect
                );

            var yesNoAttribute =
                formContext.getAttribute(
                    mapping.yesNo
                );

            if (!multiSelectAttribute ||
                !yesNoAttribute) {

                console.warn(
                    "RBKC MultiSelectManager: " +
                    "Field pair unavailable:",
                    mapping.multiSelect,
                    mapping.yesNo
                );

                return;
            }

            // Register each attribute only once
            if (!registeredAttributes.has(
                    multiSelectAttribute)) {

                multiSelectAttribute.addOnChange(
                    function (changeContext) {

                        var currentForm =
                            changeContext.getFormContext();

                        updateFieldPair(
                            currentForm,
                            mapping
                        );
                    }
                );

                registeredAttributes.add(
                    multiSelectAttribute
                );
            }

            // Evaluate current selections on load
            updateFieldPair(
                formContext,
                mapping
            );
        });

        console.log(
            "RBKC MultiSelectManager: " +
            "Initialization complete. " +
            FIELD_MAPPINGS.length +
            " field pairs configured."
        );
    }

    // ============================================
    // 6. PUBLIC FUNCTIONS
    // ============================================

    return {

        onLoad: onLoad,

        updateAll: updateAll

    };

})();
