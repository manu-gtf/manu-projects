/* GTF owns initialization and country-code synchronization. */
if (window.jQuery) {
  jQuery(function () {
    document.querySelectorAll(".phone-input").forEach(function (input) {
      input.setAttribute("autocomplete", "tel-national");
      var instance = window.intlTelInputGlobals?.getInstance(input);
      if (!instance) return;

      function describeCountry() {
        var country = instance.getSelectedCountryData();
        var selector = input
          .closest(".iti")
          ?.querySelector(".iti__selected-flag");
        if (selector) {
          selector.setAttribute(
            "aria-label",
            "Country calling code" +
              (country.name
                ? ": " + country.name + " +" + country.dialCode
                : ""),
          );
        }
      }

      describeCountry();
      instance.promise.then(describeCountry).catch(function () {});
      input.addEventListener("countrychange", describeCountry);
    });
  });
}
