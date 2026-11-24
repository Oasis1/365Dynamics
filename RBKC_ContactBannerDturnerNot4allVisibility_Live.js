<html><head>
  <meta charset="utf-8">
  <title>RBKC Contact Warning Banner</title>

  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      font-family: "Segoe UI", Arial, sans-serif;
      background-color: transparent;
    }

    #warning-banner {
      box-sizing: border-box;
      width: 100%;
      min-height: 100%;
      display: none;
      padding: 12px 18px;
      background-color: #05f656;
      color: #000000;
      border: none;
      border-radius: 0;
      font-size: 16px;
    }

    .banner-title {
      display: block;
      font-weight: 700;
      margin-bottom: 6px;
      text-align: center;
    }

    .banner-message {
      display: block;
      font-weight: 600;
      line-height: 1.4;
    }
  </style>
<meta></head>

<body style="overflow-wrap: break-word;">

  <div id="warning-banner">

    <div class="banner-title">
      <strong>*** IMPORTANT CONTACT ALERT ***</strong>
    </div>

    <div class="banner-message">
      All communication must be approved by
      <strong>Daniel Lewis</strong> or
      <strong>Levi Burke</strong>.
      If both are unavailable, approval must be
      obtained from <strong>James Caspell</strong>.
    </div>

  </div>

  <script>
    (function () {
      "use strict";

      // Darren Turner's Contact GUID
      const TARGET_CONTACT_ID =
        "0ad9a2c7-3315-e711-9417-005056bc7c30";

      // IMPORTANT:
      // Replace with the CONTROL NAME from the
      // Dynamics 365 Contact form designer.
      const WEB_RESOURCE_CONTROL_NAME =
        "WebResource_ContactWarningBanner";

      const MAX_RETRIES = 10;
      let retryCount = 0;

      function normalizeGuid(value) {
        return String(value || "")
          .replace(/[{}]/g, "")
          .trim()
          .toLowerCase();
      }

      function getFormContext() {
        try {
          if (window.parent &&
              window.parent.Xrm &&
              window.parent.Xrm.Page) {
            return window.parent.Xrm.Page;
          }
        } catch (error) {
          console.error(
            "RBKC: Unable to access form context:",
            error
          );
        }

        return null;
      }

      function getBannerControl(formContext) {
        try {
          // First use the configured control name.
          let control = formContext.getControl(
            WEB_RESOURCE_CONTROL_NAME
          );

          if (control) {
            return control;
          }

          // Fallback: find the control hosting this
          // HTML web resource.
          formContext.ui.controls.forEach(function (item) {
            if (control) return;

            try {
              if (typeof item.getObject !== "function") {
                return;
              }

              const iframe = item.getObject();

              if (iframe &&
                  iframe.contentWindow === window) {
                control = item;
              }
            } catch (error) {
              // Ignore controls that cannot be inspected.
            }
          });

          return control;

        } catch (error) {
          console.error(
            "RBKC: Unable to locate banner control:",
            error
          );
          return null;
        }
      }

      function setBannerVisibility(formContext, visible) {
        const banner = document.getElementById(
          "warning-banner"
        );

        if (!banner) return;

        // Hide message content by default.
        banner.style.display = visible ? "block" : "none";

        const control = getBannerControl(formContext);

        if (control &&
            typeof control.setVisible === "function") {

          // Hide/show the ENTIRE web resource control.
          control.setVisible(visible);

          console.log(
            "RBKC Contact Banner:",
            visible ? "Visible" : "Hidden"
          );

        } else {
          console.warn(
            "RBKC: Banner control not found. " +
            "Check WEB_RESOURCE_CONTROL_NAME."
          );
        }
      }

      function updateBanner() {
        const formContext = getFormContext();

        if (!formContext ||
            !formContext.data ||
            !formContext.data.entity) {

          if (retryCount < MAX_RETRIES) {
            retryCount++;
            setTimeout(updateBanner, 500);
          }

          return;
        }

        try {
          const entityName =
            formContext.data.entity.getEntityName();

          const currentContactId = normalizeGuid(
            formContext.data.entity.getId()
          );

          const targetContactId = normalizeGuid(
            TARGET_CONTACT_ID
          );

          const shouldShow =
            entityName === "contact" &&
            currentContactId !== "" &&
            currentContactId === targetContactId;

          setBannerVisibility(
            formContext,
            shouldShow
          );

        } catch (error) {
          console.error(
            "RBKC Contact warning banner error:",
            error
          );

          setBannerVisibility(formContext, false);
        }
      }

      function initialiseBanner() {
        setTimeout(updateBanner, 300);
      }

      if (document.readyState === "loading") {
        document.addEventListener(
          "DOMContentLoaded",
          initialiseBanner
        );
      } else {
        initialiseBanner();
      }

    })();
  </script>



</body></html>