
/*
 * RBKC Contact - Multi-select Choices to Yes/No
 * Version 1.1 - 15 field pairs
 * Parent Yes/No fields automatically locked
 *
 * Register on Contact form OnLoad:
 * RBKC.MultiSelectManager.onLoad
 *
 * Pass execution context as first parameter.
 *
 * IMPORTANT:
 * Verify all Dataverse schema names before deployment.
 */

var RBKC = window.RBKC || {};

RBKC.MultiSelectManager = (function () {
    "use strict";

    // ============================================
    // 1. FIELD CONFIGURATION
    // ============================================

    var FIELD_MAPPINGS = [

        // 1. VISUAL IMPAIRMENT
        {
            multiSelect: "rbkc_doestheresidenthaveavisualimpairment",
            yesNo: "rbkc_visualimpairment"
        },

        // 2. HEARING IMPAIRMENT
        {
            multiSelect: "rbkc_doestheresidenthaveahearingimpairment",
            yesNo: "rbkc_hearingimpairment"
        },

        // 3. DIFFICULTY WITH ENGLISH
        {
            multiSelect: "rbkc_arethereanydifficultieswithwrittenorspoke",
            yesNo: "rbkc_ifnotfirstlanguagedifficultywithenglish"
        },

        // 4. MOBILITY IMPAIRMENT
        {
            multiSelect: "rbkc_doestheresidenthaveimpairedmobility",
            yesNo: "rbkc_mobilityimpairment"
        },

        // 5. PHYSICAL IMPAIRMENT
        {
            multiSelect: "rbkc_doestheresidenthaveanyphysicalrestriction",
            yesNo: "rbkc_physicalimpairment"
        },

        // 6. WHEELCHAIR USER
        {
            multiSelect: "rbkc_doestheresidentuseawheelchair",
            yesNo: "rbkc_wheelchairuser"
        },

        // 7. OTHER HEARING INFORMATION / EQUIPMENT
        {
            multiSelect: "rbkc_doestheresidenthaveanyotherphysicalhealth",
            yesNo: "rbkc_otherhearinginformationandequipment"
        },

        // 8. MEDICAL EQUIPMENT
        {
            multiSelect: "rbkc_doestheresidentusemedicalequipmentthatreq",
            yesNo: "rbkc_medicalequipreqelecsupply"
        },

        // 9. TEMPERATURE RELATED CONDITION
        {
            multiSelect: "rbkc_doestheresidenthaveahealthconditionthatis",
            yesNo: "rbkc_conditionaffectedbytemperature"
        },

        // 10. MENTAL HEALTH
        {
            multiSelect: "rbkc_doestheresidenthaveanymentalhealthconditi",
            yesNo: "rbkc_mentalhealthcondition"
        },

        // 11. LEARNING DIFFICULTIES
        {
            multiSelect: "rbkc_doestheresidenthaveanylearningdifficultie",
            yesNo: "rbkc_learningdifficulties"
        },

        // 12. COGNITIVE NEEDS
        {
            multiSelect: "rbkc_doestheresidenthaveanymemorylossordementi",
            yesNo: "rbkc_cognitiveneeds"
        },

        // 13. SUPPORT WORKER
        {
            multiSelect: "rbkc_doestheresidenthaveasupportworkerorinvolv",
            yesNo: "cr6c3_supportworker"
        },

        // 14. CARE LEAVER
        {
            multiSelect: "rbkc_istheresidentacareleaver",
            yesNo: "rbkc_careleaver"
        },

        // 15. TEMPORARY HEALTH CONDITION
        {
            multiSelect: "rbkc_doestheresidenthaveatemporaryhealthcondit",
            yesNo: "rbkc_tempcondition"
        }
    ];

    // ============================================
    // 2. TRACK REGISTERED EVENT HANDLERS
    // ============================================

    var registeredAttributes = new WeakMap();

    // ============================================
    // 3. GET FORM CONTEXT
    // ============================================

    function getFormContext(executionContext) {

        if (!executionContext ||
            typeof executionContext.getFormContext !==
                "function") {

            console.error(
                "RBKC MultiSelectManager: " +
                "Execution context missing."
            );

            return null;
        }

        return executionContext.getFormContext();
    }

    // ============================================
    // 4. LOCK PARENT YES/NO CONTROLS
    // ============================================

    function lockParentControls(target, fieldName) {

        if (!target || !target.controls) {
            return;
        }

        target.controls.forEach(function (control) {

            if (control &&
                typeof control.setDisabled === "function") {

                control.setDisabled(true);
            }
        });

        console.info(
            "RBKC MultiSelectManager: " +
            "Locked parent control:",
            fieldName
        );
    }

    // ============================================
    // 5. UPDATE INDIVIDUAL FIELD PAIR
    // ============================================

    function updateFieldPair(formContext, mapping) {

        var source =
            formContext.getAttribute(mapping.multiSelect);

        var target =
            formContext.getAttribute(mapping.yesNo);

        if (!source || !target) {

            console.warn(
                "RBKC MultiSelectManager: Missing field(s):",
                mapping.multiSelect,
                mapping.yesNo
            );

            return;
        }

        var selected = source.getValue();

        // Validate Multi-select Choices value
        if (selected !== null &&
            !Array.isArray(selected)) {

            console.warn(
                "RBKC: Expected Multi-select array:",
                mapping.multiSelect,
                selected
            );

            return;
        }

        // One or more selections = Yes
        // No selections = No
        var newValue =
            Array.isArray(selected) &&
            selected.length > 0;

        var oldValue = target.getValue();

        // Validate parent Yes/No datatype
        if (oldValue !== null &&
            typeof oldValue !== "boolean") {

            console.warn(
                "RBKC: Parent field is not Boolean:",
                mapping.yesNo,
                oldValue
            );

            return;
        }

        // Update only when the value changes
        if (oldValue !== newValue) {

            target.setValue(newValue);

            // Notify dependent event handlers
            target.fireOnChange();

            console.info(
                "RBKC MultiSelectManager:",
                mapping.yesNo,
                "updated to",
                newValue ? "Yes" : "No"
            );
        }
    }

    // ============================================
    // 6. UPDATE ALL FIELD PAIRS
    // ============================================

    function updateAll(executionContext) {

        var formContext =
            getFormContext(executionContext);

        if (!formContext) {
            return;
        }

        FIELD_MAPPINGS.forEach(function (mapping) {

            updateFieldPair(
                formContext,
                mapping
            );
        });
    }

    // ============================================
    // 7. FORM ONLOAD
    // LOCK FIELDS AND REGISTER EVENTS
    // ============================================

    function onLoad(executionContext) {

        var formContext =
            getFormContext(executionContext);

        if (!formContext) {
            return;
        }

        FIELD_MAPPINGS.forEach(function (mapping) {

            var source =
                formContext.getAttribute(
                    mapping.multiSelect
                );

            var target =
                formContext.getAttribute(
                    mapping.yesNo
                );

            if (!source || !target) {

                console.warn(
                    "RBKC MultiSelectManager: " +
                    "Field pair unavailable:",
                    mapping.multiSelect,
                    mapping.yesNo
                );

                return;
            }

            // ====================================
            // LOCK THE PARENT YES/NO FIELD
            // ====================================

            lockParentControls(
                target,
                mapping.yesNo
            );

            // ====================================
            // REGISTER ONCHANGE ONLY ONCE
            // ====================================

            var keys =
                registeredAttributes.get(source);

            if (!keys) {

                keys = {};

                registeredAttributes.set(
                    source,
                    keys
                );
            }

            var key =
                mapping.multiSelect + "|" +
                mapping.yesNo;

            if (!keys[key]) {

                source.addOnChange(
                    function (changeContext) {

                        var currentFormContext =
                            getFormContext(changeContext);

                        if (currentFormContext) {

                            updateFieldPair(
                                currentFormContext,
                                mapping
                            );
                        }
                    }
                );

                keys[key] = true;
            }

            // ====================================
            // CHECK VALUES WHEN FORM OPENS
            // ====================================

            updateFieldPair(
                formContext,
                mapping
            );
        });

        console.info(
            "RBKC MultiSelectManager: " +
            "OnLoad processed",
            FIELD_MAPPINGS.length,
            "configured field pairs."
        );
    }

    // ============================================
    // 8. PUBLIC FUNCTIONS
    // ============================================

    return {

        onLoad: onLoad,

        updateAll: updateAll

    };

})();
